import type { MessageBubbleProps } from './MessageBubble.types'

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-prose rounded-lg px-4 py-3 text-base',
          isUser
            ? 'bg-brand-primary text-text-inverse'
            : 'bg-surface-raised text-text-primary border border-border',
          message.status === 'error' ? 'border-semantic-error' : '',
          message.status === 'pending' ? 'opacity-60' : '',
        ].join(' ')}
      >
        {message.status === 'pending' ? (
          <span className="text-text-muted">…</span>
        ) : (
          message.content
        )}
      </div>
    </div>
  )
}
