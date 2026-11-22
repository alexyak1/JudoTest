import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import EditorShell, { Button, ErrorText } from './EditorShell';
import { canvasToBlob, loadImage } from './imageIO';
import {
    cropSourceRect,
    fitRatio,
    fullRect,
    minCropSize,
    moveRect,
    outputSize,
    resizeRect,
    resolveRatio,
} from './imageGeometry';

const PRESETS = [
    { id: 'free', label: 'Free', ratio: null },
    { id: 'original', label: 'Original', ratio: 'original' },
    { id: '16:9', label: '16:9', ratio: 16 / 9 },
    { id: '4:3', label: '4:3', ratio: 4 / 3 },
    { id: '1:1', label: '1:1', ratio: 1 },
    { id: '3:4', label: '3:4', ratio: 3 / 4 },
];

// Space kept free around the photo, in screen pixels: half a handle and a bit.
const STAGE_MARGIN = 16;

const EDGE_HANDLES = ['n', 'e', 's', 'w'];
const CORNER_HANDLES = ['nw', 'ne', 'se', 'sw'];
const HANDLE_POS = {
    nw: { left: '0%', top: '0%', cursor: 'nwse-resize' },
    n: { left: '50%', top: '0%', cursor: 'ns-resize' },
    ne: { left: '100%', top: '0%', cursor: 'nesw-resize' },
    e: { left: '100%', top: '50%', cursor: 'ew-resize' },
    se: { left: '100%', top: '100%', cursor: 'nwse-resize' },
    s: { left: '50%', top: '100%', cursor: 'ns-resize' },
    sw: { left: '0%', top: '100%', cursor: 'nesw-resize' },
    w: { left: '0%', top: '50%', cursor: 'ew-resize' },
};

const Hint = styled.p`
    margin: 0 0 0.75rem; color: #9ca3af; font-size: 0.8rem;
`;
const StageWrap = styled.div`
    position: relative;
    width: 100%;
    height: min(58vh, 560px);
    display: flex; align-items: center; justify-content: center;
    background: #0d0d1a;
    border-radius: 8px;
    overflow: hidden;
`;
// Not clipped: the handles sit on the photo's edge and half of each would be
// lost. The frame around it (StageWrap) clips the box's dimming shadow instead.
const Stage = styled.div`
    position: relative;
    user-select: none;
    touch-action: none;
`;
const StageImg = styled.img`
    display: block; width: 100%; height: 100%;
    pointer-events: none; -webkit-user-drag: none;
`;
// The box itself carries a huge shadow, which darkens everything outside it;
// the stage clips the shadow to the photo.
const Box = styled.div`
    position: absolute;
    box-sizing: border-box;
    border: 1px solid #fff;
    box-shadow: 0 0 0 9999px rgba(0,0,0,0.6);
    cursor: move;
    touch-action: none;
    background-image:
        linear-gradient(to right, transparent 33.2%, rgba(255,255,255,0.35) 33.3%, rgba(255,255,255,0.35) 33.5%, transparent 33.6%, transparent 66.5%, rgba(255,255,255,0.35) 66.6%, rgba(255,255,255,0.35) 66.8%, transparent 66.9%),
        linear-gradient(to bottom, transparent 33.2%, rgba(255,255,255,0.35) 33.3%, rgba(255,255,255,0.35) 33.5%, transparent 33.6%, transparent 66.5%, rgba(255,255,255,0.35) 66.6%, rgba(255,255,255,0.35) 66.8%, transparent 66.9%);
`;
// A 28px target (fingers) with a smaller square drawn in the middle.
const Handle = styled.div`
    position: absolute;
    width: 28px; height: 28px;
    transform: translate(-50%, -50%);
    touch-action: none;
    &::after {
        content: '';
        position: absolute; left: 50%; top: 50%;
        width: 12px; height: 12px;
        transform: translate(-50%, -50%);
        background: #fff;
        border: 1px solid #667eea;
        border-radius: 2px;
    }
`;
const Presets = styled.div`
    display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem;
    margin-top: 0.85rem;
`;
const PresetBtn = styled.button`
    border: 1px solid ${p => p.active ? '#667eea' : 'rgba(255,255,255,0.18)'};
    background: ${p => p.active ? 'rgba(102,126,234,0.25)' : 'transparent'};
    color: #fff; padding: 0.3rem 0.7rem; border-radius: 999px;
    font-size: 0.8rem; cursor: pointer;
    &:hover { background: rgba(102,126,234,0.2); }
`;
const SizeInfo = styled.span`
    margin-left: auto; color: #9ca3af; font-size: 0.78rem;
`;
const Centered = styled.div`
    color: ${p => p.error ? '#f87171' : '#9ca3af'};
    font-size: 0.9rem; text-align: center; padding: 1rem;
`;

