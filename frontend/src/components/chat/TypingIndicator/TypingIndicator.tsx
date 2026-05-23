export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-3 select-none">
      <span className="h-2 w-2 rounded-full bg-brand-primary typing-dot" />
      <span className="h-2 w-2 rounded-full bg-brand-primary typing-dot" />
      <span className="h-2 w-2 rounded-full bg-brand-primary typing-dot" />
    </div>
  )
}
