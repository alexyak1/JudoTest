import React, { memo, useCallback } from 'react';
import { SmoothImage } from './SmoothImage';

const KataTechniqueCard = memo(({ 
  item, 
  imageSrc, 
  onCardClick 
}) => {
  const handleClick = useCallback(() => {
    onCardClick(item.name, imageSrc);
  }, [item.name, imageSrc, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick}>
      <div className="technique-container">
        <SmoothImage
          src={imageSrc}
          alt={item.name}
          className="img-technique"
          style={{ width: '100%', height: '200px' }}
        />
      </div>
      <h3>{item.name}</h3>
    </div>
  );
});

KataTechniqueCard.displayName = 'KataTechniqueCard';

export { KataTechniqueCard };
