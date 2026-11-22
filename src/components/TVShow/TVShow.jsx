import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE } from "../../utils/apiBase";
import { buildSlides, nextSlide, slideCaption } from './buildSlides';
import usePhotoSizes from './usePhotoSizes';

const POLL_INTERVAL_MS = 5000;
const SLIDE_INTERVAL_MS = 6000;
const FADE_MS = 800;

// How many of the newest photos must be measured before the show starts, and
// the longest we wait for them.
const START_AHEAD = 8;
const START_TIMEOUT_MS = 4000;

// Where a cropped photo is anchored inside its cell. Faces sit in the upper
// part of a picture far more often than the lower, so when the crop has to cut
// something off, bias it toward the bottom rather than cutting evenly.
const CROP_FOCUS = '50% 35%';

// Thin black gap between the two photos of a collage.
const COLLAGE_GAP = '0.3vw';

const absoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

const readViewportAspect = () => {
    if (!window.innerWidth || !window.innerHeight) return 16 / 9;
    // Two decimals is plenty, and keeps a window being dragged from rebuilding
    // the slides on every pixel.
    return Math.round((window.innerWidth / window.innerHeight) * 100) / 100;
};

const useViewportAspect = () => {
    const [aspect, setAspect] = useState(readViewportAspect);
    useEffect(() => {
        const onResize = () => setAspect(readViewportAspect());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return aspect;
};

const fill = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
};

// One photo in its share of the screen. `cover` crops it to fill the cell;
// `contain` shows all of it, with a dimmed blurred copy behind so the leftover
// space is not a black bar.
const Cell = ({ photo, fit }) => {
    const src = absoluteUrl(photo.url);
    return (
        <div style={{ position: 'relative', flex: '1 1 0', minWidth: 0, height: '100%', overflow: 'hidden' }}>
            {fit === 'contain' && (
                <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    style={{
                        ...fill,
                        objectFit: 'cover',
                        filter: 'blur(32px) brightness(0.5)',
                        transform: 'scale(1.15)',
                    }}
                />
            )}
            <img
                src={src}
                alt={photo.competition_name || ''}
                style={{
                    ...fill,
                    objectFit: fit,
                    objectPosition: fit === 'cover' ? CROP_FOCUS : '50% 50%',
                }}
            />
        </div>
    );
};

const TVShow = () => {
    const { token } = useParams();
    const [photos, setPhotos] = useState([]);
    // The slide on screen. Held as state rather than looked up by index so a
    // rebuild of the slide list (a photo finishing loading, a new upload) never
    // swaps what is on screen halfway through its turn.
    const [shown, setShown] = useState(null);
    const [fading, setFading] = useState(false);
    const maxIdRef = useRef(0);
    const photosRef = useRef([]);
    const slidesRef = useRef([]);
    const pollTimerRef = useRef(null);
    const slideTimerRef = useRef(null);
    const fadeTimerRef = useRef(null);

    const screenAspect = useViewportAspect();
    const sizes = usePhotoSizes(photos, absoluteUrl);
    const slides = useMemo(
        () => buildSlides(photos, sizes, screenAspect),
        [photos, sizes, screenAspect]
    );
    slidesRef.current = slides;

    const fetchSince = useCallback(async (sinceId) => {
        const qs = sinceId ? `?since_id=${sinceId}` : '';
        const res = await fetch(`${API_BASE}/public/tvshow/${token}/photos${qs}`, {
            cache: 'no-store',
        });
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
    }, [token]);

    useEffect(() => {
        let cancelled = false;

        const loadInitial = async () => {
            try {
                const initial = await fetchSince(0);
                if (cancelled) return;
                if (initial.length > 0) {
                    maxIdRef.current = Math.max(...initial.map((p) => p.id));
                }
                photosRef.current = initial;
                setPhotos(initial);
            } catch {
                // Silent retry on next poll tick.
            }
        };
        loadInitial();

        return () => { cancelled = true; };
    }, [fetchSince]);

    // Polling loop.
    useEffect(() => {
        const poll = async () => {
            try {
                const fresh = await fetchSince(maxIdRef.current);
                if (fresh && fresh.length > 0) {
                    maxIdRef.current = Math.max(maxIdRef.current, ...fresh.map((p) => p.id));
                    photosRef.current = [...fresh, ...photosRef.current];
                    setPhotos(photosRef.current);
                }
            } catch {
                // Keep playing on error; retry next tick.
            }
        };
        pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => clearInterval(pollTimerRef.current);
    }, [fetchSince]);

    // Photos are measured in the background, so on a cold start the slide list
    // fills in piece by piece: a portrait can sit alone for a moment before its
    // partner has loaded, and the first slide on screen would be whichever
    // photo happened to finish first rather than the newest. So the show waits
    // until the leading photos are measured, or a few seconds have passed so
    // one slow image cannot hold the screen blank.
    const hasPhotos = photos.length > 0;
    const [startTimedOut, setStartTimedOut] = useState(false);
    useEffect(() => {
        if (!hasPhotos) return undefined;
        const timer = setTimeout(() => setStartTimedOut(true), START_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [hasPhotos]);
    const leadingMeasured = photos
        .slice(0, START_AHEAD)
        .every((photo) => sizes[photo.id] !== undefined);

    useEffect(() => {
        if (!shown && slides.length > 0 && (leadingMeasured || startTimedOut)) {
            setShown(slides[0]);
        }
    }, [shown, slides, leadingMeasured, startTimedOut]);

    // Slideshow advance loop. Only runs once the show has started, so it
    // cannot start it early.
    const isPlaying = shown !== null && slides.length > 1;
    useEffect(() => {
        if (!isPlaying) return undefined;
        slideTimerRef.current = setInterval(() => {
            setFading(true);
            fadeTimerRef.current = setTimeout(() => {
                setShown((prev) => nextSlide(slidesRef.current, prev));
                setFading(false);
            }, FADE_MS);
        }, SLIDE_INTERVAL_MS);
        return () => {
            clearInterval(slideTimerRef.current);
            clearTimeout(fadeTimerRef.current);
        };
    }, [isPlaying]);

    const overlay = {
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        overflow: 'hidden',
    };

    // Stays mounted across slides so the opacity change always animates, in
    // both directions: fade out, swap the cells underneath, fade back in.
    const slideStyle = {
        display: 'flex',
        gap: COLLAGE_GAP,
        width: '100%',
        height: '100%',
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        opacity: fading ? 0 : 1,
    };

    // The photos now run edge to edge, so the caption sits on top of picture
    // instead of black bars. A soft shade behind it keeps it readable on pale
    // photos.
    const shadeStyle = {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '22vh',
        background: 'linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))',
        pointerEvents: 'none',
    };

    const captionStyle = {
        position: 'absolute',
        bottom: '4vh',
        left: '4vw',
        right: '4vw',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '2rem',
        pointerEvents: 'none',
    };

    const emptyStyle = {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        color: '#888',
        fontFamily: 'Inter, sans-serif',
        fontSize: '2rem',
        textAlign: 'center',
        padding: '2rem',
    };

    return (
        <div style={overlay}>
            {photos.length === 0 && (
                <div style={emptyStyle}>
                    Inga foton ännu.<br />
                    Ladda upp foton från en tävling så dyker de upp här.
                </div>
            )}
            {shown && (
                <>
                    <div style={slideStyle}>
                        {shown.cells.map(({ photo, fit }) => (
                            <Cell key={photo.id} photo={photo} fit={fit} />
                        ))}
                    </div>
                    <div style={shadeStyle} />
                    <div style={{ ...captionStyle, opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-in-out` }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 600 }}>
                            {slideCaption(shown)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TVShow;
