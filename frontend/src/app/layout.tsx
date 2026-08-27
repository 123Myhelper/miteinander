import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";
import CookieConsent from "@/components/CookieConsent";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${DEFAULT_TITLE} | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Alltagsbegleitung",
    "Unterstützung im Alltag",
    "Alltagsbegleiter:innen",
    "Vermittlungsplattform",
  ],
  authors: [{ name: "MyHelper.me" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: `${DEFAULT_TITLE} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "MyHelper.me Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${DEFAULT_TITLE} | ${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${playfair.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <LanguageProvider>
                {children}
                <Toaster position="top-right" richColors closeButton />
                <CookieConsent />
                <div id="datepicker-portal" />
              </LanguageProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
