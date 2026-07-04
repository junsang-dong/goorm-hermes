import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const API_URL = process.env.DKOS_API_URL || 'http://localhost:8000'

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

const server = new McpServer({ name: 'dkos', version: '0.1.0' })

server.tool('list_projects', 'List all DKOS projects', {}, async () => {
  const projects = await apiGet<unknown[]>('/api/v1/projects')
  return { content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }] }
})

server.tool('get_project', 'Get a project by ID', { id: z.string() }, async ({ id }) => {
  const project = await apiGet(`/api/v1/projects/${id}`)
  return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] }
})

server.tool('search_documents', 'Search documents', { q: z.string() }, async ({ q }) => {
  const results = await apiGet(`/api/v1/search?q=${encodeURIComponent(q)}&mode=keyword`)
  return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] }
})

server.tool('search_memory', 'Search memories', { q: z.string() }, async ({ q }) => {
  const results = await apiGet(`/api/v1/search?q=${encodeURIComponent(q)}&mode=semantic`)
  return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] }
})

server.tool('get_skills', 'List skills', {}, async () => {
  const skills = await apiGet('/api/v1/skills')
  return { content: [{ type: 'text', text: JSON.stringify(skills, null, 2) }] }
})

server.tool(
  'create_memory',
  'Create a memory entry',
  { content: z.string(), memory_type: z.string(), project_id: z.string().optional() },
  async ({ content, memory_type, project_id }) => {
    const mem = await apiPost('/api/v1/memory', { content, memory_type, project_id })
    return { content: [{ type: 'text', text: JSON.stringify(mem, null, 2) }] }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
