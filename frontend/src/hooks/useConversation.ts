import { useCallback, useEffect } from 'react'
import { useConversationStore } from '@/store'
import {
  fetchConversations,
  createConversation,
  fetchConversationWithMessages,
  addMessage,
  deleteConversation as deleteConversationService,
} from '@/services'
import { loggedLLMCall } from '@/sdk'
import { DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_PROVIDER } from '@/constants'
import type { Message } from '@/types'

export function useConversation() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    setConversations,
    setActiveConversation,
    setMessages,
    appendMessage,
    updateMessage,
    setLoadingConversations,
    setLoadingMessages,
    setSending,
  } = useConversationStore()

  useEffect(() => {
    setLoadingConversations(true)
    fetchConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoadingConversations(false))
  }, [setConversations, setLoadingConversations])

  const createNewConversation = useCallback(async () => {
    try {
      const conversation = await createConversation()
      const current = useConversationStore.getState().conversations
      setConversations([conversation, ...current])
      setActiveConversation(conversation.id)
      setMessages([])
    } catch (err) {
      console.error(err)
    }
  }, [setActiveConversation, setConversations, setMessages])

  const selectConversation = useCallback(async (id: string) => {
    setActiveConversation(id)
    setLoadingMessages(true)
    try {
      const { messages: loaded } = await fetchConversationWithMessages(id)
      setMessages(loaded)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }, [setActiveConversation, setLoadingMessages, setMessages])

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await deleteConversationService(id)
        setConversations(conversations.filter((c) => c.id !== id))
        if (activeConversationId === id) {
          setActiveConversation(null)
          setMessages([])
        }
      } catch (err) {
        console.error(err)
      }
    },
    [conversations, activeConversationId, setActiveConversation, setConversations, setMessages],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) return

      const optimisticUserMsg: Message = {
        id: crypto.randomUUID(),
        conversationId: activeConversationId,
        role: 'user',
        content,
        status: 'complete',
        createdAt: new Date().toISOString(),
      }
      appendMessage(optimisticUserMsg)

      const assistantMsgId = crypto.randomUUID()
      const pendingAssistantMsg: Message = {
        id: assistantMsgId,
        conversationId: activeConversationId,
        role: 'assistant',
        content: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      appendMessage(pendingAssistantMsg)
      setSending(true)

      try {
        const { response } = await loggedLLMCall({
          sessionId: activeConversationId,
          providerId: DEFAULT_PROVIDER,
          request: {
            sessionId: activeConversationId,
            messages: [...messages, optimisticUserMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            model: DEFAULT_MODEL,
            maxTokens: DEFAULT_MAX_TOKENS,
          },
        })
        updateMessage(assistantMsgId, { content: response.content, status: 'complete' })

        // Persist both turns non-blocking — must not delay the UI response
        addMessage(activeConversationId, 'user', content).catch(console.error)
        addMessage(activeConversationId, 'assistant', response.content).catch(console.error)
      } catch {
        updateMessage(assistantMsgId, { status: 'error' })
      } finally {
        setSending(false)
      }
    },
    [activeConversationId, messages, appendMessage, setSending, updateMessage],
  )

  return {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    createNewConversation,
    selectConversation,
    deleteConversation: handleDeleteConversation,
    sendMessage,
  }
}
