import React, { useState, useEffect, useRef } from 'react';
import './randori.css';

// SVG Icons
const Icons = {
  Timer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  BellOff: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8.5 8.5a6 6 0 0 1 9.5 5.5"/>
      <path d="M3 3l18 18"/>
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      <path d="m4 8a6 6 0 0 0 2 4.5V17h11"/>
      <path d="M9 13v.01"/>
    </svg>
  ),
  Play: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Pause: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  ),
  RotateCcw: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  ),
  ChevronUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  Zap: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Coffee: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" y1="2" x2="6" y2="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  ),
  Repeat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="m7 22-4-4 4-4"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
};

const RandoriTimer = () => {
  // Load saved settings
  const getSavedSettings = () => {
    try {
      const saved = localStorage.getItem('randoriTimerSettings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.log('Failed to load saved settings:', error);
    }
    return null;
  };

  const savedSettings = getSavedSettings();

  // Mode: 'standard' or 'interval'
  const [mode, setMode] = useState(savedSettings?.mode || 'interval');
  
  // Standard mode time
  const [standardTime, setStandardTime] = useState(savedSettings?.standardTime || 300);
  
  // Interval mode times
  const [workTime, setWorkTime] = useState(
    savedSettings?.fightMinutes !== undefined && savedSettings?.fightSeconds !== undefined
      ? savedSettings.fightMinutes * 60 + savedSettings.fightSeconds
      : 150 // 2:30 default
  );
  const [restTime, setRestTime] = useState(
    savedSettings?.restMinutes !== undefined && savedSettings?.restSeconds !== undefined
      ? savedSettings.restMinutes * 60 + savedSettings.restSeconds
      : 60 // 1:00 default
  );
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(mode === 'standard' ? standardTime : workTime);
  const [initialTime, setInitialTime] = useState(mode === 'standard' ? standardTime : workTime);
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work' or 'rest'
  const [rounds, setRounds] = useState(0);
  const [totalRounds, setTotalRounds] = useState(savedSettings?.rounds || 4);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(savedSettings?.isMuted || false);

  const timerRef = useRef(null);

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      mode,
      standardTime,
      fightMinutes: Math.floor(workTime / 60),
      fightSeconds: workTime % 60,
      restMinutes: Math.floor(restTime / 60),
      restSeconds: restTime % 60,
      rounds: totalRounds,
      isMuted
    };
    
    try {
      localStorage.setItem('randoriTimerSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Failed to save settings:', error);
    }
  }, [mode, standardTime, workTime, restTime, totalRounds, isMuted]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === 'standard') {
        setIsRunning(false);
        if (!isMuted) playAlert('final');
        clearInterval(timerRef.current);
        
        // Track timer completion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'timer_complete', {
            event_category: 'timer_interaction',
            event_label: 'standard_timer_completed',
            value: standardTime
          });
        }
      } else {
        // Interval mode
        if (currentPhase === 'work') {
          const newRounds = rounds + 1;
          setRounds(newRounds);
          
          // Check if all rounds complete
          if (newRounds >= totalRounds) {
            setIsRunning(false);
            if (!isMuted) playAlert('final');
            clearInterval(timerRef.current);
            
            // Track completion
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'timer_complete', {
                event_category: 'timer_interaction',
                event_label: 'all_rounds_completed',
                value: totalRounds
              });
            }
            return;
          }
          
          // Move to rest
          setCurrentPhase('rest');
          setTimeLeft(restTime);
          setInitialTime(restTime);
          if (!isMuted) playAlert('rest');
          
          // Track phase change
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'phase_change', {
              event_category: 'timer_interaction',
              event_label: 'fight_to_rest',
              value: newRounds
            });
          }
        } else {
          // Move to work
          setCurrentPhase('work');
          setTimeLeft(workTime);
          setInitialTime(workTime);
          if (!isMuted) playAlert('work');
          
          // Track phase change
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'phase_change', {
              event_category: 'timer_interaction',
              event_label: 'rest_to_fight',
              value: rounds + 1
            });
          }
        }
      }
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, mode, currentPhase, workTime, restTime, isMuted, rounds, totalRounds, standardTime]);

  const playAlert = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, start, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      if (type === 'work') {
        playTone(880, audioCtx.currentTime, 0.3);
        playTone(880, audioCtx.currentTime + 0.4, 0.3);
      } else if (type === 'rest') {
        playTone(440, audioCtx.currentTime, 0.6);
      } else {
        playTone(660, audioCtx.currentTime, 0.4);
        playTone(880, audioCtx.currentTime + 0.5, 0.6);
      }
    } catch (e) {
      console.log('Audio playback failed:', e);
    }
  };

  const formatTimeDisplay = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (!isRunning) {
      // Starting timer
      if (!isMuted) playAlert('work');
      
      // Track timer start
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'timer_start', {
          event_category: 'timer_interaction',
          event_label: mode === 'standard' ? 'standard_started' : 'interval_started',
          value: 1
        });
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRounds(0);
    if (mode === 'standard') {
      setTimeLeft(standardTime);
      setInitialTime(standardTime);
    } else {
      setCurrentPhase('work');
      setTimeLeft(workTime);
      setInitialTime(workTime);
    }
    
    // Track reset
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timer_reset', {
        event_category: 'timer_interaction',
        event_label: 'timer_reset'
      });
    }
  };

  const updateTimeValue = (type, unit, amount) => {
    const update = (prev) => {
      let m = Math.floor(prev / 60);
      let s = prev % 60;
      if (unit === 'm') m = Math.max(0, Math.min(59, m + amount));
      if (unit === 's') {
        s += amount;
        if (s >= 60) { m = Math.min(59, m + 1); s -= 60; }
        if (s < 0) { if (m > 0) { m -= 1; s += 60; } else { s = 0; } }
      }
      return Math.max(0, m * 60 + s);
    };

    if (type === 'standard') {
      setStandardTime(prev => {
        const next = update(prev);
        if (!isRunning) {
          setTimeLeft(next);
          setInitialTime(next);
        }
        return next;
      });
    } else if (type === 'work') {
      setWorkTime(prev => {
        const next = update(prev);
        if (!isRunning && currentPhase === 'work') {
          setTimeLeft(next);
          setInitialTime(next);
        }
        return next;
      });
    } else if (type === 'rest') {
      setRestTime(prev => {
        const next = update(prev);
        if (!isRunning && currentPhase === 'rest') {
          setTimeLeft(next);
          setInitialTime(next);
        }
        return next;
      });
    }
  };

  const updateRounds = (amount) => {
    setTotalRounds(prev => Math.max(1, Math.min(20, prev + amount)));
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setRounds(0);
    setMode(newMode);
    if (newMode === 'standard') {
      setTimeLeft(standardTime);
      setInitialTime(standardTime);
    } else {
      setCurrentPhase('work');
      setTimeLeft(workTime);
      setInitialTime(workTime);
    }
  };

  // Circle progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = initialTime > 0 ? (timeLeft / initialTime) * circumference : 0;

  const getThemeColor = () => {
    if (mode === 'standard') return 'blue';
    return currentPhase === 'work' ? 'emerald' : 'amber';
  };

  const TimeUnitControl = ({ label, value, type, colorClass }) => (
    <div className="time-unit-control">
      <span className="time-unit-label">{label}</span>
      <div className="time-unit-inputs">
        <div className="time-unit-column">
          <button 
            onClick={() => updateTimeValue(type, 'm', 1)} 
            className={`time-unit-btn ${colorClass}`}
          >
            <Icons.ChevronUp/>
          </button>
          <span className="time-unit-value">{Math.floor(value/60)}m</span>
          <button 
            onClick={() => updateTimeValue(type, 'm', -1)} 
            className={`time-unit-btn ${colorClass}`}
          >
            <Icons.ChevronDown/>
          </button>
        </div>
        <div className="time-unit-separator">:</div>
        <div className="time-unit-column">
          <button 
            onClick={() => updateTimeValue(type, 's', 10)} 
            className={`time-unit-btn ${colorClass}`}
          >
            <Icons.ChevronUp/>
          </button>
          <span className="time-unit-value">{(value%60).toString().padStart(2, '0')}s</span>
          <button 
            onClick={() => updateTimeValue(type, 's', -10)} 
            className={`time-unit-btn ${colorClass}`}
          >
            <Icons.ChevronDown/>
          </button>
        </div>
      </div>
    </div>
  );

  const RoundsControl = () => (
    <div className="rounds-control">
      <span className="time-unit-label">Rounds</span>
      <div className="rounds-inputs">
        <button 
          onClick={() => updateRounds(-1)} 
          className="time-unit-btn emerald"
        >
          <Icons.ChevronDown/>
        </button>
        <span className="rounds-value">{totalRounds}</span>
        <button 
          onClick={() => updateRounds(1)} 
          className="time-unit-btn emerald"
        >
          <Icons.ChevronUp/>
        </button>
      </div>
    </div>
  );

  return (
    <div className="zen-timer-wrapper">
      <div className="zen-timer-container">
        {/* Header */}
        <div className="zen-header">
          <div className="zen-header-top">
            <div className="zen-header-title">
              <div className={`zen-icon-box ${getThemeColor()}`}>
                <Icons.Timer />
              </div>
              <h1 className="zen-title">{mode === 'standard' ? 'Timer' : 'Randori'}</h1>
            </div>
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="zen-mute-btn"
            >
              {isMuted ? <Icons.BellOff /> : <Icons.Bell />}
            </button>
          </div>
          
          <div className="zen-mode-toggle">
            <button 
              onClick={() => switchMode('standard')} 
              className={`zen-mode-btn ${mode === 'standard' ? 'active' : ''}`}
            >
              Standard
            </button>
            <button 
              onClick={() => switchMode('interval')} 
              className={`zen-mode-btn ${mode === 'interval' ? 'active' : ''}`}
            >
              Interval
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="zen-display">
          <svg className="zen-progress-ring" viewBox="0 0 288 288">
            <circle 
              cx="144" 
              cy="144" 
              r={radius} 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent" 
              className="zen-progress-bg" 
            />
            <circle 
              cx="144" 
              cy="144" 
              r={radius} 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={circumference} 
              style={{ 
                strokeDashoffset: circumference - progress, 
                transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.4s ease-out' 
              }} 
              strokeLinecap="round" 
              className={`zen-progress-indicator ${getThemeColor()}`} 
            />
          </svg>
          <div className="zen-time-display">
            {mode === 'interval' && (
              <div className={`zen-phase-badge ${currentPhase}`}>
                {currentPhase === 'work' ? <Icons.Zap /> : <Icons.Coffee />}
                {currentPhase === 'work' ? 'Fight' : 'Rest'}
              </div>
            )}
            <span className={`zen-time-text ${timeLeft < 6 && isRunning ? 'warning' : ''}`}>
              {formatTimeDisplay(timeLeft)}
            </span>
            {mode === 'interval' && (
              <span className="zen-round-indicator">
                Round {rounds + 1} / {totalRounds}
              </span>
            )}
          </div>
        </div>

        {/* Settings */}
        {!isRunning && (
          <div className="zen-settings">
            {mode === 'standard' ? (
              <div className="zen-settings-standard">
                <TimeUnitControl 
                  label="Set Time" 
                  value={standardTime} 
                  type="standard" 
                  colorClass="blue" 
                />
                <div className="zen-presets">
                  {[120, 300, 600, 1200].map(s => (
                    <button 
                      key={s} 
                      onClick={() => { 
                        setStandardTime(s); 
                        setTimeLeft(s); 
                        setInitialTime(s);
                      }} 
                      className={`zen-preset-btn ${standardTime === s ? 'active' : ''}`}
                    >
                      {s/60}m
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="zen-settings-interval">
                <div className="zen-time-controls">
                  <TimeUnitControl 
                    label="Fight" 
                    value={workTime} 
                    type="work" 
                    colorClass="emerald" 
                  />
                  <TimeUnitControl 
                    label="Rest" 
                    value={restTime} 
                    type="rest" 
                    colorClass="amber" 
                  />
                </div>
                <RoundsControl />
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="zen-controls">
          <button onClick={resetTimer} className="zen-reset-btn">
            <Icons.RotateCcw />
          </button>
          <button 
            onClick={toggleTimer} 
            className={`zen-main-btn ${isRunning ? 'paused' : getThemeColor()}`}
          >
            {isRunning ? (
              <>
                <Icons.Pause />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Icons.Play />
                <span>Start</span>
              </>
            )}
          </button>
          <div className="zen-auto-indicator">
            {mode === 'interval' && (
              <Icons.Repeat className={isRunning ? 'spinning' : ''} />
            )}
            <span>Auto</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandoriTimer;
