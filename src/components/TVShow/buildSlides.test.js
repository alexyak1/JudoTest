import { buildSlides, isPortrait, nextSlide, slideCaption, visibleShare } from './buildSlides';

const HD = 16 / 9;

const photo = (id, competition_name = 'Open') => ({ id, url: `/uploads/${id}.jpg`, competition_name });
const sizesOf = (spec) =>
    Object.fromEntries(Object.entries(spec).map(([id, [w, h]]) => [id, { w, h }]));

const keys = (slides) => slides.map((s) => s.key);
const fits = (slide) => slide.cells.map((c) => c.fit);

describe('isPortrait', () => {
    test('splits where a half-screen crop starts beating a full-screen one (16:9)', () => {
        expect(isPortrait(2 / 3, HD)).toBe(true); // 2:3 phone portrait
        expect(isPortrait(1, HD)).toBe(true); // square
        expect(isPortrait(5 / 4, HD)).toBe(true);
        expect(isPortrait(4 / 3, HD)).toBe(false);
        expect(isPortrait(3 / 2, HD)).toBe(false);
        expect(isPortrait(16 / 9, HD)).toBe(false);
    });

    test('follows the screen, not a fixed 16:9', () => {
        // On a square window 4:3 is already wide enough to stand alone, and a
        // square photo is too.
        expect(isPortrait(1, 1)).toBe(false);
        expect(isPortrait(0.6, 1)).toBe(true);
    });
});

describe('buildSlides', () => {
    test('a landscape photo gets its own slide, cropped to fill', () => {
        const slides = buildSlides([photo(1)], sizesOf({ 1: [3000, 2000] }), HD);
        expect(keys(slides)).toEqual(['1']);
        expect(fits(slides[0])).toEqual(['cover']);
    });

    test('two portraits become one two-cell slide, both cropped to fill', () => {
        const slides = buildSlides(
            [photo(1), photo(2)],
            sizesOf({ 1: [2000, 3000], 2: [2000, 3000] }),
            HD
        );
        expect(keys(slides)).toEqual(['1-2']);
        expect(fits(slides[0])).toEqual(['cover', 'cover']);
    });

    test('a 9:16 phone shot still fills half the screen', () => {
        const slides = buildSlides(
            [photo(1), photo(2)],
            sizesOf({ 1: [1080, 1920], 2: [1080, 1920] }),
            HD
        );
        expect(fits(slides[0])).toEqual(['cover', 'cover']);
    });

    test('pairs portraits across a landscape, the pair taking the first one\'s place', () => {
        const slides = buildSlides(
            [photo(1), photo(2), photo(3), photo(4)],
            sizesOf({ 1: [2000, 3000], 2: [3000, 2000], 3: [2000, 3000], 4: [3000, 2000] }),
            HD
        );
        expect(keys(slides)).toEqual(['1-3', '2', '4']);
    });

    test('an odd portrait is shown alone, whole, rather than cropped to a sliver', () => {
        const slides = buildSlides([photo(1)], sizesOf({ 1: [2000, 3000] }), HD);
        expect(keys(slides)).toEqual(['1']);
        expect(fits(slides[0])).toEqual(['contain']);
    });

    test('a panorama is shown whole instead of losing most of its width', () => {
        const slides = buildSlides([photo(1)], sizesOf({ 1: [4000, 1000] }), HD);
        expect(fits(slides[0])).toEqual(['contain']);
    });

    test('a very tall photo is shown whole inside its half of a pair', () => {
        const slides = buildSlides(
            [photo(1), photo(2)],
            sizesOf({ 1: [1000, 3500], 2: [2000, 3000] }),
            HD
        );
        expect(fits(slides[0])).toEqual(['contain', 'cover']);
    });

    test('photos that are not measured yet, or failed, are left out', () => {
        const slides = buildSlides(
            [photo(1), photo(2), photo(3)],
            { 1: { w: 3000, h: 2000 }, 3: null },
            HD
        );
        expect(keys(slides)).toEqual(['1']);
    });

    test('keeps newest-first order', () => {
        const slides = buildSlides(
            [photo(9), photo(5), photo(2)],
            sizesOf({ 9: [3000, 2000], 5: [3000, 2000], 2: [3000, 2000] }),
            HD
        );
        expect(keys(slides)).toEqual(['9', '5', '2']);
    });

    test('adapts to the viewport: on a square window a square photo needs no partner', () => {
        const slides = buildSlides([photo(1)], sizesOf({ 1: [2000, 2000] }), 1);
        expect(keys(slides)).toEqual(['1']);
        expect(fits(slides[0])).toEqual(['cover']);
    });
});

describe('visibleShare', () => {
    test('is 1 for a perfect fit and shrinks as the crop grows', () => {
        expect(visibleShare(HD, HD)).toBe(1);
        expect(visibleShare(3 / 2, HD)).toBeCloseTo(0.844, 3);
        expect(visibleShare(2 / 3, HD)).toBeCloseTo(0.375, 3);
    });
});

describe('nextSlide', () => {
    const slides = buildSlides(
        [photo(1), photo(2), photo(3)],
        sizesOf({ 1: [3000, 2000], 2: [3000, 2000], 3: [3000, 2000] }),
        HD
    );

    test('starts with the first slide, and returns null when there are none', () => {
        expect(nextSlide(slides, null)).toBe(slides[0]);
        expect(nextSlide([], null)).toBeNull();
    });

    test('advances and wraps', () => {
        expect(nextSlide(slides, slides[0])).toBe(slides[1]);
        expect(nextSlide(slides, slides[2])).toBe(slides[0]);
    });

    test('finds its place again after a rebuild changed the slide\'s key', () => {
        // Photo 2 was on screen alone; a rebuild has since paired it with 4.
        const rebuilt = buildSlides(
            [photo(1), photo(2), photo(3), photo(4)],
            sizesOf({ 1: [3000, 2000], 2: [2000, 3000], 3: [3000, 2000], 4: [2000, 3000] }),
            HD
        );
        const shown = slides[1]; // key '2'
        expect(keys(rebuilt)).toEqual(['1', '2-4', '3']);
        expect(nextSlide(rebuilt, shown)).toBe(rebuilt[2]);
    });

    test('goes back to the newest when nothing on screen is in the list any more', () => {
        const other = buildSlides([photo(7)], sizesOf({ 7: [3000, 2000] }), HD);
        expect(nextSlide(other, slides[1])).toBe(other[0]);
    });
});

describe('slideCaption', () => {
    test('shows a shared competition name once', () => {
        const slides = buildSlides(
            [photo(1, 'Stockholm Open'), photo(2, 'Stockholm Open')],
            sizesOf({ 1: [2000, 3000], 2: [2000, 3000] }),
            HD
        );
        expect(slideCaption(slides[0])).toBe('Stockholm Open');
    });

    test('joins different names, and skips photos without one', () => {
        const slides = buildSlides(
            [photo(1, 'Stockholm Open'), photo(2, 'Club Cup'), photo(3, '')],
            sizesOf({ 1: [2000, 3000], 2: [2000, 3000], 3: [3000, 2000] }),
            HD
        );
        expect(slideCaption(slides[0])).toBe('Stockholm Open · Club Cup');
        expect(slideCaption(slides[1])).toBe('');
    });
});
