import { LatencyChart, ErrorRateCard, StatCard } from '@/components/dashboard'
import { useInferenceMetrics } from '@/hooks'
import { formatLatency, formatTokenCount } from '@/utils'
import { ERROR_RATE_WARNING_THRESHOLD } from '@/constants'

export function DashboardPage(): React.JSX.Element {
  const { metrics, latencySeries, recentLogs, isLoading, error } = useInferenceMetrics()

  if (error) {
    return (
      <div className="p-10 select-none">
        <div className="max-w-md mx-auto bg-semantic-error/10 border border-semantic-error/25 p-5 rounded-xl text-center flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8 text-semantic-error mb-2 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h4 className="font-serif font-bold text-text-primary text-sm">Failed to Load Operational Dashboard</h4>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-surface-base overflow-y-auto custom-scrollbar select-none">
      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-8 animate-slide-in">
        {/* Editorial Dashboard Header */}
        <div className="flex flex-col gap-1.5 border-b border-border pb-5">
          <h1 className="font-serif text-3xl font-extrabold tracking-wide text-text-primary">
            System Telemetry
          </h1>
          <p className="text-xs text-text-secondary font-medium tracking-wide">
            Real-time inference performance and ingestion health analytics.
          </p>
        </div>

        {/* Global Critical System Status Banner (if overall error rate is higher than 10%) */}
        {metrics && metrics.errorRate >= ERROR_RATE_WARNING_THRESHOLD && (
          <div className="w-full flex items-center gap-3 px-5 py-4 rounded-xl bg-semantic-error/10 border border-semantic-error/25 text-semantic-error">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="text-xs leading-relaxed font-sans">
              <p className="font-bold">Operational Alert: High System Failure Threshold Exceeded</p>
              <p className="opacity-90">Inference endpoints are reporting heavy error rate of {(metrics.errorRate * 100).toFixed(1)}%. Please inspect remote Groq API fallbacks immediately.</p>
            </div>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            label="Total Logged Queries"
            value={isLoading ? '—' : String(metrics?.totalRequests ?? 0)}
          />
          <StatCard
            label="Average Engine Latency"
            value={isLoading ? '—' : formatLatency(metrics?.averageLatencyMs ?? 0)}
          />
          <StatCard
            label="Total Synthesized Tokens"
            value={isLoading ? '—' : formatTokenCount(metrics?.totalTokensUsed ?? 0)}
          />
        </div>

        {/* Latency and Error Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          <div className="flex flex-col gap-5 h-full">
            <ErrorRateCard errorRate={metrics?.errorRate ?? null} isLoading={isLoading} />

            {/* AI Insight Card */}
            <div className="flex-1 rounded-xl border border-border bg-surface-raised p-5 shadow-sm hover:shadow-md transition-all duration-base flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-brand-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">AI Analysis</h3>
                </div>
                <span className="text-3xs text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded font-sans tracking-wide">Beta</span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs font-sans text-text-secondary leading-relaxed">
                <div className="flex gap-2.5 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-semantic-warning shrink-0" />
                  <p>Latency spike correlates with a burst of concurrent requests — consider request queuing under <span className="font-medium text-text-primary">sustained load</span>.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-semantic-error shrink-0" />
                  <p>Error rate trending near the <span className="font-medium text-text-primary">10% alert threshold</span> — Groq API fallback response times may be a contributing factor.</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-secondary shrink-0" />
                  <p>Token density within normal range; completion size suggests <span className="font-medium text-text-primary">well-scoped prompts</span> with no runaway generation.</p>
                </div>
              </div>
            </div>
          </div>

          <LatencyChart data={latencySeries} isLoading={isLoading} />
        </div>

        {/* Recent Inferences Table Section */}
        {!isLoading && recentLogs.length > 0 && (
          <div className="rounded-xl border border-border bg-surface-raised p-5 shadow-sm hover:shadow-md transition-all duration-base flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider font-sans">
                Recent Inference Telemetry
              </h3>
              <span className="text-3xs text-text-muted bg-neutral-200/40 px-2 py-0.5 rounded font-sans tracking-wide">
                Live Feed
              </span>
            </div>

            {/* Alternating Row Table */}
            <div className="overflow-x-auto w-full border border-border/60 rounded-lg">
              <table className="min-w-full divide-y divide-border/60 text-left font-sans text-xs select-text">
                <thead className="bg-surface-overlay text-text-secondary font-semibold text-2xs uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Input Preview</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Tokens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-text-primary">
                  {recentLogs.map((log, idx) => (
                    <tr
                      key={log.requestId}
                      className={[
                        'transition-colors duration-fast hover:bg-neutral-200/15',
                        idx % 2 === 0 ? 'bg-surface-raised' : 'bg-neutral-100/30',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary font-medium">
                        {new Date(log.timestampRequest).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-2xs text-text-muted">
                        {log.requestId}
                      </td>
                      <td className="px-4 py-3.5 truncate max-w-xs font-medium">
                        {log.inputPreview ?? '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap select-none">
                        <span
                          className={[
                            'inline-flex items-center rounded-full px-2 py-0.5 text-3xs font-semibold tracking-wide uppercase',
                            log.status === 'success'
                              ? 'bg-brand-secondary/15 text-brand-secondary'
                              : log.status === 'timeout'
                              ? 'bg-semantic-warning/15 text-semantic-warning'
                              : 'bg-semantic-error/15 text-semantic-error',
                          ].join(' ')}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-brand-primary">
                        {formatLatency(log.latencyMs)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-text-secondary font-medium">
                        {log.totalTokens} <span className="text-2xs text-text-muted">({log.promptTokens}p/{log.completionTokens}c)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
