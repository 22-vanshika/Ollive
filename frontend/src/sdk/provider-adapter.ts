import type { LLMRequest, LLMResponse } from '@/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS, PROVIDER_IDS } from '@/constants'

export interface ProviderAdapter {
  chat(request: LLMRequest): Promise<LLMResponse>
}

export function createProviderAdapter(providerId: string): ProviderAdapter {
  switch (providerId) {
    case PROVIDER_IDS.GROQ:
      return groqAdapter
    default:
      throw new Error(`Unknown provider: ${providerId}`)
  }
}

const groqAdapter: ProviderAdapter = {
  async chat(request: LLMRequest): Promise<LLMResponse> {
    // Delegates to the backend — the frontend never holds API keys.
    // AbortSignal.timeout lets the logger correctly classify a hung request as
    // 'timeout' (err.message includes "timeout") rather than generic 'error'.
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LLM_CHAT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Provider request failed: ${response.status}`)
    }

    return (await response.json()) as LLMResponse
  },
}
