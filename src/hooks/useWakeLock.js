import { useEffect, useRef, useState } from 'react';

// Keeps the screen awake while `active` is true.
//
// A running timer is the one case where the phone has nothing to go on: no
// touches, no video, so iOS locks the screen mid-round. The Screen Wake Lock
// API is the fix (Safari has it since iOS 16.4), with two catches worth
// knowing about:
//   - it needs a secure context, so it is a no-op over plain http;
//   - the browser drops the lock whenever the tab is hidden, and does not hand
//     it back by itself, so we re-request it on every visibilitychange.
//
// Returns whether the API exists at all, so the caller can say something to
// people on browsers that will still fall asleep.
const useWakeLock = (active) => {
  const sentinelRef = useRef(null);
  const [supported] = useState(
    () => typeof navigator !== 'undefined' && 'wakeLock' in navigator
  );

  useEffect(() => {
    if (!supported || !active) return undefined;

    let cancelled = false;

    const release = () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };

    const request = async () => {
      if (cancelled || sentinelRef.current) return;
      if (document.visibilityState !== 'visible') return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
          }
        });
      } catch (error) {
        // Refused - low battery, no secure context, no user gesture. The timer
        // still runs, the screen just behaves as it did before.
        console.log('Wake lock request failed:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      release();
    };
  }, [active, supported]);

  return supported;
};

export default useWakeLock;
