import { useState, useEffect } from 'react';

/**
 * True only on devices with a real hovering pointer (mouse/trackpad).
 *
 * Touch browsers fire mouseenter on tap, so hover-to-play would double up with
 * the tap-to-open-modal handler. Gating on this keeps the two interactions
 * separate: hover previews on desktop, tap opens the modal on touch.
 */
export const useHoverCapable = () => {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(query.matches);

    const onChange = (e) => setCanHover(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return canHover;
};
