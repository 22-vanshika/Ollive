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

  try {
    response = await adapter.chat(request)
  } catch (err) {
    status = err instanceof Error && err.message.includes('timeout') ? 'timeout' : 'error'
    errorCode = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
    throw err
  } finally {
    // Build and ship the log in finally so latency is measured on both
    // the success and error paths before any re-throw propagates.
    const timestampResponse = new Date().toISOString()
    const latencyMs = Date.now() - requestStart
    const lastUserMessage = request.messages.findLast(m => m.role === 'user')?.content ?? ''

    shipLog({
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
    })
  }

  // If the try block threw, catch re-threw it — execution never reaches here on error.
  // response is guaranteed to be assigned on the success path.
  return { response: response as LLMResponse }
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
