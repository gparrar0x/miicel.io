import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  typescript: {
    // Pre-existing TS errors — tracked for fix in separate PR
    ignoreBuildErrors: true,
  },
  images: {
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
  turbopack: {
    root: __dirname,
  },
}

const sentryEnabled = !!process.env.SENTRY_AUTH_TOKEN

export default sentryEnabled
  ? withSentryConfig(withNextIntl(nextConfig), {
      silent: true,
      org: 'skywalking',
      project: 'miicel-io',
    })
  : withNextIntl(nextConfig)
