import React, { memo } from 'react';
import { usePriorityLazyLoad } from '../hooks/useLazyLoad';
import './LazyKataImage.css';

/**
 * Lazy loading image component for kata techniques
 * Loads first 3 images immediately, then lazy loads the rest
 */
export const LazyKataImage = memo(({ 
  src, 
  alt, 
  className = '', 
  style = {},
  index = 0,
  priorityCount = 3,
  placeholder = '🥋',
  ...props 
}) => {
  const { ref, isLoaded, isInView, hasError } = usePriorityLazyLoad(src, index, priorityCount);

  if (hasError) {
    return (
      <div 
        className={`lazy-kata-image-error ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          minHeight: '200px',
          ...style
        }}
        {...props}
      >
        <div style={{ textAlign: 'center', color: '#999' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          <div>Failed to load</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className={`lazy-kata-image-container ${className}`}
      style={{ position: 'relative', ...style }}
      {...props}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="lazy-kata-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            border: '2px dashed #e9ecef',
            borderRadius: '8px',
            zIndex: 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{placeholder}</div>
            <div style={{ fontSize: '14px' }}>
              {isInView ? 'Loading...' : 'Scroll to load'}
            </div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {isLoaded && (
        <img
          src={src}
          alt={alt}
          className="lazy-kata-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
    </div>
  );
});

LazyKataImage.displayName = 'LazyKataImage';

export default LazyKataImage;
