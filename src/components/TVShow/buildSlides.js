// Layout logic for the TV slideshow: which photos share a slide, and how each
// one is fitted into its space. Pure functions, no React and no DOM, so it can
// be tested on its own.
//
// The TV is wider than most photos are tall. Showing a portrait photo whole
// leaves a black bar down each side, so instead:
//   - a photo is cropped to fill its space ("cover") whenever little of it is
//     lost, and
//   - two portrait photos go side by side on one slide, so each gets half the
//     screen and the pair reads as one landscape picture.
// A photo that cropping would hurt too much (a panorama, a very tall phone
// shot) is shown whole ("contain") instead, over a blurred copy of itself.
//
// Everything is relative to the screen's aspect ratio rather than a hard-coded
// 16:9, so it behaves on a 4:3 panel and in an ordinary browser window too.

// The smallest share of a photo we are willing to keep when cropping it to
// fill a space. Below this the crop starts cutting people out of the picture.
export const MIN_VISIBLE = 0.6;

// How much of a photo survives being cropped to fill a space of the given
// aspect ratio (1 means nothing is lost). Cropping removes the overhang on
// whichever axis is too long, so the kept share is the shorter ratio of the two.
export const visibleShare = (photoAspect, cellAspect) =>
    Math.min(photoAspect / cellAspect, cellAspect / photoAspect);

// A photo is "portrait" here when a half-screen cell crops it less than the
// full screen would, and those two shares meet at the geometric mean of the
// two cell aspects: sqrt(A * A/2) = A / sqrt(2). On 16:9 that is 1.26, so
// 4:3 and wider stay on their own, and 5:4, square and taller get paired.
export const isPortrait = (photoAspect, screenAspect) =>
    photoAspect < screenAspect / Math.SQRT2;

const makeSlide = (items, screenAspect) => {
    const cellAspect = screenAspect / items.length;
    return {
        key: items.map((item) => item.photo.id).join('-'),
        cells: items.map(({ photo, aspect }) => ({
            photo,
            fit: visibleShare(aspect, cellAspect) >= MIN_VISIBLE ? 'cover' : 'contain',
        })),
    };
};

// photos:       the club's photos in display order (newest first).
// sizes:        photo id -> { w, h } once measured. Photos without an entry
//               (still loading, or failed to load) are left out of the show.
// screenAspect: viewport width / height.
//
// Returns slides of one or two cells: { key, cells: [{ photo, fit }] }.
// Landscape photos get a slide each. Portrait photos are paired up in order,
// the pair sitting where its first photo was, so the newest photos still lead.
// A portrait left without a partner gets a slide to itself.
export const buildSlides = (photos, sizes, screenAspect) => {
    const items = [];
    photos.forEach((photo) => {
        const size = sizes[photo.id];
        if (size && size.w > 0 && size.h > 0) {
            items.push({ photo, aspect: size.w / size.h });
        }
    });

    const slides = [];
    const placed = new Set();
    items.forEach((item, i) => {
        if (placed.has(i)) return;
        placed.add(i);

        if (!isPortrait(item.aspect, screenAspect)) {
            slides.push(makeSlide([item], screenAspect));
            return;
        }

        let partner = i + 1;
        while (
            partner < items.length &&
            (placed.has(partner) || !isPortrait(items[partner].aspect, screenAspect))
        ) {
            partner += 1;
        }
        if (partner < items.length) {
            placed.add(partner);
            slides.push(makeSlide([item, items[partner]], screenAspect));
        } else {
            slides.push(makeSlide([item], screenAspect));
        }
    });
    return slides;
};

// The slide to show after `shown`. Slides are rebuilt whenever a photo finishes
// loading or a new one arrives, which can re-pair photos and change a slide's
// key, so the current slide is found by key first and then by any photo it
// shares with a rebuilt slide. If neither matches, start over from the newest.
export const nextSlide = (slides, shown) => {
    if (slides.length === 0) return null;
    if (!shown) return slides[0];

    let i = slides.findIndex((slide) => slide.key === shown.key);
    if (i < 0) {
        const shownIds = new Set(shown.cells.map((cell) => cell.photo.id));
        i = slides.findIndex((slide) =>
            slide.cells.some((cell) => shownIds.has(cell.photo.id))
        );
    }
    return i < 0 ? slides[0] : slides[(i + 1) % slides.length];
};

// Competition name(s) for the caption. The two photos of a pair usually come
// from the same competition, so repeats are dropped.
export const slideCaption = (slide) => {
    const names = [];
    slide.cells.forEach(({ photo }) => {
        const name = photo.competition_name;
        if (name && !names.includes(name)) names.push(name);
    });
    return names.join(' · ');
};
