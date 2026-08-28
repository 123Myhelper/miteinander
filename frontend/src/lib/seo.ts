import type { Metadata } from "next";

export const SITE_NAME = "MyHelper.me";
export const SITE_URL = "https://www.myhelper.me";
export const DEFAULT_TITLE = "Alltagsbegleitung & Unterstützung im Alltag";
export const DEFAULT_DESCRIPTION =
  "MyHelper.me ist die deutsche Vermittlungsplattform für Alltagsbegleitung und Unterstützung im Alltag. Finden Sie passende Alltagsbegleiter:innen direkt und persönlich.";

const SOCIAL_IMAGE = {
  url: "/logo.svg",
  width: 512,
  height: 512,
  alt: "MyHelper.me Logo",
};

interface PublicMetadataOptions {
  title: string;
  description: string;
  path: `/${string}` | "/";
  index?: boolean;
}

export function createPublicMetadata({
  title,
  description,
  path,
  index = true,
}: PublicMetadataOptions): Metadata {
  const brandedTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
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
      locale: "de_DE",
      type: "website",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary",
      title: brandedTitle,
      description,
      images: [SOCIAL_IMAGE.url],
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
