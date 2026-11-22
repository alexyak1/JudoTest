import {
    COLLAGE_LAYOUTS,
    DEFAULT_TRANSFORM,
    cellRect,
    coverSource,
    cropSourceRect,
    fitRatio,
    fullRect,
    hitCell,
    minCropSize,
    moveRect,
    outputSize,
    resizeRect,
    resolveRatio,
} from './imageGeometry';

const IW = 4000;
const IH = 3000;
const MIN = minCropSize(IW, IH);

const inside = (r, iw = IW, ih = IH) =>
    r.x >= -1e-9 && r.y >= -1e-9 && r.x + r.w <= iw + 1e-9 && r.y + r.h <= ih + 1e-9;

describe('resolveRatio', () => {
    test('passes numbers and null through, and resolves "original"', () => {
        expect(resolveRatio(null, IW, IH)).toBe(null);
        expect(resolveRatio(1, IW, IH)).toBe(1);
        expect(resolveRatio('original', IW, IH)).toBeCloseTo(4 / 3, 6);
    });
});

describe('fitRatio', () => {
    test('picks the largest box of the ratio that fits the photo', () => {
        const wide = fitRatio(fullRect(IW, IH), 16 / 9, IW, IH);
        expect(wide.w).toBe(IW);
        expect(wide.h).toBeCloseTo(IW * 9 / 16, 6);

        const tall = fitRatio(fullRect(IW, IH), 3 / 4, IW, IH);
        expect(tall.h).toBe(IH);
        expect(tall.w).toBeCloseTo(IH * 3 / 4, 6);
    });

    test('stays centred on the old box and inside the photo', () => {
        const rect = { x: 3000, y: 2000, w: 800, h: 800 };
        const next = fitRatio(rect, 1, IW, IH);
        expect(inside(next)).toBe(true);
        expect(next.w / next.h).toBeCloseTo(1, 6);
    });
});

describe('moveRect', () => {
    test('moves by the delta', () => {
        const next = moveRect({ x: 100, y: 100, w: 500, h: 400 }, 50, -30, IW, IH);
        expect(next).toEqual({ x: 150, y: 70, w: 500, h: 400 });
    });

    test('cannot leave the photo on any side', () => {
        const rect = { x: 100, y: 100, w: 500, h: 400 };
        expect(moveRect(rect, -9999, -9999, IW, IH)).toEqual({ x: 0, y: 0, w: 500, h: 400 });
        expect(moveRect(rect, 9999, 9999, IW, IH)).toEqual({ x: IW - 500, y: IH - 400, w: 500, h: 400 });
    });
});

describe('resizeRect, free-form', () => {
    const rect = { x: 1000, y: 1000, w: 1000, h: 800 };

    test('an edge handle moves only that edge', () => {
        const east = resizeRect(rect, 'e', 2500, 0, IW, IH, null, MIN);
        expect(east).toEqual({ x: 1000, y: 1000, w: 1500, h: 800 });
        const north = resizeRect(rect, 'n', 0, 600, IW, IH, null, MIN);
        expect(north).toEqual({ x: 1000, y: 600, w: 1000, h: 1200 });
    });

    test('a corner handle moves its two edges', () => {
        const nw = resizeRect(rect, 'nw', 500, 400, IW, IH, null, MIN);
        expect(nw).toEqual({ x: 500, y: 400, w: 1500, h: 1400 });
    });

    test('cannot cross the opposite edge or shrink below the minimum', () => {
        const crushed = resizeRect(rect, 'e', 0, 0, IW, IH, null, MIN);
        expect(crushed.w).toBe(MIN);
        expect(crushed.x).toBe(1000);
    });

    test('cannot leave the photo', () => {
        const out = resizeRect(rect, 'se', 99999, 99999, IW, IH, null, MIN);
        expect(inside(out)).toBe(true);
        expect(out.x + out.w).toBe(IW);
        expect(out.y + out.h).toBe(IH);
    });
});

