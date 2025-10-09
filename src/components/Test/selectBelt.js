

import React from "react";

export default function BeltSelector({ setBeltColor }) {
    const belts = [
        { color: 'yellow', name: 'Yellow Belt', colorCode: '#FFD700' },
        { color: 'orange', name: 'Orange Belt', colorCode: '#FF8C00' },
        { color: 'green', name: 'Green Belt', colorCode: '#32CD32' },
        { color: 'blue', name: 'Blue Belt', colorCode: '#1E90FF' },
        { color: 'brown', name: 'Brown Belt', colorCode: '#8B4513' },
        { color: 'black', name: 'Black Belt', colorCode: '#2C2C2C' }
    ];

    return (
        <div className="belt-grid">
            {belts.map((belt) => (
                <div 
                    key={belt.color}
                    className="belt-card"
                    onClick={() => setBeltColor(belt.color)}
                >
                    <div 
                        className="belt-color-bar"
                        style={{ backgroundColor: belt.colorCode }}
                    ></div>
                    <span className="belt-name">{belt.name}</span>
                </div>
            ))}
        </div>
    );
};
