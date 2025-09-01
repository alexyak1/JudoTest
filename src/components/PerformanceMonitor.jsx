import React, { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    if ('performance' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        if (lastEntry.startTime > 2500) {
          console.warn('LCP is too slow:', lastEntry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log('CLS:', clsValue);
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }, 10000); // Check every 10 seconds
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
