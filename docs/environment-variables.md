# 환경 변수

Goorm Hermes에서 사용하는 환경 변수 목록입니다.

## 백엔드 (FastAPI)

`.env` 파일 또는 Railway/Render 환경 변수에 설정합니다.

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `DATABASE_URL` | 프로덕션 필수 | `sqlite:///./data/dkos.db` | PostgreSQL 연결 문자열. 프로덕션은 `postgresql://...` |
| `OPENAI_API_KEY` | **필수** | — | Embedding (`text-embedding-3-small`) |
| `ANTHROPIC_API_KEY` | **필수** | — | 문서 요약, GitHub 분석, Reflection, RAG (Claude) |
| `GITHUB_TOKEN` | 선택 | — | GitHub API rate limit 완화 |
| `GATEWAY_URL` | 프로덕션 필수 | `http://localhost:8787` | AI Gateway URL |
| `UPLOAD_DIR` | 선택 | `./data/uploads` | 문서 업로드 저장 경로 |
| `API_PORT` | 선택 | `8000` | FastAPI 포트 (로컬) |
| `HERMES_HOME` | 선택 | `~/.hermes` | Hermes Agent 홈 디렉터리 |
| `GOOGLE_API_KEY` | 선택 | — | Gateway Gemini 어댑터 (백엔드 미사용) |
| `PERPLEXITY_API_KEY` | 선택 | — | Gateway Perplexity 어댑터 (백엔드 미사용) |

### LLM 사용처

| 기능 | Provider | 모델 |
|------|----------|------|
| Embedding | OpenAI | `text-embedding-3-small` |
| 문서 요약·태그 | Claude | `claude-sonnet-4-6` |
| GitHub README 분석 | Claude | `claude-sonnet-4-6` |
| Reflection | Claude | `claude-sonnet-4-6` |
| RAG 답변 | Claude | `claude-sonnet-4-6` |

## AI Gateway (Node.js)

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `OPENAI_API_KEY` | **필수** | — | Embedding API |
| `ANTHROPIC_API_KEY` | **필수** | — | Claude generate/stream |
| `GATEWAY_PORT` | 선택 | `8787` | Gateway 리슨 포트 |
| `GOOGLE_API_KEY` | 선택 | — | Gemini 어댑터 |
| `PERPLEXITY_API_KEY` | 선택 | — | Perplexity 어댑터 |

## 프론트엔드 (Vite / Vercel)

빌드 시점에 주입됩니다 (`import.meta.env`).

| 변수 | 필수 | 기본값 | 설명 |
|------|------|--------|------|
| `VITE_API_URL` | 프로덕션 권장 | `''` (빈 문자열) | FastAPI URL. 미설정 시 같은 도메인 `/api` 사용 |

> `VITE_GATEWAY_URL`은 타입 정의에 있으나 **현재 프론트엔드에서 직접 사용하지 않습니다.** Gateway는 백엔드가 내부 호출합니다.

## 보안 주의사항

- `.env` 파일은 **절대 Git에 커밋하지 마세요** (`.gitignore`에 포함됨)
- API 키는 **Vercel이 아닌** 백엔드·Gateway 서버에만 설정
- Vercel에는 `VITE_API_URL`만 설정 (공개 URL이므로 키 노출 없음)

## 예시: 프로덕션 `.env` (백엔드)

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/goorm_hermes?sslmode=require
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...
GATEWAY_URL=https://goorm-hermes-gateway.railway.app
UPLOAD_DIR=/tmp/uploads
```

## 예시: Vercel 환경 변수

```
VITE_API_URL=https://goorm-hermes-api.railway.app
```
