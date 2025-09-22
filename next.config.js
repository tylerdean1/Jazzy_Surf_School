/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.ts');

// Enable dynamic server functions & API routes (no static export)
const nextConfig = withNextIntl({
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.pexels.com', 'www.pexels.com']
  },
  experimental: {
    serverActions: false
  }
});

module.exports = nextConfig;