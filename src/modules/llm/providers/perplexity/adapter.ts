import OpenAI from 'openai'
import { config } from '../../config'
import type { GenerateRequest, GenerateResponse, LLMProvider } from '../../types'

function createClient() {
  return new OpenAI({ apiKey: config.perplexity.apiKey, baseURL: config.perplexity.baseURL })
}

export const perplexityAdapter: LLMProvider = {
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = createClient()
    const start = Date.now()
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
    if (request.systemPrompt) messages.push({ role: 'system', content: request.systemPrompt })
    messages.push({ role: 'user', content: request.prompt })
    const response = await client.chat.completions.create({ model: request.model, messages, max_tokens: request.maxTokens })
    const choice = response.choices[0]
    return {
      text: choice.message.content ?? '',
      provider: 'perplexity',
      model: request.model,
      latency: Date.now() - start,
    }
  },
  async *stream(request: GenerateRequest) {
    const client = createClient()
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
    if (request.systemPrompt) messages.push({ role: 'system', content: request.systemPrompt })
    messages.push({ role: 'user', content: request.prompt })
    const s = await client.chat.completions.create({ model: request.model, messages, stream: true })
    for await (const chunk of s) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  },
}
