import type { ButtonHTMLAttributes } from 'react'
import type { ButtonProps } from './Button.types'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-primary text-text-inverse hover:opacity-95 shadow-sm hover:shadow',
  secondary: 'bg-surface-raised text-text-primary hover:bg-surface-overlay/50 border border-border/80 shadow-sm',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay/60',
  danger: 'bg-semantic-error text-text-inverse hover:opacity-95 shadow-sm',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold',
  md: 'px-4.5 py-2 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...rest
}: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-base active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed active:scale-100' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
