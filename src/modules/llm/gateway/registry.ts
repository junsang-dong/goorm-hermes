import { openaiAdapter } from '../providers/openai/adapter'
import { claudeAdapter } from '../providers/claude/adapter'
import { geminiAdapter } from '../providers/gemini/adapter'
import { perplexityAdapter } from '../providers/perplexity/adapter'
import type { LLMProvider, ProviderName } from '../types'

export const registry: Record<ProviderName, LLMProvider> = {
  openai: openaiAdapter,
  claude: claudeAdapter,
  gemini: geminiAdapter,
  perplexity: perplexityAdapter,
}
