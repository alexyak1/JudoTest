import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for lazy loading images using Intersection Observer
 * @param {string} src - Image source URL
 * @param {object} options - Intersection Observer options
 * @returns {object} { ref, isLoaded, isInView }
 */
export const useLazyLoad = (src, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef(null);

  const {
    rootMargin = '50px', // Load images 50px before they come into view
    threshold = 0.1,
    ...observerOptions
  } = options;

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoaded && !hasError) {
      setIsInView(true);
      
      // Preload the image
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setIsInView(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsInView(false);
      };
      img.src = src;
    }
  }, [src, isLoaded, hasError]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
      ...observerOptions
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, rootMargin, threshold, observerOptions]);

  return { ref, isLoaded, isInView, hasError };
};

/**
 * Hook for lazy loading with priority (load first N items immediately)
 * @param {string} src - Image source URL
 * @param {number} index - Item index
 * @param {number} priorityCount - Number of items to load immediately
 * @param {object} options - Intersection Observer options
 * @returns {object} { ref, isLoaded, isInView, hasError }
 */
export const usePriorityLazyLoad = (src, index, priorityCount = 3, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    ...observerOptions
  } = options;

  // Load first N items immediately
  useEffect(() => {
    if (index < priorityCount && !isLoaded && !hasError) {
      setIsInView(true);
      
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setIsInView(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsInView(false);
      };
      img.src = src;
    }
  }, [src, index, priorityCount, isLoaded, hasError]);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoaded && !hasError && index >= priorityCount) {
      setIsInView(true);
      
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setIsInView(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsInView(false);
      };
      img.src = src;
    }
  }, [src, isLoaded, hasError, index, priorityCount]);

  useEffect(() => {
    const element = ref.current;
    if (!element || index < priorityCount) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold,
      ...observerOptions
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, rootMargin, threshold, observerOptions, index, priorityCount]);

  return { ref, isLoaded, isInView, hasError };
};
