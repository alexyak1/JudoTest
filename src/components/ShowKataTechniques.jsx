import React, { memo } from 'react';
import { useApiCache } from '../hooks/useApiCache';
import OptimizedImage from './OptimizedImage';

const ShowKataTechniques = memo(({ kataType }) => {
    const host = window.location.hostname;
    const baseUrl = `http://${host}:8787`;
    const { data: items, loading, error } = useApiCache(`${baseUrl}/kata?type=${kataType}`);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading kata techniques...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>Error loading kata techniques: {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return <div>No kata techniques available for {kataType}.</div>;
    }

    return (
        <div className="kata-techniques-grid">
            <p className="techniques-count">{items.length} techniques for {kataType}</p>
            <div className="kata-techniques-list">
                {items.map(filteredItem => (
                    <div key={filteredItem.id} className="technique-item">
                        <h3>{filteredItem.name}</h3>
                        <OptimizedImage
                            src={`/kata_techniques/${filteredItem.kata_name}/${filteredItem.name}.gif`}
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

ShowKataTechniques.displayName = 'ShowKataTechniques';

export { ShowKataTechniques };