import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const publicRoutes = ["", "/faq", "/impressum", "/datenschutz", "/agb"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
