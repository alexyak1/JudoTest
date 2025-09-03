import React, { useState, useEffect } from 'react';
import ImageModal from './ImageModal';

// Import all images at build time
const images = require.context('../pages/judo_techniques', true, /\.gif$/);

function ShowTechniques({ belt }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState({ open: false, title: '', src: '' });

    const host = window.location.hostname;

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`http://${host}:8787/techniques?belt=${belt}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch data');
                }
                return res.json();
            })
            .then(
                (result) => {
                    setItems(result);
                    setLoading(false);
                },
                (error) => {
                    setError(error.message);
                    setLoading(false);
                }
            );
    }, [belt]);

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
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                {items.length} techniques for {belt} belt
            </h2>
            {items.length > 0 ? (
                <div className="techniques-grid">
                    {items.map((filteredItem) => {
                        const imagePath = `./${filteredItem.belt}/${filteredItem.name}.gif`;
                        let imageSrc;
                        try {
                            imageSrc = images(imagePath);
                        } catch (err) {
                            imageSrc = null;
                        }

                        return (
                            <div key={filteredItem.id} className="technique-card" onClick={() => openCard(filteredItem.name, imagePath)}>
                                <div className="technique-container">
                                    {imageSrc ? (
                                        <img 
                                            className="img-technique" 
                                            src={imageSrc} 
                                            alt={filteredItem.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="loading-placeholder">
                                            Image not available
                                        </div>
                                    )}
                                </div>
                                <h3>{filteredItem.name}</h3>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
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
