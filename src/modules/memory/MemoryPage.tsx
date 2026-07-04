import { useEffect, useState } from 'react'
import { Layout } from '@/modules/dashboard/Layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/input'
import { api } from '@/shared/api'
import type { Memory } from '@/shared/types'

const MEMORY_TYPES = ['session', 'conversation', 'project', 'developer', 'long_term']

export function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [filter, setFilter] = useState<string>('')
  const [form, setForm] = useState({ memory_type: 'project', content: '' })

  const load = () => {
    const q = filter ? `?memory_type=${filter}` : ''
    api.get<Memory[]>(`/api/v1/memory${q}`).then(setMemories).catch(() => {})
  }

  useEffect(() => { load() }, [filter])

  const create = async () => {
    await api.post('/api/v1/memory', form)
    setForm({ memory_type: 'project', content: '' })
    load()
  }

  return (
    <Layout title="Memory Explorer">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant={!filter ? 'default' : 'outline'} onClick={() => setFilter('')}>전체</Button>
        {MEMORY_TYPES.map((t) => (
          <Button key={t} variant={filter === t ? 'default' : 'outline'} onClick={() => setFilter(t)}>{t}</Button>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>메모리 추가</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <select className="rounded border px-3 py-2 text-sm" value={form.memory_type} onChange={(e) => setForm({ ...form, memory_type: e.target.value })}>
            {MEMORY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Textarea placeholder="내용" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <Button onClick={create}>저장</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {memories.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">{m.memory_type}</span>
                {m.hermes_synced && <span className="text-green-600">Hermes synced</span>}
                <span className="text-muted-foreground">{new Date(m.created_at).toLocaleString('ko')}</span>
              </div>
              <p className="mt-2 text-sm">{m.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
