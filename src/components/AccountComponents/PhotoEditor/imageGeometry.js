// Geometry for the manual photo editor: the crop box and the collage layouts.
// Pure functions, no React and no DOM, so they can be tested on their own.
//
// Two coordinate systems are used:
//   - "natural" pixels: the photo's real size. The crop box is kept in these.
//   - screen pixels: whatever the stage or preview is drawn at. The components
//     convert between the two with a single scale factor.

// Longest side of anything the editor produces. Phone photos are 4000px+ and
// the TV and the club page never need more than this.
export const MAX_OUTPUT_SIDE = 2400;

const clamp = (value, lo, hi) => Math.min(Math.max(value, lo), hi);

// ---------------------------------------------------------------------------
// Crop
// ---------------------------------------------------------------------------

// The crop box can never be dragged smaller than this, in natural pixels.
export const minCropSize = (iw, ih) =>
    Math.max(16, Math.round(Math.min(iw, ih) * 0.05));

// A preset's ratio is a number (width / height), null for free-form, or the
// string 'original' for "same shape as the photo".
export const resolveRatio = (ratio, iw, ih) => (ratio === 'original' ? iw / ih : ratio);

export const fullRect = (iw, ih) => ({ x: 0, y: 0, w: iw, h: ih });

// The largest box of the given ratio that fits in the photo, centred where the
// current box is centred (and nudged back inside if that would overhang).
export const fitRatio = (rect, ratio, iw, ih) => {
    const w = Math.min(iw, ih * ratio);
    const h = w / ratio;
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    return {
        x: clamp(cx - w / 2, 0, iw - w),
        y: clamp(cy - h / 2, 0, ih - h),
        w,
        h,
    };
};

// Slide the box by (dx, dy), keeping it inside the photo.
export const moveRect = (rect, dx, dy, iw, ih) => ({
    ...rect,
    x: clamp(rect.x + dx, 0, iw - rect.w),
    y: clamp(rect.y + dy, 0, ih - rect.h),
});

// Drag one handle of the box to the pointer position (px, py).
//   handle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
//   ratio:  width / height to hold, or null for free-form.
// Free-form moves just the edges the handle touches. With a ratio only the four
// corners resize, from the opposite corner, so the box keeps its shape and
// never leaves the photo. Always called with the box as it was when the drag
// began, so the result depends only on where the pointer is now.
export const resizeRect = (rect, handle, px, py, iw, ih, ratio, minSize) => {
    const left = rect.x;
    const right = rect.x + rect.w;
    const top = rect.y;
    const bottom = rect.y + rect.h;
    const west = handle.includes('w');
    const east = handle.includes('e');
    const north = handle.includes('n');
    const south = handle.includes('s');

    if (!ratio) {
        let l = left;
        let r = right;
        let t = top;
        let b = bottom;
        if (west) l = clamp(px, 0, right - minSize);
        if (east) r = clamp(px, left + minSize, iw);
        if (north) t = clamp(py, 0, bottom - minSize);
        if (south) b = clamp(py, top + minSize, ih);
        return { x: l, y: t, w: r - l, h: b - t };
    }

    if (!((west || east) && (north || south))) return rect;

    // The corner opposite the one being dragged stays where it is.
    const ax = east ? left : right;
    const ay = south ? top : bottom;
    const dirX = east ? 1 : -1;
    const dirY = south ? 1 : -1;
    const dx = Math.max((px - ax) * dirX, 0);
    const dy = Math.max((py - ay) * dirY, 0);

    const maxW = Math.min(
        dirX > 0 ? iw - ax : ax,
        (dirY > 0 ? ih - ay : ay) * ratio
    );
    const minW = Math.min(Math.max(minSize, minSize * ratio), maxW);
    const w = clamp(Math.max(dx, dy * ratio), minW, maxW);
    const h = w / ratio;
    return {
        x: dirX > 0 ? ax : ax - w,
        y: dirY > 0 ? ay : ay - h,
        w,
        h,
    };
};

// The box as whole pixels, guaranteed inside the photo, ready for drawImage.
export const cropSourceRect = (rect, iw, ih) => {
    const sx = clamp(Math.round(rect.x), 0, iw - 1);
    const sy = clamp(Math.round(rect.y), 0, ih - 1);
    const sw = clamp(Math.round(rect.w), 1, iw - sx);
    const sh = clamp(Math.round(rect.h), 1, ih - sy);
    return { sx, sy, sw, sh };
};

