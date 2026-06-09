import type { BackendStatusModalProps } from './BackendStatusModal.types'

/**
 * Overlay shown when the backend isn't ready. While the Railway container boots
 * ('waking') it reassures the user that a slow first load is expected; if the
 * warm-up window elapses ('offline') it offers a manual retry. Renders nothing
 * once the backend is reachable.
 */
export function BackendStatusModal({ status, onRetry }: BackendStatusModalProps): React.JSX.Element | null {
  if (status !== 'waking' && status !== 'offline') return null

  const isWaking = status === 'waking'

  return (
    <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-modal animate-message-fade-in p-6 select-none">
      <div className="bg-surface-raised border border-border shadow-lg rounded-xl max-w-sm w-full p-8 text-center flex flex-col items-center">
        {isWaking ? (
          <>
            {/* Pulsing spinner */}
            <div className="relative h-14 w-14 mb-5">
              <span className="absolute inset-0 rounded-full bg-brand-primary/15 animate-ping" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-9 w-9 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
              </span>
            </div>

            <h4 className="font-serif text-lg font-bold text-text-primary">
              Waking the server
            </h4>
            <p className="text-sm text-text-secondary mt-2.5 leading-relaxed">
              The backend goes to sleep after a spell of inactivity. It&apos;s starting
              back up now — this usually takes <span className="font-medium text-text-primary">30–60 seconds</span>.
              Everything will load automatically once it&apos;s ready.
            </p>

            {/* Indeterminate shimmer bar */}
            <div className="w-full h-1 rounded-full bg-neutral-200/60 overflow-hidden mt-6">
              <div className="h-full w-1/3 rounded-full bg-brand-primary animate-shimmer-slide" />
            </div>

            <p className="text-2xs text-text-muted mt-4 tracking-wide flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary/80 animate-pulse" />
              Hang tight, no need to refresh
            </p>
          </>
        ) : (
          <>
            {/* Offline icon */}
            <div className="h-14 w-14 mb-5 rounded-full bg-semantic-error/10 flex items-center justify-center text-semantic-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h4 className="font-serif text-lg font-bold text-text-primary">
              Can&apos;t reach the server
            </h4>
            <p className="text-sm text-text-secondary mt-2.5 leading-relaxed">
              The backend didn&apos;t respond in time. It may still be starting up, or the
              connection dropped. You can try again in a moment.
            </p>

            <button
              onClick={onRetry}
              className="mt-6 px-5 py-2 rounded-lg bg-brand-primary text-text-inverse font-medium text-sm hover:opacity-95 active:scale-[0.98] cursor-pointer shadow-sm transition-all flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
