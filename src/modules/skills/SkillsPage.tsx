import { useEffect, useState } from 'react'
import { Layout } from '@/modules/dashboard/Layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input, Textarea } from '@/shared/components/ui/input'
import { api } from '@/shared/api'
import type { Skill } from '@/shared/types'

export function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [form, setForm] = useState({ name: '', description: '' })

  const load = () => api.get<Skill[]>('/api/v1/skills').then(setSkills).catch(() => {})
  useEffect(() => { load() }, [])

  const create = async () => {
    await api.post('/api/v1/skills', form)
    setForm({ name: '', description: '' })
    load()
  }

  return (
    <Layout title="Skill Library">
      <Card className="mb-6">
        <CardHeader><CardTitle>스킬 추가</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button onClick={create}>생성</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle>{s.name}</CardTitle>
              <div className="text-xs text-muted-foreground">사용 {s.usage_count}회 · {s.source_pattern}</div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{s.description}</p>
              {s.skill_md && <pre className="mt-3 max-h-40 overflow-auto rounded bg-muted p-3 text-xs">{s.skill_md}</pre>}
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
