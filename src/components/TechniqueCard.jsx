import React, { memo, useCallback } from 'react';
import { SmoothImage } from './SmoothImage';

const TechniqueCard = memo(({ 
  item, 
  imageSrc, 
  imagePath, 
  onCardClick 
}) => {
  const handleClick = useCallback(() => {
    onCardClick(item.name, imagePath);
  }, [item.name, imagePath, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick}>
      <h3>{item.name}</h3>
      <div className="technique-container">
        {imageSrc ? (
          <SmoothImage
            src={imageSrc}
            alt={item.name}
            className="img-technique"
            placeholder="🥋"
          />
        ) : (
          <div className="loading-placeholder">
            Image not available
          </div>
        )}
      </div>
    </div>
  );
});

TechniqueCard.displayName = 'TechniqueCard';

export { TechniqueCard };
