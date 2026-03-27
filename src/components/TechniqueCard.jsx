import React, { memo, useCallback } from 'react';
import { usePriorityLazyLoad } from '../hooks/useLazyLoad';

const PRIORITY_COUNT = 6; // Load first 6 images immediately (typical above-the-fold)

const TechniqueCard = memo(({
  item,
  imageSrc,
  imagePath,
  index = 0,
  onCardClick
}) => {
  const { ref, isLoaded, isInView, hasError } = usePriorityLazyLoad(
    imageSrc, index, PRIORITY_COUNT, { rootMargin: '200px' }
  );

  const handleClick = useCallback(() => {
    onCardClick(item.name, imagePath);
  }, [item.name, imagePath, onCardClick]);

  return (
    <div className="technique-card" onClick={handleClick} ref={ref}>
      <h3>{item.name}</h3>
      <div className="technique-container">
        {!imageSrc ? (
          <div className="loading-placeholder">
            Image not available
          </div>
        ) : hasError ? (
          <div className="loading-placeholder">
            Failed to load image
          </div>
        ) : isLoaded ? (
          <img
            src={imageSrc}
            alt={item.name}
            className="img-technique"
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div className="loading-placeholder" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
          }}>
            {isInView ? 'Loading...' : null}
          </div>
        )}
      </div>
    </div>
  );
});

TechniqueCard.displayName = 'TechniqueCard';

export { TechniqueCard };
