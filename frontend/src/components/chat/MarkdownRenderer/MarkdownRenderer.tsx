import React from 'react'

interface MarkdownRendererProps {
  content: string
}

function parseInlineStyles(text: string): React.ReactNode[] | string {
  // A regex to match **bold**
  const parts: React.ReactNode[] = []
  let currentIndex = 0
  const regex = /\*\*(.*?)\*\*/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index
    // Add normal text before the match
    if (matchIndex > currentIndex) {
      parts.push(text.slice(currentIndex, matchIndex))
    }

    const boldText = match[1]
    // Render the beautiful highlight badge
    parts.push(
      <strong
        key={matchIndex}
        className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-semibold text-sm border border-brand-primary/15 mx-0.5 inline-block"
      >
        {boldText}
      </strong>
    )

    currentIndex = regex.lastIndex
  }

  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex))
  }

  return parts.length > 0 ? parts : text
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  // Split by newlines
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []
  let currentListItems: React.ReactNode[] = []
  let isInsideList = false
  let listType: 'ol' | 'ul' | null = null

  const pushCurrentList = () => {
    if (currentListItems.length > 0 && listType) {
      const listKey = `list-${blocks.length}`
      if (listType === 'ol') {
        blocks.push(
          <ol key={listKey} className="list-decimal pl-6 my-4 space-y-3 text-text-primary leading-relaxed font-sans">
            {currentListItems}
          </ol>
        )
      } else {
        blocks.push(
          <ul key={listKey} className="list-disc pl-6 my-4 space-y-3 text-text-primary leading-relaxed font-sans">
            {currentListItems}
          </ul>
        )
      }
      currentListItems = []
      isInsideList = false
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      pushCurrentList()
      continue
    }

    // Check if it is a list item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/)

    if (olMatch) {
      if (!isInsideList || listType !== 'ol') {
        pushCurrentList()
        isInsideList = true
        listType = 'ol'
      }
      const contentText = olMatch[2]
      currentListItems.push(
        <li key={`li-${i}`} className="pl-1.5 text-md text-text-primary">
          {parseInlineStyles(contentText)}
        </li>
      )
    } else if (ulMatch) {
      if (!isInsideList || listType !== 'ul') {
        pushCurrentList()
        isInsideList = true
        listType = 'ul'
      }
      const contentText = ulMatch[1]
      currentListItems.push(
        <li key={`li-${i}`} className="pl-1.5 text-md text-text-primary">
          {parseInlineStyles(contentText)}
        </li>
      )
    } else {
      // Not a list item
      pushCurrentList()

      // Check if it is a heading
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const headingText = headingMatch[2]
        const headingClass = level === 1
          ? 'text-2xl font-serif font-bold text-text-primary mt-6 mb-3'
          : level === 2
            ? 'text-xl font-serif font-bold text-text-primary mt-5 mb-2.5'
            : 'text-lg font-serif font-bold text-text-primary mt-4 mb-2'

        blocks.push(
          <div key={`h-${i}`} className={headingClass}>
            {parseInlineStyles(headingText)}
          </div>
        )
      } else {
        // Normal paragraph
        // If it starts and ends with bold indicators and has a colon like "**Storylines:**", render as premium section label
        if (trimmed.startsWith('**') && trimmed.endsWith(':**')) {
          const cleanText = trimmed.slice(2, -3)
          blocks.push(
            <div key={`p-${i}`} className="text-md font-serif font-bold text-brand-primary mt-6 mb-2 tracking-wide uppercase text-xs">
              {cleanText}
            </div>
          )
        } else {
          blocks.push(
            <p key={`p-${i}`} className="text-md text-text-primary leading-relaxed mb-4 font-sans whitespace-pre-wrap select-text">
              {parseInlineStyles(line)}
            </p>
          )
        }
      }
    }
  }

  // Flush remaining list items
  pushCurrentList()

  return <div className="markdown-body select-text w-full">{blocks}</div>
}
