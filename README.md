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
uvicorn src.api.main:app --reload --port 8000
```

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
| `POST /api/v1/repositories/{id}/sync` | GitHub sync |
| `POST /api/v1/documents/upload` | Document upload |
| `GET/POST /api/v1/memory` | Memory management |
| `GET/POST /api/v1/skills` | Skill library |
| `GET /api/v1/knowledge/graph` | Knowledge graph |
| `GET /api/v1/search?q=&mode=` | Unified search (keyword/semantic/hybrid/rag) |
| `POST /api/v1/reflection/run/{project_id}` | Reflection engine |
| `GET /api/v1/hermes/status` | Hermes status |

Gateway (`:8787`): `POST /v1/generate`, `POST /v1/stream`, `POST /v1/embeddings`

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

---

## 로드맵 (Phase 3+)

- GitHub Wiki / 블로그 / 강의자료 자동 생성
- 기술명세서(`docs/spec.md`) 버전 관리
- Multi-Agent Workflow (Planner, Coding, Document Agent)
- Self-Improving Developer OS

---

## License

MIT · © 2026 Goorm Hermes · Designed for NextPlatform Ecosystem
