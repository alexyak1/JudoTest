import { useEffect } from 'react';

// Single source of truth for the canonical origin. Must always name a URL that
// actually answers -- a canonical pointing somewhere unreachable is worse than
// no canonical at all. If this ever changes, public/index.html,
// public/sitemap.xml and public/robots.txt hold the same origin and must
// change with it.
export const SITE_ORIGIN = 'https://judoquiz.com';

const upsertMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

// hreflang is a set, not a single tag, so the previous route's alternates have
// to be cleared rather than overwritten -- otherwise /sv keeps pointing at the
// alternates of whatever page was rendered before it.
const setAlternates = (alternates) => {
  document.head
    .querySelectorAll('link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove());

  Object.entries(alternates).forEach(([hreflang, path]) => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', hreflang);
    el.setAttribute('href', `${SITE_ORIGIN}${path}`);
    document.head.appendChild(el);
  });
};

/**
 * Sets the document title and the indexing-relevant head tags for a route.
 *
 * The pages used to render <title> inside their JSX. React 17 has no head
 * hoisting, so those tags landed in <body> and neither browsers nor crawlers
 * ever read them -- every route inherited the static title from index.html.
 *
 * @param {object} seo
 * @param {string} seo.title        Full <title> text.
 * @param {string} seo.description  Meta description, ~150-160 chars.
 * @param {string} seo.path         Path (plus query) this route canonicalises to.
 * @param {boolean} [seo.noindex]   Keep utility pages out of the index.
 * @param {string} [seo.lang]       Written language, for <html lang>.
 * @param {object} [seo.alternates] hreflang code -> path, for translated pages.
 */
export function useSeo({
  title,
  description,
  path,
  noindex = false,
  lang = 'en',
  alternates = null,
}) {
  // Objects passed inline would be a new reference every render, so compare the
  // serialised form instead of the identity.
  const alternatesKey = alternates ? JSON.stringify(alternates) : '';

  useEffect(() => {
    const url = `${SITE_ORIGIN}${path}`;

    document.title = title;
    document.documentElement.lang = lang;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:locale', lang === 'sv' ? 'sv_SE' : 'en_US');
    upsertCanonical(url);

    setAlternates(alternatesKey ? JSON.parse(alternatesKey) : {});

    // Always written, never just added: leaving a noindex route has to clear
    // the flag again or the whole SPA goes noindex after one visit to /login.
    const robots = noindex ? 'noindex, follow' : 'index, follow';
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots);
  }, [title, description, path, noindex, lang, alternatesKey]);
}
