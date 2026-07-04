import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { generate, stream } from '../../llm/gateway/factory'
import { createEmbedding } from '../../llm/providers/openai/adapter'
import type { GenerateRequest } from '../../llm/types'

const app = express()
const PORT = Number(process.env.GATEWAY_PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({ windowMs: 60_000, max: 100 })
app.use(limiter)

const cache = new Map<string, { result: unknown; expires: number }>()

function cacheKey(body: GenerateRequest) {
  return JSON.stringify({ provider: body.provider, model: body.model, prompt: body.prompt })
}

app.post('/v1/generate', async (req, res) => {
  try {
    const body = req.body as GenerateRequest
    const key = cacheKey(body)
    const cached = cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.result)
    }
    const result = await generate(body)
    cache.set(key, { result, expires: Date.now() + 300_000 })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/v1/stream', async (req, res) => {
  try {
    const body = req.body as GenerateRequest
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    for await (const chunk of stream(body)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
    }
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/v1/embeddings', async (req, res) => {
  try {
    const { text } = req.body as { text: string }
    const embedding = await createEmbedding(text)
    res.json({ embedding })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`DKOS AI Gateway on :${PORT}`))
