import React, { useState, useCallback } from "react";
import TechniquesBeltSelector from "../components/TechniquesBeltSelector";
import { ShowTechniques } from "../components/ShowTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";

export default function Techniques() {
    const [filterParam, setFilterColor] = useState('yellow');

    const applyFilter = useCallback((beltColor) => {
        setFilterColor(beltColor);
    }, []);

    return (
        <div className='app'>
            <title>Judo quiz | Techniques</title>
            <div>
                <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginBottom: '2rem' }}>Here are all techniques:</h2>
                <div className="belt-selector-container">
                    <TechniquesBeltSelector setBeltColor={applyFilter} selectedBelt={filterParam} />
                </div>
                <ShowTechniques belt={filterParam} />
                <ToTop />
            </div>
        </div>
    );
}
