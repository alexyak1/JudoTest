import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiPlus } from 'react-icons/fi';
import EditorShell, { Button, ErrorText } from './EditorShell';
import { canvasToBlob, loadImage } from './imageIO';
import { renderCollage } from './renderCollage';
import {
    COLLAGE_ASPECTS,
    COLLAGE_LAYOUTS,
    DEFAULT_TRANSFORM,
    GAP_SHARE,
    cellRect,
    coverSource,
    hitCell,
} from './imageGeometry';

const Section = styled.div`
    margin-bottom: 0.9rem;
`;
const Label = styled.div`
    color: #9ca3af; font-size: 0.75rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 0.4rem;
`;
const Hint = styled.p`
    margin: 0.4rem 0 0; color: #9ca3af; font-size: 0.8rem;
`;
const Tray = styled.div`
    display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;
`;
const Thumb = styled.button`
    position: relative;
    width: 72px; height: 72px; padding: 0;
    border-radius: 8px; overflow: hidden; cursor: pointer;
    background: #111;
    border: 2px solid ${p => p.failed ? '#f87171' : p.used ? '#667eea' : 'rgba(255,255,255,0.1)'};
    opacity: ${p => p.failed ? 0.4 : 1};
    &:hover { border-color: #667eea; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;
const Badge = styled.span`
    position: absolute; top: 3px; left: 3px;
    min-width: 18px; height: 18px; padding: 0 4px;
    display: inline-flex; align-items: center; justify-content: center;
    background: #667eea; color: #fff; border-radius: 9px;
    font-size: 0.7rem; font-weight: 700;
