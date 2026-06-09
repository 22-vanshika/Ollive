export const API_BASE_URL = ''

export const API_ENDPOINTS = {
  INGEST: '/api/v1/ingest',
  CONVERSATIONS: '/api/v1/conversations',
  CONVERSATION: (id: string) => `/api/v1/conversations/${id}`,
  CONVERSATION_PIN: (id: string) => `/api/v1/conversations/${id}/pin`,
  MESSAGES: (conversationId: string) => `/api/v1/conversations/${conversationId}/messages`,
  METRICS: '/api/v1/metrics',
  METRICS_RECENT: '/api/v1/metrics/recent',
  LLM_CHAT: '/api/v1/chat',
  HEALTH: '/health',
} as const

export const API_TIMEOUT_MS = 30_000

// Backend health-check / cold-start warm-up tuning.
// Railway puts the free-tier container to sleep after inactivity, so the first
// request after idling can take tens of seconds while the server boots.
export const HEALTH_CHECK_TIMEOUT_MS = 5_000
// If the first probe hasn't resolved this fast, assume a cold start is underway
// and surface the "waking up" state to the user.
export const HEALTH_WAKING_THRESHOLD_MS = 2_500
// How long to keep retrying before giving up and declaring the backend offline.
export const HEALTH_MAX_WARMUP_MS = 75_000
// Pause between failed probes during warm-up.
export const HEALTH_RETRY_INTERVAL_MS = 2_000
