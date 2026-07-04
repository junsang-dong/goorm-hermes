export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card px-8 py-6 text-sm text-muted-foreground">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Goorm Hermes</p>
          <p className="max-w-xl leading-relaxed">
            Hermes Agent 기반 Developer Knowledge OS. 프로젝트·문서·Memory·Skill을 Project First
            아키텍처로 통합하여, 개발 경험이 시간이 지날수록 축적·재사용되는 AI 개발 운영체제입니다.
          </p>
        </div>
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 md:gap-8">
          <div>
            <p className="mb-1 font-medium text-foreground">프로젝트 정보</p>
            <ul className="space-y-0.5">
              <li>개발: 2026년 7월</li>
              <li>개발자: Jun.NextPlatform</li>
              <li>생태계: NextPlatform</li>
            </ul>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">기술 스택</p>
            <ul className="space-y-0.5">
              <li>React · Vite · TypeScript · Tailwind</li>
              <li>FastAPI · SQLAlchemy · PostgreSQL</li>
              <li>Hermes · Multi LLM SDK · AI Gateway</li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs">© 2026 Goorm Hermes · Designed for NextPlatform Ecosystem</p>
    </footer>
  )
}
