import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@/modules/dashboard/Layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { api } from '@/shared/api'
import type { Document, Project, Repository } from '@/shared/types'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [docs, setDocs] = useState<Document[]>([])
  const [tab, setTab] = useState<'overview' | 'repository' | 'documents'>('overview')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const load = async () => {
    if (!id) return
    const [p, r, d] = await Promise.all([
      api.get<Project>(`/api/v1/projects/${id}`),
      api.get<Repository[]>(`/api/v1/repositories?project_id=${id}`),
      api.get<Document[]>(`/api/v1/documents?project_id=${id}`),
    ])
    setProject(p)
    setRepos(r)
    setDocs(d)
  }

  useEffect(() => { load().catch(() => {}) }, [id])

  const syncRepo = async (repoId: string) => {
    await api.post(`/api/v1/repositories/${repoId}/sync`)
    load()
  }

  const runReflection = async () => {
    if (!id) return
    await api.post(`/api/v1/reflection/run/${id}`)
    alert('Reflection 완료')
  }

  const syncHermes = async () => {
    if (!id) return
    await api.post(`/api/v1/hermes/sync/${id}`)
    alert('Hermes 동기화 완료')
  }

  const uploadDoc = async () => {
    if (!id || !uploadFile || !uploadTitle) return
    const fd = new FormData()
    fd.append('project_id', id)
    fd.append('title', uploadTitle)
    fd.append('file', uploadFile)
    await api.upload('/api/v1/documents/upload', fd)
    setUploadTitle('')
    setUploadFile(null)
    load()
  }

  if (!project) return <Layout title="Loading..."><p>로딩 중...</p></Layout>

  return (
    <Layout title={project.name}>
      <div className="mb-4 flex gap-2">
        {(['overview', 'repository', 'documents'] as const).map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>
            {t === 'overview' ? '개요' : t === 'repository' ? 'Repository' : 'Documents'}
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={runReflection}>Reflection</Button>
          <Button variant="outline" onClick={syncHermes}>Hermes Sync</Button>
        </div>
      </div>

      {tab === 'overview' && (
        <Card>
          <CardHeader><CardTitle>프로젝트 정보</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{project.description}</p>
            <p>Status: {project.status}</p>
            <p>GitHub: {project.github_repo || 'N/A'}</p>
            <p>Deploy: {project.deploy_url || 'N/A'}</p>
            <div className="flex flex-wrap gap-1">
              {project.tech_stack?.map((t) => <span key={t} className="rounded bg-accent px-2 py-0.5 text-xs">{t}</span>)}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'repository' && (
        <div className="space-y-4">
          {repos.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{r.owner}/{r.repo_name}</CardTitle>
                <Button size="sm" onClick={() => syncRepo(r.id)}>Sync</Button>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">{r.summary}</p>
                <p className="text-xs text-muted-foreground">
                  Last synced: {r.last_synced_at ? new Date(r.last_synced_at).toLocaleString('ko') : 'Never'}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.tech_detected?.map((t) => <span key={t} className="rounded bg-accent px-2 py-0.5 text-xs">{t}</span>)}
                </div>
              </CardContent>
            </Card>
          ))}
          {!repos.length && <p className="text-muted-foreground">GitHub repo가 연결되지 않았습니다.</p>}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>문서 업로드</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Input placeholder="제목" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} />
              <Input type="file" accept=".md,.pdf" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <Button onClick={uploadDoc}>업로드</Button>
            </CardContent>
          </Card>
          {docs.map((d) => (
            <Card key={d.id}>
              <CardHeader><CardTitle>{d.title} v{d.version}</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p>{d.summary}</p>
                <div className="mt-2 flex gap-1">{d.tags?.map((t) => <span key={t} className="rounded bg-accent px-2 py-0.5 text-xs">{t}</span>)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  )
}
