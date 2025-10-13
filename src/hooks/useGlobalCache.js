import { useState, useEffect, useCallback } from 'react';

// Request throttler to prevent too many simultaneous requests
class RequestThrottler {
  constructor(maxConcurrent = 2, delay = 500) {
    this.maxConcurrent = maxConcurrent;
    this.delay = delay;
    this.activeRequests = 0;
    this.queue = [];
  }

  async throttle(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeRequests >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { fn, resolve, reject } = this.queue.shift();
    this.activeRequests++;

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.activeRequests--;
      setTimeout(() => this.processQueue(), this.delay);
    }
  }
}

// Global request throttler instance - optimized for faster loading
const requestThrottler = new RequestThrottler(3, 200);

// Global data cache
class DataCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  }

  set(key, data) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Get cache info for debugging
  getCacheInfo() {
    const info = {};
    for (const [key, timestamp] of this.timestamps) {
      info[key] = {
        age: Date.now() - timestamp,
        maxAge: this.CACHE_DURATION,
        isValid: Date.now() - timestamp <= this.CACHE_DURATION
      };
    }
    return info;
  }
}

// Global cache instance
const globalCache = new DataCache();

/**
 * Custom hook for caching API data globally across the app
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {boolean} forceRefresh - Force refresh even if cached
 * @returns {object} { data, loading, error, refetch }
 */
export const useGlobalCache = (url, options = {}, forceRefresh = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const cacheKey = url;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && globalCache.has(cacheKey)) {
      const cachedData = globalCache.get(cacheKey);
      setData(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        headers: {
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      globalCache.set(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [url, options, forceRefresh]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    globalCache.clear();
  }, []);

  return { data, loading, error, refetch, clearCache };
};

/**
 * Hook for techniques data with global caching
 * @param {string} belt - Belt color or 'all'
 * @returns {object} { data, loading, error, refetch }
 */
export const useTechniquesCache = (belt) => {
  const host = window.location.hostname;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const cacheKey = belt === 'all' ? `techniques-all-belts` : `techniques-${belt}`;
    
    // Check cache first
    if (globalCache.has(cacheKey)) {
      const cachedData = globalCache.get(cacheKey);
      setData(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      if (belt === 'all') {
        // Fetch techniques from all belts
        const allBelts = ['yellow', 'orange', 'green', 'blue', 'brown'];
        const allTechniques = [];
        
        for (const beltColor of allBelts) {
          const response = await fetch(`http://${host}:8787/techniques?belt=${beltColor}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${beltColor} belt`);
          }
          const beltData = await response.json();
          allTechniques.push(...beltData);
        }
        
        result = allTechniques;
      } else {
        // Fetch techniques from specific belt
        const response = await fetch(`http://${host}:8787/techniques?belt=${belt}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        result = await response.json();
      }
      
      // Cache the result
      globalCache.set(cacheKey, result);
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [belt, host]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const cacheKey = belt === 'all' ? `techniques-all-belts` : `techniques-${belt}`;
    globalCache.cache.delete(cacheKey);
    globalCache.timestamps.delete(cacheKey);
    setData(null);
    setError(null);
    setLoading(true);
  }, [belt]);

  return { data, loading, error, refetch };
};

/**
 * Hook for kata data with global caching
 * @param {string} kataType - Kata type
 * @returns {object} { data, loading, error, refetch }
 */
export const useKataCache = (kataType) => {
  const host = window.location.hostname;
  const url = `http://${host}:8787/kata?type=${kataType}`;
  
  return useGlobalCache(url);
};

/**
 * Hook for all kata series data with global caching
 * @param {array} kataSeries - Array of kata series names
 * @returns {object} { data, loadingStates, error, refetch }
 */
export const useAllKataCache = (kataSeries) => {
  const [allData, setAllData] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!kataSeries || kataSeries.length === 0 || isInitialized) return;

    setIsInitialized(true);
    const host = window.location.hostname;
    const baseUrl = `http://${host}:8787`;
    
    // Initialize loading states
    const initialLoadingStates = {};
    kataSeries.forEach(series => {
      initialLoadingStates[series] = true;
    });
    setLoadingStates(initialLoadingStates);

    // Check cache first and collect cached data
    const cachedData = {};
    const uncachedSeries = [];
    
    kataSeries.forEach(series => {
      const cacheKey = `${baseUrl}/kata?type=${series}`;
      if (globalCache.has(cacheKey)) {
        cachedData[series] = globalCache.get(cacheKey);
        initialLoadingStates[series] = false;
      } else {
        uncachedSeries.push(series);
      }
    });

    // Set cached data immediately
    if (Object.keys(cachedData).length > 0) {
      setAllData(cachedData);
      setLoadingStates(initialLoadingStates);
    }

    // Fetch only uncached data with proper throttling
    if (uncachedSeries.length > 0) {
      uncachedSeries.forEach((series) => {
        const cacheKey = `${baseUrl}/kata?type=${series}`;
        
        // Double-check cache to prevent duplicate requests
        if (globalCache.has(cacheKey)) {
          const cachedResult = globalCache.get(cacheKey);
          setAllData(prev => ({
            ...prev,
            [series]: cachedResult
          }));
          setLoadingStates(prev => ({
            ...prev,
            [series]: false
          }));
          return;
        }

        // Use request throttler to prevent too many simultaneous requests
        requestThrottler.throttle(async () => {
          const response = await fetch(`${baseUrl}/kata?type=${series}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        }).then(result => {
          // Cache the result
          globalCache.set(cacheKey, result);
          
          setAllData(prev => ({
            ...prev,
            [series]: result
          }));
          setLoadingStates(prev => ({
            ...prev,
            [series]: false
          }));
        }).catch(error => {
          console.error(`Error fetching ${series}:`, error);
          setError(error.message);
          setLoadingStates(prev => ({
            ...prev,
            [series]: false
          }));
        });
      });
    }
  }, [kataSeries, isInitialized]);

  const refetch = useCallback(() => {
    // Clear cache for kata data
    const host = window.location.hostname;
    const baseUrl = `http://${host}:8787`;
    
    kataSeries.forEach(series => {
      const cacheKey = `${baseUrl}/kata?type=${series}`;
      globalCache.cache.delete(cacheKey);
      globalCache.timestamps.delete(cacheKey);
    });
    
    // Reset states and refetch
    setAllData({});
    setError(null);
    setIsInitialized(false);
    
    const initialLoadingStates = {};
    kataSeries.forEach(series => {
      initialLoadingStates[series] = true;
    });
    setLoadingStates(initialLoadingStates);
  }, [kataSeries]);

  return { data: allData, loadingStates, error, refetch };
};

// Export cache instance for debugging
export { globalCache };
