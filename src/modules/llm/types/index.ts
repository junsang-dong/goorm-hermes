export type ProviderName = 'openai' | 'claude' | 'gemini' | 'perplexity'

export interface GenerateRequest {
  provider: ProviderName
  model: string
  systemPrompt?: string
  prompt: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface GenerateResponse {
  text: string
  usage?: TokenUsage
  finishReason?: string
  provider: ProviderName
  model: string
  latency: number
  raw?: unknown
}

export interface LLMProvider {
  generate(request: GenerateRequest): Promise<GenerateResponse>
  stream(request: GenerateRequest): AsyncGenerator<string, void, unknown>
}
