import React, { useEffect, memo } from 'react';
import { TechniquePlayer } from './TechniquePlayer';
import ShareLinkButton from './ShareLinkButton';

/**
 * Shows a technique full size. When the technique has a video it opens in the
 * frame-stepping player, so a throw can be held on one moment -- the main
 * thing the old GIFs could not do. Stills fall back to the poster image.
 */
const ImageModal = memo(({ isOpen, onClose, title, imageSrc, videoSrc, fps, altText, shareUrl, onShare }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <div className="modal-header-actions">
            {shareUrl && <ShareLinkButton url={shareUrl} onShare={onShare} />}
            <button className="modal-close" aria-label="Close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="modal-body">
          {videoSrc ? (
            <TechniquePlayer
              src={videoSrc}
              poster={imageSrc}
              fps={fps}
              title={altText}
            />
          ) : (
            <img className="modal-image" src={imageSrc} alt={altText} />
          )}
        </div>
      </div>
    </div>
  );
});

ImageModal.displayName = 'ImageModal';

export default ImageModal;
