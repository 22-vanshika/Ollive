import type { StatCardProps } from './StatCard.types'

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-surface-raised border border-border shadow-sm p-5 flex flex-col hover:shadow-md transition-all duration-base select-none">
      {/* Muted label above */}
      <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 font-sans">
        {label}
      </span>
      {/* Terracotta accent value */}
      <span className="text-3xl font-serif font-bold text-brand-primary">
        {value}
      </span>
    </div>
  )
}
