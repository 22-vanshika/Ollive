import type { Conversation } from '@/types'

export interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}
