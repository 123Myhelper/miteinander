import type { NextConfig } from "next";

const privateNoIndexRoutes = [
  "/admin/:path*",
  "/caregiver/:path*",
  "/dashboard/:path*",
  "/plans/:path*",
  "/support/:path*",
];

const authNoIndexRoutes = [
  "/forgot-password",
  "/login",
  "/registrieren",
  "/verify-email",
];

// These guides are statically generated under a shared root layout. The
// Content-Language response header keeps the server-side language signal in
// step with the per-page `lang`, hreflang, metadata, and structured data.
const localizedGuideLanguages = [
  { source: "/en/:path*", locale: "en" },
  { source: "/fr/:path*", locale: "fr" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      ...localizedGuideLanguages.map(({ source, locale }) => ({
        source,
        headers: [
          {
            key: "Content-Language",
            value: locale,
          },
        ],
      })),
      ...privateNoIndexRoutes.map((source) => ({
        source,
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      })),
      ...authNoIndexRoutes.map((source) => ({
        source,
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, noarchive, nosnippet",
          },
        ],
      })),
    ];
  },
};

export default nextConfig;
