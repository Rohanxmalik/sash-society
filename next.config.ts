import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sass-socio.org",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
