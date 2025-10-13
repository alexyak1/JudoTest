import { useState, useEffect, useMemo } from 'react';

// Simple hook for smooth image loading
export const useSmoothImage = (src) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Memoize the image loading logic to prevent unnecessary re-runs
  const imageLoadingState = useMemo(() => {
    if (!src) return { loaded: false, error: false };

    // Check if already cached
    if (window.imagePreloader?.isCached(src)) {
      return { loaded: true, error: false };
    }

    return { loaded: false, error: false };
  }, [src]);

  useEffect(() => {
    if (!src) return;

    // If already cached, set loaded immediately
    if (window.imagePreloader?.isCached(src)) {
      setLoaded(true);
      setError(false);
      return;
    }

    setLoaded(false);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error };
};
