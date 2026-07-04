# 프로덕션 배포 — 전체 기능 활성화

이 문서는 Vercel에 배포된 **프론트엔드**에 백엔드·Gateway·DB를 연결하여 Goorm Hermes의 **모든 기능**을 활성화하는 가이드입니다.

## 현재 상태

| 구성요소 | 상태 | URL |
|----------|------|-----|
| Frontend | ✅ 배포됨 | https://goorm-260703-hermes-assistant-v1.vercel.app |
| FastAPI | ⏳ 필요 | — |
| AI Gateway | ⏳ 필요 | — |
| PostgreSQL | ⏳ 필요 | — |

프론트엔드만 배포된 상태에서는 UI는 보이지만, 프로젝트 생성·문서 업로드·검색·AI 분석 등 **API 의존 기능은 동작하지 않습니다.**

---

## 배포 아키텍처 (목표)

```
사용자 브라우저
    │
    ▼
[Vercel] React SPA ──VITE_API_URL──▶ [Railway] FastAPI (:8000)
                                          │              │
                                          │              ▼
                                          │         [Neon] PostgreSQL + pgvector
                                          │
                                          └────GATEWAY_URL────▶ [Railway] AI Gateway (:8787)
                                                                          │
                                                                          ▼
                                                                    OpenAI / Anthropic
```

---

## 배포 순서 (권장)

```
1. PostgreSQL (Neon) 생성 + pgvector 활성화
2. FastAPI (Railway) 배포 + 환경 변수 설정
3. AI Gateway (Railway) 배포 + 환경 변수 설정
4. Vercel 환경 변수 설정 + Redeploy
5. 동작 확인
```

> **순서가 중요합니다.** FastAPI는 `GATEWAY_URL`이 필요하고, Gateway는 API 키가 필요합니다.

---

## Step 1. PostgreSQL (Neon)

시맨틱 검색·embedding·RAG를 위해 **pgvector**가 포함된 PostgreSQL이 필요합니다.

### 1-1. Neon 프로젝트 생성

