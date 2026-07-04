# 아키텍처

Goorm Hermes는 **Project First** 철학에 따라 프로젝트·저장소·문서·Memory·Skill·Knowledge Graph를 하나의 개발 지식 운영체제로 통합합니다.

## 3계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                     │
│  포트: 5191 (로컬) / Vercel (프로덕션)                        │
│  src/modules/dashboard, project, memory, skills, ...         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (VITE_API_URL / /api)
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (FastAPI)                                           │
│  포트: 8000                                                  │
│  src/api/ — routers, services, models                        │
└──────────────┬───────────────────────────┬──────────────────┘
               │                           │
               │ SQLAlchemy                │ HTTP (GATEWAY_URL)
┌──────────────▼──────────┐   ┌──────────▼──────────────────┐
│  PostgreSQL + pgvector    │   │  AI Gateway (Express)        │
│  (프로덕션) / SQLite (로컬) │   │  포트: 8787                  │
│                           │   │  src/modules/gateway, llm/   │
└───────────────────────────┘   └──────────┬──────────────────┘
                                           │
                              ┌────────────┼────────────┐
                              ▼            ▼            ▼
                          OpenAI      Anthropic     Gemini / Perplexity
```

## 역할 분담

| 계층 | 기술 | 책임 |
|------|------|------|
| **Frontend** | React 19, Vite 6, Tailwind 4 | UI, 라우팅, API 클라이언트 (`src/shared/api.ts`) |
| **Backend** | FastAPI, SQLAlchemy 2 | REST API, DB, GitHub 연동, 비즈니스 로직 |
| **AI Gateway** | Node.js Express | LLM Provider 라우팅, embedding, rate limit, 캐싱 |
| **Database** | PostgreSQL + pgvector | 영구 저장, 벡터 검색 (시맨틱/RAG) |

## 프론트엔드 ↔ 백엔드 연결

| 환경 | API 연결 방식 |
|------|---------------|
| **로컬** | Vite `server.proxy` — `/api` → `localhost:8000` |
| **Vercel (방법 A)** | `VITE_API_URL` 환경 변수에 FastAPI URL 설정 |
| **Vercel (방법 B)** | `vercel.json` rewrites로 `/api` → Railway FastAPI 프록시 |

Gateway는 **프론트엔드가 직접 호출하지 않습니다.** FastAPI의 `GatewayService`가 `GATEWAY_URL`로 내부 호출합니다.

## 모듈 구조

```
src/
├── modules/
│   ├── dashboard/     # Developer Home, Sidebar, Footer
│   ├── project/       # Project Catalog & Detail
│   ├── memory/        # Memory Explorer
│   ├── skills/        # Skill Library
│   ├── knowledge/     # Knowledge Graph
│   ├── search/        # Unified Search
│   ├── guide/         # User Guide (/guide)
│   ├── llm/           # Multi LLM SDK
│   ├── gateway/       # AI Gateway (Express)
│   └── hermes/        # MCP Server
├── api/               # FastAPI
└── shared/            # UI components, API client
```

## 데이터 흐름 예시

### GitHub URL로 프로젝트 생성

1. 사용자가 GitHub URL 입력 (Frontend)
2. `POST /api/v1/projects/preview-github` (FastAPI)
3. `GitHubService`가 GitHub API로 README·package.json·topics 분석
4. 폼 자동 채움 → 프로젝트 생성 시 Repository Sync 백그라운드 실행

### 시맨틱 검색 (RAG)

1. `GET /api/v1/search?mode=rag` (Frontend → FastAPI)
2. `SearchService`가 Gateway로 query embedding 요청
3. pgvector로 유사 문서 검색
4. Gateway로 Claude 답변 생성
5. 결과 반환

> **주의:** 시맨틱 검색·embedding은 **PostgreSQL + pgvector**가 필요합니다. SQLite 로컬 폴백에서는 키워드 검색만 동작합니다.

## Hermes Agent 연동

로컬 개발 환경에서 Hermes MCP Server를 등록하면 Cursor/IDE에서 프로젝트·Memory·Skill을 조회할 수 있습니다.

```bash
hermes mcp add goorm-hermes --command npx --args tsx src/modules/hermes/mcp-server/index.ts
```

MCP 도구: `list_projects`, `get_project`, `search_documents`, `search_memory`, `get_skills`, `create_memory`
