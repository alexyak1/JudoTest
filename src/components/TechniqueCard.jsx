import React, { memo, useCallback } from 'react';
import { TechniqueMedia } from './TechniqueMedia';

const EAGER_COUNT = 6; // first row or two; the rest lazy-load natively

const TechniqueCard = memo(({
  item,
  posterSrc,
  videoSrc,
  fps,
  index = 0,
  onCardClick
}) => {
  const handleClick = useCallback(() => {
    onCardClick(item.name, posterSrc, videoSrc, fps);
  }, [item.name, posterSrc, videoSrc, fps, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick}>
      <h3>{item.name}</h3>
      <div className="technique-container">
        <TechniqueMedia
          posterSrc={posterSrc}
          videoSrc={videoSrc}
          alt={item.name}
          eager={index < EAGER_COUNT}
        />
      </div>
    </div>
  );
});

TechniqueCard.displayName = 'TechniqueCard';

export { TechniqueCard };
