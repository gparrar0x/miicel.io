// NOTE: Sentry temporarily disabled — withSentryConfig causes ALL Node.js
// serverless functions to hang on Vercel (OTEL keeps event loop alive).
// Re-enable after finding compatible config. See PR #24.
// import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

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

export default withNextIntl(nextConfig)
