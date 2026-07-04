import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/modules/dashboard/Layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input, Textarea } from '@/shared/components/ui/input'
import { api } from '@/shared/api'
import type { Project } from '@/shared/types'

const EXAMPLE_PROJECT = {
  name: 'Goorm Hermes',
  description:
    'Hermes Agent 기반 Developer Knowledge OS. 프로젝트·문서·Memory·Skill을 Project First 아키텍처로 통합하여, 개발 경험이 시간이 지날수록 축적·재사용되는 AI 개발 운영체제입니다.',
  github_repo: 'https://github.com/junsang-dong/goorm-hermes',
  tech_stack: 'React, Vite, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy, PostgreSQL, pgvector, Hermes Agent, Multi LLM SDK, AI Gateway',
}

interface GitHubPreview {
  name: string
  description: string | null
  github_repo: string
  tech_stack: string[]
  deploy_url?: string | null
}

const emptyForm = { name: '', description: '', github_repo: '', tech_stack: '' }

export function ProjectCatalogPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [githubUrl, setGithubUrl] = useState('')
  const [deployUrl, setDeployUrl] = useState<string | null>(null)
  const [loadingGithub, setLoadingGithub] = useState(false)
  const [githubError, setGithubError] = useState('')

  const load = () => api.get<Project[]>('/api/v1/projects').then(setProjects).catch(() => {})

  useEffect(() => { load() }, [])

  const create = async () => {
    await api.post('/api/v1/projects', {
      name: form.name,
      description: form.description,
      github_repo: form.github_repo || null,
      deploy_url: deployUrl,
      tech_stack: form.tech_stack ? form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean) : [],
    })
    setShowForm(false)
    setForm(emptyForm)
    setGithubUrl('')
    setDeployUrl(null)
    setGithubError('')
    load()
  }

  const applyExample = () => {
    setShowForm(true)
    setForm(EXAMPLE_PROJECT)
    setGithubUrl(EXAMPLE_PROJECT.github_repo)
    setGithubError('')
  }

  const previewFromGithub = async () => {
    const url = githubUrl.trim()
    if (!url) {
      setGithubError('GitHub URL을 입력해 주세요.')
      return
    }
    setLoadingGithub(true)
    setGithubError('')
    try {
      const preview = await api.post<GitHubPreview>('/api/v1/projects/preview-github', { github_url: url })
      setShowForm(true)
      setForm({
        name: preview.name,
        description: preview.description || '',
        github_repo: preview.github_repo,
        tech_stack: preview.tech_stack.join(', '),
      })
      setDeployUrl(preview.deploy_url || null)
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'GitHub 정보를 불러오지 못했습니다.')
    } finally {
      setLoadingGithub(false)
    }
  }

  return (
    <Layout title="Project Catalog">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">모든 개발 프로젝트를 Project First로 관리합니다.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={applyExample}>예시 프로젝트 적용</Button>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? '취소' : '새 프로젝트'}</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GitHub URL로 프로젝트 생성</CardTitle>
          <CardDescription>
            GitHub 저장소 URL을 입력하면 README, package.json, 언어 정보를 분석해 프로젝트 폼을 자동으로 채웁니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[280px] flex-1"
              placeholder="https://github.com/owner/repository"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && previewFromGithub()}
            />
            <Button onClick={previewFromGithub} disabled={loadingGithub}>
              {loadingGithub ? '분석 중...' : 'GitHub URL로 프로젝트 생성'}
            </Button>
          </div>
          {githubError && <p className="text-sm text-red-600">{githubError}</p>}
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle>프로젝트 생성</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea placeholder="설명" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="GitHub URL" value={form.github_repo} onChange={(e) => setForm({ ...form, github_repo: e.target.value })} />
            <Input placeholder="기술 스택 (쉼표 구분)" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={create} disabled={!form.name.trim()}>생성</Button>
              <Button variant="outline" onClick={applyExample}>예시 프로젝트 적용</Button>
            </div>
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
