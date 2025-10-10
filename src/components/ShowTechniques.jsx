import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import ImageModal from './ImageModal';
import { SmoothImage } from './SmoothImage';
import { TechniqueCard } from './TechniqueCard';
import { useDebouncedResize } from '../hooks/useDebouncedResize';
import { useTechniquesCache } from '../hooks/useGlobalCache';
import { trackBeltAction } from '../hooks/useBeltWithUrl';
import '../utils/imagePreloader';

// Import all images at build time
const images = require.context('../pages/judo_techniques', true, /\.gif$/);

const ShowTechniques = memo(({ belt }) => {
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    const techniquesGridRef = useRef(null);
    const searchFilterRef = useRef(null);
    const isMobile = useDebouncedResize(150, 768);

    // Use global cache for techniques data
    const { data: items, loading, error } = useTechniquesCache(belt);

    // Auto-scroll to techniques on mobile when belt changes
    useEffect(() => {
        if (isMobile && items && items.length > 0 && !loading) {
            // Wait for the techniques grid to be rendered
            const scrollToTechniques = () => {
                if (techniquesGridRef.current && searchFilterRef.current) {
                    const filterHeight = searchFilterRef.current.offsetHeight;
                    const offset = filterHeight + 20; // Add extra 20px for better spacing
                    
                    const elementPosition = techniquesGridRef.current.offsetTop;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                } else {
                    // If refs are not ready, try again after a short delay
                    setTimeout(scrollToTechniques, 100);
                }
            };
            
            setTimeout(scrollToTechniques, 300); // Initial delay to ensure DOM is ready
        }
    }, [belt, items?.length, isMobile, loading]);

    // Preload images when data changes
    useEffect(() => {
        if (items && items.length > 0) {
            setTimeout(() => {
                const imageUrls = items.map(item => {
                    const imagePath = `./${item.belt}/${item.name}.gif`;
                    try {
                        return images(imagePath);
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean);
                
                if (imageUrls.length > 0) {
                    window.imagePreloader?.preloadBatch(imageUrls);
                }
            }, 100);
        }
    }, [items]);

    // Memoized filtered items to prevent unnecessary recalculations
    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    // Memoized callbacks to prevent unnecessary re-renders
    const openCard = useCallback((title, imagePath) => {
        let imageSrc = '';
        try {
            imageSrc = images(imagePath);
        } catch (e) {
            imageSrc = '';
        }
        setModal({ open: true, title, src: imageSrc });
        
        // Track technique view
        trackBeltAction('technique_view', 'techniques', belt, {
            technique_name: title,
            image_path: imagePath
        });
    }, [belt]);

    const closeCard = useCallback(() => setModal({ open: false, title: '', src: '' }), []);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);

    if (loading) return (
        <div className="loading-placeholder">
            Loading techniques...
        </div>
    );

    if (error) return (
        <div className="loading-placeholder">
            Error: {error}
        </div>
    );

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                {belt === 'all' ? `${items?.length || 0} techniques from all belts` : `${items?.length || 0} techniques for ${belt} belt`}
            </h2>

            {/* Search Filter */}
            <div 
                ref={searchFilterRef}
                className={`search-filter-container ${isMobile ? 'mobile-sticky' : ''}`}
                style={{ textAlign: 'center', marginBottom: '30px' }}
            >
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search techniques (e.g., o-goshi, seoi-nage)..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                {searchTerm && (
                    <div className="search-results">
                        Showing {filteredItems.length} of {items?.length || 0} techniques
                    </div>
                )}
            </div>

            {filteredItems.length > 0 ? (
                <div ref={techniquesGridRef} className="techniques-grid">
                    {filteredItems.map((filteredItem) => {
                        const imagePath = `./${filteredItem.belt}/${filteredItem.name}.gif`;
                        let imageSrc;
                        try {
                            imageSrc = images(imagePath);
                        } catch (err) {
                            imageSrc = null;
                        }

                        return (
                            <TechniqueCard
                                key={filteredItem.id}
                                item={filteredItem}
                                imageSrc={imageSrc}
                                imagePath={imagePath}
                                onCardClick={openCard}
                            />
                        );
                    })}
                </div>
            ) : searchTerm ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#b8b8b8', fontSize: '1.1rem', fontFamily: 'Inter, sans-serif' }}>
                    No techniques found matching "{searchTerm}"
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#b8b8b8', fontSize: '1.1rem', fontFamily: 'Inter, sans-serif' }}>
                    No techniques available for this belt.
                </div>
            )}

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

ShowTechniques.displayName = 'ShowTechniques';

export { ShowTechniques };
