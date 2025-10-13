import React, { memo, useCallback } from 'react';
import { LazyKataImage } from './LazyKataImage';

const KataTechniqueCard = memo(({ 
  item, 
  imageSrc, 
  onCardClick,
  index = 0
}) => {
  const handleClick = useCallback(() => {
    onCardClick(item.name, imageSrc);
  }, [item.name, imageSrc, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick}>
      <div className="technique-container">
        <LazyKataImage
          src={imageSrc}
          alt={item.name}
          className="img-technique"
          style={{ width: '100%', height: '200px' }}
          index={index}
          priorityCount={3}
          placeholder="🥋"
        />
      </div>
      <h3>{item.name}</h3>
    </div>
  );
});

KataTechniqueCard.displayName = 'KataTechniqueCard';

export { KataTechniqueCard };