// Size of the saved image: the crop at full resolution, shrunk only if it is
// larger than `maxSide`. Never scaled up.
export const outputSize = (w, h, maxSide = MAX_OUTPUT_SIDE) => {
    const scale = Math.min(1, maxSide / Math.max(w, h));
    return {
        w: Math.max(1, Math.round(w * scale)),
        h: Math.max(1, Math.round(h * scale)),
    };
};

// ---------------------------------------------------------------------------
// Collage
// ---------------------------------------------------------------------------

// Shapes of the finished collage. 16:9 first because that is what the TV is.
export const COLLAGE_ASPECTS = [
    { id: '16:9', label: '16:9', w: 1920, h: 1080 },
    { id: '4:3', label: '4:3', w: 1600, h: 1200 },
    { id: '1:1', label: '1:1', w: 1440, h: 1440 },
];

const cell = (x, y, w, h) => ({ x, y, w, h });

// Where each photo goes, as fractions of the whole collage.
export const COLLAGE_LAYOUTS = [
    { id: 'h2', label: 'Side by side', cells: [cell(0, 0, 0.5, 1), cell(0.5, 0, 0.5, 1)] },
    { id: 'v2', label: 'Stacked', cells: [cell(0, 0, 1, 0.5), cell(0, 0.5, 1, 0.5)] },
    {
        id: 'h3',
        label: 'Three across',
        cells: [cell(0, 0, 1 / 3, 1), cell(1 / 3, 0, 1 / 3, 1), cell(2 / 3, 0, 1 / 3, 1)],
    },
    {
        id: 'l3',
        label: 'One big, two small',
        cells: [cell(0, 0, 2 / 3, 1), cell(2 / 3, 0, 1 / 3, 0.5), cell(2 / 3, 0.5, 1 / 3, 0.5)],
    },
    {
        id: 'g4',
        label: 'Grid of four',
        cells: [cell(0, 0, 0.5, 0.5), cell(0.5, 0, 0.5, 0.5), cell(0, 0.5, 0.5, 0.5), cell(0.5, 0.5, 0.5, 0.5)],
    },
];

// Share of the collage's width left as a thin gap between photos.
export const GAP_SHARE = 0.005;

const EDGE = 1e-6;

// A cell as pixels on a canvas of width x height. Photos are separated by `gap`
// pixels, split evenly either side of each inner edge; the outer edges stay
// flush with the canvas.
export const cellRect = (c, width, height, gap) => {
    const x0 = Math.round(c.x * width);
    const y0 = Math.round(c.y * height);
    const x1 = Math.round((c.x + c.w) * width);
    const y1 = Math.round((c.y + c.h) * height);
    const half = gap / 2;
    const left = c.x > EDGE ? half : 0;
    const top = c.y > EDGE ? half : 0;
    const right = c.x + c.w < 1 - EDGE ? half : 0;
    const bottom = c.y + c.h < 1 - EDGE ? half : 0;
    return {
        x: x0 + left,
        y: y0 + top,
        w: x1 - x0 - left - right,
        h: y1 - y0 - top - bottom,
    };
};

// Index of the cell under a point on the canvas, or -1.
export const hitCell = (cells, width, height, px, py) =>
    cells.findIndex(
        (c) =>
            px >= c.x * width &&
            px < (c.x + c.w) * width &&
            py >= c.y * height &&
            py < (c.y + c.h) * height
    );

// How one photo sits inside its cell. It always covers the cell completely
// (the "cover" fit), then `zoom` (1 or more) magnifies it, and (fx, fy) is the
// point of the photo, as fractions 0..1, that the cell is centred on.
export const DEFAULT_TRANSFORM = { zoom: 1, fx: 0.5, fy: 0.5 };

// The part of the photo (sx, sy, sw, sh, in natural pixels) that fills a cell of
// cw x ch for the given zoom and focus. The focus is pulled back as far as
// needed so the visible part never leaves the photo; the clamped focus and the
// screen-pixels-per-natural-pixel `scale` come back too, for panning.
export const coverSource = (cw, ch, iw, ih, zoom, fx, fy) => {
    const scale = Math.max(cw / iw, ch / ih) * Math.max(1, zoom);
    const sw = Math.min(cw / scale, iw);
    const sh = Math.min(ch / scale, ih);
    const cx = clamp(fx * iw, sw / 2, iw - sw / 2);
    const cy = clamp(fy * ih, sh / 2, ih - sh / 2);
    return {
        sx: cx - sw / 2,
        sy: cy - sh / 2,
        sw,
        sh,
        scale,
        fx: cx / iw,
        fy: cy / ih,
    };
};
