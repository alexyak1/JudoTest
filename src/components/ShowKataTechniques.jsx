import React, { useState, useEffect, useCallback, memo } from 'react';
import ImageModal from './ImageModal';
import { SmoothImage } from './SmoothImage';
import { KataTechniqueCard } from './KataTechniqueCard';
import { useKataCache } from '../hooks/useGlobalCache';
import '../utils/imagePreloader';

const ShowKataTechniques = memo(({ kataType, preloadedData }) => {
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    
    // Use global cache for kata data, but prefer preloaded data if available
    const { data: cachedData, loading: cacheLoading, error: cacheError } = useKataCache(kataType);
    
    // Use preloaded data if available, otherwise use cached data
    const items = preloadedData || cachedData || [];
    const loading = preloadedData ? false : cacheLoading;
    const error = preloadedData ? null : cacheError;

    // Preload images when data changes
    useEffect(() => {
        if (items && items.length > 0) {
            setTimeout(() => {
                const imageUrls = items.map(item => 
                    require("../pages/kata_techniques/" + item.kata_name + "/" + item.name + ".gif")
                );
                window.imagePreloader?.preloadBatch(imageUrls);
            }, 100);
        }
    }, [items]);

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
                {items.map(filteredItem => {
                    const imgSrc = require("../pages/kata_techniques/" + filteredItem.kata_name + "/" + filteredItem.name + ".gif");
                    return (
                        <KataTechniqueCard
                            key={filteredItem.id}
                            item={filteredItem}
                            imageSrc={imgSrc}
                            onCardClick={openCard}
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