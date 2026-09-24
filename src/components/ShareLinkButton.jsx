import React, { useCallback, useEffect, useState } from 'react';
import './ShareLinkButton.css';

/**
 * Copies a technique's permalink. Lives in the modal header rather than under
 * the player: the player is tall enough on a laptop that anything below it is
 * the first thing to fall off the bottom of the modal.
 */

// clipboard.writeText needs a secure context and is missing in some in-app
// browsers, so keep the old execCommand path as a fallback.
const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      /* fall through to the legacy path */
    }
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch (e) {
    return false;
  }
};

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ShareLinkButton = ({ url, onShare }) => {
  const [state, setState] = useState('idle'); // idle | copied | failed

  // Reset when the modal moves to another technique.
  useEffect(() => setState('idle'), [url]);

  useEffect(() => {
    if (state === 'idle') return undefined;
    const timer = setTimeout(() => setState('idle'), 2200);
    return () => clearTimeout(timer);
  }, [state]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(url);
    setState(ok ? 'copied' : 'failed');
    if (ok && onShare) onShare('copy_link');
  }, [url, onShare]);

  const label = {
    idle: 'Copy link',
    copied: 'Link copied',
    failed: 'Press ⌘C to copy',
  }[state];

  return (
    <button
      type="button"
      className={`share-link-btn${state === 'copied' ? ' is-copied' : ''}`}
      onClick={handleCopy}
      title="Copy a link to this technique"
    >
      {state === 'copied' ? <CheckIcon /> : <LinkIcon />}
      <span className="share-link-btn-label">{label}</span>
      {/* The label is visual; this is what a screen reader hears change. */}
      <span className="share-link-btn-status" role="status" aria-live="polite">
        {state === 'copied' ? 'Link copied to clipboard' : ''}
      </span>
    </button>
  );
};

export default ShareLinkButton;
