import type { LLMRequest, LLMResponse } from '@/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS, PROVIDER_IDS } from '@/constants'

export interface ProviderAdapter {
  chat(request: LLMRequest, onChunk?: (chunk: string) => void): Promise<LLMResponse>
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
  async chat(request: LLMRequest, onChunk?: (chunk: string) => void): Promise<LLMResponse> {
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

    if (onChunk && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let promptTokens = 0
      let completionTokens = 0
      let totalTokens = 0
      let model = request.model

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        // Keep the last partial line in the buffer
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const data = JSON.parse(trimmed)
            if (data.content) {
              fullContent += data.content
              onChunk(data.content)
            }
            if (data.prompt_tokens !== undefined && data.prompt_tokens !== null) {
              promptTokens = data.prompt_tokens
            }
            if (data.completion_tokens !== undefined && data.completion_tokens !== null) {
              completionTokens = data.completion_tokens
            }
            if (data.total_tokens !== undefined && data.total_tokens !== null) {
              totalTokens = data.total_tokens
            }
            if (data.model) {
              model = data.model
            }
          } catch (e) {
            console.error('Failed to parse stream line:', e)
          }
        }
      }

      // Handle any remaining content in the buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer.trim())
          if (data.content) {
            fullContent += data.content
            onChunk(data.content)
          }
          if (data.prompt_tokens !== undefined && data.prompt_tokens !== null) {
            promptTokens = data.prompt_tokens
          }
          if (data.completion_tokens !== undefined && data.completion_tokens !== null) {
            completionTokens = data.completion_tokens
          }
          if (data.total_tokens !== undefined && data.total_tokens !== null) {
            totalTokens = data.total_tokens
          }
          if (data.model) {
            model = data.model
          }
        } catch (e) {
          console.error('Failed to parse remaining stream buffer:', e)
        }
      }

      // Approximate token counts if they are not returned by the API (e.g. 0)
      if (promptTokens === 0) {
        const wordCount = request.messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0)
        promptTokens = Math.max(10, Math.floor(wordCount * 1.3))
      }
      if (completionTokens === 0) {
        const wordCount = fullContent.split(/\s+/).length
        completionTokens = Math.max(1, Math.floor(wordCount * 1.3))
      }
      if (totalTokens === 0) {
        totalTokens = promptTokens + completionTokens
      }

      return {
        content: fullContent,
        promptTokens,
        completionTokens,
        totalTokens,
        model,
      }
    } else {
      const text = await response.text()
      try {
        const lines = text.split('\n')
        let fullContent = ''
        let promptTokens = 0
        let completionTokens = 0
        let totalTokens = 0
        let model = request.model
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          const data = JSON.parse(trimmed)
          if (data.content) fullContent += data.content
          if (data.prompt_tokens) promptTokens = data.prompt_tokens
          if (data.completion_tokens) completionTokens = data.completion_tokens
          if (data.total_tokens) totalTokens = data.total_tokens
          if (data.model) model = data.model
        }
        return {
          content: fullContent,
          promptTokens: promptTokens || 10,
          completionTokens: completionTokens || 10,
          totalTokens: totalTokens || 20,
          model,
        }
      } catch {
        return JSON.parse(text) as LLMResponse
      }
    }
  },
}
