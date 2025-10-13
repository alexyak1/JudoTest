import React, { useState, useEffect, useRef } from 'react';
import './randori.css';

const RandoriTimer = () => {
  // Settings state
  const [fightMinutes, setFightMinutes] = useState(2);
  const [fightSeconds, setFightSeconds] = useState(30);
  const [restMinutes, setRestMinutes] = useState(1);
  const [restSeconds, setRestSeconds] = useState(0);
  const [rounds, setRounds] = useState(4);

  // Input display states (can be empty while typing)
  const [fightMinutesDisplay, setFightMinutesDisplay] = useState('2');
  const [fightSecondsDisplay, setFightSecondsDisplay] = useState('30');
  const [restMinutesDisplay, setRestMinutesDisplay] = useState('1');
  const [restSecondsDisplay, setRestSecondsDisplay] = useState('0');
  const [roundsDisplay, setRoundsDisplay] = useState('4');

  // Calculate total seconds
  const fightTime = fightMinutes * 60 + fightSeconds;
  const restTime = restMinutes * 60 + restSeconds;

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('ready'); // 'ready', 'fight', 'rest'
  const [timeLeft, setTimeLeft] = useState(fightTime);
  const [currentRound, setCurrentRound] = useState(1);

  const intervalRef = useRef(null);
  const fightEndSoundRef = useRef(null);
  const restEndSoundRef = useRef(null);
  
  // Audio elements for mobile
  const fightEndAudioRef = useRef(null);
  const restEndAudioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    // Simple approach for mobile - use HTML5 Audio with data URLs
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
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    };

    // Create audio elements
    fightEndAudioRef.current = new Audio();
    restEndAudioRef.current = new Audio();
    
    fightEndAudioRef.current.src = createSimpleTone(220, 1.2);
    restEndAudioRef.current.src = createSimpleTone(330, 0.8);
    
    // Preload audio for mobile
    fightEndAudioRef.current.preload = 'auto';
    restEndAudioRef.current.preload = 'auto';
    
    // Enable audio in silent mode (like YouTube/Instagram)
    try {
      fightEndAudioRef.current.setAttribute('playsinline', 'true');
      restEndAudioRef.current.setAttribute('playsinline', 'true');
      
      // For iOS - allow audio in silent mode
      if (fightEndAudioRef.current.webkitAudioContext) {
        fightEndAudioRef.current.webkitAudioContext = true;
      }
      if (restEndAudioRef.current.webkitAudioContext) {
        restEndAudioRef.current.webkitAudioContext = true;
      }
    } catch (e) {
      console.log('Silent mode audio setup failed:', e);
    }
    
    fightEndSoundRef.current = () => {
      try {
        fightEndAudioRef.current.currentTime = 0;
        fightEndAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Fight end sound failed:', error);
      }
    };
    
    restEndSoundRef.current = () => {
      try {
        restEndAudioRef.current.currentTime = 0;
        restEndAudioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Rest end sound failed:', error);
      }
    };
    
    // Initialize audio context for silent mode playback
    const initAudioContext = async () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Configure audio session for silent mode playback
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        // Set audio session category for iOS (if available)
        if (navigator.mediaSession) {
          navigator.mediaSession.setActionHandler('play', () => {});
          navigator.mediaSession.setActionHandler('pause', () => {});
        }
        
      } catch (error) {
        console.log('Audio context initialization failed:', error);
      }
    };
    
    // Initialize audio context on first user interaction
    initAudioContext();
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
              } else {
                setCurrentPhase('rest');
                return restTime;
              }
            } else if (currentPhase === 'rest') {
              setCurrentRound(prev => prev + 1);
              setCurrentPhase('fight');
              return fightTime;
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
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhase('ready');
    setCurrentRound(1);
    setTimeLeft(fightTime);
    
    // Scroll to top when timer stops
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