1. [neon.tech](https://neon.tech) 가입·로그인
2. **New Project** → 리전 선택 (Vercel `iad1`과 가까운 `US East` 권장)
3. 프로젝트 이름: `goorm-hermes` (임의)

### 1-2. pgvector 확장 활성화

Neon SQL Editor에서 실행:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1-3. 연결 문자열 복사

Neon 대시보드 → **Connection Details** → `postgresql://...` 형식 URL 복사

```
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

> FastAPI 시작 시 `init_db()`가 테이블을 자동 생성하고 pgvector 확장을 확인합니다. 별도 Alembic 마이그레이션 실행은 초기 배포에 필수는 아닙니다.

### 대안: Supabase / Railway PostgreSQL

| 플랫폼 | pgvector | 비고 |
|--------|----------|------|
| [Neon](https://neon.tech) | ✅ | 서버리스, 무료 티어 |
| [Supabase](https://supabase.com) | ✅ | Dashboard에서 extension 활성화 |
| [Railway](https://railway.app) | ✅ | 같은 프로젝트에 API와 함께 배포 가능 |

---

## Step 2. FastAPI (Railway)

### 2-1. Railway 프로젝트 생성

1. [railway.app](https://railway.app) 로그인
2. **New Project** → **Deploy from GitHub repo**
3. `junsang-dong/goorm-hermes` 선택

### 2-2. 서비스 설정

Railway가 모노레포를 감지하면 Python + Node가 함께 설치될 수 있습니다. **FastAPI 전용 서비스**로 분리하는 것을 권장합니다.

| 설정 | 값 |
|------|-----|
| **Root Directory** | `/` (기본) |
| **Start Command** | `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT` |
| **Builder** | Nixpacks (Python 감지) |

### 2-3. 환경 변수

Railway → 서비스 → **Variables**:

```env
DATABASE_URL=postgresql://...   # Step 1에서 복사
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GITHUB_TOKEN=ghp_...            # 선택 (GitHub 연동 시 권장)
GATEWAY_URL=https://...         # Step 3 완료 후 Gateway URL로 업데이트
UPLOAD_DIR=/tmp/uploads
```

> **주의:** Step 3 Gateway 배포 전에는 `GATEWAY_URL`을 임시로 두고, Gateway URL 확정 후 업데이트하세요.

### 2-4. 공개 URL 발급

Railway → 서비스 → **Settings** → **Networking** → **Generate Domain**

예: `https://goorm-hermes-api-production.up.railway.app`

### 2-5. 헬스 체크

```bash
curl https://goorm-hermes-api-production.up.railway.app/health
# → {"status":"ok"}
```

---

## Step 3. AI Gateway (Railway)

### 3-1. 같은 Railway 프로젝트에 서비스 추가

1. **+ New Service** → **GitHub Repo** (동일 repo)
2. Gateway 전용 서비스로 분리

| 설정 | 값 |
|------|-----|
| **Start Command** | `npm run gateway` |
| **Builder** | Nixpacks (Node.js 감지) |

### 3-2. 환경 변수

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GATEWAY_PORT=$PORT
```

> Railway는 `$PORT`를 자동 주입합니다. Gateway 코드는 `GATEWAY_PORT` 환경 변수를 읽습니다.

### 3-3. 공개 URL 발급

예: `https://goorm-hermes-gateway-production.up.railway.app`

### 3-4. FastAPI에 Gateway URL 반영

Railway FastAPI 서비스의 `GATEWAY_URL`을 위 URL로 업데이트 후 재배포:

```env
GATEWAY_URL=https://goorm-hermes-gateway-production.up.railway.app
```

### 3-5. Gateway 동작 확인

```bash
curl -X POST https://goorm-hermes-gateway-production.up.railway.app/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"input":"hello"}'
```

---

## Step 4. Vercel 프론트엔드 연결

프론트엔드는 이미 배포되어 있습니다. 백엔드 URL만 연결하면 됩니다.

### 방법 A — 환경 변수 (권장)

1. [Vercel 대시보드](https://vercel.com/jay-nextplatform/goorm-260703-hermes-assistant-v1) → **Settings** → **Environment Variables**
2. 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://goorm-hermes-api-production.up.railway.app` | Production, Preview, Development |

3. **Deployments** → 최신 배포 → **Redeploy**

### 방법 B — vercel.json API 프록시

`VITE_API_URL`을 비워 두고, `vercel.json`에 프록시를 추가합니다:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://goorm-hermes-api-production.up.railway.app/api/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

이 방법은 API URL을 프론트엔드 빌드에 bake하지 않아, 백엔드 URL 변경 시 프론트엔드 재빌드 없이 `vercel.json`만 수정하면 됩니다.

변경 후 Git push → Vercel 자동 재배포.

### Vercel CLI로 환경 변수 설정

```bash
vercel env add VITE_API_URL production
# 프롬프트에 Railway FastAPI URL 입력

vercel --prod
```

---

## Step 5. 동작 확인 체크리스트

배포 완료 후 아래 항목을 순서대로 확인하세요.

- [ ] `GET {API_URL}/health` → `{"status":"ok"}`
- [ ] Vercel 사이트에서 대시보드 로드 (빈 데이터 OK)
- [ ] **예시 프로젝트 적용** → 프로젝트 생성 성공
- [ ] **GitHub URL로 프로젝트 생성** → 미리보기·생성 성공
- [ ] 프로젝트 상세 → **Repository Sync** 실행
- [ ] 문서 업로드 (Markdown/PDF)
- [ ] Search — keyword 모드 결과 확인
- [ ] Search — semantic/hybrid 모드 (PostgreSQL + pgvector 필요)
- [ ] Reflection 실행
- [ ] Knowledge Graph 노드 표시

### 브라우저 개발자 도구로 확인

Network 탭에서 API 요청 URL이 `localhost:8000`이 아닌 **Railway URL** 또는 **같은 도메인 `/api`**인지 확인하세요.

`localhost:8000`으로 요청되면 `VITE_API_URL` 미설정 또는 Redeploy 필요입니다.

---

## CORS

현재 FastAPI는 `allow_origins=["*"]`로 설정되어 있어 Vercel 도메인에서 별도 CORS 설정 없이 동작합니다.

프로덕션에서 origin을 제한하려면 `src/api/main.py`를 수정하세요:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://goorm-260703-hermes-assistant-v1.vercel.app",
        "http://localhost:5191",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Render / Fly.io 대안

Railway 대신 다른 플랫폼을 사용할 수 있습니다.

### Render (FastAPI)

| 설정 | 값 |
|------|-----|
| Environment | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT` |

### Fly.io (FastAPI)

```bash
fly launch
fly secrets set DATABASE_URL=... OPENAI_API_KEY=... ANTHROPIC_API_KEY=...
fly deploy
```

Gateway도 별도 Fly 앱 또는 Render Web Service로 배포합니다.

---

## 비용 참고 (무료 티어)

| 서비스 | 무료 티어 | 비고 |
|--------|-----------|------|
| Vercel | ✅ Hobby | 프론트엔드 |
| Neon | ✅ 0.5 GB | PostgreSQL |
| Railway | ⚠️ 제한적 | $5 크레딧/월 (변동 가능) |
| Render | ✅ Free tier | 콜드 스타트 있음 |

---

## 주의사항

1. **SQLite는 프로덕션에서 사용 불가** — Vercel·Railway는 ephemeral 파일시스템이므로 PostgreSQL 필수
2. **API 키는 백엔드·Gateway에만** — Vercel `VITE_*` 변수는 클라이언트에 노출됨 (URL만 설정)
3. **문서 업로드 저장소** — Railway는 재시작 시 `/tmp` 데이터가 사라질 수 있음. 프로덕션에서는 S3/R2 등 외부 스토리지 연동 권장 (Phase 3)
4. **Serverless Functions 미지원** — 현재 FastAPI는 long-running 서버 전제. Vercel Functions로 이전하려면 별도 어댑터 작업 필요
5. **Gateway와 FastAPI는 같은 리전**에 배치하면 latency가 줄어듭니다

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| UI는 보이나 데이터 없음/오류 | 백엔드 미연결 | `VITE_API_URL` 설정 후 Redeploy |
| `Failed to fetch` / CORS 오류 | API URL 오타 또는 HTTPS 혼용 | URL 확인, `https://` 사용 |
| 시맨틱 검색 실패 | pgvector 미활성화 | Neon에서 `CREATE EXTENSION vector` |
| Embedding 오류 | Gateway 미배포 또는 `GATEWAY_URL` 오류 | Gateway URL·API 키 확인 |
| GitHub sync 실패 | `GITHUB_TOKEN` 없음 또는 rate limit | Personal Access Token 설정 |
| 502 Bad Gateway | Railway 서비스 크래시 | Railway 로그 확인, `DATABASE_URL` 검증 |

---

## 다음 단계 (Phase 3)

전체 기능 활성화 후 고려할 개선 사항:

- 문서 업로드 S3/R2 스토리지 연동
- 커스텀 도메인 (`goorm-hermes.example.com`)
- CI/CD — GitHub Actions로 테스트 자동화
- 모니터링 — Railway/Render 헬스 체크 알림

관련 문서: [아키텍처](./architecture.md) · [환경 변수](./environment-variables.md) · [로컬 개발](./local-development.md)
