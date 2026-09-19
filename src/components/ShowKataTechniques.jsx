import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import ImageModal from './ImageModal';
import { KataTechniqueCard } from './KataTechniqueCard';
import { useKataCache } from '../hooks/useGlobalCache';
import '../utils/imagePreloader';
import '../components/MobileOptimization.css';

// Import kata media at build time. Posters are stills the grid always shows;
// videos are fetched only when a technique is played.
const kataPosters = require.context('../pages/kata_techniques', true, /\.webp$/);
const kataVideos = require.context('../pages/kata_techniques', true, /\.mp4$/);

// Per-clip frame rate, written by scripts/convert_media.py.
const manifest = require('../pages/media-manifest.json');

const resolve = (ctx, path) => {
    try {
        return ctx(path);
    } catch (e) {
        return null;
    }
};

const ShowKataTechniques = memo(({ kataType, preloadedData }) => {
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    
    // Use global cache for kata data, but prefer preloaded data if available
    const { data: cachedData, loading: cacheLoading, error: cacheError } = useKataCache(kataType);
    
    // Use preloaded data if available, otherwise use cached data
    const items = useMemo(() => preloadedData || cachedData || [], [preloadedData, cachedData]);
    const loading = preloadedData ? false : cacheLoading;
    const error = preloadedData ? null : cacheError;

    // Resolve poster/video pairs once per item. Index-aligned with `items`, so
    // a technique missing media still keeps its slot.
    const media = useMemo(() => {
        if (!items || items.length === 0) return [];

        return items.map(item => {
            const base = `./${item.kata_name}/${item.name}`;
            const key = `kata_techniques/${item.kata_name}/${item.name}`;
            return {
                posterSrc: resolve(kataPosters, `${base}.webp`),
                videoSrc: resolve(kataVideos, `${base}.mp4`),
                fps: manifest[key]?.fps,
            };
        });
    }, [items]);

    // Preload only the first 3 posters for immediate display
    useEffect(() => {
        const priorityPosters = media.slice(0, 3).map(m => m.posterSrc).filter(Boolean);
        if (priorityPosters.length > 0) {
            window.imagePreloader?.preloadBatch(priorityPosters);
        }
    }, [media]);

    const openCard = useCallback((title, posterSrc, videoSrc, fps) =>
        setModal({ open: true, title, src: posterSrc, videoSrc, fps }), []);
    const closeCard = useCallback(() =>
        setModal({ open: false, title: '', src: '', videoSrc: null, fps: undefined }), []);

    if (loading) return (
        <div className="loading-placeholder">
            Loading kata techniques...
        </div>
    );

    if (error) return (
        <div className="loading-placeholder">
            Error: {error}
        </div>
    );

    return (
        <div>
            <div className="techniques-grid">
                {items.map((filteredItem, index) => (
                    <KataTechniqueCard
                        key={filteredItem.id}
                        item={filteredItem}
                        posterSrc={media[index]?.posterSrc}
                        videoSrc={media[index]?.videoSrc}
                        fps={media[index]?.fps}
                        onCardClick={openCard}
                        index={index}
                    />
                ))}
            </div>

            <ImageModal
                isOpen={modal.open}
                onClose={closeCard}
                title={modal.title}
                imageSrc={modal.src}
                videoSrc={modal.videoSrc}
                fps={modal.fps}
                altText={modal.title}
            />
        </div>
    );
});

ShowKataTechniques.displayName = 'ShowKataTechniques';

export { ShowKataTechniques };