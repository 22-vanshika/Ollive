import type { InferenceLog } from '@/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS } from '@/constants'

export async function postInferenceLog(log: InferenceLog): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.INGEST}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to ingest log: ${response.status}`)
}
