import React, { memo, useCallback } from 'react';
import { TechniqueMedia } from './TechniqueMedia';

const EAGER_COUNT = 3;

const KataTechniqueCard = memo(({
  item,
  posterSrc,
  videoSrc,
  fps,
  onCardClick,
  index = 0
}) => {
  const handleClick = useCallback(() => {
    onCardClick(item.name, posterSrc, videoSrc, fps);
  }, [item.name, posterSrc, videoSrc, fps, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick}>
      <div className="technique-container">
        <TechniqueMedia
          posterSrc={posterSrc}
          videoSrc={videoSrc}
          alt={item.name}
          eager={index < EAGER_COUNT}
        />
      </div>
      <h3>{item.name}</h3>
    </div>
  );
});

KataTechniqueCard.displayName = 'KataTechniqueCard';

export { KataTechniqueCard };
