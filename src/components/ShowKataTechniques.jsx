import React, { useState, useEffect } from 'react';
import ImageModal from './ImageModal';
import { SmoothImage } from './SmoothImage';
import '../utils/imagePreloader';

function ShowKataTechniques({ kataType }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    const host = window.location.hostname;
    const baseUrl = `http://${host}:8787`;

    useEffect(() => {
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
    }, [kataType]);


    if (loading) return (
        <div className="loading-placeholder">
            Loading kata techniques...
        </div>
    );

    const openCard = (title, src) => setModal({ open: true, title, src });
    const closeCard = () => setModal({ open: false, title: '', src: '' });

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                {items.length} techniques for {kataType}
            </h2>
            

            <div className="techniques-grid">
                {items.map(filteredItem => {
                    const imgSrc = require("../pages/kata_techniques/" + filteredItem.kata_name + "/" + filteredItem.name + ".gif");
                    return (
                        <div key={filteredItem.id} className="technique-card" onClick={() => openCard(filteredItem.name, imgSrc)}>
                            <div className="technique-container">
                                <SmoothImage
                                    src={imgSrc}
                                    alt={filteredItem.name}
                                    className="img-technique"
                                    style={{ width: '100%', height: '200px' }}
                                />
                            </div>
                            <h3>{filteredItem.name}</h3>
                        </div>
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
}

export { ShowKataTechniques };