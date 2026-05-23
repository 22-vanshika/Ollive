import type { ButtonHTMLAttributes } from 'react'
import type { ButtonProps } from './Button.types'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-primary text-text-inverse hover:opacity-90',
  secondary: 'bg-surface-overlay text-text-primary hover:bg-neutral-200 border border-border',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-overlay',
  danger: 'bg-semantic-error text-text-inverse hover:opacity-90',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
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
        'inline-flex items-center justify-center rounded font-medium transition-opacity duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
        variantClasses[variant],
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
