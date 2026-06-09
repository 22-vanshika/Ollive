import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '@/services'
import {
  HEALTH_CHECK_TIMEOUT_MS,
  HEALTH_MAX_WARMUP_MS,
  HEALTH_RETRY_INTERVAL_MS,
  HEALTH_WAKING_THRESHOLD_MS,
} from '@/constants'
import type { BackendStatus, UseBackendStatusResult } from '@/types'

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Tracks whether the backend is reachable, transparently driving a warm-up
 * retry loop while a sleeping Railway container boots. Surfaces a 'waking' state
 * so the UI can reassure the user instead of appearing frozen, and exposes a
 * manual retry for the 'offline' case.
 */
export function useBackendStatus(): UseBackendStatusResult {
  const [status, setStatus] = useState<BackendStatus>('checking')
  // Bumping this re-runs the probe effect (used by manual retry).
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    // A slow first probe almost always means a cold start — tell the user.
    const wakingTimer = setTimeout(() => {
      if (!cancelled) setStatus((current) => (current === 'checking' ? 'waking' : current))
    }, HEALTH_WAKING_THRESHOLD_MS)

    const run = async (): Promise<void> => {
      const startedAt = Date.now()
      let healthy = false
      while (!cancelled && Date.now() - startedAt < HEALTH_MAX_WARMUP_MS) {
        healthy = await checkHealth(HEALTH_CHECK_TIMEOUT_MS)
        if (healthy || cancelled) break
        await delay(HEALTH_RETRY_INTERVAL_MS)
      }
      clearTimeout(wakingTimer)
      if (!cancelled) setStatus(healthy ? 'online' : 'offline')
    }

    void run()
    return () => {
      cancelled = true
      clearTimeout(wakingTimer)
    }
  }, [attempt])

  const retry = useCallback(() => {
    setStatus('checking')
    setAttempt((n) => n + 1)
  }, [])

  return { status, retry }
}
