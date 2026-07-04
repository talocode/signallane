export interface AuthResult {
  ok: boolean
  keyPreview: string
  error?: string
  status?: number
}

function redactKey(key: string): string {
  if (key.length <= 12) return key.slice(0, 4) + '...' + key.slice(-4)
  return key.slice(0, 8) + '...' + key.slice(-4)
}

export function authenticate(headers: Record<string, string | undefined>): AuthResult {
  const rawKey =
    headers['authorization']?.replace(/^Bearer\s+/i, '') ??
    headers['x-api-key']

  if (!rawKey) {
    return {
      ok: false,
      keyPreview: '',
      error: 'Missing API key. Provide via Authorization: Bearer <key> or X-Api-Key header.',
      status: 401,
    }
  }

  const expectedKey = process.env.TALOCODE_API_KEY

  if (!expectedKey) {
    return {
      ok: false,
      keyPreview: redactKey(rawKey),
      error: 'Server authentication is not configured. Set TALOCODE_API_KEY.',
      status: 500,
    }
  }

  if (rawKey !== expectedKey) {
    return {
      ok: false,
      keyPreview: redactKey(rawKey),
      error: 'Invalid API key.',
      status: 401,
    }
  }

  return {
    ok: true,
    keyPreview: redactKey(rawKey),
  }
}
