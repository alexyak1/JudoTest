import React, { useState, useEffect } from "react";

export default function Techniques() {
    const url = "http://localhost:8787/techniques";
    const [setError] = useState(null);
    const [items, setItems] = useState([]);

        useEffect(() => {
            fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    setItems(result)
                },
                (error) => {
                    setError(error);
                }
            )
        }, [])

        return (
            <div className='app'>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh'
                    }}
                >
                    <h1>Here is all techniques:</h1>
                    <ul>
                        {items.map(item => (
                            <li key={item.id}>
                                {item.name} belt: {item.belt}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
}
