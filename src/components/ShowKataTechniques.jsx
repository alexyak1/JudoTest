import React, { useState, useEffect, useCallback, memo } from 'react';
import ImageModal from './ImageModal';
import { SmoothImage } from './SmoothImage';
import { KataTechniqueCard } from './KataTechniqueCard';
import '../utils/imagePreloader';

const ShowKataTechniques = memo(({ kataType, preloadedData }) => {
    const [items, setItems] = useState(preloadedData || []);
    const [loading, setLoading] = useState(!preloadedData);
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    const host = window.location.hostname;
    const baseUrl = `http://${host}:8787`;

    useEffect(() => {
        // Only fetch if we don't have preloaded data
        if (!preloadedData) {
            setLoading(true);
            fetch(`${baseUrl}/kata?type=${kataType}`)
                .then(res => res.json())
                .then(result => {
                    setItems(result);
                    setLoading(false);
                    
                    // Preload images in background for faster future loading
                    setTimeout(() => {
                        const imageUrls = result.map(item => 
                            require("../pages/kata_techniques/" + item.kata_name + "/" + item.name + ".gif")
                        );
                        window.imagePreloader?.preloadBatch(imageUrls);
                    }, 100);
                })
                .catch(error => {
                    console.error("Error fetching kata techniques:", error);
                    setLoading(false);
                });
        } else {
            // Use preloaded data and preload images
            setItems(preloadedData);
            setLoading(false);
            
            setTimeout(() => {
                const imageUrls = preloadedData.map(item => 
                    require("../pages/kata_techniques/" + item.kata_name + "/" + item.name + ".gif")
                );
                window.imagePreloader?.preloadBatch(imageUrls);
            }, 100);
        }
    }, [kataType, baseUrl, preloadedData]);

    const openCard = useCallback((title, src) => setModal({ open: true, title, src }), []);
    const closeCard = useCallback(() => setModal({ open: false, title: '', src: '' }), []);

    if (loading) return (
        <div className="loading-placeholder">
            Loading kata techniques...
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