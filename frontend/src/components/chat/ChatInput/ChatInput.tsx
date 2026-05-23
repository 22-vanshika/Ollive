import { useState } from 'react'
import { Button } from '@/components/ui'
import type { ChatInputProps } from './ChatInput.types'

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-2 items-end border-t border-border px-4 py-3 bg-surface-base">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder="Send a message…"
        className="flex-1 resize-none rounded border border-border bg-surface-raised px-3 py-2 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-fast"
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        size="md"
      >
        Send
      </Button>
    </div>
  )
}
