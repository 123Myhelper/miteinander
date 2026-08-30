import type { AuthorityLocale } from "@/lib/i18n/authority-pages";
import de from "@/locales/de/alltagsbegleitung-pflegedienst.json";
import en from "@/locales/en/alltagsbegleitung-pflegedienst.json";
import fr from "@/locales/fr/alltagsbegleitung-pflegedienst.json";

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
 * German is the source of truth: `AlltagsbegleitungPflegedienstContent` is derived
 * from the German namespace, so a translated file that drifts from its shape fails
 * the type check rather than rendering a half-translated page.
 */
export type AlltagsbegleitungPflegedienstContent = typeof de;

const content: Record<AuthorityLocale, AlltagsbegleitungPflegedienstContent> = {
  de,
  en,
  fr,
};

export function getAlltagsbegleitungPflegedienstContent(
  locale: AuthorityLocale,
): AlltagsbegleitungPflegedienstContent {
  return content[locale];
}
