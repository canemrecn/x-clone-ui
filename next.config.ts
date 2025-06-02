//next.config.ts
// next.config.ts
// next.config.ts
// next.config.ts
import "./src/app/start-cron";
import TerserPlugin from "terser-webpack-plugin";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' https://www.googletagmanager.com 'unsafe-inline';
      connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com;
      img-src 'self' blob: data: https://www.google-analytics.com https://www.googletagmanager.com https://ik.imagekit.io;
      style-src 'self' 'unsafe-inline';
      media-src 'self' https://ik.imagekit.io;
      font-src 'self';
      form-action 'self';
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, " ").trim(),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "500mb", // ✅ Sadece burada geçerli
    },
  },

  compiler: {
    removeConsole: true,
  },

  productionBrowserSourceMaps: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },

  async headers() {
    if (isDev) return [];
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  webpack(config: Configuration, { isServer }) {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
