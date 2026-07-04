import { Layout } from '@/modules/dashboard/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 align-top text-muted-foreground">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function UserGuidePage() {
  return (
    <Layout title="User Guide">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Goorm Hermes 활용 가이드</CardTitle>
            <CardDescription>
              Goorm Hermes는 개발 경험을 축적하고 재사용하는 지식 운영체제입니다.
              Project First · Memory First 원칙에 따라 아래 워크플로우를 따르면 시간이 지날수록 더 똑똑한 AI 개발 파트너가 됩니다.
            </CardDescription>
          </CardHeader>
        </Card>

        <Section title="1. 핵심 철학">
          <Table
            headers={['원칙', '의미', '실천 방법']}
            rows={[
              ['Project First', '모든 자산은 프로젝트에 연결', 'README, 문서, Memory, Skill을 항상 특정 프로젝트 아래에 둠'],
              ['Memory First', '코드보다 경험을 먼저 탐색', '새 작업 전에 Search · Memory · Skills를 먼저 확인'],
            ]}
          />
          <Card>
            <CardContent className="pt-6 font-mono text-sm text-muted-foreground">
              Project → Repository → Document → Memory → Skill → Knowledge Graph
            </CardContent>
          </Card>
        </Section>

        <Section title="2. 일상 워크플로우">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">아침 — Developer Home</CardTitle>
                <CardDescription>대시보드에서 최근 프로젝트, Memory, Skill, Reflection을 확인하며 오늘 할 일을 정합니다.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">새 프로젝트 시작 — Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Projects → 새 프로젝트 생성</p>
                <p>2. 이름, 설명, GitHub URL, 기술 스택 입력</p>
                <p>3. GitHub URL 등록 시 Repository 자동 연결 및 README · package.json 분석 시작</p>
                <p className="font-medium text-foreground">모범 사례: 프로젝트 1개 = GitHub repo 1개, 기술 스택을 미리 입력해 Knowledge Graph에 반영</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">개발 중 — Project Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <Table
                  headers={['탭', '할 일']}
                  rows={[
                    ['개요', '프로젝트 상태 · 메타 확인'],
                    ['Repository', 'Sync로 GitHub 최신 정보(커밋, 이슈, PR) 반영'],
                    ['Documents', '기술명세서, API 문서, 설계 노트 업로드 (MD/PDF)'],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">작업 종료 후 — Reflection + Hermes Sync</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Reflection</strong> — AI 회고: 잘된 점, 어려웠던 점, 개선점, Skill 자동 추출</p>
                <p><strong className="text-foreground">Hermes Sync</strong> — 프로젝트 요약을 Hermes MEMORY.md에 반영</p>
                <p className="font-medium text-foreground">모범 사례: 스프린트·기능 단위 완료 시마다 Reflection 실행</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="3. 지식 축적 레이어">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Memory</CardTitle></CardHeader>
              <CardContent>
                <Table
                  headers={['타입', '용도', '예시']}
                  rows={[
                    ['session', '이번 세션 맥락', '오늘 auth 모듈 리팩터링 중'],
                    ['conversation', '대화 인사이트', 'Claude가 제안한 패턴'],
                    ['project', '프로젝트 규칙·결정', 'tabs, 120자 line width'],
                    ['developer', '나의 선호·습관', 'TypeScript 우선'],
                    ['long_term', '장기 기억', 'Reflection 결과 (자동 생성)'],
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Skills</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Reflection에서 자동 생성된 Skill을 검토하고, Supabase Login · React CRUD 등 반복 패턴을 등록하세요.
                새 프로젝트 시작 전 Skills 페이지에서 관련 Skill을 검색하는 것이 좋습니다.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Knowledge Graph</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Repository Sync → project —uses→ technology · 문서 업로드 → project —has→ document ·
                Skill 생성 → project —produced→ skill. 비슷한 기술 스택 프로젝트의 공통 Skill을 그래프에서 찾으세요.
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Search</CardTitle></CardHeader>
              <CardContent>
                <Table
                  headers={['모드', '언제 쓸까']}
                  rows={[
                    ['keyword', '정확한 키워드 · 파일명 검색'],
                    ['semantic', '의미 기반 검색 (인증 관련 경험)'],
                    ['hybrid', '일반적으로 가장 추천'],
                    ['rag', '질문에 대한 AI 답변까지 필요할 때'],
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="4. Hermes Agent 연동">
          <Card>
            <CardContent className="space-y-3 pt-6 font-mono text-xs text-muted-foreground">
              <p>hermes mcp add dkos --command npx --args tsx src/modules/hermes/mcp-server/index.ts</p>
              <p>hermes chat</p>
            </CardContent>
          </Card>
          <Table
            headers={['도구', '설명']}
            rows={[
              ['list_projects', '프로젝트 목록'],
              ['get_project', '프로젝트 상세'],
              ['search_documents', '문서 검색'],
              ['search_memory', '메모리 검색'],
              ['get_skills', 'Skill 목록'],
              ['create_memory', '메모리 추가'],
            ]}
          />
        </Section>

        <Section title="5. 환경 설정">
          <Card>
            <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
              <p>GITHUB_TOKEN — Repository Sync · OPENAI_API_KEY — Embedding</p>
              <p>ANTHROPIC_API_KEY — Reflection, 문서 요약</p>
              <p className="mt-2">실행 순서: docker compose up → uvicorn (8000) → npm run gateway (8787) → npm run dev</p>
              <p className="text-foreground">시맨틱 검색 · RAG는 PostgreSQL + pgvector 환경에서 완전히 동작합니다.</p>
            </CardContent>
          </Card>
        </Section>

        <Section title="6. 시나리오별 모범 사례">
          <div className="space-y-3 text-sm">
            <Card>
              <CardHeader><CardTitle className="text-base">새 사이드 프로젝트</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">
                Search → Skills 확인 → 프로젝트 등록 → spec.md 업로드 → 개발 → Repository Sync → Reflection → Hermes Sync
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">강의/블로그 준비</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">
                Documents · Reflection · Knowledge Graph 정리 → Memory에 핵심 3가지 추가 → Search rag 모드로 설명 초안 생성
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">팀 지식 공유</CardTitle></CardHeader>
              <CardContent className="text-muted-foreground">
                기술명세서 업로드 → project Memory에 컨벤션 기록 → 반복 작업은 Skill로 등록
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section title="7. 피해야 할 것">
          <Table
            headers={['하지 말 것', '이유']}
            rows={[
              ['프로젝트 없이 Memory만 쌓기', 'Project First 구조가 깨짐'],
              ['Reflection 없이 프로젝트 종료', '경험이 Skill · long_term Memory로 전환되지 않음'],
              ['GitHub Sync 없이 repo만 등록', 'README · 기술 스택 분석이 비어 있음'],
              ['API 키 없이 Reflection 기대', 'Gateway 경유 LLM 호출 필요'],
            ]}
          />
        </Section>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">한 줄 요약</CardTitle>
            <CardDescription className="text-base leading-relaxed text-foreground">
              프로젝트를 중심에 두고, 문서와 GitHub를 연결하고, 작업이 끝날 때마다 Reflection으로 회고하며,
              다음 프로젝트 전에 Search · Skills로 과거를 먼저 탐색하세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  )
}
