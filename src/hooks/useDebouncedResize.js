import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for debounced window resize events
 * @param {number} delay - Debounce delay in milliseconds
 * @param {number} breakpoint - Breakpoint to determine mobile/desktop
 * @returns {boolean} isMobile - Whether the current screen size is mobile
 */
export const useDebouncedResize = (delay = 150, breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= breakpoint;
    }
    return false;
  });

  const handleResize = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setIsMobile(window.innerWidth <= breakpoint);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay, breakpoint]);

  useEffect(() => {
    let cleanup;
    
    const resizeHandler = () => {
      cleanup = handleResize();
    };

    window.addEventListener('resize', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (cleanup) cleanup();
    };
  }, [handleResize]);

  return isMobile;
};
