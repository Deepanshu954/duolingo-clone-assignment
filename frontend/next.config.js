/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl || "http://127.0.0.1:8000"}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
