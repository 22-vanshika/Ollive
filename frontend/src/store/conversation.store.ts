import { create } from 'zustand'
import type { Conversation, Message } from '@/types'

interface ConversationState {
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
  setLoadingConversations: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSending: (sending: boolean) => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  setLoadingConversations: (loading) => set({ isLoadingConversations: loading }),
  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setSending: (sending) => set({ isSending: sending }),
}))
