import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'
import type { MarkdownRendererProps } from './MarkdownRenderer.types'

/**
 * Component map for ReactMarkdown.
 * Defined outside the render function so the reference is stable — prevents
 * ReactMarkdown from re-mounting on every parent re-render.
 *
 * All colours use Tailwind token classes mapped in tailwind.config.ts; no
 * hex codes or arbitrary values appear here (§4.1 / §4.5 of PROJECT_STANDARDS.md).
 * The SyntaxHighlighter theme (solarizedlight) applies its own inline styles —
 * those are library-owned values, not project magic numbers.
 */
const MARKDOWN_COMPONENTS: Components = {
  /** Outer wrapper for fenced code blocks — provides the rounded border shell. */
  pre({ children }) {
    return (
      <div className="rounded-md my-4 border border-neutral-200 overflow-hidden text-sm">
        {children}
      </div>
    )
  },

  /**
   * Handles both fenced code blocks and inline code.
   * Block detection: react-markdown sets className="language-{lang}" on fenced
   * blocks. No className → inline code.
   */
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className ?? '')
    if (match) {
      return (
        <SyntaxHighlighter
          style={solarizedlight}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: 0, background: 'var(--color-neutral-100)' }}
          wrapLongLines
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    }
    // Inline code — warm beige background + monospace font via design tokens
    return (
      <code className="bg-neutral-100 text-text-primary font-mono text-xs rounded px-1.5 py-0.5 border border-neutral-200">
        {children}
      </code>
    )
  },

  p({ children }) {
    return (
      <p className="text-md text-text-primary leading-chat mb-4 font-sans">
        {children}
      </p>
    )
  },

  h1({ children }) {
    return (
      <h1 className="text-2xl font-serif font-bold text-text-primary mt-6 mb-3">
        {children}
      </h1>
    )
  },
  h2({ children }) {
    return (
      <h2 className="text-xl font-serif font-bold text-text-primary mt-5 mb-2">
        {children}
      </h2>
    )
  },
  h3({ children }) {
    return (
      <h3 className="text-lg font-serif font-bold text-text-primary mt-4 mb-2">
        {children}
      </h3>
    )
  },
  h4({ children }) {
    return (
      <h4 className="text-base font-serif font-semibold text-text-primary mt-3 mb-1">
        {children}
      </h4>
    )
  },
  h5({ children }) {
    return (
      <h5 className="text-sm font-serif font-semibold text-text-secondary mt-3 mb-1">
        {children}
      </h5>
    )
  },
  h6({ children }) {
    return (
      <h6 className="text-xs font-serif font-semibold text-text-muted mt-3 mb-1">
        {children}
      </h6>
    )
  },

  ul({ children }) {
    return (
      <ul className="list-disc pl-6 my-4 space-y-2 text-text-primary leading-chat font-sans">
        {children}
      </ul>
    )
  },
  ol({ children }) {
    return (
      <ol className="list-decimal pl-6 my-4 space-y-2 text-text-primary leading-chat font-sans">
        {children}
      </ol>
    )
  },
  li({ children }) {
    return (
      <li className="pl-1 text-md text-text-primary">
        {children}
      </li>
    )
  },

  /**
   * Bold text rendered as a warm terracotta highlight badge —
   * preserves the intentional Ollive design language for emphasis.
   */
  strong({ children }) {
    return (
      <strong className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded font-semibold text-sm border border-brand-primary/15 mx-0.5 inline-block">
        {children}
      </strong>
    )
  },

  em({ children }) {
    return (
      <em className="italic text-text-secondary">
        {children}
      </em>
    )
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-brand-primary/40 pl-4 my-4 text-text-secondary italic font-sans">
        {children}
      </blockquote>
    )
  },
}

export function MarkdownRenderer({ content }: MarkdownRendererProps): React.ReactElement | null {
  if (!content) return null

  return (
    <div className="markdown-body select-text w-full">
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>
    </div>
  )
}
