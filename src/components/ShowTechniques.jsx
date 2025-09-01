import React, { memo } from 'react';
import { useApiCache } from '../hooks/useApiCache';
import OptimizedImage from './OptimizedImage';

const ShowTechniques = memo(({ belt }) => {
    const host = window.location.hostname;
    const { data: items, loading, error } = useApiCache(`http://${host}:8787/techniques?belt=${belt}`);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading techniques...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error loading techniques: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return <div>No techniques available for this belt.</div>;
    }

    return (
        <div className="techniques-grid">
            <p className="techniques-count">{items.length} techniques for {belt} belt</p>
            <div className="techniques-list">
                {items.map((filteredItem) => (
                    <div key={filteredItem.id} className="technique-item">
                        <h3>{filteredItem.name}</h3>
                        <OptimizedImage
                            src={`/judo_techniques/${filteredItem.belt}/${filteredItem.name}.gif`}
                            alt={filteredItem.name}
                            className="img-technique"
                            fallbackSrc="/placeholder-technique.png"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
});

ShowTechniques.displayName = 'ShowTechniques';

export { ShowTechniques };
