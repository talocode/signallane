import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { randomUUID } from 'node:crypto'
import { config } from './config.js'
import { authenticate } from './auth.js'
import { charge } from './billing.js'
import { analyzeSignals, generateContentPlan, generatePostDrafts, generateExperiments, generateReport } from './engine.js'
import { BillingActions } from './types.js'
import type { ApiResponse, XMetrics, XTopPost } from './types.js'

const creditsPerAction: Record<string, number> = {
  [BillingActions.ANALYZE]: 20,
  [BillingActions.CONTENT_PLAN]: 30,
  [BillingActions.POST_DRAFTS]: 20,
  [BillingActions.EXPERIMENTS]: 40,
  [BillingActions.REPORT]: 80,
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

async function handleRoute(
  req: IncomingMessage,
  res: ServerResponse,
  route: string,
  handler: (body: Record<string, unknown>) => unknown,
): Promise<void> {
  const requestId = randomUUID()

  try {
    const body = await parseBody(req) as Record<string, unknown>

    const auth = authenticate(Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, typeof v === 'string' ? v : v?.[0]]),
    ))

    if (!auth.ok) {
      const response: ApiResponse = { ok: false, requestId, error: auth.error }
      sendJson(res, auth.status ?? 401, response)
      return
    }

    const billingResult = await charge(
      route,
      `/v1/signallane/${route}`,
      body,
      process.env.TALOCODE_API_KEY ?? '',
    )

    if (!billingResult.success) {
      const status = billingResult.error === 'insufficient_credits' ? 402 : 402
      const response: ApiResponse = {
        ok: false,
        requestId,
        error: billingResult.error === 'insufficient_credits' ? 'Insufficient credits.' : 'Billing service unavailable.',
      }
      sendJson(res, status, response)
      return
    }

    const data = handler(body)
    const response: ApiResponse = {
      ok: true,
      requestId,
      data,
      usage: { credits: creditsPerAction[route] ?? 10 },
    }
    sendJson(res, 200, response)
  } catch (err) {
    const response: ApiResponse = {
      ok: false,
      requestId,
      error: err instanceof Error ? err.message : 'Internal server error',
    }
    sendJson(res, 400, response)
  }
}

const server = createServer((req, res) => {
  const { method, url } = req

  if (url === '/v1/signallane/health' && method === 'GET') {
    sendJson(res, 200, { ok: true, service: 'signallane', version: '0.1.0' })
    return
  }

  if (method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' })
    return
  }

  switch (url) {
    case '/v1/signallane/x/analyze':
      handleRoute(req, res, 'x_analyze', (body) =>
        analyzeSignals({
          handle: body.handle as string ?? '',
          goal: body.goal as string ?? '',
          metrics: body.metrics as XMetrics ?? {},
          topPosts: body.topPosts as XTopPost[] | undefined,
        })
      )
      break

    case '/v1/signallane/x/content-plan':
      handleRoute(req, res, 'x_content_plan', (body) =>
        generateContentPlan({
          handle: body.handle as string ?? '',
          goal: body.goal as string ?? '',
          analysis: body.analysis as Record<string, unknown> ?? {},
          week: body.week as string ?? 'next',
          cadence: body.cadence as string ?? '5',
        })
      )
      break

    case '/v1/signallane/x/post-drafts':
      handleRoute(req, res, 'x_post_drafts', (body) =>
        generatePostDrafts({
          goal: body.goal as string ?? '',
          voice: body.voice as string ?? 'conversational',
          topics: body.topics as string[] ?? [],
          count: (body.count as number) ?? 5,
          maxLength: (body.maxLength as number) ?? 280,
        })
      )
      break

    case '/v1/signallane/x/experiments':
      handleRoute(req, res, 'x_experiments', (body) =>
        generateExperiments({
          goal: body.goal as string ?? '',
          hypotheses: body.hypotheses as string[] ?? [],
          durationDays: (body.durationDays as number) ?? 14,
        })
      )
      break

    case '/v1/signallane/x/report':
      handleRoute(req, res, 'x_report', (body) =>
        generateReport({
          handle: body.handle as string ?? '',
          goal: body.goal as string ?? '',
          metrics: body.metrics as XMetrics ?? {},
          topPosts: body.topPosts as XTopPost[] ?? [],
          period: body.period as string ?? '30d',
        })
      )
      break

    default:
      sendJson(res, 404, { ok: false, error: 'Not found' })
      break
  }
})

server.listen(config.port, '0.0.0.0', () => {
  console.log(`[signallane] server listening on 0.0.0.0:${config.port}`)
})

function shutdown(signal: string) {
  console.log(`[signallane] received ${signal}, shutting down gracefully...`)
  server.close(() => {
    console.log('[signallane] server closed')
    process.exit(0)
  })
  setTimeout(() => {
    console.error('[signallane] forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

export { server }
