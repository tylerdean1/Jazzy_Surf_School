/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n.ts');
const path = require('path');
const os = require('os');

function getDistDir() {
  // Allows overriding if you want a project-local folder again later.
  if (process.env.NEXT_DIST_DIR) return process.env.NEXT_DIST_DIR;

  // OneDrive-synced folders can cause Windows reparse-point `readlink` errors.
  // Prefer a local, non-synced directory for Next's build artifacts.
  const projectRoot = __dirname;

  if (process.env.LOCALAPPDATA) {
    const target = path.join(process.env.LOCALAPPDATA, 'SunsetSurfAcademy', 'next-dist');
    // Next's `distDir` expects a relative path; absolute Windows paths can break.
    // This keeps the artifacts outside OneDrive while still providing a relative path.
    const rel = path.relative(projectRoot, target);
    // If on a different drive, `path.relative` returns an absolute path (with a drive letter).
    if (rel && !path.isAbsolute(rel)) return rel;
  }

  // Fallback: a project-local folder.
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

module.exports = nextConfig;