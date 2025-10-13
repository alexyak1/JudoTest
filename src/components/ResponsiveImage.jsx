import React, { memo } from 'react';
import { useResponsiveLazyImage } from '../hooks/useResponsiveImage';
import './ResponsiveImage.css';

/**
 * Responsive image component with lazy loading and device optimization
 * Similar to imgix functionality but client-side
 */
export const ResponsiveImage = memo(({ 
  src, 
  alt, 
  className = '', 
  style = {},
  index = 0,
  priorityCount = 3,
  placeholder = '🥋',
  fallbackSrc = null,
  ...props 
}) => {
  const { 
    ref, 
    src: optimizedSrc, 
    error, 
    deviceType, 
    isLoaded, 
    isInView 
  } = useResponsiveLazyImage(src, index, priorityCount, {
    fallbackSrc,
    rootMargin: '50px',
    threshold: 0.1
  });

  if (error) {
    return (
      <div 
        className={`responsive-image-error ${className}`}
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
      className={`responsive-image-container ${className}`}
      style={{ position: 'relative', ...style }}
      {...props}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="responsive-image-placeholder"
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
              {isInView ? `Loading ${deviceType}...` : 'Scroll to load'}
            </div>
            {deviceType === 'mobile' && (
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                Optimized for mobile
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {isLoaded && (
        <img
          src={optimizedSrc}
          alt={alt}
          className="responsive-image"
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

ResponsiveImage.displayName = 'ResponsiveImage';

export default ResponsiveImage;
