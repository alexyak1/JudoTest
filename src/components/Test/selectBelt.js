

import React from "react";

export default function BeltSelector({ setBeltColor, selectedBelt = 'yellow' }) {
    const belts = [
        { color: 'yellow', name: 'Yellow Belt', colorCode: '#FFD700' },
        { color: 'orange', name: 'Orange Belt', colorCode: '#FF8C00' },
        { color: 'green', name: 'Green Belt', colorCode: '#32CD32' },
        { color: 'blue', name: 'Blue Belt', colorCode: '#1E90FF' },
        { color: 'brown', name: 'Brown Belt', colorCode: '#8B4513' },
        { color: 'all', name: 'All Belts', colorCode: 'red-white-red-white', isSpecial: true },
    ];

    return (
        <div className="belt-grid">
            {belts.map((belt) => (
                <div 
                    key={belt.color}
                    className={`belt-card ${selectedBelt === belt.color ? 'selected' : ''} ${belt.isSpecial ? 'all-belts' : ''}`}
                    onClick={() => setBeltColor(belt.color)}
                >
                    <div 
                        className={`belt-color-bar ${belt.isSpecial ? 'all-belts-bar' : ''}`}
                        style={belt.isSpecial ? {} : { backgroundColor: belt.colorCode }}
                    ></div>
                    <span className="belt-name">{belt.name}</span>
                </div>
            ))}
        </div>
    );
};
