export type MessageRole = 'user' | 'assistant' | 'system'

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error'

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  status: MessageStatus
  createdAt: string
}

export interface Conversation {
  id: string
  title: string | null
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface ConversationDetail {
  conversation: Conversation
  messages: Message[]
}

// Raw API response shapes (snake_case from backend — consumed only by conversation.service.ts)
export interface ApiConversation {
  id: string
  title: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface ApiMessage {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface ApiConversationWithMessages extends ApiConversation {
  messages: ApiMessage[]
}

export interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  isSending: boolean

  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setMessages: (messages: Message[]) => void
  appendMessage: (message: Message) => void
  updateMessage: (id: string, patch: Partial<Message>) => void
  updateConversation: (id: string, patch: Partial<Conversation>) => void
  setLoadingConversations: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSending: (sending: boolean) => void
}

export interface UseConversationResult {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  isSending: boolean
  createNewConversation: () => Promise<void>
  selectConversation: (id: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
}
