import { useEffect, useState } from 'react'
import { fetchMetrics, fetchLatencyTimeSeries, fetchRecentLogs } from '@/services'
import type { InferenceMetrics, LatencyDataPoint, RecentInferenceLog, UseInferenceMetricsResult } from '@/types'

export function useInferenceMetrics(): UseInferenceMetricsResult {
  const [metrics, setMetrics] = useState<InferenceMetrics | null>(null)
  const [latencySeries, setLatencySeries] = useState<LatencyDataPoint[]>([])
  const [recentLogs, setRecentLogs] = useState<RecentInferenceLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchMetrics(), fetchLatencyTimeSeries(), fetchRecentLogs()])
      .then(([m, series, logs]) => {
        setMetrics(m)
        setLatencySeries(series)
        setRecentLogs(logs)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { metrics, latencySeries, recentLogs, isLoading, error }
}
