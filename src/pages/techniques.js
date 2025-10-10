import React, { useCallback } from "react";
import TechniquesBeltSelector from "../components/TechniquesBeltSelector";
import { ShowTechniques } from "../components/ShowTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";
import { useBeltWithUrl, usePageTracking } from "../hooks/useBeltWithUrl";

export default function Techniques() {
    // Use URL-based belt selection with analytics tracking
    const { belt, setBelt } = useBeltWithUrl('yellow', 'techniques');
    
    // Track page views with belt information
    usePageTracking('techniques', belt);

    const applyFilter = useCallback((beltColor) => {
        setBelt(beltColor);
    }, [setBelt]);

    return (
        <div className='app'>
            <title>Judo quiz | Techniques</title>
            <div>
                <h2 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginBottom: '2rem' }}>Here are all techniques:</h2>
                <div className="belt-selector-container">
                    <TechniquesBeltSelector setBeltColor={applyFilter} selectedBelt={belt} />
                </div>
                <ShowTechniques belt={belt} />
                <ToTop />
            </div>
        </div>
    );
}
