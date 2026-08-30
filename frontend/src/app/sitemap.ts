import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import {
  AUTHORITY_LOCALES,
  languageAlternates,
  localizedUrl,
  type AuthorityLocale,
  type BasePath,
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

interface AuthorityPage {
  basePath: BasePath;
  /**
   * Per-locale dates. The German versions changed on 2026-08-31 only in so far
   * as they gained the visible language links; the English and French versions
   * are new on that date. Their editorial content is a translation of the
   * German text as it stood on 2026-08-29.
   */
  lastModified: Record<AuthorityLocale, string>;
}

const authorityPages: AuthorityPage[] = [
  {
    basePath: "/alltagsbegleitung-oder-pflegedienst",
    lastModified: { de: "2026-08-31", en: "2026-08-31", fr: "2026-08-31" },
  },
  {
    basePath: "/alltagsbegleitung-finden",
    lastModified: { de: "2026-08-31", en: "2026-08-31", fr: "2026-08-31" },
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const singleLanguageEntries = publicRoutes.map(({ path, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));

  // Every language version of a translated page is listed, and each entry
  // carries the same alternates map the pages themselves emit as hreflang.
  const authorityEntries = authorityPages.flatMap(
    ({ basePath, lastModified }) =>
      AUTHORITY_LOCALES.map((locale) => ({
        url: localizedUrl(locale, basePath),
        lastModified: lastModified[locale],
        alternates: { languages: languageAlternates(basePath) },
      })),
  );

  return [...singleLanguageEntries, ...authorityEntries];
}
