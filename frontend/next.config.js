/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Proxy semua panggilan /api ke backend Express dari sisi server Next.js.
  // Dengan begini browser cukup memanggil same-origin (/api/...), sehingga
  // tetap berfungsi di Codespaces / dev container / produksi tanpa masalah CORS.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
