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

  // Initialize audio
  useEffect(() => {
    // Create Japanese-style bell/gong sounds
    const createJapaneseBellSound = (frequency, duration, harmonics = 3) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create multiple oscillators for harmonic richness
      for (let i = 0; i < harmonics; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Create harmonic series (fundamental + overtones)
        oscillator.frequency.value = frequency * (i + 1);
        oscillator.type = 'sine';
        
        // Envelope for bell-like decay
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3 / (i + 1), now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
      }
    };

    fightEndSoundRef.current = () => createJapaneseBellSound(220, 1.2, 4); // Lower, longer bell for fight end
    restEndSoundRef.current = () => createJapaneseBellSound(330, 0.8, 3); // Higher, shorter bell for rest end
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
      <div className="randori-header">
        <h1>TIMER</h1>
      </div>

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
                value={rounds}
                onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
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
