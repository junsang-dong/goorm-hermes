# Goorm Hermes

**Hermes Agent 기반 Developer Knowledge OS** — NextPlatform Ecosystem

React + Vite + FastAPI + PostgreSQL(pgvector) + [Hermes Agent](https://hermes-agent.nousresearch.com/docs) + Multi LLM SDK

> 프로젝트·문서·Memory·Skill을 Project First 아키텍처로 통합하여, 개발 경험이 시간이 지날수록 축적·재사용되는 AI 개발 운영체제입니다.

**Repository:** [github.com/junsang-dong/goorm-hermes](https://github.com/junsang-dong/goorm-hermes)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 브랜드명 | Goorm Hermes |
| 개발 | 2026년 7월 |
| 개발자 | Jun.NextPlatform |
| 생태계 | NextPlatform |

### 핵심 철학

- **Project First** — 모든 데이터는 Project → Repository → Document → Memory → Skill → Knowledge Graph로 연결
- **Memory First** — 새 작업 전 과거 경험(Search · Memory · Skills)을 먼저 탐색

---

## 주요 기능 (Phase 1 + 2)

### Phase 1 — Foundation

| 모듈 | 기능 |
|------|------|
| **Dashboard** | Developer Home — 최근 프로젝트, Memory, Skill, Reflection 위젯 |
| **Projects** | 프로젝트 CRUD, Catalog/Detail UI, GitHub URL 연동 |
| **Repository** | GitHub Sync — README, package.json, commits, issues, PR 분석 및 요약 |
| **Documents** | Markdown/PDF 업로드, 청킹, embedding, 요약·태그 자동 생성 |
| **Multi LLM SDK** | OpenAI / Claude / Gemini / Perplexity 통합 어댑터 |

### Phase 2 — Intelligence

| 모듈 | 기능 |
|------|------|
| **AI Gateway** | Express 서버 — Provider 라우팅, rate limit, 캐싱, embedding API |
| **Memory** | 5종 메모리(session/conversation/project/developer/long_term) CRUD + Hermes sync |
| **Skills** | SKILL.md 포맷 Skill Library, Reflection 연동 자동 생성 |
| **Reflection** | 작업 종료 AI 회고 → Memory · Skill 자동 추출 |
| **Knowledge Graph** | 프로젝트·기술·문서·Skill·경험 그래프 시각화 |
| **Search** | keyword / semantic / hybrid / RAG 통합 검색 |
| **Hermes** | Context sync, MCP Server (`list_projects`, `search_memory` 등) |
| **User Guide** | 앱 내 활용 가이드 (`/guide`) |

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, Vite 6, TypeScript, Tailwind CSS 4 |
| Backend | FastAPI, SQLAlchemy 2, Alembic |
| Database | PostgreSQL 16 + pgvector (프로덕션) / SQLite (로컬 개발 폴백) |
| AI | Hermes Runtime, Multi LLM SDK, Node.js AI Gateway |
| Embedding | OpenAI text-embedding-3-small (Gateway 경유) |

---

## Quick Start

### 1. 환경 변수

```bash
cp .env.example .env
# GITHUB_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY 등 설정
```

### 2. Database (프로덕션 — 시맨틱 검색 권장)

```bash
docker compose up -d
```

로컬에서 Docker 없이 빠르게 실행하려면 `.env`의 `DATABASE_URL`을 SQLite로 설정합니다 (기본값).

```
DATABASE_URL=sqlite:///./data/dkos.db
```

### 3. Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run api       # uvicorn --reload, http://localhost:8000
```

또는:

```bash
uvicorn src.api.main:app --reload --port 8000
```

> API 라우트 추가·수정 후에는 `--reload` 옵션으로 실행하거나 서버를 재시작해야 합니다.

### 4. AI Gateway

```bash
npm install
npm run gateway   # http://localhost:8787
```

### 5. Frontend

```bash
npm run dev       # http://localhost:5191
```

---

## 프로젝트 구조

```
src/
├── modules/
│   ├── dashboard/     # Developer Home, Sidebar, Footer
│   ├── project/       # Project Catalog & Detail
│   ├── memory/        # Memory Explorer
│   ├── skills/        # Skill Library
│   ├── knowledge/     # Knowledge Graph
│   ├── search/        # Unified Search
│   ├── guide/         # User Guide
│   ├── llm/           # Multi LLM SDK
│   ├── gateway/       # AI Gateway (Express)
│   └── hermes/        # MCP Server, agents stub
├── api/               # FastAPI (routers, services, models)
└── shared/            # UI components, types, API client
```

---

## Hermes Agent 연동

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes setup --portal
hermes mcp add dkos --command npx --args tsx src/modules/hermes/mcp-server/index.ts
```

MCP 도구: `list_projects`, `get_project`, `search_documents`, `search_memory`, `get_skills`, `create_memory`

---

## API Endpoints

| Endpoint | 설명 |
|----------|------|
| `GET/POST /api/v1/projects` | Project CRUD |
| `POST /api/v1/projects/preview-github` | GitHub URL로 프로젝트 메타 미리보기 |
| `POST /api/v1/repositories/{id}/sync` | GitHub sync |
| `POST /api/v1/documents/upload` | Document upload |
| `GET/POST /api/v1/memory` | Memory management |
| `GET/POST /api/v1/skills` | Skill library |
| `GET /api/v1/knowledge/graph` | Knowledge graph |
| `GET /api/v1/search?q=&mode=` | Unified search (keyword/semantic/hybrid/rag) |
| `POST /api/v1/reflection/run/{project_id}` | Reflection engine |
| `GET /api/v1/hermes/status` | Hermes status |

Gateway (`:8787`): `POST /v1/generate`, `POST /v1/stream`, `POST /v1/embeddings`

### 환경 변수 (LLM)

| 키 | 필수 여부 | 용도 |
|----|-----------|------|
| `OPENAI_API_KEY` | **필수** | Embedding (`text-embedding-3-small`) |
| `ANTHROPIC_API_KEY` | **필수** | 문서 요약, GitHub 분석, Reflection, RAG |
| `GOOGLE_API_KEY` | 선택 | Gateway Gemini 어댑터 (현재 백엔드 미사용) |
| `PERPLEXITY_API_KEY` | 선택 | Gateway Perplexity 어댑터 (현재 백엔드 미사용) |
| `GITHUB_TOKEN` | 선택 | GitHub API rate limit 완화 |

---

## 최근 업데이트 (2026-07)

### 추가 기능

| 기능 | 설명 |
|------|------|
| **예시 프로젝트 적용** | Project Catalog에서 Goorm Hermes 예시 데이터를 폼에 자동 입력 |
| **GitHub URL로 프로젝트 생성** | GitHub URL 입력 → README·package.json·언어·topics 분석 후 프로젝트 폼 자동 채움 |
| **User Guide** | `/guide` — 앱 내 활용 가이드 |
| **Footer** | 개발연월, 개발자, 기술스택, 프로젝트 개요 |
| **`npm run api`** | FastAPI 개발 서버 (`--reload` 포함) |

### GitHub URL 프로젝트 생성 흐름

1. Project Catalog → **GitHub URL로 프로젝트 생성** 카드에 URL 입력
2. `POST /api/v1/projects/preview-github` 호출
3. 이름·설명·기술 스택·배포 URL 자동 입력
4. **생성** 클릭 → Repository Sync 백그라운드 실행

---

## 오류 수정 및 개선 사항

개발 과정에서 다음 이슈를 확인하고 수정했습니다.

| 구분 | 내용 |
|------|------|
| **DB 로컬 폴백** | Docker/PostgreSQL 미설치 환경에서 SQLite로 기동 가능하도록 `database.py`, `config.py`, 모델 타입(JSON/Uuid) 조정 |
| **Python 3.9 호환** | `str \| None` union 타입 오류 → `Optional`/`from __future__ import annotations` 및 `eval_type_backport` 패키지 추가 |
| **모델 import** | `src/api/models/__init__.py`에서 `from .database` → `from ..database` 경로 수정 |
| **Background task** | 프로젝트 생성 시 GitHub sync 백그라운드 태스크가 공유 DB 세션을 사용하던 문제 → 독립 `SessionLocal` 세션으로 분리 |
| **Gateway import** | `gateway/server/index.ts` LLM 모듈 상대 경로 (`../llm` → `../../llm`) 수정 |
| **Knowledge Graph** | `react-force-graph-2d` ref 타입 불일치 TypeScript 오류 수정 |
| **Hermes agents stub** | `hermes/agents/index.ts`에 Python 문법이 들어가 있던 문제 → TypeScript stub으로 교체 |
| **시맨틱 검색** | SQLite 환경에서 pgvector 쿼리 스킵 처리 (`search_service.py`) |
| **브랜딩** | DKOS → **Goorm Hermes** (사이드바, 타이틀, Footer) |
| **UI** | Footer(개발정보·기술스택), User Guide 메뉴(`/guide`) 추가 |
| **405 Method Not Allowed** | `preview-github` API 추가 후 구버전 uvicorn 프로세스가 실행 중이던 문제 → `--reload`로 서버 재시작으로 해결 |
| **GitHub preview API** | `GitHubService.preview_project()` 및 `POST /api/v1/projects/preview-github` 엔드포인트 추가 |

---

## Vercel 배포 (Frontend)

Goorm Hermes는 **React 프론트엔드 + FastAPI 백엔드 + Node.js AI Gateway** 3계층 구조입니다. Vercel은 **프론트엔드 정적 빌드**에 적합하며, API·Gateway는 별도 호스팅이 필요합니다.

### 1. Vercel에 배포 가능한 것

- `npm run build`로 생성되는 `dist/` (React SPA)

### 2. 별도 호스팅이 필요한 것

| 서비스 | 권장 플랫폼 | 비고 |
|--------|-------------|------|
| FastAPI (`:8000`) | [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io) | PostgreSQL + pgvector 연동 |
| AI Gateway (`:8787`) | Railway, Render | API 키 보관 |
| PostgreSQL | [Neon](https://neon.tech), [Supabase](https://supabase.com), Railway | pgvector 확장 필요 |

### 3. Vercel 프로젝트 설정

1. [vercel.com](https://vercel.com) → GitHub `junsang-dong/goorm-hermes` 연결
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**

```
VITE_API_URL=https://your-api.railway.app
VITE_GATEWAY_URL=https://your-gateway.railway.app
```

6. **Rewrites** (`vercel.json` — SPA 라우팅):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 4. 배포 순서 (권장)

```
1. PostgreSQL (Neon/Supabase) 생성 + pgvector 활성화
2. FastAPI 배포 → DATABASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY 설정
3. AI Gateway 배포 → OPENAI_API_KEY, ANTHROPIC_API_KEY 설정
4. Vercel Frontend 배포 → VITE_API_URL, VITE_GATEWAY_URL을 2·3 URL로 설정
5. FastAPI CORS에 Vercel 도메인 추가 (예: https://goorm-hermes.vercel.app)
```

### 5. 주의사항

- Vercel **Serverless Functions**로 FastAPI를 대체하려면 추가 어댑터 작업이 필요합니다 (현재 구조는 long-running 서버 전제).
- SQLite 로컬 DB는 Vercel에서 사용 불가 — 프로덕션은 PostgreSQL 필수.
- API 키는 Vercel이 아닌 **Gateway/백엔드 서버**에만 설정하세요.

---

## 로드맵 (Phase 3+)

- GitHub Wiki / 블로그 / 강의자료 자동 생성
- 기술명세서(`docs/spec.md`) 버전 관리
- Multi-Agent Workflow (Planner, Coding, Document Agent)
- Self-Improving Developer OS

---

## License

MIT · © 2026 Goorm Hermes · Designed for NextPlatform Ecosystem
