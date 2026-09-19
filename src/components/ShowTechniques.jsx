import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import ImageModal from './ImageModal';
import { TechniqueCard } from './TechniqueCard';
import { useDebouncedResize } from '../hooks/useDebouncedResize';
import { useTechniquesCache } from '../hooks/useGlobalCache';
import { trackBeltAction } from '../hooks/useBeltWithUrl';
import '../components/MobileOptimization.css';

// Import technique media at build time. Posters are stills the grid always
// shows; videos are fetched only when a technique is played. Techniques whose
// source was a single frame have a poster but no video.
const posters = require.context('../pages/judo_techniques', true, /\.webp$/);
const videos = require.context('../pages/judo_techniques', true, /\.mp4$/);

// Per-clip frame rate, written by scripts/convert_media.py. Needed so the
// player steps real frames -- these clips run anywhere from 2 to 30fps.
const manifest = require('../pages/media-manifest.json');

const resolve = (ctx, path) => {
    try {
        return ctx(path);
    } catch (e) {
        return null;
    }
};

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

    // Memoized filtered items to prevent unnecessary recalculations
    const filteredItems = useMemo(() => {
        if (!items) return [];
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [items, searchTerm]);

    // Memoized callbacks to prevent unnecessary re-renders
    const openCard = useCallback((title, posterSrc, videoSrc, fps) => {
        setModal({ open: true, title, src: posterSrc, videoSrc, fps });

        // Track technique view
        trackBeltAction('technique_view', 'techniques', belt, {
            technique_name: title
        });
    }, [belt]);

    const closeCard = useCallback(() => setModal({ open: false, title: '', src: '', videoSrc: null, fps: undefined }), []);

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
                    {filteredItems.map((filteredItem, index) => {
                        const base = `./${filteredItem.belt}/${filteredItem.name}`;
                        const key = `judo_techniques/${filteredItem.belt}/${filteredItem.name}`;

                        return (
                            <TechniqueCard
                                key={filteredItem.id}
                                item={filteredItem}
                                posterSrc={resolve(posters, `${base}.webp`)}
                                videoSrc={resolve(videos, `${base}.mp4`)}
                                fps={manifest[key]?.fps}
                                index={index}
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
                videoSrc={modal.videoSrc}
                fps={modal.fps}
                altText={modal.title}
            />
        </div>
    );
});

ShowTechniques.displayName = 'ShowTechniques';

export { ShowTechniques };
