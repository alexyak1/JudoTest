import { useState, useEffect, useMemo } from 'react';

// Simple hook for smooth image loading
export const useSmoothImage = (src) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [timeout, setTimeout] = useState(false);

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
      setTimeout(false);
      return;
    }

    setLoaded(false);
    setError(false);
    setTimeout(false);

    // Set a timeout for very large images
    const timeoutId = setTimeout(() => {
      setTimeout(true);
    }, 10000); // 10 second timeout

    const img = new Image();
    
    img.onload = () => {
      clearTimeout(timeoutId);
      setLoaded(true);
      setTimeout(false);
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      setError(true);
      setTimeout(false);
    };

    img.src = src;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error, timeout };
};
