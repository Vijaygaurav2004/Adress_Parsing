/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static file serving through _next/static
  output: 'standalone',
  // Disable image optimization during development if needed
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig 