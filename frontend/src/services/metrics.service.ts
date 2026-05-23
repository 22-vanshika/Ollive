import type { InferenceMetrics, LatencyDataPoint } from '@/types'
import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT_MS } from '@/constants'

export async function fetchMetrics(): Promise<InferenceMetrics> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.METRICS}`, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to fetch metrics: ${response.status}`)
  return response.json() as Promise<InferenceMetrics>
}

export async function fetchLatencyTimeSeries(): Promise<LatencyDataPoint[]> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.METRICS}/latency`, {
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`Failed to fetch latency data: ${response.status}`)
  return response.json() as Promise<LatencyDataPoint[]>
}
