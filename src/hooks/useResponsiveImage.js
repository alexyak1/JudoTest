import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  detectDeviceType, 
  getOptimizedImageSource, 
  generateImageSources,
  preloadResponsiveImage 
} from '../utils/responsiveImages';

/**
 * Hook for responsive image loading with device detection
 * @param {string} originalSrc - Original image source
 * @param {object} options - Options for image loading
 * @returns {object} { src, loading, error, deviceType, sources }
 */
export const useResponsiveImage = (originalSrc, options = {}) => {
  const [src, setSrc] = useState(originalSrc);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  const [sources, setSources] = useState({});

  const { 
    preload = false, 
    fallbackSrc = null,
    autoDetect = true 
  } = options;

  // Detect device type
  useEffect(() => {
    if (autoDetect) {
      const currentDevice = detectDeviceType();
      setDeviceType(currentDevice);
    }
  }, [autoDetect]);

  // Generate responsive sources
  useEffect(() => {
    if (originalSrc) {
      const responsiveSources = generateImageSources(originalSrc);
      setSources(responsiveSources);
    }
  }, [originalSrc]);

  // Load optimized image
  const loadOptimizedImage = useCallback(async () => {
    if (!originalSrc) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      // Get optimized image source
      const optimizedSrc = await getOptimizedImageSource(originalSrc, deviceType);
      setSrc(optimizedSrc);

      // Preload if requested
      if (preload) {
        await preloadResponsiveImage(originalSrc, deviceType);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading responsive image:', err);
      setError(true);
      setLoading(false);
      
      // Fallback to original source
      if (fallbackSrc) {
        setSrc(fallbackSrc);
      }
    }
  }, [originalSrc, deviceType, preload, fallbackSrc]);

  // Load image when dependencies change
  useEffect(() => {
    loadOptimizedImage();
  }, [loadOptimizedImage]);

  // Handle window resize for device type changes
  useEffect(() => {
    if (!autoDetect) return;

    const handleResize = () => {
      const newDeviceType = detectDeviceType();
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [deviceType, autoDetect]);

  return {
    src,
    loading,
    error,
    deviceType,
    sources,
    reload: loadOptimizedImage
  };
};

/**
 * Hook for responsive image with lazy loading
 * @param {string} originalSrc - Original image source
 * @param {number} index - Item index for priority loading
 * @param {number} priorityCount - Number of items to load immediately
 * @param {object} options - Options for image loading
 * @returns {object} { ref, src, loading, error, deviceType, isLoaded, isInView }
 */
export const useResponsiveLazyImage = (originalSrc, index = 0, priorityCount = 3, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [deviceType, setDeviceType] = useState('desktop');
  const [optimizedSrc, setOptimizedSrc] = useState(originalSrc);
  const ref = useRef(null);

  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallbackSrc = null,
    ...observerOptions
  } = options;

  // Detect device type
  useEffect(() => {
    const currentDevice = detectDeviceType();
    setDeviceType(currentDevice);
  }, []);

  // Load optimized image
  const loadImage = useCallback(async () => {
    if (!originalSrc) return;

    try {
      const optimized = await getOptimizedImageSource(originalSrc, deviceType);
      setOptimizedSrc(optimized);
      
      // Preload the image
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setIsInView(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsInView(false);
        
        // Try fallback if available
        if (fallbackSrc) {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            setOptimizedSrc(fallbackSrc);
            setIsLoaded(true);
            setIsInView(false);
            setHasError(false);
          };
          fallbackImg.src = fallbackSrc;
        }
      };
      img.src = optimized;
    } catch (err) {
      console.error('Error loading responsive image:', err);
      setHasError(true);
    }
  }, [originalSrc, deviceType, fallbackSrc]);

  // Load first N items immediately
  useEffect(() => {
    if (index < priorityCount && !isLoaded && !hasError) {
      setIsInView(true);
      loadImage();
    }
  }, [index, priorityCount, isLoaded, hasError, loadImage]);

  // Intersection observer for lazy loading
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isLoaded && !hasError && index >= priorityCount) {
      setIsInView(true);
      loadImage();
    }
  }, [isLoaded, hasError, index, priorityCount, loadImage]);

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

  return { 
    ref, 
    src: optimizedSrc, 
    loading: !isLoaded && !hasError, 
    error: hasError, 
    deviceType, 
    isLoaded, 
    isInView 
  };
};
