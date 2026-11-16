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

/**
 * Base (German, unprefixed) paths of every translated guide page. Anything that
 * needs to know which routes have EN/FR versions — the sitemap, the client-side
 * document language, FAQ links — reads this list, so a new guide only has to be
 * added here.
 */
export const AUTHORITY_PAGE_PATHS = [
  "/alltagsbegleitung-oder-pflegedienst",
  "/alltagsbegleitung-finden",
] as const satisfies readonly BasePath[];

export type AuthorityPagePath = (typeof AUTHORITY_PAGE_PATHS)[number];

/**
 * Locale of a translated guide page from its pathname, or `undefined` when the
 * pathname is not one of the guide pages.
 */
export function authorityPageLocale(
  pathname: string,
): AuthorityLocale | undefined {
  for (const basePath of AUTHORITY_PAGE_PATHS) {
    for (const locale of AUTHORITY_LOCALES) {
      if (pathname === localizedPath(locale, basePath)) return locale;
    }
  }
  return undefined;
}

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
