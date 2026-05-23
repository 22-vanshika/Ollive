import type { LLMRequest, LLMResponse } from '@/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS } from '@/constants'

export async function sendChatRequest(request: LLMRequest): Promise<LLMResponse> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LLM_CHAT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.status}`)
  }

  return response.json() as Promise<LLMResponse>
}
