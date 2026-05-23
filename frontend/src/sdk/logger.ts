import type { InferenceLog, InferenceStatus, LLMRequest, LLMResponse } from '@/types'
import {
  API_BASE_URL,
  API_ENDPOINTS,
  INPUT_PREVIEW_LENGTH,
  OUTPUT_PREVIEW_LENGTH,
} from '@/constants'
import { postInferenceLog } from '@/services'
import { redactPII } from './pii-redactor'
import { createProviderAdapter } from './provider-adapter'

export interface LoggerCallOptions {
  sessionId: string
  providerId: string
  request: LLMRequest
}

export interface LoggerCallResult {
  response: LLMResponse
  log: InferenceLog
}

export async function loggedLLMCall(options: LoggerCallOptions): Promise<LoggerCallResult> {
  const { sessionId, providerId, request } = options

  const requestId = crypto.randomUUID()
  const timestampRequest = new Date().toISOString()
  const requestStart = Date.now()
  const adapter = createProviderAdapter(providerId)

  let status: InferenceStatus = 'success'
  let errorCode: string | null = null
  let response: LLMResponse | undefined
  let log: InferenceLog | undefined

  try {
    response = await adapter.chat(request)
  } catch (err) {
    status = err instanceof Error && err.message.includes('timeout') ? 'timeout' : 'error'
    errorCode = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
    throw err
  } finally {
    // Compute response time and latency inside finally so a single timestamp
    // covers both the success and error paths — no risk of an uninitialized variable.
    const timestampResponse = new Date().toISOString()
    const latencyMs = Date.now() - requestStart

    const lastUserMessage =
      request.messages.findLast(m => m.role === 'user')?.content ?? ''

    log = {
      sessionId,
      requestId,
      provider: providerId,
      model: request.model,
      timestampRequest,
      timestampResponse,
      latencyMs,
      promptTokens: response?.promptTokens ?? 0,
      completionTokens: response?.completionTokens ?? 0,
      totalTokens: response?.totalTokens ?? 0,
      status,
      errorCode,
      inputPreview: redactPII(lastUserMessage).slice(0, INPUT_PREVIEW_LENGTH),
      outputPreview: redactPII(response?.content ?? '').slice(0, OUTPUT_PREVIEW_LENGTH),
    }

    shipLog(log)
  }

  // response and log are both assigned before reaching here:
  //   • response — assigned in try; if try threw, catch re-threw so we never reach this line
  //   • log     — assigned in finally, which always runs before any return
  return { response: response!, log: log! }
}

function shipLog(log: InferenceLog): void {
  // sendBeacon is fire-and-forget and survives page unload.
  // It returns false when the UA queue is full — fall through to the service in that case.
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const url = `${API_BASE_URL}${API_ENDPOINTS.INGEST}`
    const queued = navigator.sendBeacon(url, new Blob([JSON.stringify(log)], { type: 'application/json' }))
    if (queued) return
  }

  postInferenceLog(log).catch(() => {
    // Intentionally swallowed — log shipping must never surface errors to the user
  })
}
