import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const OptimizedImage = ({ src, alt, className, fallbackSrc }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    } else {
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError && !fallbackSrc) {
    return (
      <div className={`${className} image-error`}>
        <p>Image not available</p>
      </div>
    );
  }

  return (
    <div className={`image-container ${className}`}>
      <LazyLoadImage
        src={imageSrc}
        alt={alt}
        effect="blur"
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmM2YzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+"
      />
      {isLoading && (
        <div className="image-loading">
          <div className="loading-spinner-small"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
