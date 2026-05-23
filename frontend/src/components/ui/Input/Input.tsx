import type { InputHTMLAttributes } from 'react'
import type { InputProps } from './Input.types'

export function Input({
  label,
  error,
  className = '',
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-text-secondary">{label}</label>
      )}
      <input
        {...rest}
        className={[
          'w-full rounded border px-3 py-2 text-base bg-surface-base text-text-primary',
          'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary',
          'transition-shadow duration-fast',
          error ? 'border-semantic-error' : 'border-border focus:border-brand-primary',
          className,
        ].join(' ')}
      />
      {error && <span className="text-sm text-semantic-error">{error}</span>}
    </div>
  )
}
