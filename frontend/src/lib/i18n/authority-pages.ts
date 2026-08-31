import { SITE_URL } from "@/lib/seo";

/**
 * Locale handling for the editorial authority pages.
 *
 * Why this exists separately from `LanguageContext`:
 * the site-wide switcher is a client context that swaps text at a single URL.
 * The authority pages are Server Components precisely so their content ships in
 * the server-rendered HTML, which means each language version needs its own
 * indexable URL, its own canonical and reciprocal hreflang. German keeps the
 * bare path it is already indexed under; EN and FR are served from a locale
 * prefix. Nothing here touches the global switcher or any other route.
 */
export const AUTHORITY_LOCALES = ["de", "en", "fr"] as const;

export type AuthorityLocale = (typeof AUTHORITY_LOCALES)[number];

/** German is the source of truth and keeps the unprefixed URL. */
export const DEFAULT_AUTHORITY_LOCALE: AuthorityLocale = "de";

export const OPEN_GRAPH_LOCALE: Record<AuthorityLocale, string> = {
  de: "de_DE",
  en: "en_GB",
  fr: "fr_FR",
};

/** Endonyms, matching the labels the site-wide LanguageSwitcher already uses. */
export const LANGUAGE_ENDONYM: Record<AuthorityLocale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
};

export type BasePath = `/${string}`;

export function localizedPath(
  locale: AuthorityLocale,
  basePath: BasePath,
): BasePath {
  return locale === DEFAULT_AUTHORITY_LOCALE
    ? basePath
    : (`/${locale}${basePath}` as BasePath);
}

export function localizedUrl(
  locale: AuthorityLocale,
  basePath: BasePath,
): string {
  return `${SITE_URL}${localizedPath(locale, basePath)}`;
}

/**
 * Absolute hreflang map for one page, in the shape both `Metadata.alternates`
 * and `MetadataRoute.Sitemap` expect. `x-default` points at German, which is
 * the version written first and the one a visitor without a language signal
 * should land on.
 */
export function languageAlternates(basePath: BasePath): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const locale of AUTHORITY_LOCALES) {
    alternates[locale] = localizedUrl(locale, basePath);
  }
  alternates["x-default"] = localizedUrl(DEFAULT_AUTHORITY_LOCALE, basePath);

  return alternates;
}
