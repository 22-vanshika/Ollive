export const PROVIDER_IDS = {
  GROQ: 'groq',
} as const

export const MODEL_IDS = {
  LLAMA_70B: 'llama-3.3-70b-versatile',
} as const

export const DEFAULT_PROVIDER = PROVIDER_IDS.GROQ
export const DEFAULT_MODEL = MODEL_IDS.LLAMA_70B
export const DEFAULT_MAX_TOKENS = 1024

export const INPUT_PREVIEW_LENGTH = 200
export const OUTPUT_PREVIEW_LENGTH = 200
