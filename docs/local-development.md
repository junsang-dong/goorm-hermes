# 로컬 개발

로컬에서 Goorm Hermes 전체 스택을 실행하는 방법입니다.

## 사전 요구사항

- Node.js 20+
- Python 3.9+
- (선택) Docker — PostgreSQL + pgvector

## 1. 환경 변수 설정

```bash
cp .env.example .env
```

필수 키: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`  
자세한 목록은 [환경 변수](./environment-variables.md) 참고.

## 2. 의존성 설치

```bash
# Python
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Node.js
npm install
```

## 3. Database

### 옵션 A — Docker (시맨틱 검색 권장)

```bash
docker compose up -d
```

`.env` 설정:

```
DATABASE_URL=postgresql://dkos:dkos@localhost:5432/dkos
```

### 옵션 B — SQLite (빠른 시작)

`.env` 기본값 사용 (Docker 불필요):

```
DATABASE_URL=sqlite:///./data/dkos.db
```

> SQLite에서는 pgvector 기반 시맨틱/RAG 검색이 제한됩니다.

## 4. 서버 실행 (3개 터미널)

**터미널 1 — FastAPI**

```bash
source .venv/bin/activate
npm run api
# → http://localhost:8000
```

**터미널 2 — AI Gateway**

```bash
npm run gateway
# → http://localhost:8787
```

**터미널 3 — Frontend**

```bash
npm run dev
# → http://localhost:5191
```

## 5. 동작 확인

| URL | 확인 내용 |
|-----|-----------|
| http://localhost:5191 | 대시보드 UI |
| http://localhost:8000/health | `{"status":"ok"}` |
| http://localhost:8000/docs | FastAPI Swagger UI |
| http://localhost:8787 | Gateway (POST `/v1/generate` 등) |

## 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|------|------|------|
| `405 Method Not Allowed` | API 라우트 추가 후 서버 미재시작 | `npm run api` (`--reload`)로 재시작 |
| 포트 5191 사용 중 | 이전 Vite 프로세스 | `lsof -i :5191` 후 프로세스 종료 |
| 시맨틱 검색 결과 없음 | SQLite 사용 중 | Docker PostgreSQL로 전환 |
| Gateway 연결 실패 | Gateway 미실행 | `npm run gateway` 실행 확인 |
| `str \| None` 타입 오류 | Python 3.9 | `eval_type_backport` 설치 확인 (`requirements.txt` 포함) |

## npm 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | Vite 개발 서버 (5191) |
| `npm run api` | FastAPI + `--reload` (8000) |
| `npm run gateway` | AI Gateway (8787) |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run mcp` | Hermes MCP Server |
