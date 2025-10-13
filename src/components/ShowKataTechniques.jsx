import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import ImageModal from './ImageModal';
import { SmoothImage } from './SmoothImage';
import { KataTechniqueCard } from './KataTechniqueCard';
import { useKataCache } from '../hooks/useGlobalCache';
import '../utils/imagePreloader';

// Import all kata images at build time for better performance
const kataImages = require.context('../pages/kata_techniques', true, /\.gif$/);

const ShowKataTechniques = memo(({ kataType, preloadedData }) => {
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    
    // Use global cache for kata data, but prefer preloaded data if available
    const { data: cachedData, loading: cacheLoading, error: cacheError } = useKataCache(kataType);
    
    // Use preloaded data if available, otherwise use cached data
    const items = preloadedData || cachedData || [];
    const loading = preloadedData ? false : cacheLoading;
    const error = preloadedData ? null : cacheError;

    // Memoize image URLs to prevent unnecessary recalculations
    const imageUrls = useMemo(() => {
        if (!items || items.length === 0) return [];
        
        return items.map(item => {
            const imagePath = `./${item.kata_name}/${item.name}.gif`;
            try {
                return kataImages(imagePath);
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
    }, [items]);

    // Preload only the first 3 images for immediate display
    useEffect(() => {
        if (imageUrls.length > 0) {
            const priorityImages = imageUrls.slice(0, 3);
            window.imagePreloader?.preloadBatch(priorityImages);
        }
    }, [imageUrls]);

    const openCard = useCallback((title, src) => setModal({ open: true, title, src }), []);
    const closeCard = useCallback(() => setModal({ open: false, title: '', src: '' }), []);

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
                {items.map((filteredItem, index) => {
                    const imgSrc = imageUrls[index] || null;
                    return (
                        <KataTechniqueCard
                            key={filteredItem.id}
                            item={filteredItem}
                            imageSrc={imgSrc}
                            onCardClick={openCard}
                            index={index}
                        />
                    )
                })}
            </div>

            <ImageModal
                isOpen={modal.open}
                onClose={closeCard}
                title={modal.title}
                imageSrc={modal.src}
                altText={modal.title}
            />
        </div>
    );
});

ShowKataTechniques.displayName = 'ShowKataTechniques';

export { ShowKataTechniques };