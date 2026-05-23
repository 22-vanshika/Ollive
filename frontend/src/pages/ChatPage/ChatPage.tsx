import { useRef, useEffect } from 'react'
import { ConversationList, MessageBubble, ChatInput } from '@/components/chat'
import { Button } from '@/components/ui'
import { useConversation } from '@/hooks'

export function ChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  } = useConversation()

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex h-screen bg-surface-base">
      <aside className="w-64 border-r border-border flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <h1 className="text-base font-semibold text-text-primary">Ollive</h1>
          <p className="text-xs text-text-muted">LLM Inference Logger</p>
        </div>
        <div className="p-3 border-b border-border">
          <Button variant="secondary" size="sm" className="w-full" onClick={createNewConversation}>
            New chat
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            isLoading={isLoadingConversations}
            onSelect={selectConversation}
            onDelete={deleteConversation}
          />
        </nav>
      </aside>

      <main className="flex flex-col flex-1 min-w-0">
        {!activeConversationId ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-muted text-sm">Select a conversation or start a new one.</p>
          </div>
        ) : isLoadingMessages ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-text-muted text-sm">Loading messages…</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
        <ChatInput onSend={sendMessage} disabled={isSending || !activeConversationId} />
      </main>
    </div>
  )
}
