import type { BackendStatus } from '@/types'

export interface BackendStatusModalProps {
  status: BackendStatus
  onRetry: () => void
}
