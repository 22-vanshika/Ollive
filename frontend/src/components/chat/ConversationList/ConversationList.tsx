import { UNTITLED_CONVERSATION } from '@/constants'
import { formatRelativeTime } from '@/utils'
import type { ConversationListProps } from './ConversationList.types'

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onDelete,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded bg-surface-overlay animate-pulse" />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-text-muted">No conversations yet.</p>
    )
  }

  return (
    <ul className="flex flex-col">
      {conversations.map((conv) => (
        <li key={conv.id} className="group relative">
          <button
            onClick={() => onSelect(conv.id)}
            className={[
              'w-full text-left px-4 py-3 pr-10 transition-colors duration-fast',
              'hover:bg-surface-overlay',
              activeId === conv.id ? 'bg-surface-overlay border-l-2 border-brand-primary' : '',
            ].join(' ')}
          >
            <p className="text-sm font-medium text-text-primary truncate">
              {conv.title ?? UNTITLED_CONVERSATION}
            </p>
            <p className="text-xs text-text-muted mt-1">{formatRelativeTime(conv.updatedAt)}</p>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(conv.id)
            }}
            aria-label="Delete conversation"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-fast text-text-muted hover:text-semantic-error"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
