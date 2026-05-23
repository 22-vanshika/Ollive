import type { ReactNode } from 'react'

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: ReactNode
}
