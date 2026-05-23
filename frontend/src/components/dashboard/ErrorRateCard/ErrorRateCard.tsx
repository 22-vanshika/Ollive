import { Badge } from '@/components/ui'
import { formatErrorRate } from '@/utils'
import type { ErrorRateCardProps } from './ErrorRateCard.types'
import { ERROR_RATE_WARNING_THRESHOLD, ERROR_RATE_ELEVATED_THRESHOLD } from '@/constants'

export function ErrorRateCard({ errorRate, isLoading }: ErrorRateCardProps): React.JSX.Element {
  if (isLoading) {
    return (
      <div className="h-28 rounded-xl bg-neutral-200/50 animate-pulse border border-neutral-200/20" />
    )
  }

  // Handle standard ranges
  const isHigh = errorRate !== null && errorRate >= ERROR_RATE_WARNING_THRESHOLD
  const isElevated = errorRate !== null && errorRate >= ERROR_RATE_ELEVATED_THRESHOLD && errorRate < ERROR_RATE_WARNING_THRESHOLD

  const badgeVariant = errorRate === null
    ? 'neutral'
    : isHigh ? 'error' : isElevated ? 'warning' : 'success'

  const badgeLabel = errorRate === null
    ? '—'
    : isHigh ? 'High' : isElevated ? 'Elevated' : 'Normal'

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* High Error Rate Alert Banner */}
      {isHigh && (
        <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-semantic-error/10 border border-semantic-error/25 text-semantic-error animate-slide-in">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-5 h-5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div className="text-xs font-medium leading-normal select-none">
            <p className="font-bold">System Warning: High Error Rate Detected</p>
            <p className="opacity-90">Inference errors currently exceed the 10% operational threshold. Active monitoring has triggered logs review.</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-xl bg-surface-raised border border-border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all duration-base select-none">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            {/* Muted label above */}
            <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider mb-1 font-sans">
              Error Rate
            </span>
            {/* Terracotta value */}
            <span className="text-3xl font-serif font-bold text-brand-primary">
              {errorRate === null ? '—' : formatErrorRate(errorRate)}
            </span>
          </div>

          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
        </div>

        {/* Supporting description text */}
        <p className="text-xs text-text-secondary mt-3 font-sans leading-relaxed">
          {errorRate === null
            ? 'No operational data logged yet.'
            : isHigh
            ? 'Operational integrity compromised. Recommend scaling Groq fallback servers.'
            : isElevated
            ? 'Slight delay spikes in API responses. System is operational but degraded.'
            : 'Operational efficiency is peak. Zero anomalies logged in past 50 queries.'}
        </p>
      </div>
    </div>
  )
}
