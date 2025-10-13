import React, { memo } from 'react';
import { useSmoothImage } from '../hooks/useSmoothImage';
import './SmoothImage.css';

// Smooth loading image component
export const SmoothImage = memo(({ 
  src, 
  alt, 
  className = '', 
  style = {},
  placeholder = '🥋',
  ...props 
}) => {
  const { loaded, error, timeout } = useSmoothImage(src);

  if (error) {
    return (
      <div 
        className={`smooth-image-error ${className}`}
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

  if (timeout) {
    return (
      <div 
        className={`smooth-image-timeout ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff3cd',
          border: '2px dashed #ffc107',
          borderRadius: '8px',
          minHeight: '200px',
          ...style
        }}
        {...props}
      >
        <div style={{ textAlign: 'center', color: '#856404' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div>Large image loading...</div>
          <div style={{ fontSize: '0.8em', marginTop: '4px' }}>This may take a moment</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`smooth-image-container ${className}`}
      style={{ position: 'relative', ...style }}
      {...props}
    >
      {/* Loading placeholder */}
      {!loaded && (
        <div 
          className="smooth-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: '2px dashed #e9ecef',
            borderRadius: '8px',
            zIndex: 1
          }}
        >
          <div style={{ textAlign: 'center', color: '#6c757d' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{placeholder}</div>
            <div style={{ fontSize: '14px' }}>Loading...</div>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className="smooth-image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </div>
  );
});
