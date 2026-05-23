import type { WelcomeSuggestion } from '@/types'

export const UNTITLED_CONVERSATION = 'Untitled exploration'

export const APP_VERSION = 'v1.1'
export const ERROR_RATE_WARNING_THRESHOLD = 0.10
export const ERROR_RATE_ELEVATED_THRESHOLD = 0.02

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
