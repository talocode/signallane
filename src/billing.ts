import { config } from './config.js'

export interface BillingResult {
  success: boolean
  remainingCredits?: number
  error?: string
}

export interface BillingMeta {
  product: 'signallane'
  action: string
  route: string
  mode: 'hosted'
  inputSize: number
  idempotencyKey: string
}

export async function charge(
  action: string,
  route: string,
  body: unknown,
  apiKey: string,
): Promise<BillingResult> {
  const meta: BillingMeta = {
    product: 'signallane',
    action,
    route,
    mode: 'hosted',
    inputSize: new TextEncoder().encode(JSON.stringify(body)).length,
    idempotencyKey: crypto.randomUUID(),
  }

  try {
    const res = await fetch(`${config.talocodeBaseUrl}/api/v1/cloud/usage/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ metadata: meta }),
    })

    if (res.status === 200) {
      const data = await res.json()
      return { success: true, remainingCredits: data.remainingCredits ?? 0 }
    }

    if (res.status === 401) {
      return { success: false, error: 'auth_error' }
    }

    if (res.status === 402) {
      return { success: false, error: 'insufficient_credits' }
    }

    return { success: false, error: 'billing_unavailable' }
  } catch {
    return { success: false, error: 'billing_unavailable' }
  }
}
