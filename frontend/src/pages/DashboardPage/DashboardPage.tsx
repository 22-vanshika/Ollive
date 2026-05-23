import { LatencyChart, ErrorRateCard, StatCard } from '@/components/dashboard'
import { useInferenceMetrics } from '@/hooks'
import { formatLatency, formatTokenCount } from '@/utils'

export function DashboardPage() {
  const { metrics, latencySeries, isLoading, error } = useInferenceMetrics()

  if (error) {
    return (
      <div className="p-8">
        <p className="text-sm text-semantic-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Requests"
          value={isLoading ? '—' : String(metrics?.totalRequests ?? 0)}
        />
        <StatCard
          label="Avg Latency"
          value={isLoading ? '—' : formatLatency(metrics?.averageLatencyMs ?? 0)}
        />
        <StatCard
          label="Total Tokens"
          value={isLoading ? '—' : formatTokenCount(metrics?.totalTokensUsed ?? 0)}
        />
      </div>

      <ErrorRateCard errorRate={metrics?.errorRate ?? null} isLoading={isLoading} />
      <LatencyChart data={latencySeries} isLoading={isLoading} />
    </div>
  )
}

