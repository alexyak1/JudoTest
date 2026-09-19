import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Quiz from "../pages/quiz";
import { QUIZ_PATHS } from "../i18n/quizCopy";
import { resolveLandingLang, DEFAULT_LANG } from "../i18n/language";

/**
 * The site root, in whichever translation the visitor reads.
 *
 * The language is resolved once, during the first render, rather than in an
 * effect: an effect runs after paint, so a Swedish visitor would see a frame
 * of the English page on every load before being moved off it.
 *
 * <Navigate replace> rather than a push. With a push, Back from /sv lands on
 * /, which resolves to Swedish again and bounces straight back to /sv -- the
 * visitor cannot leave the page by going backwards.
 *
 * Only "/" does this. /quiz stays English whoever asks for it, and /sv stays
 * Swedish: both are URLs somebody named on purpose, and overriding an explicit
 * request is what makes language redirection obnoxious.
 */
export default function LocalizedLanding() {
  const { search } = useLocation();

  // useState, not a bare call, so an in-app re-render cannot re-resolve the
  // language and yank someone off the page they are already reading.
  const [{ lang, source }] = useState(() => resolveLandingLang(search));
  const redirecting = lang !== DEFAULT_LANG;

  // Without this, an auto-redirected visitor is indistinguishable in GA from
  // one who arrived at /sv straight from google.se -- the redirect leaves no
  // trace of its own, and both end up as an ordinary /sv page_view.
  //
  // window.gtag is the queueing stub defined inline in index.html, so it
  // exists from first paint whether or not gtag.js has finished loading; the
  // event sits in dataLayer until it has.
  useEffect(() => {
    if (!redirecting) return;
    if (typeof window === "undefined" || !window.gtag) return;

    window.gtag("event", "language_redirect", {
      event_category: "i18n",
      event_label: `${DEFAULT_LANG}_to_${lang}`,
      detected_language: lang,
      // Which rule sent them: 'browser' is the one that measures detection.
      redirect_source: source,
    });
  }, [redirecting, lang, source]);

  if (redirecting) {
    return <Navigate to={QUIZ_PATHS[lang]} replace />;
  }

  return <Quiz lang={DEFAULT_LANG} />;
}
