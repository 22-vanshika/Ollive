import type { LatencyChartProps } from './LatencyChart.types'
import { formatLatency } from '@/utils'

export function LatencyChart({ data, isLoading }: LatencyChartProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="h-full min-h-chart rounded-xl bg-neutral-200/50 animate-pulse border border-neutral-200/20" />
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-full min-h-chart flex flex-col items-center justify-center rounded-xl bg-surface-raised border border-border select-none p-6 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-text-muted/60 mb-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18" />
        </svg>
        <p className="text-sm font-semibold text-text-secondary">No latency data logged</p>
        <p className="text-xs text-text-muted mt-0.5">Perform chat operations to view system response speeds.</p>
      </div>
    )
  }

  // Focus on the last 20 queries for a elegant density
  const pointsToRender = data.slice(-20)
  const maxLatency = Math.max(...pointsToRender.map((d) => d.latencyMs), 100)
  const minLatency = Math.min(...pointsToRender.map((d) => d.latencyMs), 0)

  // Canvas settings
  const width = 500
  const height = 150
  const paddingX = 20
  const paddingY = 20

  // Derive coordinates
  const points = pointsToRender.map((point, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(1, pointsToRender.length - 1)
    const y = height - paddingY - ((point.latencyMs - minLatency) * (height - paddingY * 2)) / Math.max(1, maxLatency - minLatency)
    return { x, y, point }
  })

  // Create SVG path string
  const linePath = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : ''

  // Create filled area path string (extends path down to the baseline)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : ''

  return (
    <div className="h-full rounded-xl bg-surface-raised border border-border shadow-sm p-5 hover:shadow-md transition-all duration-base flex flex-col select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
          Latency Over Time
        </h3>
        <span className="text-2xs text-text-muted font-sans font-medium bg-neutral-200/40 px-2 py-0.5 rounded">
          Max: {formatLatency(maxLatency)}
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full flex-1 min-h-chart-canvas bg-surface-base/30 rounded-lg p-3 border border-border/40 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-h-chart-canvas overflow-visible"
        >
          <defs>
            {/* Soft Terracotta Gradient Area Fill */}
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Baseline and Middle Guide Lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="var(--color-border)"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="var(--color-border)"
            strokeWidth="0.8"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="var(--color-border)"
            strokeWidth="0.8"
          />

          {/* Line Fill Under Path */}
          {areaPath && (
            <path d={areaPath} fill="url(#chart-gradient)" />
          )}

          {/* Solid Terracotta Curve Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-brand-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Render circular dots on key inflection points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2.5"
              fill="var(--color-surface-raised)"
              stroke="var(--color-brand-primary)"
              strokeWidth="1.8"
              className="cursor-pointer transition-all duration-fast hover:r-4 hover:stroke-width-3"
            >
              <title>
                {formatLatency(p.point.latencyMs)} at {new Date(p.point.timestamp).toLocaleTimeString()}
              </title>
            </circle>
          ))}
        </svg>
      </div>

      {/* Axis Guide Row */}
      <div className="flex justify-between items-center mt-2.5 text-3xs text-text-muted font-sans font-medium px-1.5 uppercase tracking-wider">
        <span>{new Date(pointsToRender[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <span>Operational Log Feed Timeline</span>
        <span>{new Date(pointsToRender[pointsToRender.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
