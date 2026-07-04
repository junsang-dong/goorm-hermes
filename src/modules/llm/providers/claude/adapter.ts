import Anthropic from '@anthropic-ai/sdk'
import { config } from '../../config'
import type { GenerateRequest, GenerateResponse, LLMProvider } from '../../types'

function createClient() {
  return new Anthropic({ apiKey: config.claude.apiKey })
}

export const claudeAdapter: LLMProvider = {
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = createClient()
    const start = Date.now()
    const response = await client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? 8096,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    const text = textBlock?.type === 'text' ? textBlock.text : ''
    return {
      text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason ?? undefined,
      provider: 'claude',
      model: request.model,
      latency: Date.now() - start,
    }
  },
  async *stream(request: GenerateRequest) {
    const client = createClient()
    const s = client.messages.stream({
      model: request.model,
      max_tokens: request.maxTokens ?? 8096,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.prompt }],
    })
    for await (const event of s) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  },
}