`;
const AddBtn = styled.label`
    width: 72px; height: 72px; box-sizing: border-box;
    display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.2rem;
    border: 2px dashed rgba(255,255,255,0.2); border-radius: 8px;
    color: #9ca3af; font-size: 0.68rem; text-align: center; cursor: pointer;
    &:hover { color: #fff; border-color: #667eea; }
`;
const Row = styled.div`
    display: flex; flex-wrap: wrap; gap: 1.25rem 2rem; align-items: flex-end;
`;
const Choices = styled.div`
    display: flex; flex-wrap: wrap; gap: 0.4rem;
`;
const LayoutBtn = styled.button`
    width: 48px; height: 34px; padding: 3px; border-radius: 6px; cursor: pointer;
    background: ${p => p.active ? 'rgba(102,126,234,0.25)' : 'transparent'};
    border: 1px solid ${p => p.active ? '#667eea' : 'rgba(255,255,255,0.18)'};
    &:hover { background: rgba(102,126,234,0.2); }
`;
const LayoutIconBox = styled.div`
    position: relative; width: 100%; height: 100%;
`;
const LayoutIconCell = styled.div`
    position: absolute; box-sizing: border-box;
    border: 1px solid #1a1a2e; background: #aab4f5; border-radius: 1px;
`;
const PillBtn = styled.button`
    border: 1px solid ${p => p.active ? '#667eea' : 'rgba(255,255,255,0.18)'};
    background: ${p => p.active ? 'rgba(102,126,234,0.25)' : 'transparent'};
    color: #fff; padding: 0.3rem 0.7rem; border-radius: 999px;
    font-size: 0.8rem; cursor: pointer;
    &:hover { background: rgba(102,126,234,0.2); }
`;
const Check = styled.label`
    display: inline-flex; align-items: center; gap: 0.4rem;
    color: #d1d5db; font-size: 0.82rem; cursor: pointer;
`;
const PreviewWrap = styled.div`
    width: 100%; display: flex; justify-content: center;
`;
const Preview = styled.div`
    position: relative; line-height: 0;
    border-radius: 6px; overflow: hidden;
    background: #000;
    touch-action: none; user-select: none;
    cursor: grab;
    &:active { cursor: grabbing; }
`;
const SelectedFrame = styled.div`
    position: absolute; box-sizing: border-box;
    border: 2px solid #667eea;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
    pointer-events: none;
`;
const ZoomRow = styled.div`
    display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem;
    color: #d1d5db; font-size: 0.82rem;
    input[type=range] { flex: 1; max-width: 320px; }
`;

const LayoutIcon = ({ cells }) => (
    <LayoutIconBox>
        {cells.map((c, i) => (
            <LayoutIconCell
                key={i}
                style={{
                    left: `${c.x * 100}%`,
                    top: `${c.y * 100}%`,
                    width: `${c.w * 100}%`,
                    height: `${c.h * 100}%`,
                }}
            />
        ))}
    </LayoutIconBox>
);

const MAX_PREVIEW_W = 760;
const MIN_PREVIEW_W = 160;

const sized = (arr, n, fill) => Array.from({ length: n }, (_, i) => (i < arr.length ? arr[i] : fill));

// Put several photos from one competition into a single picture, by hand.
//
// Choose a layout, then choose photos to fill its slots: the selected slot gets
// the next photo you tap, and tapping a photo already in the collage moves it
// (or takes it out, if it is in the selected slot). Drag a photo inside its slot
// to choose which part shows and use the slider to zoom. Nothing is uploaded
// here: "Add collage" hands the finished image back through onSave.
//
//   candidates: [{ key, source: { file } | { url }, thumb }]
const CollageEditor = ({ candidates, onSave, onCancel, saveLabel = 'Add collage' }) => {
    const [layoutId, setLayoutId] = useState(COLLAGE_LAYOUTS[0].id);
    const [aspectId, setAspectId] = useState(COLLAGE_ASPECTS[0].id);
    const [gapOn, setGapOn] = useState(true);
    const [extra, setExtra] = useState([]); // photos added from the device in here
    const [slots, setSlots] = useState(() => sized([], COLLAGE_LAYOUTS[0].cells.length, null));
    const [transforms, setTransforms] = useState(() =>
        sized([], COLLAGE_LAYOUTS[0].cells.length, DEFAULT_TRANSFORM)
    );
    const [selected, setSelected] = useState(0);
    const [loaded, setLoaded] = useState({}); // key -> decoded image
    const [failed, setFailed] = useState({}); // key -> true
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [box, setBox] = useState({ w: MAX_PREVIEW_W, vh: window.innerHeight });

    const canvasRef = useRef(null);
    const wrapRef = useRef(null);
    const dragRef = useRef(null);
    const loadingRef = useRef(new Set());
    const objectUrlsRef = useRef([]);
    const aliveRef = useRef(true);

    const layout = COLLAGE_LAYOUTS.find((l) => l.id === layoutId);
    const aspect = COLLAGE_ASPECTS.find((a) => a.id === aspectId);
    const cells = layout.cells;

    const all = useMemo(() => [...candidates, ...extra], [candidates, extra]);
    const byKey = useMemo(() => Object.fromEntries(all.map((c) => [c.key, c])), [all]);

    useEffect(() => {
        aliveRef.current = true;
        const urls = objectUrlsRef.current;
        return () => {
            aliveRef.current = false;
            urls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, []);

    // Decode a photo the first time it is put in a slot. Full-size, because the
    // saved collage is drawn from it.
    useEffect(() => {
        slots.forEach((key) => {
            if (!key || loadingRef.current.has(key) || !byKey[key]) return;
            loadingRef.current.add(key);
            loadImage(byKey[key].source)
                .then(({ img, objectUrl }) => {
                    if (!aliveRef.current) {
                        URL.revokeObjectURL(objectUrl);
                        return;
                    }
                    objectUrlsRef.current.push(objectUrl);
                    setLoaded((prev) => ({ ...prev, [key]: img }));
                })
                .catch(() => {
                    if (!aliveRef.current) return;
                    setFailed((prev) => ({ ...prev, [key]: true }));
                    setSlots((prev) => prev.map((k) => (k === key ? null : k)));
                    setError('One of the photos could not be loaded.');
                });
        });
    }, [slots, byKey]);

    const measure = useCallback(() => {
        const el = wrapRef.current;
        if (el) setBox({ w: el.clientWidth, vh: window.innerHeight });
    }, []);
    useEffect(() => {
        measure();
        const el = wrapRef.current;
        let observer = null;
        if (el && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(measure);
            observer.observe(el);
        }
        window.addEventListener('resize', measure);
        return () => {
            if (observer) observer.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [measure]);

    // The preview is as wide as the room allows, but no taller than half the
    // screen so the controls stay in view.
    const previewW = Math.max(
        MIN_PREVIEW_W,
        Math.min(box.w, MAX_PREVIEW_W, Math.round((box.vh * 0.5 * aspect.w) / aspect.h))
    );
    const previewH = Math.round((previewW * aspect.h) / aspect.w);
    const exportGap = gapOn ? Math.round(aspect.w * GAP_SHARE) : 0;
    const previewGap = (exportGap * previewW) / aspect.w;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(previewW * dpr);
        canvas.height = Math.round(previewH * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        renderCollage(ctx, previewW, previewH, {
            cells,
            images: slots.map((k) => (k && loaded[k]) || null),
            transforms,
            gap: previewGap,
            placeholders: true,
        });
    }, [cells, slots, loaded, transforms, previewW, previewH, previewGap]);

    const selectLayout = (id) => {
        const n = COLLAGE_LAYOUTS.find((l) => l.id === id).cells.length;
        const nextSlots = sized(slots, n, null);
        setLayoutId(id);
        setSlots(nextSlots);
        setTransforms(sized(transforms, n, DEFAULT_TRANSFORM));
        // Select the first empty slot, so the next photo tapped fills a gap
        // instead of replacing one that is already placed.
        const empty = nextSlots.indexOf(null);
        setSelected(empty >= 0 ? empty : Math.min(selected, n - 1));
    };

    const pickPhoto = (key) => {
        if (failed[key]) return;
        setError('');
        const nextSlots = [...slots];
        const nextTransforms = [...transforms];
        const at = nextSlots.indexOf(key);
        if (at === selected) {
            // Tapped the photo that is already in the selected slot: take it out.
            nextSlots[selected] = null;
            nextTransforms[selected] = DEFAULT_TRANSFORM;
        } else {
            // Put it in the selected slot; if it was in another slot, that slot
            // gets whatever the selected one held (a swap, or empty).
            if (at >= 0) {
                nextSlots[at] = nextSlots[selected];
                nextTransforms[at] = DEFAULT_TRANSFORM;
            }
            nextSlots[selected] = key;
            nextTransforms[selected] = DEFAULT_TRANSFORM;
        }
        setSlots(nextSlots);
        setTransforms(nextTransforms);
        const empty = nextSlots.indexOf(null);
        if (at !== selected && empty >= 0) setSelected(empty);
    };

    const addFromDevice = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;
        const stamp = Date.now();
        const added = files.map((file, i) => {
            const thumb = URL.createObjectURL(file);
            objectUrlsRef.current.push(thumb);
            return { key: `device-${stamp}-${i}`, source: { file }, thumb };
        });
        setExtra((prev) => [...prev, ...added]);
    };

    const cellPx = (i) => cellRect(cells[i], previewW, previewH, previewGap);

    const onPointerDown = (e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const i = hitCell(cells, previewW, previewH, e.clientX - bounds.left, e.clientY - bounds.top);
        if (i < 0) return;
        setSelected(i);
        const img = slots[i] && loaded[slots[i]];
        if (!img) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { i, x: e.clientX, y: e.clientY, start: transforms[i], img, cell: cellPx(i) };
    };
    const onPointerMove = (e) => {
        const d = dragRef.current;
        if (!d) return;
        const iw = d.img.naturalWidth;
        const ih = d.img.naturalHeight;
        const { scale } = coverSource(d.cell.w, d.cell.h, iw, ih, d.start.zoom, d.start.fx, d.start.fy);
        // Dragging right drags the photo right, so the part on show moves left.
        const next = coverSource(
            d.cell.w,
            d.cell.h,
            iw,
            ih,
            d.start.zoom,
            d.start.fx - (e.clientX - d.x) / (scale * iw),
            d.start.fy - (e.clientY - d.y) / (scale * ih)
        );
        setTransforms((prev) =>
            prev.map((t, k) => (k === d.i ? { zoom: d.start.zoom, fx: next.fx, fy: next.fy } : t))
        );
    };
    const endDrag = () => {
        dragRef.current = null;
    };

    const selectedImg = slots[selected] ? loaded[slots[selected]] : null;
    const zoom = transforms[selected] ? transforms[selected].zoom : 1;
    const onZoom = (e) => {
        if (!selectedImg) return;
        const z = Number(e.target.value);
        const t = transforms[selected];
        const c = cellPx(selected);
        const next = coverSource(c.w, c.h, selectedImg.naturalWidth, selectedImg.naturalHeight, z, t.fx, t.fy);
        setTransforms(transforms.map((old, k) => (k === selected ? { zoom: z, fx: next.fx, fy: next.fy } : old)));
    };

    const ready = slots.every((k) => k && loaded[k]);
    const filled = slots.filter(Boolean).length;

    const handleSave = async () => {
        if (!ready) return;
        setBusy(true);
        setError('');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = aspect.w;
            canvas.height = aspect.h;
            renderCollage(canvas.getContext('2d'), aspect.w, aspect.h, {
                cells,
                images: slots.map((k) => loaded[k]),
                transforms,
                gap: exportGap,
                placeholders: false,
            });
            const blob = await canvasToBlob(canvas);
            // Cleared before handing over: the parent normally closes this editor
            // straight away, and a state update after that would be a warning.
            setBusy(false);
            onSave(blob);
        } catch (err) {
            setError(err.message || 'Could not create the collage');
            setBusy(false);
        }
    };

    const frame = cellPx(selected);

    return (
        <EditorShell
            title="Make a collage"
            onCancel={onCancel}
            footer={
                <>
                    {error && <ErrorText>{error}</ErrorText>}
                    <Button onClick={onCancel} disabled={busy}>Cancel</Button>
                    <Button primary onClick={handleSave} disabled={!ready || busy}>
                        {busy ? 'Working…' : saveLabel}
                    </Button>
                </>
            }
        >
            <Section>
                <Label>1. Pick a layout</Label>
                <Row>
                    <Choices>
                        {COLLAGE_LAYOUTS.map((l) => (
                            <LayoutBtn
                                key={l.id}
                                type="button"
                                title={l.label}
                                aria-label={l.label}
                                active={l.id === layoutId}
                                onClick={() => selectLayout(l.id)}
                            >
                                <LayoutIcon cells={l.cells} />
                            </LayoutBtn>
                        ))}
                    </Choices>
                    <Choices>
                        {COLLAGE_ASPECTS.map((a) => (
                            <PillBtn
                                key={a.id}
                                type="button"
                                active={a.id === aspectId}
                                onClick={() => setAspectId(a.id)}
                            >
                                {a.label}
                            </PillBtn>
                        ))}
                    </Choices>
                    <Check>
                        <input type="checkbox" checked={gapOn} onChange={(e) => setGapOn(e.target.checked)} />
                        Gap between photos
                    </Check>
                </Row>
            </Section>

            <Section>
                <Label>2. Choose photos ({filled} of {slots.length})</Label>
                <Tray>
                    {all.map((c) => {
                        const at = slots.indexOf(c.key);
                        return (
                            <Thumb
                                key={c.key}
                                type="button"
                                used={at >= 0}
                                failed={failed[c.key]}
                                onClick={() => pickPhoto(c.key)}
                                title={at >= 0 ? `In slot ${at + 1}` : 'Put in the selected slot'}
                            >
                                <img src={c.thumb} alt="" />
                                {at >= 0 && <Badge>{at + 1}</Badge>}
                            </Thumb>
                        );
                    })}
                    <AddBtn title="Add photos from this device">
                        <FiPlus size={18} />
                        From device
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={addFromDevice}
                            style={{ display: 'none' }}
                        />
                    </AddBtn>
                </Tray>
                <Hint>
                    Slot {selected + 1} is selected: tap a photo to put it there. Tap a photo that is already used to move or remove it.
                </Hint>
            </Section>

            <Section ref={wrapRef}>
                <Label>3. Adjust</Label>
                <PreviewWrap>
                    <Preview
                        style={{ width: previewW, height: previewH }}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                    >
                        <canvas
                            ref={canvasRef}
                            data-testid="collage-preview"
                            style={{ width: previewW, height: previewH, display: 'block' }}
                        />
                        <SelectedFrame
                            data-testid="selected-frame"
                            style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
                        />
                    </Preview>
                </PreviewWrap>
                <ZoomRow>
                    <span>Zoom</span>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.01"
                        value={zoom}
                        onChange={onZoom}
                        disabled={!selectedImg}
                        aria-label="Zoom the selected photo"
                    />
                    <span>{zoom.toFixed(2)}×</span>
                </ZoomRow>
                <Hint>Drag a photo in the preview to choose which part of it shows.</Hint>
            </Section>
        </EditorShell>
    );
};

export default CollageEditor;
