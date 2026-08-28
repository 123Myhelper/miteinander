import JsonLd from "@/components/JsonLd";
import HomePageClient from "@/app/_components/HomePageClient";
import {
  createPublicMetadata,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const metadata = {
  ...createPublicMetadata({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  }),
  title: {
    absolute: `${DEFAULT_TITLE} | ${SITE_NAME}`,
  },
};

const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.svg`,
      email: "info@myhelper.me",
      telephone: "+49 152 09465369",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Im Hof 16",
        postalCode: "88069",
        addressLocality: "Tettnang",
        addressCountry: "DE",
      },
      sameAs: [
        "https://www.instagram.com/myhelper.me",
        "https://www.facebook.com/profile.php?id=61582266767267",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "de",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#vermittlung`,
      name: "Vermittlungsplattform für Alltagsbegleitung",
      serviceType: "Vermittlung von Alltagsbegleitung und Unterstützung im Alltag",
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Country",
        name: "Deutschland",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeStructuredData} />
      <HomePageClient />
    </>
  );
}
