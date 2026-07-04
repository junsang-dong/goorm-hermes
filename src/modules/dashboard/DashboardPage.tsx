import { Layout } from '@/modules/dashboard/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { api } from '@/shared/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Project, Memory, Skill, Reflection } from '@/shared/types'

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [reflections, setReflections] = useState<Reflection[]>([])

  useEffect(() => {
    api.get<Project[]>('/api/v1/projects?limit=5').then(setProjects).catch(() => {})
    api.get<Memory[]>('/api/v1/memory?limit=5').then(setMemories).catch(() => {})
    api.get<Skill[]>('/api/v1/skills').then(setSkills).catch(() => {})
    api.get<Reflection[]>('/api/v1/reflection').then(setReflections).catch(() => {})
  }, [])

  return (
    <Layout title="Developer Home">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>최근 프로젝트</CardTitle>
            <CardDescription>최근 업데이트된 프로젝트</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block rounded-lg border p-3 hover:bg-accent">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.status}</div>
              </Link>
            ))}
            {!projects.length && <p className="text-sm text-muted-foreground">프로젝트가 없습니다.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 Memory</CardTitle>
            <CardDescription>장기 기억 스냅샷</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {memories.slice(0, 5).map((m) => (
              <div key={m.id} className="rounded-lg border p-3 text-sm">
                <span className="text-xs text-primary">{m.memory_type}</span>
                <p className="mt-1 line-clamp-2">{m.content}</p>
              </div>
            ))}
            {!memories.length && <p className="text-sm text-muted-foreground">메모리가 없습니다.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skill Library</CardTitle>
            <CardDescription>{skills.length}개 스킬</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {skills.slice(0, 5).map((s) => (
              <div key={s.id} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">사용 {s.usage_count}회</div>
              </div>
            ))}
            {!skills.length && <p className="text-sm text-muted-foreground">스킬이 없습니다.</p>}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>최근 Reflection</CardTitle>
            <CardDescription>AI 회고 기록</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {reflections.slice(0, 3).map((r) => (
              <div key={r.id} className="rounded-lg border p-3 text-sm">
                <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString('ko')}</div>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{JSON.stringify(r.content, null, 2)}</pre>
              </div>
            ))}
            {!reflections.length && <p className="text-sm text-muted-foreground">회고 기록이 없습니다.</p>}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
