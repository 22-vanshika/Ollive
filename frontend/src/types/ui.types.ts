export interface WelcomeSuggestion {
  id: string
  title: string
  description: string
  category: 'creative' | 'analytical' | 'technical' | 'editorial'
}

/**
 * Reachability of the backend.
 * - checking: a probe is in flight and hasn't taken long enough to look cold
 * - waking:   probe is slow / failing — the Railway container is likely booting
 * - online:   backend responded OK
 * - offline:  warm-up window elapsed without a healthy response
 */
export type BackendStatus = 'checking' | 'waking' | 'online' | 'offline'

export interface UseBackendStatusResult {
  status: BackendStatus
  retry: () => void
}
