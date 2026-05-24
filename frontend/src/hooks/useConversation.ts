import { useCallback, useEffect } from 'react'
import { useConversationStore } from '@/store'
import {
  fetchConversations,
  createConversation,
  fetchConversationWithMessages,
  addMessage,
  deleteConversation as deleteConversationService,
  updateConversationTitle,
  pinConversation,
} from '@/services'
import { loggedLLMCall } from '@/sdk'
import { DEFAULT_MODEL, DEFAULT_MAX_TOKENS, DEFAULT_PROVIDER, UNTITLED_CONVERSATION } from '@/constants'
import type { Message, UseConversationResult } from '@/types'

export function useConversation(): UseConversationResult {
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
    updateConversation,
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

  const togglePin = useCallback(
    async (id: string) => {
      const current = useConversationStore.getState().conversations.find((c) => c.id === id)
      if (!current) return
      try {
        const updated = await pinConversation(id, !current.pinned)
        updateConversation(id, { pinned: updated.pinned })
      } catch (err) {
        console.error(err)
      }
    },
    [updateConversation],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      // Read live ID from the store — not the stale closure — so a just-created
      // conversation is visible immediately without waiting for a re-render.
      let conversationId = useConversationStore.getState().activeConversationId
      if (!conversationId) {
        await createNewConversation()
        conversationId = useConversationStore.getState().activeConversationId
        if (!conversationId) return
      }

      const optimisticUserMsg: Message = {
        id: crypto.randomUUID(),
        conversationId,
        role: 'user',
        content,
        status: 'complete',
        createdAt: new Date().toISOString(),
      }
      appendMessage(optimisticUserMsg)

      const assistantMsgId = crypto.randomUUID()
      const pendingAssistantMsg: Message = {
        id: assistantMsgId,
        conversationId,
        role: 'assistant',
        content: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      appendMessage(pendingAssistantMsg)
      setSending(true)

      // Persist user turn immediately so it gets an earlier timestamp
      addMessage(conversationId, 'user', content).catch(console.error)

      try {
        const { response } = await loggedLLMCall({
          sessionId: conversationId,
          providerId: DEFAULT_PROVIDER,
          request: {
            sessionId: conversationId,
            messages: [...messages, optimisticUserMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            model: DEFAULT_MODEL,
            maxTokens: DEFAULT_MAX_TOKENS,
          },
          onChunk: (chunk) => {
            const currentMsgs = useConversationStore.getState().messages
            const targetMsg = currentMsgs.find((m) => m.id === assistantMsgId)
            const currentContent = targetMsg ? targetMsg.content : ''
            updateMessage(assistantMsgId, {
              content: currentContent + chunk,
              status: 'pending',
            })
          },
        })
        updateMessage(assistantMsgId, { content: response.content, status: 'complete' })

        // Persist assistant reply once complete
        addMessage(conversationId, 'assistant', response.content).catch(console.error)

        // Non-blocking auto-generation of conversation title
        const currentConv = useConversationStore.getState().conversations.find((c) => c.id === conversationId)
        const isUntitled = !currentConv || !currentConv.title || currentConv.title === UNTITLED_CONVERSATION
        const finalMsgs = useConversationStore.getState().messages
        if (finalMsgs.length >= 2 && conversationId && isUntitled) {
          const currentConvId = conversationId
          const userQuery = content
          const assistantReply = response.content

          ;(async () => {
            try {
              const { response: summaryResponse } = await loggedLLMCall({
                sessionId: currentConvId,
                providerId: DEFAULT_PROVIDER,
                request: {
                  sessionId: currentConvId,
                  messages: [
                    { role: 'user', content: userQuery },
                    { role: 'assistant', content: assistantReply },
                    {
                      role: 'user',
                      content:
                        'Summarize this conversation in 4 words or fewer. Reply with only the title, no punctuation.',
                    },
                  ],
                  model: DEFAULT_MODEL,
                  maxTokens: 50,
                },
              })

              let title = summaryResponse.content.trim()
              if (title.startsWith('"') && title.endsWith('"')) {
                title = title.slice(1, -1).trim()
              }
              if (title.startsWith("'") && title.endsWith("'")) {
                title = title.slice(1, -1).trim()
              }
              if (title.endsWith('.')) {
                title = title.slice(0, -1).trim()
              }

              if (title) {
                await updateConversationTitle(currentConvId, title)

                const currentConversations = useConversationStore.getState().conversations
                const updatedConversations = currentConversations.map((c) =>
                  c.id === currentConvId ? { ...c, title } : c
                )
                useConversationStore.getState().setConversations(updatedConversations)
              }
            } catch (err) {
              console.error('Failed to auto-generate conversation title:', err)
            }
          })()
        }
      } catch {
        updateMessage(assistantMsgId, { status: 'error' })
      } finally {
        setSending(false)
      }
    },
    [messages, appendMessage, setSending, updateMessage, createNewConversation],
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
    togglePin,
  }
}
