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

const nextConfig: NextConfig = {
  async headers() {
    return [
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
