# Goorm Hermes — 개발자 문서

Goorm Hermes 프로젝트의 개발·배포·운영 가이드입니다.

## 문서 목록

| 문서 | 설명 |
|------|------|
| [아키텍처](./architecture.md) | 3계층 구조, 모듈 구성, 데이터 흐름 |
| [로컬 개발](./local-development.md) | 로컬 환경 설정 및 실행 방법 |
| [프로덕션 배포](./deployment.md) | **전체 기능 활성화** — DB · API · Gateway · Vercel 연동 |
| [환경 변수](./environment-variables.md) | `.env` 키 목록 및 필수/선택 구분 |
| [기술 명세](./spec.md) | Phase 1+2 모듈 명세 (버전 관리용) |

## 현재 배포 상태

| 구성요소 | 상태 | URL |
|----------|------|-----|
| Frontend (Vercel) | ✅ 배포됨 | https://goorm-260703-hermes-assistant-v1.vercel.app |
| FastAPI Backend | ⏳ 미배포 | — |
| AI Gateway | ⏳ 미배포 | — |
| PostgreSQL | ⏳ 미배포 | — |

> UI는 Vercel에서 동작하지만, **프로젝트·문서·검색·AI 기능**을 사용하려면 [프로덕션 배포](./deployment.md) 가이드를 따라 백엔드·Gateway·DB를 배포해야 합니다.

## 빠른 링크

- **Repository:** [github.com/junsang-dong/goorm-hermes](https://github.com/junsang-dong/goorm-hermes)
- **Vercel 대시보드:** [vercel.com/jay-nextplatform/goorm-260703-hermes-assistant-v1](https://vercel.com/jay-nextplatform/goorm-260703-hermes-assistant-v1)
