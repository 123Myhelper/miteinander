import de from "@/locales/de/alltagsbegleitung-pflegedienst.json";

/**
 * Server-side content accessor for the /alltagsbegleitung-oder-pflegedienst page.
 *
 * Why this exists instead of `useTranslation()`:
 * the page must be a Server Component so its content ships in the server-rendered
 * HTML and is indexable without client JavaScript. `LanguageContext` is a client
 * context ("use client") and cannot be read during a server render. This module
 * reads the same `src/locales/<locale>/<namespace>.json` structure the rest of
 * the app uses, so page components stay free of hardcoded user-facing strings.
 *
 * Scope: German only, by decision for the German-first milestone. To add a
 * locale later, drop the same namespace file into `src/locales/<locale>/` and
 * give this function a locale parameter — no component change required.
 */
export type AlltagsbegleitungPflegedienstContent = typeof de;

export function getAlltagsbegleitungPflegedienstContent(): AlltagsbegleitungPflegedienstContent {
  return de;
}
