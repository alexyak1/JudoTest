import React from "react";

export default function TechniquesBeltSelector({ setBeltColor, selectedBelt = 'yellow' }) {
    const belts = [
        { color: 'yellow', name: 'Yellow Belt', colorCode: '#FFD700' },
        { color: 'orange', name: 'Orange Belt', colorCode: '#FF8C00' },
        { color: 'green', name: 'Green Belt', colorCode: '#32CD32' },
        { color: 'blue', name: 'Blue Belt', colorCode: '#1E90FF' },
        { color: 'brown', name: 'Brown Belt', colorCode: '#8B4513' }
    ];

    return (
        <div className="techniques-belt-grid">
            {belts.map((belt) => (
                <div 
                    key={belt.color}
                    className={`techniques-belt-card ${selectedBelt === belt.color ? 'selected' : ''}`}
                    onClick={() => setBeltColor(belt.color)}
                >
                    <div 
                        className="techniques-belt-color-bar"
                        style={{ backgroundColor: belt.colorCode }}
                    ></div>
                    <span className="techniques-belt-name">{belt.name}</span>
                </div>
            ))}
        </div>
    );
};
