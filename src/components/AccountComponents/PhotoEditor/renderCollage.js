import { DEFAULT_TRANSFORM, cellRect, coverSource } from './imageGeometry';

// Draws a collage onto a 2D context of width x height. The live preview and the
// saved file both go through here, so what is saved is what was on screen.
//
//   cells:        layout cells, as fractions of the whole
//   images:       one decoded image (or null for an empty slot) per cell
//   transforms:   one { zoom, fx, fy } per cell
//   gap:          pixels between photos
//   placeholders: draw a "+" in empty slots (preview only)
export const renderCollage = (ctx, width, height, { cells, images, transforms, gap, placeholders }) => {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    cells.forEach((c, i) => {
        const r = cellRect(c, width, height, gap);
        const img = images[i];
        if (img) {
            const t = transforms[i] || DEFAULT_TRANSFORM;
            const s = coverSource(r.w, r.h, img.naturalWidth, img.naturalHeight, t.zoom, t.fx, t.fy);
            ctx.drawImage(img, s.sx, s.sy, s.sw, s.sh, r.x, r.y, r.w, r.h);
        } else if (placeholders) {
            ctx.fillStyle = '#16162a';
            ctx.fillRect(r.x, r.y, r.w, r.h);
            ctx.fillStyle = '#6b7280';
            ctx.font = `${Math.round(Math.min(r.w, r.h) * 0.3)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', r.x + r.w / 2, r.y + r.h / 2);
        }
    });
    ctx.restore();
};
