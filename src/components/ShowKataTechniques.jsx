import React, { useState, useEffect } from 'react';
import ImageModal from './ImageModal';

function ShowKataTechniques({ kataType }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, title: '', src: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const host = window.location.hostname;
    const baseUrl = `http://${host}:8787`;

    useEffect(() => {
        setLoading(true);
        fetch(`${baseUrl}/kata?type=${kataType}`)
            .then(res => res.json())
            .then(result => {
                setItems(result);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching kata techniques:", error);
                setLoading(false);
            });
    }, [kataType]);

    // Filter techniques based on search term
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="loading-placeholder">
            Loading kata techniques...
        </div>
    );

    const openCard = (title, src) => setModal({ open: true, title, src });
    const closeCard = () => setModal({ open: false, title: '', src: '' });

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                {items.length} techniques for {kataType}
            </h2>
            
            {/* Search Filter */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search kata techniques..."
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
                <div className="techniques-grid">
                    {filteredItems.map(filteredItem => {
                    const imgSrc = require("../pages/kata_techniques/" + filteredItem.kata_name + "/" + filteredItem.name + ".gif");
                    return (
                        <div key={filteredItem.id} className="technique-card" onClick={() => openCard(filteredItem.name, imgSrc)}>
                            <div className="technique-container">
                                <img
                                    className="img-technique"
                                    src={imgSrc}
                                    alt={filteredItem.name}
                                    loading="lazy"
                                />
                            </div>
                            <h3>{filteredItem.name}</h3>
                        </div>
                    )
                })}
            </div>
            ) : searchTerm ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No techniques found matching "{searchTerm}"
                </div>
            ) : null}

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