import type { NextConfig } from "next";

// No includeSubDomains on HSTS until the client's domain is known. Other services
// on it may not support https yet.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

// Sessions and email links use the address in BETTER_AUTH_URL, so www must not
// serve the site separately.
const siteHost = new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000")
  .hostname;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return siteHost === "localhost"
      ? []
      : [
          {
            source: "/:path*",
            has: [{ type: "host" as const, value: `www.${siteHost}` }],
            destination: `https://${siteHost}/:path*`,
            permanent: true,
          },
        ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The URL carries the reset token.
        source: "/reset-password",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
