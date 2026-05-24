import { useState, useRef, useEffect } from 'react'
import type { ChatInputProps } from './ChatInput.types'
import { DEFAULT_MODEL } from '@/constants'

const INPUT_MAX_HEIGHT_PX = 120

export function ChatInput({ onSend, disabled = false }: ChatInputProps): React.JSX.Element {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(): void {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    
    // Reset height of textarea after submit
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-grow height logic up to 5 lines (~120px)
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, INPUT_MAX_HEIGHT_PX)
    textarea.style.height = `${newHeight}px`
  }, [value])

  // Simple human-readable model name mapping
  const getFriendlyModelName = (): string => {
    if (DEFAULT_MODEL.includes('llama-3.3-70b')) return 'Llama 3.3 70B'
    return DEFAULT_MODEL
  }

  return (
    <div className="px-4 pb-4 pt-1.5 sm:px-6 sm:pb-6 sm:pt-2 bg-surface-base shrink-0 select-none">
      {/* Warm Card-Like Container */}
      <div className="bg-surface-raised border border-border shadow-md rounded-xl p-2.5 sm:p-3.5 flex flex-col gap-2.5 transition-all duration-base focus-within:border-brand-primary/45 focus-within:shadow-lg">
        <div className="flex gap-3 items-end">
          {/* Multi-line growable textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Explore new ideas, search logs, write drafts..."
            className="flex-1 resize-none bg-transparent py-1 px-1.5 text-md leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none min-h-input max-h-input custom-scrollbar select-text"
          />

          {/* Terracotta send button with press shrink scaling */}
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className={`active:scale-[0.96] transition-all duration-fast select-none cursor-pointer w-touch h-touch sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${
              disabled || !value.trim()
                ? 'bg-neutral-200 text-text-muted opacity-40 cursor-not-allowed'
                : 'bg-brand-primary hover:bg-brand-primary/95 text-text-inverse shadow-sm hover:shadow'
            }`}
            title="Send Message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4.5 h-4.5 sm:w-4 sm:h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>

        {/* Info Row: character count & model name */}
        <div className="flex justify-between items-center text-2xs text-text-muted font-sans border-t border-border/40 pt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-secondary/80 animate-pulse" />
            <span className="tracking-wide">Active Model: {getFriendlyModelName()}</span>
          </div>
          <div className="tracking-wide select-none">
            {value.length} {value.length === 1 ? 'character' : 'characters'}
          </div>
        </div>
      </div>
    </div>
  )
}
