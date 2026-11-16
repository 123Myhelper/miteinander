import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import {
  AUTHORITY_LOCALES,
  AUTHORITY_PAGE_PATHS,
  languageAlternates,
  localizedUrl,
  type AuthorityLocale,
  type AuthorityPagePath,
} from "@/lib/i18n/authority-pages";

interface PublicRoute {
  path: string;
  /**
   * Date of the last genuine change to this page's content, taken from the
   * commit history of the files that render it. Deliberately NOT `new Date()`:
   * a build-time value would mark every page as freshly updated on every
   * deployment, which is a false freshness signal.
   */
  lastModified: string;
}

const publicRoutes: PublicRoute[] = [
  { path: "", lastModified: "2026-08-28" },
  { path: "/faq", lastModified: "2026-08-27" },
  { path: "/impressum", lastModified: "2026-08-27" },
  { path: "/datenschutz", lastModified: "2026-08-27" },
  { path: "/agb", lastModified: "2026-08-27" },
];

/**
 * Per-locale dates for each guide page. The German versions changed on
 * 2026-08-31 only in so far as they gained the visible language links; the
 * English and French versions are new on that date. Their editorial content is
 * a translation of the German text as it stood on 2026-08-29. Keyed by
 * `AuthorityPagePath`, so adding a guide without a date here is a type error.
 */
const authorityLastModified: Record<
  AuthorityPagePath,
  Record<AuthorityLocale, string>
> = {
  "/alltagsbegleitung-oder-pflegedienst": {
    de: "2026-08-31",
    en: "2026-08-31",
    fr: "2026-08-31",
  },
  "/alltagsbegleitung-finden": {
    de: "2026-08-31",
    en: "2026-08-31",
    fr: "2026-08-31",
  },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const singleLanguageEntries = publicRoutes.map(({ path, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));

  // Every language version of a translated page is listed, and each entry
  // carries the same alternates map the pages themselves emit as hreflang.
  const authorityEntries = AUTHORITY_PAGE_PATHS.flatMap((basePath) =>
    AUTHORITY_LOCALES.map((locale) => ({
      url: localizedUrl(locale, basePath),
      lastModified: authorityLastModified[basePath][locale],
      alternates: { languages: languageAlternates(basePath) },
    })),
  );

  return [...singleLanguageEntries, ...authorityEntries];
}
