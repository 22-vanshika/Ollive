import { useRef, useEffect, useState } from 'react'
import { ConversationList, MessageBubble, ChatInput } from '@/components/chat'
import { useConversation } from '@/hooks'
import { useConversationStore } from '@/store'
import { WELCOME_SUGGESTIONS, UNTITLED_CONVERSATION } from '@/constants'

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
  const messageListRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Local storage state for pinned conversation IDs
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ollive_pinned_conversations')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Synchronize pinned state with local storage
  useEffect(() => {
    localStorage.setItem('ollive_pinned_conversations', JSON.stringify(pinnedIds))
  }, [pinnedIds])

  // Toggle pinning action
  const togglePin = (id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Smooth scroll message container
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Greeting based on hours
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Filter conversations by search input
  const filteredConversations = conversations.filter((c) =>
    (c.title ?? UNTITLED_CONVERSATION)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const pinnedConversations = filteredConversations.filter((c) =>
    pinnedIds.includes(c.id)
  )
  const recentConversations = filteredConversations.filter(
    (c) => !pinnedIds.includes(c.id)
  )

  // Suggestion card clicked -> create a conversation if needed, then send.
  // We read the store directly after creation to get the new ID without waiting
  // for a re-render, which avoids the stale-closure race condition.
  const handleSuggestionClick = async (text: string) => {
    if (!activeConversationId) {
      try {
        await createNewConversation()
      } catch (err) {
        console.error(err)
        return
      }
    }
    const currentId = useConversationStore.getState().activeConversationId
    if (!currentId) return
    sendMessage(text)
  }

  // Export conversation as beautiful Markdown
  const handleExportMarkdown = () => {
    if (!messages.length) return
    const title = conversations.find((c) => c.id === activeConversationId)?.title ?? UNTITLED_CONVERSATION
    const mdHeader = `# Ollive Chat Export — ${title}\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`
    const mdBody = messages
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'User' : 'Ollive Assistant'} (${new Date(m.createdAt).toLocaleTimeString()})\n\n${m.content}\n`
      )
      .join('\n---\n\n')

    const blob = new Blob([mdHeader + mdBody], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ollive-exploration-${activeConversationId || 'export'}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full w-full bg-surface-base select-none overflow-hidden font-sans">
      {/* ─── Sidebar (Left Zone) ─── */}
      <aside className="w-sidebar border-r border-border bg-surface-overlay flex flex-col shrink-0 h-full overflow-hidden select-none">
        {/* Sidebar Header */}
        <div className="px-6 py-4 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-text-primary tracking-wide">
              Explorations
            </h2>
            {/* Elegant New Chat Button inside sidebar */}
            <button
              onClick={createNewConversation}
              className="p-1.5 rounded-full bg-brand-primary text-text-inverse hover:opacity-95 active:scale-95 transition-all shadow-sm cursor-pointer"
              title="Start a new exploration"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted/70">
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
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search explorations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-raised border border-border/80 text-xs rounded-lg pl-9 pr-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-base"
            />
          </div>
        </div>

        {/* Scrollable Conversation Sections Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4 flex flex-col gap-4">
          {/* Pinned Exploration Section */}
          {pinnedConversations.length > 0 && (
            <div>
              <div className="px-4 py-1.5 text-2xs font-semibold text-brand-secondary tracking-wider uppercase select-none">
                Pinned
              </div>
              <ConversationList
                conversations={pinnedConversations}
                activeId={activeConversationId}
                pinnedIds={pinnedIds}
                isLoading={isLoadingConversations}
                onSelect={selectConversation}
                onDelete={deleteConversation}
                onTogglePin={togglePin}
              />
            </div>
          )}

          {/* Recent Exploration Section */}
          <div>
            {pinnedConversations.length > 0 && (
              <div className="px-4 py-1.5 text-2xs font-semibold text-text-muted tracking-wider uppercase select-none">
                Recent
              </div>
            )}
            <ConversationList
              conversations={recentConversations}
              activeId={activeConversationId}
              pinnedIds={pinnedIds}
              isLoading={isLoadingConversations}
              onSelect={selectConversation}
              onDelete={deleteConversation}
              onTogglePin={togglePin}
            />
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="px-6 py-4 border-t border-border/60 bg-surface-overlay/80 shrink-0 text-xs text-text-muted flex justify-between items-center select-none">
          <a
            href="#documentation"
            onClick={(e) => {
              e.preventDefault()
              setShowShortcuts(true)
            }}
            className="hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1 font-medium"
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
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
            Help & Shortcuts
          </a>
          <span className="opacity-60">v1.1</span>
        </div>
      </aside>

      {/* ─── Main Chat Workspace (Right Zone) ─── */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-surface-base">
        {/* Slim Header Bar */}
        <header className="h-14 border-b border-border bg-surface-base px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <span className="h-2 w-2 rounded-full bg-brand-secondary/80 shrink-0" />
            <h3 className="text-sm font-semibold text-text-primary truncate">
              {activeConversationId
                ? conversations.find((c) => c.id === activeConversationId)?.title ??
                  UNTITLED_CONVERSATION
                : 'No Exploration Selected'}
            </h3>
          </div>

          {/* Action Row */}
          {activeConversationId && (
            <div className="flex items-center gap-1 shrink-0">
              {/* Keyboard Shortcuts Button */}
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-1.5 rounded-md hover:bg-neutral-200/40 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Keyboard Shortcuts"
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
                    d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z"
                  />
                </svg>
              </button>

              {/* Export Markdown Button */}
              <button
                onClick={handleExportMarkdown}
                disabled={messages.length === 0}
                className={[
                  'p-1.5 rounded-md transition-colors cursor-pointer',
                  messages.length === 0
                    ? 'text-text-muted/40 cursor-not-allowed'
                    : 'hover:bg-neutral-200/40 text-text-muted hover:text-text-primary',
                ].join(' ')}
                title="Export Exploration as Markdown"
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
                    d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a9 9 0 1118 0 9 9 0 01-18 0z"
                  />
                </svg>
              </button>
            </div>
          )}
        </header>

        {/* Message Area Context Handler */}
        {!activeConversationId || (messages.length === 0 && !isLoadingMessages) ? (
          /* Centered Editorial Welcome State */
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-center items-center px-8 py-10 select-none">
            <div className="max-w-2xl w-full text-center flex flex-col items-center">
              <span className="font-serif text-3xl font-extrabold tracking-wide text-brand-primary">
                {getGreeting()}
              </span>
              <p className="text-sm font-medium text-text-secondary mt-2.5">
                What would you like to explore today?
              </p>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-10">
                {WELCOME_SUGGESTIONS.map((s) => {
                  // Custom sage green SVGs for suggestion categories
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.description)}
                      className="group p-5 text-left rounded-xl bg-surface-raised border border-border/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-base cursor-pointer focus:border-brand-primary"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Soft Sage Circle */}
                        <div className="h-8 w-8 rounded-full bg-brand-secondary/15 flex items-center justify-center text-brand-secondary shrink-0 group-hover:bg-brand-secondary/25 transition-colors">
                          {s.category === 'creative' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                            </svg>
                          )}
                          {s.category === 'analytical' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                          {s.category === 'technical' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                            </svg>
                          )}
                          {s.category === 'editorial' && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l5.096-.813 10.814-10.814-4.283-4.283L9.813 15.904z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 8.5L15.5 5M3 12h5m-5 4h3m-3-8h7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                          {s.title}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary/90 mt-2 font-normal leading-relaxed">
                        {s.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : isLoadingMessages ? (
          /* Loading State */
          <div className="flex-1 flex flex-col items-center justify-center select-none gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
            <p className="text-text-muted text-xs tracking-wide">Synthesizing exploration…</p>
          </div>
        ) : (
          /* Active Messages list */
          <div
            ref={messageListRef}
            className="flex-1 overflow-y-auto custom-scrollbar px-10 py-6 flex flex-col min-w-0"
          >
            <div className="max-w-3xl w-full mx-auto flex flex-col">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={bottomRef} className="h-2 shrink-0" />
            </div>
          </div>
        )}

        {/* Input box stays fixed at the bottom */}
        <ChatInput onSend={sendMessage} disabled={isSending || !activeConversationId} />
      </main>

      {/* ─── Keyboard Shortcuts Modal Overlay ─── */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-modal animate-message-fade-in p-6">
          <div className="bg-surface-raised border border-border shadow-lg rounded-xl max-w-sm w-full p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowShortcuts(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-neutral-200/50 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h4 className="font-serif text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5 text-brand-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                />
              </svg>
              Keyboard Shortcuts & Help
            </h4>

            {/* List */}
            <div className="flex flex-col gap-3 font-sans text-xs text-text-secondary mt-4">
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <span>Send message</span>
                <kbd className="px-2 py-1 rounded bg-neutral-200 border border-neutral-300 font-mono text-3xs">
                  Enter
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <span>Add new line</span>
                <kbd className="px-2 py-1 rounded bg-neutral-200 border border-neutral-300 font-mono text-3xs">
                  Shift + Enter
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                <span>Markdown Bold</span>
                <kbd className="px-2 py-1 rounded bg-neutral-200 border border-neutral-300 font-mono text-3xs">
                  **text**
                </kbd>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>Export Chat</span>
                <span className="text-2xs text-text-muted font-normal">
                  Use top header icon
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full mt-6 py-2 rounded-lg bg-brand-primary text-text-inverse font-medium text-xs hover:opacity-95 cursor-pointer shadow-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
