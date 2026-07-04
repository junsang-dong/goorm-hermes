import { registry } from './registry'
import type { GenerateRequest, GenerateResponse, LLMProvider, ProviderName } from '../types'

interface CreateLLMOptions {
  provider: ProviderName
}

export function createLLM(options: CreateLLMOptions): LLMProvider {
  const adapter = registry[options.provider]
  if (!adapter) throw new Error(`Unknown provider: ${options.provider}`)
  return adapter
}

export async function generate(request: GenerateRequest): Promise<GenerateResponse> {
  return registry[request.provider].generate(request)
}

export async function* stream(request: GenerateRequest): AsyncGenerator<string, void, unknown> {
  yield* registry[request.provider].stream(request)
}