// Crop one photo by hand. The box can be dragged and resized freely, or held to
// a shape (16:9 for the TV, square, ...). Nothing is sent anywhere: "Apply" hands
// the cropped image back through onSave and the caller decides what to do with it.
//
//   source: { file } | { url }, held in state or memoised by the caller, since a
//           new object would reload the photo.
const CropEditor = ({ source, title = 'Crop photo', applyLabel = 'Apply crop', onSave, onCancel }) => {
    const [loaded, setLoaded] = useState(null); // { img, objectUrl }
    const [loadError, setLoadError] = useState('');
    const [rect, setRect] = useState(null);
    const [presetId, setPresetId] = useState('free');
    const [avail, setAvail] = useState({ w: 0, h: 0 });
    const [busy, setBusy] = useState(false);
    const [saveError, setSaveError] = useState('');
    const wrapRef = useRef(null);
    const stageRef = useRef(null);
    const dragRef = useRef(null);

    useEffect(() => {
        let alive = true;
        let objectUrl = null;
        setLoaded(null);
        setLoadError('');
        loadImage(source)
            .then((result) => {
                if (!alive) {
                    URL.revokeObjectURL(result.objectUrl);
                    return;
                }
                objectUrl = result.objectUrl;
                setLoaded(result);
                setRect(fullRect(result.img.naturalWidth, result.img.naturalHeight));
            })
            .catch((err) => alive && setLoadError(err.message || 'Could not load this photo'));
        return () => {
            alive = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [source]);

    // The room the photo has to fit in.
    const measure = useCallback(() => {
        const el = wrapRef.current;
        if (el) setAvail({ w: el.clientWidth, h: el.clientHeight });
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
    }, [measure, loaded]);

    const iw = loaded ? loaded.img.naturalWidth : 0;
    const ih = loaded ? loaded.img.naturalHeight : 0;
    // Screen pixels per photo pixel. A small photo is shown at its own size
    // rather than blown up, and a margin is kept all round so the handles on the
    // photo's edge can be seen and grabbed in full.
    const scale = loaded && avail.w > STAGE_MARGIN * 2 && avail.h > STAGE_MARGIN * 2
        ? Math.min(1, (avail.w - STAGE_MARGIN * 2) / iw, (avail.h - STAGE_MARGIN * 2) / ih)
        : 0;
    const preset = PRESETS.find((p) => p.id === presetId);
    const ratio = loaded ? resolveRatio(preset.ratio, iw, ih) : null;
    const minSize = loaded ? minCropSize(iw, ih) : 0;

    const choosePreset = (next) => {
        setPresetId(next.id);
        const r = loaded ? resolveRatio(next.ratio, iw, ih) : null;
        if (r && rect) setRect(fitRatio(rect, r, iw, ih));
    };

    const reset = () => {
        setPresetId('free');
        setRect(fullRect(iw, ih));
    };

    const beginDrag = (e, mode) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { mode, startX: e.clientX, startY: e.clientY, startRect: rect };
    };
    const onPointerMove = (e) => {
        const d = dragRef.current;
        if (!d || !scale) return;
        if (d.mode === 'move') {
            const dx = (e.clientX - d.startX) / scale;
            const dy = (e.clientY - d.startY) / scale;
            setRect(moveRect(d.startRect, dx, dy, iw, ih));
        } else {
            const box = stageRef.current.getBoundingClientRect();
            const px = (e.clientX - box.left) / scale;
            const py = (e.clientY - box.top) / scale;
            setRect(resizeRect(d.startRect, d.mode, px, py, iw, ih, ratio, minSize));
        }
    };
    const endDrag = () => {
        dragRef.current = null;
    };

    const handleSave = async () => {
        if (!loaded || !rect) return;
        setBusy(true);
        setSaveError('');
        try {
            const { sx, sy, sw, sh } = cropSourceRect(rect, iw, ih);
            const { w, h } = outputSize(sw, sh);
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(loaded.img, sx, sy, sw, sh, 0, 0, w, h);
            const blob = await canvasToBlob(canvas);
            // Cleared before handing over: the parent normally closes this editor
            // straight away, and a state update after that would be a warning.
            setBusy(false);
            onSave(blob);
        } catch (err) {
            setSaveError(err.message || 'Could not crop this photo');
            setBusy(false);
        }
    };

    const crop = rect ? cropSourceRect(rect, iw, ih) : null;
    const out = crop ? outputSize(crop.sw, crop.sh) : null;
    const handles = ratio ? CORNER_HANDLES : [...CORNER_HANDLES, ...EDGE_HANDLES];

    return (
        <EditorShell
            title={title}
            onCancel={onCancel}
            footer={
                <>
                    {saveError && <ErrorText>{saveError}</ErrorText>}
                    <Button onClick={reset} disabled={!loaded || busy}>Reset</Button>
                    <Button onClick={onCancel} disabled={busy}>Cancel</Button>
                    <Button primary onClick={handleSave} disabled={!loaded || busy}>
                        {busy ? 'Working…' : applyLabel}
                    </Button>
                </>
            }
        >
            <Hint>Drag the box to move it and the handles to resize it. Pick a shape to lock the proportions.</Hint>
            <StageWrap ref={wrapRef}>
                {loadError && <Centered error>{loadError}</Centered>}
                {!loaded && !loadError && <Centered>Loading photo…</Centered>}
                {loaded && rect && scale > 0 && (
                    <Stage ref={stageRef} style={{ width: iw * scale, height: ih * scale }}>
                        <StageImg src={loaded.objectUrl} alt="" draggable={false} />
                        <Box
                            data-testid="crop-box"
                            style={{
                                left: rect.x * scale,
                                top: rect.y * scale,
                                width: rect.w * scale,
                                height: rect.h * scale,
                            }}
                            onPointerDown={(e) => beginDrag(e, 'move')}
                            onPointerMove={onPointerMove}
                            onPointerUp={endDrag}
                            onPointerCancel={endDrag}
                        >
                            {handles.map((h) => (
                                <Handle
                                    key={h}
                                    data-handle={h}
                                    style={HANDLE_POS[h]}
                                    onPointerDown={(e) => beginDrag(e, h)}
                                />
                            ))}
                        </Box>
                    </Stage>
                )}
            </StageWrap>
            <Presets>
                {PRESETS.map((p) => (
                    <PresetBtn
                        key={p.id}
                        type="button"
                        active={p.id === presetId}
                        onClick={() => choosePreset(p)}
                        disabled={!loaded}
                    >
                        {p.label}
                    </PresetBtn>
                ))}
                {out && <SizeInfo>{out.w} × {out.h} px</SizeInfo>}
            </Presets>
        </EditorShell>
    );
};

export default CropEditor;