describe('resizeRect, locked ratio', () => {
    const ratio = 16 / 9;
    const rect = { x: 1000, y: 1000, w: 1600, h: 900 };

    test('keeps the ratio and the opposite corner', () => {
        const next = resizeRect(rect, 'se', 3000, 2000, IW, IH, ratio, MIN);
        expect(next.w / next.h).toBeCloseTo(ratio, 6);
        expect(next.x).toBe(1000);
        expect(next.y).toBe(1000);
    });

    test('works from every corner, anchored on the opposite one', () => {
        const nw = resizeRect(rect, 'nw', 600, 600, IW, IH, ratio, MIN);
        expect(nw.x + nw.w).toBeCloseTo(2600, 6);
        expect(nw.y + nw.h).toBeCloseTo(1900, 6);
        expect(nw.w / nw.h).toBeCloseTo(ratio, 6);

        const ne = resizeRect(rect, 'ne', 3000, 600, IW, IH, ratio, MIN);
        expect(ne.x).toBe(1000);
        expect(ne.y + ne.h).toBeCloseTo(1900, 6);

        const sw = resizeRect(rect, 'sw', 600, 2400, IW, IH, ratio, MIN);
        expect(sw.x + sw.w).toBeCloseTo(2600, 6);
        expect(sw.y).toBe(1000);
    });

    test('stops at the photo edge instead of overhanging', () => {
        const next = resizeRect(rect, 'se', 99999, 99999, IW, IH, ratio, MIN);
        expect(inside(next)).toBe(true);
        expect(next.w / next.h).toBeCloseTo(ratio, 6);
    });

    test('stops at whichever photo edge it reaches first, width or height', () => {
        // A square in a landscape photo runs out of height before width.
        const square = { x: 1000, y: 1000, w: 500, h: 500 };
        const se = resizeRect(square, 'se', 99999, 99999, IW, IH, 1, MIN);
        expect(inside(se)).toBe(true);
        expect(se.w).toBe(IH - 1000);
        expect(se.w / se.h).toBeCloseTo(1, 6);

        const nw = resizeRect(square, 'nw', -99999, -99999, IW, IH, 1, MIN);
        expect(inside(nw)).toBe(true);
        expect(nw.x + nw.w).toBeCloseTo(1500, 6);
        expect(nw.y).toBe(0);

        // A portrait box in the same photo runs out of width first.
        const tall = { x: 3000, y: 500, w: 300, h: 400 };
        const tallSe = resizeRect(tall, 'se', 99999, 99999, IW, IH, 3 / 4, MIN);
        expect(inside(tallSe)).toBe(true);
        expect(tallSe.x + tallSe.w).toBe(IW);
    });

    test('never collapses below the minimum size', () => {
        const next = resizeRect(rect, 'se', 0, 0, IW, IH, ratio, MIN);
        expect(next.w).toBeGreaterThanOrEqual(MIN);
        expect(next.h).toBeGreaterThanOrEqual(MIN);
        expect(next.w / next.h).toBeCloseTo(ratio, 6);
    });

    test('ignores edge handles, which are not shown when the ratio is locked', () => {
        expect(resizeRect(rect, 'e', 3000, 0, IW, IH, ratio, MIN)).toBe(rect);
    });
});

describe('cropSourceRect and outputSize', () => {
    test('rounds to whole pixels and stays inside the photo', () => {
        const r = cropSourceRect({ x: 10.4, y: 20.6, w: IW, h: IH }, IW, IH);
        expect(r.sx + r.sw).toBeLessThanOrEqual(IW);
        expect(r.sy + r.sh).toBeLessThanOrEqual(IH);
        expect(Number.isInteger(r.sx) && Number.isInteger(r.sw)).toBe(true);
    });

    test('keeps full resolution up to the cap, shrinks above it, never enlarges', () => {
        expect(outputSize(1200, 800)).toEqual({ w: 1200, h: 800 });
        expect(outputSize(4000, 3000)).toEqual({ w: 2400, h: 1800 });
        expect(outputSize(3000, 4000)).toEqual({ w: 1800, h: 2400 });
        expect(outputSize(100, 50)).toEqual({ w: 100, h: 50 });
    });
});

