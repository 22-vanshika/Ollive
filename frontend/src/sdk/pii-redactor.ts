type Rule = { pattern: RegExp; label: string }

const RULES: Rule[] = [
  // Email addresses
  {
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    label: '[EMAIL]',
  },
  // US / international phone numbers
  {
    pattern: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    label: '[PHONE]',
  },
  // US Social Security Numbers — NNN-NN-NNNN or NNN NN NNNN (separator required)
  {
    pattern: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g,
    label: '[SSN]',
  },
  // Credit / debit card numbers (13–16 digits, optional separators)
  {
    pattern: /\b(?:\d[ -]?){13,15}\d\b/g,
    label: '[CARD]',
  },
  // Google API keys  (AIzaSy + 33 base64url chars = 39 chars total)
  {
    pattern: /\bAIzaSy[A-Za-z0-9_-]{33}\b/g,
    label: '[API_KEY]',
  },
  // Anthropic / OpenAI-style secret keys
  {
    pattern: /\b(?:sk-ant-|sk-)[A-Za-z0-9_-]{20,}\b/g,
    label: '[API_KEY]',
  },
  // Groq API keys
  {
    pattern: /\bgsk_[A-Za-z0-9]{52}\b/g,
    label: '[API_KEY]',
  },
  // Generic Bearer tokens in text (e.g. copy-pasted Authorization headers)
  {
    pattern: /Bearer\s+[A-Za-z0-9_.~+/-]+=*/gi,
    label: '[BEARER_TOKEN]',
  },
]

export function redactPII(text: string): string {
  return RULES.reduce((acc, { pattern, label }) => acc.replace(pattern, label), text)
}
