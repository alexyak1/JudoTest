import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = `http://${window.location.hostname}:8787`;
const POLL_INTERVAL_MS = 5000;
const SLIDE_INTERVAL_MS = 6000;
const FADE_MS = 800;

const absoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

const TVShow = () => {
    const { token } = useParams();
    const [photos, setPhotos] = useState([]);
    const [index, setIndex] = useState(0);
    const [fading, setFading] = useState(false);
    const maxIdRef = useRef(0);
    const photosRef = useRef([]);
    const pollTimerRef = useRef(null);
    const slideTimerRef = useRef(null);

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

    // Slideshow advance loop.
    useEffect(() => {
        if (photos.length <= 1) return undefined;
        slideTimerRef.current = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setIndex((i) => (i + 1) % photosRef.current.length);
                setFading(false);
            }, FADE_MS);
        }, SLIDE_INTERVAL_MS);
        return () => clearInterval(slideTimerRef.current);
    }, [photos.length]);

    // Keep index inside bounds when the list grows or shrinks.
    useEffect(() => {
        if (photos.length === 0 && index !== 0) setIndex(0);
        if (photos.length > 0 && index >= photos.length) setIndex(0);
    }, [photos.length, index]);

    const current = photos[index];

    const overlay = {
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    };

    const imgStyle = {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        transition: `opacity ${FADE_MS}ms ease-in-out`,
        opacity: fading ? 0 : 1,
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
            {current && (
                <>
                    <img
                        key={current.id}
                        src={absoluteUrl(current.url)}
                        alt={current.competition_name || ''}
                        style={imgStyle}
                    />
                    <div style={captionStyle}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 600 }}>
                            {current.competition_name}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TVShow;
