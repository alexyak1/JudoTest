import React, { useState, useEffect } from 'react';

function ShowKataTechniques({ kataType }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
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

    if (loading) return (
        <div className="loading-placeholder">
            Loading kata techniques...
        </div>
    );

    return (
        <div>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                {items.length} techniques for {kataType}
            </h2>
            <div className="techniques-grid">
                {items.map(filteredItem => (
                    <div key={filteredItem.id} className="technique-item">
                        <h3>{filteredItem.name}</h3>
                        <div className="technique-container">
                            <img
                                className="img-technique"
                                src={require("../pages/kata_techniques/" + filteredItem.kata_name + "/" + filteredItem.name + ".gif")}
                                alt="technique"
                                loading="lazy"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export { ShowKataTechniques };