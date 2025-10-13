import React, { memo, useCallback } from 'react';
import { ResponsiveImage } from './ResponsiveImage';

const TechniqueCard = memo(({ 
  item, 
  imageSrc, 
  imagePath, 
  onCardClick,
  index = 0
}) => {
  const handleClick = useCallback(() => {
    onCardClick(item.name, imagePath);
  }, [item.name, imagePath, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick}>
      <h3>{item.name}</h3>
      <div className="technique-container">
        {imageSrc ? (
          <ResponsiveImage
            src={imageSrc}
            alt={item.name}
            className="img-technique"
            placeholder="🥋"
            index={index}
            priorityCount={3}
            fallbackSrc={imageSrc}
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
