import type { LatencyChartProps } from './LatencyChart.types'
import { formatLatency } from '@/utils'

export function LatencyChart({ data, isLoading }: LatencyChartProps) {
  if (isLoading) {
    return <div className="h-48 rounded bg-surface-overlay animate-pulse" />
  }

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center rounded bg-surface-raised border border-border">
        <p className="text-sm text-text-muted">No latency data yet.</p>
      </div>
    )
  }

  const maxLatency = Math.max(...data.map((d) => d.latencyMs))

  return (
    <div className="rounded bg-surface-raised border border-border p-4">
      <h3 className="text-sm font-medium text-text-secondary mb-3">Latency over time</h3>
      <div className="flex items-end gap-1 h-32">
        {data.slice(-40).map((point, i) => {
          const heightPct = maxLatency > 0 ? (point.latencyMs / maxLatency) * 100 : 0
          return (
            <div
              key={i}
              title={`${formatLatency(point.latencyMs)} at ${new Date(point.timestamp).toLocaleTimeString()}`}
              className="flex-1 bg-brand-primary rounded-t opacity-80 hover:opacity-100 transition-opacity duration-fast min-w-0"
              style={{ height: `${heightPct}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}
