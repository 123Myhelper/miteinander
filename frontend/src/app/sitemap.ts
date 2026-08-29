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

/**
 * PENDING — MUST BE FINALISED AT COMMIT TIME.
 *
 * The two routes changed in this milestone (/alltagsbegleitung-finden and
 * /alltagsbegleitung-oder-pflegedienst) cannot carry their final value yet:
 * the convention above derives it from the commit that changed the rendering
 * files, and that commit does not exist while this work is uncommitted. The
 * value below is the authoring date, used so the build is testable locally.
 *
 * After the implementation commit exists, replace this constant's uses with the
 * literal dates produced by:
 *   git log -1 --format=%cs -- src/locales/de/alltagsbegleitung-finden.json \
 *                              src/app/alltagsbegleitung-finden/
 *   git log -1 --format=%cs -- src/locales/de/alltagsbegleitung-pflegedienst.json \
 *                              src/app/alltagsbegleitung-oder-pflegedienst/
 * then delete this constant. Do not substitute `new Date()`.
 */
const PENDING_COMMIT_DATE = "2026-08-29";

const publicRoutes: PublicRoute[] = [
  { path: "", lastModified: "2026-08-28" },
  {
    path: "/alltagsbegleitung-oder-pflegedienst",
    lastModified: PENDING_COMMIT_DATE,
  },
  { path: "/alltagsbegleitung-finden", lastModified: PENDING_COMMIT_DATE },
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
