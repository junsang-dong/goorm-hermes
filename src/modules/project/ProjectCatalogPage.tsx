import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/modules/dashboard/Layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input, Textarea } from '@/shared/components/ui/input'
import { api } from '@/shared/api'
import type { Project } from '@/shared/types'

export function ProjectCatalogPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', github_repo: '', tech_stack: '' })

  const load = () => api.get<Project[]>('/api/v1/projects').then(setProjects).catch(() => {})

  useEffect(() => { load() }, [])

  const create = async () => {
    await api.post('/api/v1/projects', {
      name: form.name,
      description: form.description,
      github_repo: form.github_repo || null,
      tech_stack: form.tech_stack ? form.tech_stack.split(',').map((s) => s.trim()) : [],
    })
    setShowForm(false)
    setForm({ name: '', description: '', github_repo: '', tech_stack: '' })
    load()
  }

  return (
    <Layout title="Project Catalog">
      <div className="mb-6 flex justify-between">
        <p className="text-muted-foreground">모든 개발 프로젝트를 Project First로 관리합니다.</p>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '새 프로젝트'}</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle>프로젝트 생성</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="GitHub URL" value={form.github_repo} onChange={(e) => setForm({ ...form, github_repo: e.target.value })} />
            <Input placeholder="기술 스택 (쉼표 구분)" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
            <Button onClick={create}>생성</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <div className="text-xs text-primary">{p.status}</div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                {p.tech_stack?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.tech_stack.map((t) => (
                      <span key={t} className="rounded bg-accent px-2 py-0.5 text-xs">{t}</span>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
