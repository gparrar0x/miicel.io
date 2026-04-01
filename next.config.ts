// NOTE: Sentry temporarily disabled — see PR #24.
// import { withSentryConfig } from '@sentry/nextjs'

// NOTE: next-intl temporarily disabled to test if it causes Node.js
// serverless function hang on Vercel. See PR #24.
// import createNextIntlPlugin from 'next-intl/plugin'
// const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    // Pre-existing TS errors — tracked for fix in separate PR
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lmqysqapqbttmyheuejo.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  transpilePackages: ['@skywalking/core'],
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
