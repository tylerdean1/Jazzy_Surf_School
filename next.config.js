/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.ts');
const path = require('path');
const os = require('os');

function getDistDir() {
  // Optional override (e.g., to keep build artifacts outside OneDrive):
  // set NEXT_DIST_DIR=.next
  // or point it to a project-local junction/symlink.
  if (process.env.NEXT_DIST_DIR) return process.env.NEXT_DIST_DIR;

  // Default to a project-local folder so TypeScript module resolution
  // works for generated Next types (distDir outside the project breaks this).
  return '.next';
}

// Enable dynamic server functions & API routes (no static export)
const nextConfig = withNextIntl({
  distDir: getDistDir(),
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.pexels.com', 'www.pexels.com']
  },
  experimental: {
    serverActions: false,
    // Workaround: disable Next's ESM externals optimization to avoid
    // conflicting star exports from some ESM/CJS mixed packages (e.g. MUI).
    // This reduces runtime import rewriting that led to __barrel_optimize__ errors.
    esmExternals: false
  }
});

// Next 13.5+ validates env values are strings. next-intl injects
// `env._next_intl_trailing_slash` and may leave it undefined.
nextConfig.env = {
  ...(nextConfig.env || {}),
  _next_intl_trailing_slash: String((nextConfig.env || {})._next_intl_trailing_slash ?? ''),
};

module.exports = nextConfig;