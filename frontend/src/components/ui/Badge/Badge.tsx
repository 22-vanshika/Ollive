import type { BadgeProps } from './Badge.types'

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-semantic-success/10 text-semantic-success',
  warning: 'bg-semantic-warning/10 text-semantic-warning',
  error: 'bg-semantic-error/10 text-semantic-error',
  info: 'bg-semantic-info/10 text-semantic-info',
  neutral: 'bg-surface-overlay text-text-secondary',
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0 text-xs font-medium',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
