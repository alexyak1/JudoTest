import React, { useState, useEffect } from 'react';
import './PerformanceDashboard.css';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    lcp: null,
    fid: null,
    cls: 0,
    memory: null
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if ('performance' in window) {
      // Monitor LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor CLS
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            setMetrics(prev => ({ ...prev, cls: prev.cls + entry.value }));
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Monitor Memory
      if ('memory' in performance) {
        const updateMemory = () => {
          const memory = performance.memory;
          setMetrics(prev => ({
            ...prev,
            memory: {
              used: Math.round(memory.usedJSHeapSize / 1048576),
              total: Math.round(memory.totalJSHeapSize / 1048576),
              limit: Math.round(memory.jsHeapSizeLimit / 1048576)
            }
          }));
        };
        
        updateMemory();
        setInterval(updateMemory, 5000);
      }
    }
  }, []);

  const getPerformanceScore = () => {
    let score = 100;
    
    if (metrics.lcp > 2500) score -= 20;
    if (metrics.lcp > 4000) score -= 20;
    
    if (metrics.fid > 100) score -= 15;
    if (metrics.fid > 300) score -= 15;
    
    if (metrics.cls > 0.1) score -= 15;
    if (metrics.cls > 0.25) score -= 15;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  if (!isVisible) {
    return (
      <button 
        className="performance-toggle"
        onClick={() => setIsVisible(true)}
        title="Show Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h3>Performance Dashboard</h3>
        <button 
          className="close-btn"
          onClick={() => setIsVisible(false)}
        >
          ×
        </button>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Performance Score</h4>
          <div 
            className="score-circle"
            style={{ color: getScoreColor(getPerformanceScore()) }}
          >
            {getPerformanceScore()}
          </div>
        </div>
        
        <div className="metric-card">
          <h4>LCP</h4>
          <div className="metric-value">
            {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Loading...'}
          </div>
          <div className="metric-status">
            {metrics.lcp && metrics.lcp < 2500 ? '✅ Good' : '⚠️ Needs improvement'}
          </div>
        </div>
        
        <div className="metric-card">
          <h4>FID</h4>
          <div className="metric-value">
            {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Loading...'}
          </div>
          <div className="metric-status">
            {metrics.fid && metrics.fid < 100 ? '✅ Good' : '⚠️ Needs improvement'}
          </div>
        </div>
        
        <div className="metric-card">
          <h4>CLS</h4>
          <div className="metric-value">
            {metrics.cls ? metrics.cls.toFixed(3) : '0.000'}
          </div>
          <div className="metric-status">
            {metrics.cls < 0.1 ? '✅ Good' : '⚠️ Needs improvement'}
          </div>
        </div>
        
        {metrics.memory && (
          <div className="metric-card memory-card">
            <h4>Memory Usage</h4>
            <div className="memory-bar">
              <div 
                className="memory-fill"
                style={{ width: `${(metrics.memory.used / metrics.memory.limit) * 100}%` }}
              ></div>
            </div>
            <div className="memory-text">
              {metrics.memory.used}MB / {metrics.memory.limit}MB
            </div>
          </div>
        )}
      </div>
      
      <div className="dashboard-footer">
        <small>Performance data updates every 5 seconds</small>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
