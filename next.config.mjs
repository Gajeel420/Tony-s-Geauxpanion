/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Trailing slash needed for Capacitor file:// serving
  trailingSlash: true,
};

export default nextConfig;
