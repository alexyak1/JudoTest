import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ScrollableTimePicker.css';

const ScrollableTimePicker = ({ 
  initialMinutes = 2, 
  initialSeconds = 30, 
  onTimeChange,
  maxMinutes = 10,
  maxSeconds = 59,
  label = ""
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [dragType, setDragType] = useState(null); // Track which column is being dragged
  
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);


  // Calculate visible range with circular wrapping (show 5 items: 2 above, 1 selected, 2 below)
  const getVisibleRange = (value, maxValue) => {
    const range = [];
    for (let i = 0; i < 5; i++) {
      let index = value - 2 + i;
      
      // Circular wrapping
      if (index < 0) {
        index = maxValue + index + 1;
      } else if (index > maxValue) {
        index = index - maxValue - 1;
      }
      
      range.push(index);
    }
    return range;
  };

  const visibleMinutes = getVisibleRange(minutes, maxMinutes);
  const visibleSeconds = getVisibleRange(seconds, maxSeconds);

  // Handle scroll events with circular behavior
  const handleScroll = (type, deltaY) => {
    if (type === 'minutes') {
      setMinutes(prev => {
        const delta = Math.round(deltaY / 30); // More sensitive scrolling
        let newValue = prev - delta;
        
        // Circular wrapping for minutes
        if (newValue < 0) {
          newValue = maxMinutes;
        } else if (newValue > maxMinutes) {
          newValue = 0;
        }
        
        return newValue;
      });
    } else {
      setSeconds(prev => {
        const delta = Math.round(deltaY / 30); // More sensitive scrolling
        let newValue = prev - delta;
        
        // Circular wrapping for seconds
        if (newValue < 0) {
          newValue = 59;
        } else if (newValue > 59) {
          newValue = 0;
        }
        
        return newValue;
      });
    }
  };

  // Handle mouse events
  const handleMouseDown = useCallback((e, type, value) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartValue(value);
    setDragType(type); // Track which column is being dragged
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !dragType) return;
    
    const deltaY = e.clientY - dragStartY;
    const deltaValue = Math.round(deltaY / 20); // More sensitive dragging
    
    if (Math.abs(deltaValue) >= 1) {
      let newValue = dragStartValue - deltaValue;
      
      if (dragType === 'minutes') {
        // Circular wrapping for minutes
        if (newValue < 0) {
          newValue = maxMinutes;
        } else if (newValue > maxMinutes) {
          newValue = 0;
        }
        setMinutes(newValue);
      } else if (dragType === 'seconds') {
        // Circular wrapping for seconds
        if (newValue < 0) {
          newValue = 59;
        } else if (newValue > 59) {
          newValue = 0;
        }
        setSeconds(newValue);
      }
      
      setDragStartY(e.clientY);
      setDragStartValue(newValue);
    }
  }, [isDragging, dragStartY, dragStartValue, dragType, maxMinutes]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  // Handle touch events
  const handleTouchStart = useCallback((e, type, value) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartValue(value);
    setDragType(type); // Track which column is being dragged
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !dragType) return;
    
    const deltaY = e.touches[0].clientY - dragStartY;
    const deltaValue = Math.round(deltaY / 20); // More sensitive touch dragging
    
    if (Math.abs(deltaValue) >= 1) {
      let newValue = dragStartValue - deltaValue;
      
      if (dragType === 'minutes') {
        // Circular wrapping for minutes
        if (newValue < 0) {
          newValue = maxMinutes;
        } else if (newValue > maxMinutes) {
          newValue = 0;
        }
        setMinutes(newValue);
      } else if (dragType === 'seconds') {
        // Circular wrapping for seconds
        if (newValue < 0) {
          newValue = 59;
        } else if (newValue > 59) {
          newValue = 0;
        }
        setSeconds(newValue);
      }
      
      setDragStartY(e.touches[0].clientY);
      setDragStartValue(newValue);
    }
  }, [isDragging, dragStartY, dragStartValue, dragType, maxMinutes]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  // Handle wheel events
  const handleWheel = (e, type) => {
    e.preventDefault();
    handleScroll(type, e.deltaY);
  };

  // Handle click events
  const handleClick = (type, value) => {
    if (type === 'minutes') {
      setMinutes(value);
    } else {
      setSeconds(value);
    }
  };

  // Notify parent of time changes
  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(minutes, seconds);
    }
  }, [minutes, seconds, onTimeChange]);

  // Add global event listeners for mouse/touch
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="scrollable-time-picker">
      {label && <div className="time-picker-label">{label}</div>}
      <div className="time-picker-row">
        <div className="time-picker-column">
          <div className="column-label">MIN</div>
          <div 
            className="picker-wheel"
            ref={minutesRef}
            onWheel={(e) => handleWheel(e, 'minutes')}
          >
            {visibleMinutes.map((value) => (
              <div
                key={value}
                className={`picker-item ${value === minutes ? 'selected' : ''}`}
                onClick={() => handleClick('minutes', value)}
                onMouseDown={(e) => handleMouseDown(e, 'minutes', value)}
                onTouchStart={(e) => handleTouchStart(e, 'minutes', value)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        
        <div className="time-picker-column">
          <div className="column-label">SEC</div>
          <div 
            className="picker-wheel"
            ref={secondsRef}
            onWheel={(e) => handleWheel(e, 'seconds')}
          >
            {visibleSeconds.map((value) => (
              <div
                key={value}
                className={`picker-item ${value === seconds ? 'selected' : ''}`}
                onClick={() => handleClick('seconds', value)}
                onMouseDown={(e) => handleMouseDown(e, 'seconds', value)}
                onTouchStart={(e) => handleTouchStart(e, 'seconds', value)}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollableTimePicker;
