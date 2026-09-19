// Which of the two translations a visitor gets when they open the site root.
//
// The landing pages stay two separate URLs (/ and /sv) tied together by
// hreflang, so nothing here changes what Google indexes -- it only decides
// which one a person lands on. Googlebot crawls from US IPs with an en-US
// language list, so it never takes the Swedish branch and keeps seeing the
// English page at the canonical "/".
//
// The signal is the browser's language list, not the IP's country. It is the
// better one for this decision: a Swedish speaker abroad still reads Swedish,
// and someone in Stockholm running an English phone is not pushed into a
// language they did not ask for. It also needs no GeoIP module in the nginx
// image, no MaxMind database to keep current, and no third party being handed
// visitor IP addresses.

export const SUPPORTED_LANGS = ['en', 'sv'];
export const DEFAULT_LANG = 'en';

const STORAGE_KEY = 'judoquiz.lang';

// localStorage is not merely empty but throws outright in Safari's private
// mode and wherever a browser is set to block site data, so every access is
// guarded. A visitor in that state still gets a working site -- their language
// choice just is not remembered between visits.
export function getStoredLang() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function storeLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* No persistence available. Detection still runs on the next visit. */
  }
}

// navigator.languages is ordered by preference, so the first supported entry
// wins: ['en-GB', 'sv-SE'] is someone who reads both but prefers English, and
// ['de', 'sv-SE'] is someone whose best available option here is Swedish.
// Returns null when the visitor asked for neither, which the caller reads as
// "fall back to the default" rather than "prefers English".
export function detectBrowserLang() {
  if (typeof navigator === 'undefined') return null;

  const list = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const tag of list) {
    if (!tag) continue;
    // Match on the base subtag so sv-SE, sv-FI and bare sv all count.
    const base = String(tag).toLowerCase().split('-')[0];
    if (SUPPORTED_LANGS.includes(base)) return base;
  }

  return null;
}

/**
 * The language to serve at the site root, in precedence order:
 *
 *   1. ?lang= on the URL -- an explicit override, also remembered. This is how
 *      you check the other translation without changing your browser settings,
 *      and how a link can pin the language it was shared in.
 *   2. A choice the visitor made before, via the switcher at the foot of the
 *      landing page. An explicit choice must outrank detection, or picking
 *      English from a Swedish browser would be undone on the next visit.
 *   3. The browser's language list.
 *   4. English.
 *
 * @param {string} search  location.search, including the leading '?'.
 * @returns {'en'|'sv'}
 */
export function resolveLandingLang(search = '') {
  const forced = new URLSearchParams(search).get('lang');
  if (SUPPORTED_LANGS.includes(forced)) {
    storeLang(forced);
    return forced;
  }

  return getStoredLang() || detectBrowserLang() || DEFAULT_LANG;
}
