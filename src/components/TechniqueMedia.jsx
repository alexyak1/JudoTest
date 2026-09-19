import React, { memo, useCallback, useRef, useState } from 'react';
import { useHoverCapable } from '../hooks/useHoverCapable';

/**
 * Poster-first technique media.
 *
 * The grid renders only the poster still (~10KB webp, natively lazy-loaded).
 * The <video> element is not mounted at all until the user hovers, so no video
 * bytes are fetched for techniques nobody looks at. This is the whole reason
 * for moving off GIFs: a GIF has to download in full before it shows anything,
 * and it cannot be paused.
 *
 * Techniques whose source was a single frame have no video and render as a
 * plain still, with no play affordance.
 */
const TechniqueMedia = memo(({
  posterSrc,
  videoSrc,
  alt,
  eager = false,
}) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);
  const canHover = useHoverCapable();

  const hasVideo = Boolean(videoSrc);

  const startPlaying = useCallback(() => {
    if (!hasVideo || !canHover) return;
    setPlaying(true);
  }, [hasVideo, canHover]);

  const stopPlaying = useCallback(() => {
    if (!hasVideo || !canHover) return;
    setPlaying(false);
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [hasVideo, canHover]);

  if (!posterSrc && !hasVideo) {
    return <div className="loading-placeholder">Image not available</div>;
  }

  return (
    <div
      className="technique-media"
      onMouseEnter={startPlaying}
      onMouseLeave={stopPlaying}
    >
      {playing ? (
        <video
          ref={videoRef}
          className="img-technique"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={alt}
        />
      ) : (
        <>
          <img
            className="img-technique"
            src={posterSrc}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
          {hasVideo && (
            <span className="technique-play-badge" aria-hidden="true">▶</span>
          )}
        </>
      )}
    </div>
  );
});

TechniqueMedia.displayName = 'TechniqueMedia';

export { TechniqueMedia };
