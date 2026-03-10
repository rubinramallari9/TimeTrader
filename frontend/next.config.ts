import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: !isProd,
    remotePatterns: [
      { protocol: "http",  hostname: "localhost",           port: "8000", pathname: "/media/**" },
      { protocol: "https", hostname: "*.s3.amazonaws.com",               pathname: "/**" },
      { protocol: "https", hostname: "*.s3.eu-central-1.amazonaws.com",  pathname: "/**" },
      { protocol: "https", hostname: "*.cloudinary.com",                 pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com",               pathname: "/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Allow PayPal script
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.paypal.com https://www.sandbox.paypal.com https://www.google-analytics.com " +
                (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"),
              "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Redirect bare /dashboard to the most relevant sub-page
      {
        source: "/dashboard",
        destination: "/dashboard/store",
        permanent: false,
      },
    ];
  },

  // Compress responses
  compress: true,

  // Strict mode for catching bugs early
  reactStrictMode: true,

  // Silence the "x-powered-by" header
  poweredByHeader: false,
};

export default nextConfig;
