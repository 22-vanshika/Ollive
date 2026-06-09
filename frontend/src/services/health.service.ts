import { API_BASE_URL, API_ENDPOINTS, HEALTH_CHECK_TIMEOUT_MS } from '@/constants'

/**
 * Pings the backend's lightweight /health endpoint. Returns true only when the
 * server responds OK within the timeout — a hung/booting Railway container or a
 * network error both resolve to false so callers can drive a retry loop.
 */
export async function checkHealth(timeoutMs: number = HEALTH_CHECK_TIMEOUT_MS): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    })
    return response.ok
  } catch {
    return false
  }
}
