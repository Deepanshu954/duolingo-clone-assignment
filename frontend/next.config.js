/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const shouldProxyApi = apiUrl || process.env.VERCEL !== "1";

const nextConfig = {
  async rewrites() {
    if (!shouldProxyApi) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl || "http://localhost:8000"}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
