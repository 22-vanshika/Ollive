import { useState } from 'react'
import type { MessageBubbleProps } from './MessageBubble.types'
import { TypingIndicator } from '../TypingIndicator'
import { MarkdownRenderer } from '../MarkdownRenderer'

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)

  // Copy helper
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text', err)
    }
  }

  // Realistic stable statistics based on the message content & id hash
  const generateSimulatedStats = () => {
    // Generate simple stable hash from id
    let hash = 0
    for (let i = 0; i < message.id.length; i++) {
      hash = message.id.charCodeAt(i) + ((hash << 5) - hash)
    }
    const seed = Math.abs(hash)
    const latencyMs = 800 + (seed % 1400) + Math.floor(message.content.length * 6)
    const promptTokens = 120 + (seed % 180)
    const completionTokens = Math.max(5, Math.floor(message.content.length / 4.2))
    const totalTokens = promptTokens + completionTokens

    return {
      latency: (latencyMs / 1000).toFixed(2) + 's',
      tokens: `${totalTokens} tokens (${promptTokens}p / ${completionTokens}c)`,
    }
  }

  const stats = generateSimulatedStats()

  if (isUser) {
    return (
      <div className="flex justify-end w-full mb-6 animate-message-fade-in">
        <div className="max-w-bubble-user flex flex-col items-end">
          {/* User Soft terracotta Bubble */}
          <div className="rounded-xl rounded-br-sm px-5 py-3.5 bg-user-bubble-bg text-user-bubble-text text-md font-sans leading-relaxed shadow-sm border border-brand-primary/5 select-text">
            {message.content}
          </div>
          {/* Timestamp */}
          <span className="text-2xs text-text-muted mt-1 px-1 font-sans">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    )
  }

  // Assistant Message Layout (No bubble background, sits on page bg, elegant avatar)
  return (
    <div className="flex justify-start w-full mb-8 group animate-message-fade-in">
      <div className="flex gap-4 max-w-bubble-assistant items-start">
        {/* Warm Premium Logo Avatar */}
        <div className="h-9 w-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-serif font-bold text-sm select-none shrink-0 mt-0.5 shadow-sm">
          O
        </div>

        {/* Content Box */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="text-md text-text-primary leading-chat font-sans font-normal select-text">
            {message.status === 'pending' && message.content === '' ? (
              <TypingIndicator />
            ) : message.status === 'error' ? (
              <span className="text-semantic-error bg-semantic-error/10 border border-semantic-error/25 rounded-lg px-4 py-2 mt-1 inline-block text-sm">
                An error occurred while generating a response. Please try again.
              </span>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Metadata & Actions row (only visible on hover or completed messages) */}
          {message.status === 'complete' && (
            <div className="flex items-center justify-between mt-2 py-1 border-t border-border/40 min-h-input gap-4">
              {/* Latency & Token stats */}
              <div className="flex items-center gap-3 text-xs text-text-muted font-sans tracking-wide select-none">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-text-muted/70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {stats.latency}
                </span>
                <span className="h-2 w-px bg-border" />
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-text-muted/70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  {stats.tokens}
                </span>
              </div>

              {/* Action Buttons (visible on hover) */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-fast select-none">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-neutral-200/50 text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
                  title="Copy text"
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-brand-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75a8.965 8.965 0 00-3.75 3.125m9.75 1.375c.063.303.1.619.1.945M12 12.75a8.965 8.965 0 013.75 3.125" />
                    </svg>
                  )}
                </button>

                {/* Thumbs Up */}
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={[
                    'p-1 rounded hover:bg-neutral-200/50 text-text-muted transition-colors cursor-pointer',
                    feedback === 'up' ? 'text-brand-secondary' : 'hover:text-brand-secondary',
                  ].join(' ')}
                  title="Thumbs up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.421.068.848.068 1.285 0 2.287-.515 4.453-1.442 6.386a2.25 2.25 0 01-2.016 1.294H9.07a2.28 2.28 0 01-1.517-.577l-4.9-4.496a.75.75 0 010-1.113l3.128-3.096a.75.75 0 011.023-.011z" />
                  </svg>
                </button>

                {/* Thumbs Down */}
                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={[
                    'p-1 rounded hover:bg-neutral-200/50 text-text-muted transition-colors cursor-pointer',
                    feedback === 'down' ? 'text-brand-primary' : 'hover:text-brand-primary',
                  ].join(' ')}
                  title="Thumbs down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.367 13.5c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H6.368c-1.026 0-1.945-.694-2.054-1.715a12.04 12.04 0 01-.068-1.285c0-2.287.515-4.453 1.442-6.386A2.25 2.25 0 017.704 6.75h9.002c.677 0 1.285.393 1.517.577l4.9 4.496a.75.75 0 010 1.113l-3.128 3.096a.75.75 0 01-1.023.011z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
