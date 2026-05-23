import type { WelcomeSuggestion } from '@/types'

export const UNTITLED_CONVERSATION = 'Untitled exploration'

export const DASHBOARD_RECENT_INPUT_SAMPLES: readonly string[] = [
  'How does async IO work in FastAPI?',
  'Redesign premium SaaS dashboard layout',
  'Compare Groq Llama-3.3 vs Claude-3.5 latency',
  'Create a warm editorial palette token file',
  'Help me redact PII from this inference logger payload',
  'Draft an API endpoint to ingest telemetry data',
] as const

export const WELCOME_SUGGESTIONS: WelcomeSuggestion[] = [
  {
    id: 's1',
    title: 'Creative Writing',
    description: 'Brainstorm storylines, metaphorical essays, or novel structures.',
    category: 'creative',
  },
  {
    id: 's2',
    title: 'Deep Synthesis',
    description: 'Extract key themes from transcripts or complex research materials.',
    category: 'analytical',
  },
  {
    id: 's3',
    title: 'Refactor & Clean',
    description: 'Refactor logic, optimize algorithms, or comment complex hooks.',
    category: 'technical',
  },
  {
    id: 's4',
    title: 'Editorial Polish',
    description: 'Elevate drafts into sophisticated copy with tailored tone adjustments.',
    category: 'editorial',
  },
]
