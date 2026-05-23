export const API_BASE_URL = ''

export const API_ENDPOINTS = {
  INGEST: '/api/v1/ingest',
  CONVERSATIONS: '/api/v1/conversations',
  CONVERSATION: (id: string) => `/api/v1/conversations/${id}`,
  MESSAGES: (conversationId: string) => `/api/v1/conversations/${conversationId}/messages`,
  METRICS: '/api/v1/metrics',
  METRICS_RECENT: '/api/v1/metrics/recent',
  LLM_CHAT: '/api/v1/chat',
} as const

export const API_TIMEOUT_MS = 30_000
