export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  claude: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY || '',
  },
  perplexity: {
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    baseURL: 'https://api.perplexity.ai',
  },
} as const

export const models = {
  openai: {
    'gpt-4o': 'gpt-4o',
    'gpt-4o-mini': 'gpt-4o-mini',
  },
  gemini: {
    'gemini-2.5-pro': 'gemini-2.5-pro',
    'gemini-2.5-flash': 'gemini-2.5-flash',
  },
  claude: {
    'claude-opus': 'claude-opus-4-8',
    'claude-sonnet': 'claude-sonnet-4-6',
  },
  perplexity: {
    sonar: 'sonar',
    'sonar-pro': 'sonar-pro',
  },
} as const
