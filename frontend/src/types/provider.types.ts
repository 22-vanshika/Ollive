export type ProviderStatus = 'idle' | 'loading' | 'error'

export interface ProviderConfig {
  id: string
  name: string
  model: string
  maxTokens: number
}

export interface LLMRequest {
  sessionId: string
  messages: Array<{ role: string; content: string }>
  model: string
  maxTokens: number
}

export interface LLMResponse {
  content: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  model: string
}
