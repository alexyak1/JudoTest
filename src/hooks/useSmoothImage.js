import { useState, useEffect, useMemo } from 'react';

// Simple hook for smooth image loading
export const useSmoothImage = (src) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Memoize the cache check to prevent unnecessary re-runs
  const isCached = useMemo(() => {
    if (!src) return false;
    return window.imagePreloader?.isCached(src) || false;
  }, [src]);

  useEffect(() => {
    if (!src) return;

    // If already cached, set loaded immediately
    if (isCached) {
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
  }, [src, isCached]);

  return { loaded, error };
};
