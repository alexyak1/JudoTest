import React, { useState, useEffect } from 'react';

// Import all images at build time
const images = require.context('../pages/judo_techniques', true, /\.gif$/);

function ShowTechniques({ belt }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        fetch(`http://localhost:8787/techniques?belt=${belt}`)
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {items.length} techniques for {belt} belt
            {items.length > 0 ? (
                items.map((filteredItem) => {
                    let imagePath = `./${filteredItem.belt}/${filteredItem.name}.gif`;
                    let imageSrc;

                    try {
                        imageSrc = images(imagePath);
                    } catch (err) {
                        console.error(`Image not found: ${imagePath}`);
                        imageSrc = null;
                    }

                    return (
                        <div key={filteredItem.id}>
                            <h3>{filteredItem.name}</h3>
                            {imageSrc ? (
                                <img className="img-technique" src={imageSrc} alt={filteredItem.name} />
                            ) : (
                                <p>Image not available</p>
                            )}
                        </div>
                    );
                })
            ) : (
                <div>No techniques available for this belt.</div>
            )}
        </div>
    );
}

export { ShowTechniques };
