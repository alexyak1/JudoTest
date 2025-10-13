import React, { useState, useEffect, useRef } from 'react';
import './randori.css';

const RandoriTimer = () => {
  // Load saved settings or use defaults
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
  
  // Settings state with saved values or defaults
  const [fightMinutes, setFightMinutes] = useState(savedSettings?.fightMinutes || 2);
  const [fightSeconds, setFightSeconds] = useState(savedSettings?.fightSeconds || 30);
  const [restMinutes, setRestMinutes] = useState(savedSettings?.restMinutes || 1);
  const [restSeconds, setRestSeconds] = useState(savedSettings?.restSeconds || 0);
  const [rounds, setRounds] = useState(savedSettings?.rounds || 4);

  // Input display states (can be empty while typing)
  const [fightMinutesDisplay, setFightMinutesDisplay] = useState(savedSettings?.fightMinutes?.toString() || '2');
  const [fightSecondsDisplay, setFightSecondsDisplay] = useState(savedSettings?.fightSeconds?.toString() || '30');
  const [restMinutesDisplay, setRestMinutesDisplay] = useState(savedSettings?.restMinutes?.toString() || '1');
  const [restSecondsDisplay, setRestSecondsDisplay] = useState(savedSettings?.restSeconds?.toString() || '0');
  const [roundsDisplay, setRoundsDisplay] = useState(savedSettings?.rounds?.toString() || '4');

  // Calculate total seconds
  const fightTime = fightMinutes * 60 + fightSeconds;
  const restTime = restMinutes * 60 + restSeconds;

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = {
      fightMinutes,
      fightSeconds,
      restMinutes,
      restSeconds,
      rounds
    };
    
    try {
      localStorage.setItem('randoriTimerSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Failed to save settings:', error);
    }
  }, [fightMinutes, fightSeconds, restMinutes, restSeconds, rounds]);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready'); // 'ready', 'fight', 'rest'
  const [timeLeft, setTimeLeft] = useState(fightTime);
  const [currentRound, setCurrentRound] = useState(1);

  const intervalRef = useRef(null);
  const fightEndSoundRef = useRef(null);
  const restEndSoundRef = useRef(null);
  const fightStartSoundRef = useRef(null);
  
  // Audio elements for mobile
  const fightEndAudioRef = useRef(null);
  const restEndAudioRef = useRef(null);
  const fightStartAudioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Very simple audio setup
    const createSimpleTone = (frequency, duration) => {
      const sampleRate = 44100;
      const length = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Generate sine wave
      for (let i = 0; i < length; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.5;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    };

    // Create audio elements
    fightEndAudioRef.current = new Audio();
    restEndAudioRef.current = new Audio();
    fightStartAudioRef.current = new Audio();
    
    fightEndAudioRef.current.src = createSimpleTone(220, 1.2);
    restEndAudioRef.current.src = createSimpleTone(330, 0.8);
    fightStartAudioRef.current.src = createSimpleTone(440, 0.5); // Higher pitch, shorter for fight start
    
    // Basic settings
    fightEndAudioRef.current.preload = 'auto';
    restEndAudioRef.current.preload = 'auto';
    
    fightEndSoundRef.current = () => {
      console.log('Playing fight end sound');
      fightEndAudioRef.current.currentTime = 0;
      fightEndAudioRef.current.play().catch(e => console.log('Fight end audio play failed:', e));
    };
    
    restEndSoundRef.current = () => {
      console.log('Playing rest end sound');
      restEndAudioRef.current.currentTime = 0;
      restEndAudioRef.current.play().catch(e => console.log('Rest audio play failed:', e));
    };
    
    fightStartSoundRef.current = () => {
      console.log('Playing fight start sound');
      fightStartAudioRef.current.currentTime = 0;
      fightStartAudioRef.current.play().catch(e => console.log('Fight start audio play failed:', e));
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - play sound and move to next phase
            if (currentPhase === 'fight') {
              fightEndSoundRef.current?.();
            } else if (currentPhase === 'rest') {
              restEndSoundRef.current?.();
            }
            
            if (currentPhase === 'fight') {
              if (currentRound >= rounds) {
                // All rounds complete
                setIsRunning(false);
                setCurrentPhase('ready');
                setCurrentRound(1);
                return fightTime;
                
                // Track timer completion in Google Analytics
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'timer_complete', {
                    event_category: 'timer_interaction',
                    event_label: 'all_rounds_completed',
                    value: rounds,
                    custom_map: {
                      total_rounds: rounds,
                      fight_time: fightTime,
                      rest_time: restTime
                    }
                  });
                }
              } else {
                setCurrentPhase('rest');
                return restTime;
                
                // Track phase change to rest
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'phase_change', {
                    event_category: 'timer_interaction',
                    event_label: 'fight_to_rest',
                    value: currentRound,
                    custom_map: {
                      current_round: currentRound,
                      total_rounds: rounds
                    }
                  });
                }
              }
            } else if (currentPhase === 'rest') {
              setCurrentRound(prev => prev + 1);
              setCurrentPhase('fight');
              return fightTime;
              
              // Track phase change to fight
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'phase_change', {
                  event_category: 'timer_interaction',
                  event_label: 'rest_to_fight',
                  value: currentRound + 1,
                  custom_map: {
                    current_round: currentRound + 1,
                    total_rounds: rounds
                  }
                });
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, currentPhase, fightTime, restTime, rounds, currentRound]);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCurrentPhase('fight');
    setTimeLeft(fightTime);
    
    // Scroll to top when timer starts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Play fight start sound
    setTimeout(() => {
      fightStartSoundRef.current?.();
    }, 100);
    
    // Track timer start in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timer_start', {
        event_category: 'timer_interaction',
        event_label: 'timer_started',
        value: 1,
        custom_map: {
          fight_time: fightTime,
          rest_time: restTime,
          rounds: rounds
        }
      });
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
    
    // Track pause/resume in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', isPaused ? 'timer_resume' : 'timer_pause', {
        event_category: 'timer_interaction',
        event_label: isPaused ? 'timer_resumed' : 'timer_paused',
        value: 1,
        custom_map: {
          current_phase: currentPhase,
          current_round: currentRound,
          time_left: timeLeft
        }
      });
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhase('ready');
    setCurrentRound(1);
    setTimeLeft(fightTime);
    
    // Scroll to top when timer stops
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Track timer stop in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timer_stop', {
        event_category: 'timer_interaction',
        event_label: 'timer_stopped',
        value: 1,
        custom_map: {
          completed_rounds: currentRound - 1,
          total_rounds: rounds
        }
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    if (currentPhase === 'fight') return 'FIGHT';
    if (currentPhase === 'rest') return 'REST';
    return 'READY';
  };

  const getPhaseColor = () => {
    if (currentPhase === 'fight') return '#ff4444';
    if (currentPhase === 'rest') return '#44ff44';
    return '#666';
  };

  return (
    <div className="randori-container">
      <header className="randori-header">
        <h1>TIMER</h1>
        <p className="timer-description">Free online judo timer and randori timer for martial arts training</p>
      </header>

      {!isRunning ? (
        <div className="settings-container">
          <div className="setting-group">
            <label>FIGHT TIME</label>
            <div className="time-inputs">
              <div className="time-input">
                <input
                  type="number"
                  value={fightMinutesDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFightMinutesDisplay(value);
                    if (value === '') {
                      setFightMinutes(0);
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num)) {
                        setFightMinutes(Math.max(0, Math.min(10, num)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (fightMinutesDisplay === '') {
                      setFightMinutesDisplay('0');
                    }
                  }}
                  onFocus={(e) => {
                    // Move cursor to end of input
                    setTimeout(() => {
                      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    }, 0);
                  }}
                  min="0"
                  max="10"
                />
                <span>min</span>
              </div>
              <div className="time-input">
                <input
                  type="number"
                  value={fightSecondsDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFightSecondsDisplay(value);
                    if (value === '') {
                      setFightSeconds(0);
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num)) {
                        setFightSeconds(Math.max(0, Math.min(59, num)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (fightSecondsDisplay === '') {
                      setFightSecondsDisplay('0');
                    }
                  }}
                  onFocus={(e) => {
                    // Move cursor to end of input
                    setTimeout(() => {
                      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    }, 0);
                  }}
                  min="0"
                  max="59"
                />
                <span>sec</span>
              </div>
            </div>
          </div>

          <div className="setting-group">
            <label>REST TIME</label>
            <div className="time-inputs">
              <div className="time-input">
                <input
                  type="number"
                  value={restMinutesDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRestMinutesDisplay(value);
                    if (value === '') {
                      setRestMinutes(0);
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num)) {
                        setRestMinutes(Math.max(0, Math.min(10, num)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (restMinutesDisplay === '') {
                      setRestMinutesDisplay('0');
                    }
                  }}
                  onFocus={(e) => {
                    // Move cursor to end of input
                    setTimeout(() => {
                      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    }, 0);
                  }}
                  min="0"
                  max="10"
                />
                <span>min</span>
              </div>
              <div className="time-input">
                <input
                  type="number"
                  value={restSecondsDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRestSecondsDisplay(value);
                    if (value === '') {
                      setRestSeconds(0);
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num)) {
                        setRestSeconds(Math.max(0, Math.min(59, num)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (restSecondsDisplay === '') {
                      setRestSecondsDisplay('0');
                    }
                  }}
                  onFocus={(e) => {
                    // Move cursor to end of input
                    setTimeout(() => {
                      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    }, 0);
                  }}
                  min="0"
                  max="59"
                />
                <span>sec</span>
              </div>
            </div>
          </div>

          <div className="setting-group">
            <label>ROUNDS</label>
            <div className="time-input">
              <input
                type="number"
                value={roundsDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRoundsDisplay(value);
                    if (value === '') {
                      setRounds(1);
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num)) {
                        setRounds(Math.max(1, Math.min(20, num)));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (roundsDisplay === '') {
                      setRoundsDisplay('1');
                    }
                  }}
                  onFocus={(e) => {
                    // Move cursor to end of input
                    setTimeout(() => {
                      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                    }, 0);
                  }}
                min="1"
                max="20"
              />
            </div>
          </div>

          <button className="start-button" onClick={startTimer}>
            START
          </button>
        </div>
      ) : (
        <div className="timer-container">
          <div className="timer-display" style={{ color: getPhaseColor() }}>
            {formatTime(timeLeft)}
          </div>
          
          <div className="phase-info">
            <div className="phase-text" style={{ color: getPhaseColor() }}>
              {getPhaseText()}
            </div>
            <div className="round-info">
              Round {currentRound}/{rounds}
            </div>
          </div>

          <div className="timer-controls">
            <button className="control-button pause" onClick={pauseTimer}>
              {isPaused ? '▶' : '⏸'}
            </button>
            <button className="control-button stop" onClick={stopTimer}>
              ⏹
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandoriTimer;
