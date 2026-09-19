import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Quiz from "../pages/quiz";
import { QUIZ_PATHS } from "../i18n/quizCopy";
import { resolveLandingLang } from "../i18n/language";

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
  const [lang] = useState(() => resolveLandingLang(search));

  if (lang === "sv") {
    return <Navigate to={QUIZ_PATHS.sv} replace />;
  }

  return <Quiz lang="en" />;
}
