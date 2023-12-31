import {ProfilingIntegration} from '@sentry/profiling-node'
import * as Sentry from '@sentry/remix'
import {prisma} from './prisma.server.ts'

export function init() {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    environment: ENV.MODE,
    tracesSampleRate: ENV.MODE === 'production' ? 1 : 0,
    denyUrls: [
      /\/healthcheck/,
      // TODO: be smarter about the public assets...
      /\/build\//,
      /\/favicons\//,
      /\/images\//,
      /\/fonts\//,
      /\/apple-touch-.*/,
      /\/robots.txt/,
      /\/favicon.ico/,
      /\/site\.webmanifest/,
    ],
    integrations: [
      new Sentry.Integrations.Http({tracing: true}),
      new Sentry.Integrations.Prisma({client: prisma}),
      new ProfilingIntegration(),
    ],
    beforeSendTransaction(event) {
      // ignore all healthcheck related transactions
      if (event.request?.headers?.['X-Healthcheck'] === 'true') return null

      return event
    },
  })
}
