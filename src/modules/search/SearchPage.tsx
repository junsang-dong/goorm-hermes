import { useState } from 'react'
import { Layout } from '@/modules/dashboard/Layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { api } from '@/shared/api'
import type { SearchResponse } from '@/shared/types'

const MODES = ['keyword', 'semantic', 'hybrid', 'rag'] as const

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<(typeof MODES)[number]>('hybrid')
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await api.get<SearchResponse>(`/api/v1/search?q=${encodeURIComponent(query)}&mode=${mode}`)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="통합 검색">
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="max-w-md" placeholder="검색어..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
        <Button onClick={search} disabled={loading}>{loading ? '검색 중...' : '검색'}</Button>
      </div>

      <div className="mb-4 flex gap-2">
        {MODES.map((m) => (
          <Button key={m} variant={mode === m ? 'default' : 'outline'} size="sm" onClick={() => setMode(m)}>{m}</Button>
        ))}
      </div>

      {result?.answer && (
        <Card className="mb-4">
          <CardHeader><CardTitle>RAG 답변</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{result.answer}</p></CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {result?.results.map((r) => (
          <Card key={`${r.type}-${r.id}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-primary/10 px-2 py-0.5 text-primary">{r.type}</span>
                <span className="text-muted-foreground">score: {r.score.toFixed(3)}</span>
              </div>
              <div className="mt-1 font-medium">{r.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{r.snippet}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
