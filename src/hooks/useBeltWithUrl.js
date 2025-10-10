import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook for managing belt selection with URL parameters and Google Analytics tracking
 * @param {string} defaultBelt - Default belt if no URL parameter
 * @param {string} pageName - Page name for analytics tracking
 * @returns {object} { belt, setBelt, updateUrl }
 */
export const useBeltWithUrl = (defaultBelt = 'yellow', pageName = 'techniques') => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [belt, setBeltState] = useState(() => {
    const urlBelt = searchParams.get('belt');
    return urlBelt || defaultBelt;
  });

  // Update URL when belt changes
  const setBelt = useCallback((newBelt) => {
    setBeltState(newBelt);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    if (newBelt === defaultBelt) {
      // Remove belt parameter if it's the default
      newSearchParams.delete('belt');
    } else {
      newSearchParams.set('belt', newBelt);
    }
    setSearchParams(newSearchParams, { replace: true });

    // Track belt selection in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'belt_selection', {
        event_category: 'user_interaction',
        event_label: `${pageName}_${newBelt}`,
        value: newBelt,
        custom_map: {
          belt_color: newBelt,
          page: pageName
        }
      });
    }
  }, [searchParams, setSearchParams, defaultBelt, pageName]);

  // Update belt when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlBelt = searchParams.get('belt');
    const newBelt = urlBelt || defaultBelt;
    
    if (newBelt !== belt) {
      setBeltState(newBelt);
      
      // Track URL-based belt change
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'belt_url_change', {
          event_category: 'navigation',
          event_label: `${pageName}_${newBelt}`,
          value: newBelt,
          custom_map: {
            belt_color: newBelt,
            page: pageName,
            source: 'url'
          }
        });
      }
    }
  }, [searchParams, belt, defaultBelt, pageName]);

  // Function to update URL without changing belt (for sharing)
  const updateUrl = useCallback((newBelt) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newBelt === defaultBelt) {
      newSearchParams.delete('belt');
    } else {
      newSearchParams.set('belt', newBelt);
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams, defaultBelt]);

  return { belt, setBelt, updateUrl };
};

/**
 * Hook for tracking page views with belt information
 * @param {string} pageName - Page name
 * @param {string} belt - Current belt
 */
export const usePageTracking = (pageName, belt) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        event_category: 'page_interaction',
        event_label: `${pageName}_${belt}`,
        custom_map: {
          page: pageName,
          belt_color: belt
        }
      });
    }
  }, [pageName, belt]);
};

/**
 * Utility function to track belt-specific actions
 * @param {string} action - Action name
 * @param {string} pageName - Page name
 * @param {string} belt - Belt color
 * @param {object} additionalData - Additional tracking data
 */
export const trackBeltAction = (action, pageName, belt, additionalData = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'belt_interaction',
      event_label: `${pageName}_${belt}`,
      value: belt,
      custom_map: {
        belt_color: belt,
        page: pageName,
        ...additionalData
      }
    });
  }
};
