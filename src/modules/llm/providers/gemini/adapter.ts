import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../../config'
import type { GenerateRequest, GenerateResponse, LLMProvider } from '../../types'

function createClient() {
  return new GoogleGenerativeAI(config.gemini.apiKey)
}

export const geminiAdapter: LLMProvider = {
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const client = createClient()
    const start = Date.now()
    const model = client.getGenerativeModel({
      model: request.model,
      systemInstruction: request.systemPrompt,
    })
    const result = await model.generateContent(request.prompt)
    const response = result.response
    return {
      text: response.text(),
      provider: 'gemini',
      model: request.model,
      latency: Date.now() - start,
    }
  },
  async *stream(request: GenerateRequest) {
    const client = createClient()
    const model = client.getGenerativeModel({ model: request.model, systemInstruction: request.systemPrompt })
    const result = await model.generateContentStream(request.prompt)
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) yield text
    }
  },
}
