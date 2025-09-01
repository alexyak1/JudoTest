import { useState, useEffect, useCallback } from 'react';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useApiCache = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const cacheKey = url;
    const cached = cache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    // Clear cache for this URL
    cache.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, loading, error, refetch };
};
