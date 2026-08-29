import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

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
  { path: "/alltagsbegleitung-oder-pflegedienst", lastModified: "2026-08-29" },
  { path: "/alltagsbegleitung-finden", lastModified: "2026-08-29" },
  { path: "/faq", lastModified: "2026-08-27" },
  { path: "/impressum", lastModified: "2026-08-27" },
  { path: "/datenschutz", lastModified: "2026-08-27" },
  { path: "/agb", lastModified: "2026-08-27" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, lastModified }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));
}
