// Sentry server init temporarily disabled — OTEL keeps event loop alive
// in Vercel serverless, causing all Node.js functions to hang. See PR #24.
//
// import * as Sentry from '@sentry/nextjs'
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
// })
