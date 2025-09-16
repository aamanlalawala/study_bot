/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For better server deployment
  images: {
    unoptimized: true, // Disable image optimization for simplicity (no external domains)
  },
};

module.exports = nextConfig;