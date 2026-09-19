import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import './TechniquePlayer.css';

const DEFAULT_FPS = 15;
const SKIP_SECONDS = 1; // clips run 1.5-28s, so 5s would overshoot most throws
const SPEEDS = [1, 0.5, 0.25];

const pad = (n) => String(n).padStart(2, '0');

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00.0';
  const whole = Math.floor(seconds);
  const tenths = Math.floor((seconds - whole) * 10);
  return `${Math.floor(whole / 60)}:${pad(whole % 60)}.${tenths}`;
};

/**
 * Video player built for studying a throw rather than watching it.
 *
 * The scrub bar is indexed in frames, not seconds, so dragging lands exactly
 * on one moment instead of somewhere between two. Frame rate comes from the
 * build manifest because it varies per clip (2-30fps, inherited from each
 * source GIF) -- a fixed step would skip frames on some and stall on others.
 */
const TechniquePlayer = memo(({ src, poster, fps: fpsProp, title }) => {
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const wasPlayingRef = useRef(false);

  const fps = fpsProp && fpsProp > 0 ? fpsProp : DEFAULT_FPS;

  const [duration, setDuration] = useState(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const totalFrames = duration > 0 ? Math.max(1, Math.round(duration * fps)) : 0;

  // Land mid-frame: seeking exactly on a boundary can resolve to either side.
  const seekToFrame = useCallback((index) => {
    const video = videoRef.current;
    if (!video || totalFrames === 0) return;
    const clamped = Math.min(Math.max(index, 0), totalFrames - 1);
    video.currentTime = (clamped + 0.5) / fps;
    setFrame(clamped);
  }, [fps, totalFrames]);

  // timeupdate only fires ~4x/sec, too coarse to track a scrub bar smoothly.
  useEffect(() => {
    const tick = () => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setFrame(Math.floor(video.currentTime * fps));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fps]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
  }, [speed]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const stepFrame = useCallback((delta) => {
    const video = videoRef.current;
    if (video) video.pause();
    seekToFrame(frame + delta);
  }, [frame, seekToFrame]);

  const skip = useCallback((seconds) => {
    seekToFrame(frame + Math.round(seconds * fps));
  }, [frame, fps, seekToFrame]);

  // Pause while dragging so the scrub position holds, then restore.
  const onScrubStart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    wasPlayingRef.current = !video.paused;
    video.pause();
  }, []);

  const onScrub = useCallback((e) => {
    seekToFrame(Number(e.target.value));
  }, [seekToFrame]);

  const onScrubEnd = useCallback(() => {
    const video = videoRef.current;
    if (video && wasPlayingRef.current) video.play().catch(() => {});
    wasPlayingRef.current = false;
  }, []);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepFrame(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); stepFrame(1); }
    else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  }, [stepFrame, togglePlay]);

  return (
    <div className="technique-player" onKeyDown={onKeyDown}>
      <video
        ref={videoRef}
        className="technique-player-video"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        aria-label={title}
        onClick={togglePlay}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="technique-player-controls">
        <input
          className="technique-scrub"
          type="range"
          min={0}
          max={Math.max(0, totalFrames - 1)}
          step={1}
          value={Math.min(frame, Math.max(0, totalFrames - 1))}
          style={{
            '--progress': totalFrames > 1
              ? `${(Math.min(frame, totalFrames - 1) / (totalFrames - 1)) * 100}%`
              : '0%',
          }}
          onPointerDown={onScrubStart}
          onPointerUp={onScrubEnd}
          onChange={onScrub}
          aria-label="Scrub to a moment"
        />

        <div className="technique-player-readout">
          <span>{formatTime(frame / fps)} / {formatTime(duration)}</span>
          <span>frame {totalFrames ? frame + 1 : 0} / {totalFrames}</span>
        </div>

        <div className="technique-player-buttons">
          <button type="button" onClick={() => skip(-SKIP_SECONDS)}
                  aria-label={`Back ${SKIP_SECONDS} second`}>
            «<small>{SKIP_SECONDS}s</small>
          </button>
          <button type="button" onClick={() => stepFrame(-1)}
                  aria-label="Previous frame">
            ◀<small>frame</small>
          </button>
          <button type="button" className="primary" onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '❙❙' : '▶'}
          </button>
          <button type="button" onClick={() => stepFrame(1)}
                  aria-label="Next frame">
            <small>frame</small>▶
          </button>
          <button type="button" onClick={() => skip(SKIP_SECONDS)}
                  aria-label={`Forward ${SKIP_SECONDS} second`}>
            <small>{SKIP_SECONDS}s</small>»
          </button>
        </div>

        <div className="technique-player-speeds" role="group" aria-label="Playback speed">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={s === speed ? 'active' : ''}
              onClick={() => setSpeed(s)}
              aria-pressed={s === speed}
            >
              {s === 1 ? '1x' : `${s}x`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

TechniquePlayer.displayName = 'TechniquePlayer';

export { TechniquePlayer };
