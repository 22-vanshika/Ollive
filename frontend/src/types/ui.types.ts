export interface WelcomeSuggestion {
  id: string
  title: string
  description: string
  category: 'creative' | 'analytical' | 'technical' | 'editorial'
}
