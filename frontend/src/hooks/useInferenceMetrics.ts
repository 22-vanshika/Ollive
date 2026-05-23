import { useEffect, useState } from 'react'
import { fetchMetrics, fetchLatencyTimeSeries } from '@/services'
import type { InferenceMetrics, LatencyDataPoint, UseInferenceMetricsResult } from '@/types'

export function useInferenceMetrics(): UseInferenceMetricsResult {
  const [metrics, setMetrics] = useState<InferenceMetrics | null>(null)
  const [latencySeries, setLatencySeries] = useState<LatencyDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchLatencyTimeSeries()])
      .then(([m, series]) => {
        setMetrics(m)
        setLatencySeries(series)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { metrics, latencySeries, isLoading, error }
}
