export type InferenceStatus = 'success' | 'error' | 'timeout'

export interface InferenceLog {
  sessionId: string
  requestId: string
  provider: string
  model: string
  timestampRequest: string
  timestampResponse: string
  latencyMs: number
  promptTokens: number
  completionTokens: number
  totalTokens: number
  status: InferenceStatus
  errorCode: string | null
  inputPreview: string
  outputPreview: string
}

export interface InferenceMetrics {
  totalRequests: number
  averageLatencyMs: number
  errorRate: number
  totalTokensUsed: number
}

export interface LatencyDataPoint {
  timestamp: string
  latencyMs: number
}

export interface UseInferenceMetricsResult {
  metrics: InferenceMetrics | null
  latencySeries: LatencyDataPoint[]
  isLoading: boolean
  error: string | null
}
