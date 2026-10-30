/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Microphone is needed by the Speaking Arena (speech recognition happens in the browser; no audio is uploaded).
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self)" },
  // HTTPS-only in production (ignored by browsers over plain http, so local dev is unaffected).
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig = {
  // Lets QA build a production bundle next to a running dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // schema.sql is read at runtime by the auto-migrator.
  outputFileTracingIncludes: { "/**": ["./db/**/*"] },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
