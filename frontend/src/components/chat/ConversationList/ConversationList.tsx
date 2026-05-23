import { UNTITLED_CONVERSATION } from '@/constants'
import { formatRelativeTime } from '@/utils'
import type { ConversationListProps } from './ConversationList.types'

export function ConversationList({
  conversations,
  activeId,
  pinnedIds,
  isLoading,
  onSelect,
  onDelete,
  onTogglePin,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-neutral-200/50 animate-pulse border border-neutral-200/20"
          />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="px-6 py-12 text-center select-none">
        <p className="text-sm font-medium text-text-muted">No conversations</p>
        <p className="text-xs text-text-muted/70 mt-1">Start a new exploration</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-1 p-2">
      {conversations.map((conv, index) => {
        const isActive = activeId === conv.id
        const isPinned = pinnedIds.includes(conv.id)

        return (
          <li
            key={conv.id}
            className="group relative rounded-md overflow-hidden animate-slide-in"
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* The Conversation Row Button */}
            <button
              onClick={() => onSelect(conv.id)}
              className={[
                'w-full text-left px-4 py-3 flex flex-col justify-center transition-all duration-base cursor-pointer',
                isActive
                  ? 'bg-surface-sidebarActive border-l-accent border-brand-primary pl-3.5'
                  : 'hover:bg-neutral-200/30 border-l-accent border-transparent',
              ].join(' ')}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span
                  className={[
                    'text-sm truncate pr-16',
                    isActive ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
                  ].join(' ')}
                >
                  {conv.title ?? UNTITLED_CONVERSATION}
                </span>

                {/* Pinned Dot Indicator */}
                {isPinned && !isActive && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-brand-secondary shrink-0"
                    title="Pinned conversation"
                  />
                )}
              </div>

              {/* Timestamp */}
              <span className="text-xs text-text-muted mt-1 font-sans">
                {formatRelativeTime(conv.updatedAt)}
              </span>
            </button>

            {/* Hover Action Overlay Row */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-fast bg-gradient-to-l from-surface-raised via-surface-raised/95 to-transparent pl-4 py-1 rounded-l-md">
              {/* Pin/Unpin Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTogglePin(conv.id)
                }}
                title={isPinned ? 'Unpin' : 'Pin'}
                className="p-1.5 rounded hover:bg-neutral-200/40 text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isPinned ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                  />
                </svg>
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                title="Delete exploration"
                className="p-1.5 rounded hover:bg-semantic-error/10 text-text-muted hover:text-semantic-error transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