describe('collage layouts', () => {
    test('every layout tiles the whole collage exactly once', () => {
        COLLAGE_LAYOUTS.forEach((layout) => {
            const area = layout.cells.reduce((sum, c) => sum + c.w * c.h, 0);
            expect(area).toBeCloseTo(1, 6);
            layout.cells.forEach((c) => {
                expect(c.x).toBeGreaterThanOrEqual(0);
                expect(c.y).toBeGreaterThanOrEqual(0);
                expect(c.x + c.w).toBeLessThanOrEqual(1 + 1e-9);
                expect(c.y + c.h).toBeLessThanOrEqual(1 + 1e-9);
            });
        });
    });

    test('cellRect leaves the gap only between photos, not at the outer edge', () => {
        const [a, b] = COLLAGE_LAYOUTS.find((l) => l.id === 'h2').cells;
        const ra = cellRect(a, 1000, 500, 10);
        const rb = cellRect(b, 1000, 500, 10);
        expect(ra.x).toBe(0);
        expect(ra.y).toBe(0);
        expect(ra.h).toBe(500);
        expect(ra.w).toBe(495);
        expect(rb.x).toBe(505);
        expect(rb.x + rb.w).toBe(1000);
        expect(rb.x - (ra.x + ra.w)).toBe(10);
    });

    test('with no gap the cells meet exactly', () => {
        const [a, b] = COLLAGE_LAYOUTS.find((l) => l.id === 'h3').cells;
        const ra = cellRect(a, 1920, 1080, 0);
        const rb = cellRect(b, 1920, 1080, 0);
        expect(ra.x + ra.w).toBe(rb.x);
    });

    test('hitCell finds the cell under a point', () => {
        const cells = COLLAGE_LAYOUTS.find((l) => l.id === 'l3').cells;
        expect(hitCell(cells, 900, 450, 100, 200)).toBe(0);
        expect(hitCell(cells, 900, 450, 700, 100)).toBe(1);
        expect(hitCell(cells, 900, 450, 700, 400)).toBe(2);
        expect(hitCell(cells, 900, 450, -5, 10)).toBe(-1);
    });
});

describe('coverSource', () => {
    const { zoom, fx, fy } = DEFAULT_TRANSFORM;

    test('fills the cell: the visible part has the cell shape', () => {
        const s = coverSource(500, 500, IW, IH, zoom, fx, fy);
        expect(s.sw / s.sh).toBeCloseTo(1, 6);
        expect(s.sh).toBeCloseTo(IH, 6);
        expect(s.sx).toBeCloseTo((IW - IH) / 2, 6);
    });

    test('zoom shows a smaller part of the photo', () => {
        const one = coverSource(960, 540, IW, IH, 1, 0.5, 0.5);
        const two = coverSource(960, 540, IW, IH, 2, 0.5, 0.5);
        expect(two.sw).toBeCloseTo(one.sw / 2, 6);
        expect(two.sh).toBeCloseTo(one.sh / 2, 6);
    });

    test('the visible part never leaves the photo, however far it is panned', () => {
        [[0, 0], [1, 1], [-3, 9], [0.5, 0.5]].forEach(([x, y]) => {
            [1, 1.5, 3].forEach((z) => {
                const s = coverSource(960, 540, IW, IH, z, x, y);
                expect(s.sx).toBeGreaterThanOrEqual(-1e-9);
                expect(s.sy).toBeGreaterThanOrEqual(-1e-9);
                expect(s.sx + s.sw).toBeLessThanOrEqual(IW + 1e-9);
                expect(s.sy + s.sh).toBeLessThanOrEqual(IH + 1e-9);
            });
        });
    });

    test('returns the clamped focus, so panning cannot build up past the edge', () => {
        const s = coverSource(960, 540, IW, IH, 1, 5, 5);
        expect(s.fx).toBeLessThanOrEqual(1);
        expect(s.fy).toBeLessThanOrEqual(1);
        expect(s.sx + s.sw).toBeCloseTo(IW, 6);
    });

    test('a photo with the cell shape and no zoom is shown whole', () => {
        const s = coverSource(1600, 900, 3200, 1800, 1, 0.5, 0.5);
        expect(s.sx).toBeCloseTo(0, 6);
        expect(s.sy).toBeCloseTo(0, 6);
        expect(s.sw).toBeCloseTo(3200, 6);
        expect(s.sh).toBeCloseTo(1800, 6);
    });

    test('zoom below 1 is treated as 1, so a photo can never leave a gap', () => {
        const s = coverSource(960, 540, IW, IH, 0.2, 0.5, 0.5);
        const base = coverSource(960, 540, IW, IH, 1, 0.5, 0.5);
        expect(s.sw).toBeCloseTo(base.sw, 6);
    });
});
