import { Badge } from '@/components/ui'
import { formatErrorRate } from '@/utils'
import type { ErrorRateCardProps } from './ErrorRateCard.types'

export function ErrorRateCard({ errorRate, isLoading }: ErrorRateCardProps) {
  if (isLoading) {
    return <div className="h-24 rounded bg-surface-overlay animate-pulse" />
  }

  const variant = errorRate === null
    ? 'neutral'
    : errorRate > 0.05 ? 'error' : errorRate > 0.01 ? 'warning' : 'success'

  return (
    <div className="rounded bg-surface-raised border border-border p-4 flex flex-col gap-2">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Error Rate</span>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-text-primary">
          {errorRate === null ? '—' : formatErrorRate(errorRate)}
        </span>
        <Badge variant={variant}>
          {variant === 'error' ? 'High' : variant === 'warning' ? 'Elevated' : variant === 'success' ? 'Normal' : '—'}
        </Badge>
      </div>
    </div>
  )
}
