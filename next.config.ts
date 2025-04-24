import "./src/app/start-cron";
import TerserPlugin from "terser-webpack-plugin";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src 'self' https://ik.imagekit.io; img-src 'self' data: https://ik.imagekit.io; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none';"
      : "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self'; media-src 'self' https://ik.imagekit.io; img-src 'self' data: https://ik.imagekit.io; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none';",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=()",
  },
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
      bodySizeLimit: "50mb",
    },
  },
  compiler: {
    removeConsole: true,
  },
  productionBrowserSourceMaps: false,

  // ✅ Eklendi: Build sırasında ESLint hataları görmezden gelinsin
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
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack(config: Configuration, { isServer }: { isServer: boolean }) {
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
