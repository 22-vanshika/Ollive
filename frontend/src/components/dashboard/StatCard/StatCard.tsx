import type { StatCardProps } from './StatCard.types'

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded bg-surface-raised border border-border p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-text-primary">{value}</span>
    </div>
  )
}
