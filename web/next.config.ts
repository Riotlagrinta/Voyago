import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'troika-three-text'],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://demotiles.maplibre.org https://*.tile.openstreetmap.org https://vercel.live https://*.vercel.live",
              "font-src 'self' data:",
              "connect-src 'self' https://demotiles.maplibre.org https://*.supabase.co wss://*.supabase.co http://localhost:* ws://localhost:* https://voyago-api-2lcz.onrender.com wss://voyago-api-2lcz.onrender.com https://*.onrender.com wss://*.onrender.com https://vercel.live https://*.vercel.live https://*.vercel.app wss://*.vercel.app",
              "worker-src 'self' blob:",
              "frame-src 'self' https://vercel.live https://*.vercel.live",
              "frame-ancestors 'self' https://vercel.live https://*.vercel.live",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
