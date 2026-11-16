import type { Metadata } from "next";

export const SITE_NAME = "MyHelper.me";
export const SITE_URL = "https://www.myhelper.me";
export const DEFAULT_TITLE = "Alltagsbegleitung & Unterstützung im Alltag";
export const DEFAULT_DESCRIPTION =
  "MyHelper.me ist die deutsche Vermittlungsplattform für Alltagsbegleitung und Unterstützung im Alltag. Finden Sie passende Alltagsbegleiter:innen direkt und persönlich.";

/**
 * Link-preview image for Open Graph and X/Twitter. A raster PNG at the
 * 1200 × 630 (1.91:1) size the large preview cards expect; Facebook, LinkedIn,
 * WhatsApp and X do not render SVG previews.
 */
export const SOCIAL_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "MyHelper.me – Die Plattform, die verbindet.",
  type: "image/png",
};

interface PublicMetadataOptions {
  title: string;
  description: string;
  path: `/${string}` | "/";
  index?: boolean;
  /**
   * Open Graph locale of this page's content. Defaults to German, which is what
   * every page served from an unprefixed path is written in.
   */
  ogLocale?: string;
  /**
   * hreflang map for pages that exist in more than one language. Absolute URLs,
   * keyed by language code plus `x-default`. Omitted for single-language pages,
   * which must not advertise alternates they do not have.
   */
  languages?: Record<string, string>;
}

export function createPublicMetadata({
  title,
  description,
  path,
  index = true,
  ogLocale = "de_DE",
  languages,
}: PublicMetadataOptions): Metadata {
  const brandedTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      ...(languages ? { languages } : {}),
    },
    robots: {
      index,
      follow: true,
      googleBot: {
        index,
        follow: true,
        noimageindex: !index,
      },
    },
    openGraph: {
      title: brandedTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: ogLocale,
      type: "website",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

export function createPrivateMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        nosnippet: true,
      },
    },
  };
}
