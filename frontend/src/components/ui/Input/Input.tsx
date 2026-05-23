import type { InputHTMLAttributes } from 'react'
import type { InputProps } from './Input.types'

export function Input({
  label,
  error,
  className = '',
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5 font-sans">
      {label && (
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{label}</label>
      )}
      <input
        {...rest}
        className={[
          'w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-base text-text-primary',
          'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
          'transition-all duration-base',
          error
            ? 'border-semantic-error focus:ring-semantic-error/30'
            : 'border-border/80 hover:border-border-strong/60 focus:border-brand-primary/60',
          className,
        ].join(' ')}
      />
      {error && <span className="text-xs font-medium text-semantic-error mt-0.5">{error}</span>}
    </div>
  )
}
