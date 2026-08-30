import type { AuthorityLocale } from "@/lib/i18n/authority-pages";
import de from "@/locales/de/alltagsbegleitung-finden.json";
import en from "@/locales/en/alltagsbegleitung-finden.json";
import fr from "@/locales/fr/alltagsbegleitung-finden.json";

/**
 * Server-side content accessor for the /alltagsbegleitung-finden page.
 *
 * Why this exists instead of `useTranslation()`:
 * the page must be a Server Component so its content ships in the server-rendered
 * HTML and is indexable without client JavaScript. `LanguageContext` is a client
 * context ("use client") and cannot be read during a server render. This module
 * reads the same `src/locales/<locale>/<namespace>.json` structure the rest of
 * the app uses, so page components stay free of hardcoded user-facing strings.
 *
 * German is the source of truth: `AlltagsbegleitungFindenContent` is derived from
 * the German namespace, so a translated file that drifts from its shape fails the
 * type check rather than rendering a half-translated page.
 */
export type AlltagsbegleitungFindenContent = typeof de;

const content: Record<AuthorityLocale, AlltagsbegleitungFindenContent> = {
  de,
  en,
  fr,
};

export function getAlltagsbegleitungFindenContent(
  locale: AuthorityLocale,
): AlltagsbegleitungFindenContent {
  return content[locale];
}
