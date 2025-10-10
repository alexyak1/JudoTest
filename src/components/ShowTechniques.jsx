import React, { useState, useEffect, useRef } from 'react';
import ImageModal from './ImageModal';
import { SmoothImage } from './SmoothImage';
import '../utils/imagePreloader';

// Import all images at build time
const images = require.context('../pages/judo_techniques', true, /\.gif$/);

function ShowTechniques({ belt }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    
    const techniquesGridRef = useRef(null);
    const searchFilterRef = useRef(null);

    const host = window.location.hostname;

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-scroll to techniques on mobile when belt changes
    useEffect(() => {
        if (isMobile && techniquesGridRef.current && items.length > 0) {
            setTimeout(() => {
                const filterHeight = searchFilterRef.current ? searchFilterRef.current.offsetHeight : 0;
                const offset = filterHeight + 20; // Add extra 20px for better spacing
                
                const elementPosition = techniquesGridRef.current.offsetTop;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [belt, items.length, isMobile]);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchTechniques = async () => {
            try {
                let result;
                
                if (belt === 'all') {
                    // Fetch techniques from all belts
                    const allBelts = ['yellow', 'orange', 'green', 'blue', 'brown'];
                    const allTechniques = [];
                    
                    for (const beltColor of allBelts) {
                        const response = await fetch(`http://${host}:8787/techniques?belt=${beltColor}`);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch data for ${beltColor} belt`);
                        }
                        const beltData = await response.json();
                        allTechniques.push(...beltData);
                    }
                    
                    result = allTechniques;
                } else {
                    // Fetch techniques from specific belt
                    const response = await fetch(`http://${host}:8787/techniques?belt=${belt}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch data');
                    }
                    result = await response.json();
                }

                setItems(result);
                setLoading(false);
                
                // Preload images in background for faster future loading
                setTimeout(() => {
                    const imageUrls = result.map(item => {
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
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchTechniques();
    }, [belt, host]);

    // Filter techniques based on search term
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    const openCard = (title, imagePath) => {
        let imageSrc = '';
        try {
            imageSrc = images(imagePath);
        } catch (e) {
            imageSrc = '';
        }
        setModal({ open: true, title, src: imageSrc });
    };

    const closeCard = () => setModal({ open: false, title: '', src: '' });

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ffffff', fontSize: '1.5rem', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                {belt === 'all' ? `${items.length} techniques from all belts` : `${items.length} techniques for ${belt} belt`}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <div className="search-results">
                        Showing {filteredItems.length} of {items.length} techniques
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
                            <div key={filteredItem.id} className="technique-card" onClick={() => openCard(filteredItem.name, imagePath)}>
                                <h3>{filteredItem.name}</h3>
                                <div className="technique-container">
                                    {imageSrc ? (
                                        <SmoothImage
                                            src={imageSrc}
                                            alt={filteredItem.name}
                                            className="img-technique"
                                            placeholder="🥋"
                                        />
                                    ) : (
                                        <div className="loading-placeholder">
                                            Image not available
                                        </div>
                                    )}
                                </div>
                            </div>
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
}

export { ShowTechniques };
