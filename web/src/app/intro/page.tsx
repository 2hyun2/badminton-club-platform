import Link from "next/link"
import SocialLoginButtons from "./SocialLoginButtons"

export default function IntroPage() {
  return (
    <div className="flex flex-col">
      <p className="text-body-sm font-semibold text-text-muted">AIS · ALL IN SHUTTLECOCK</p>
      <h1 className="mt-4 text-display text-text-main">내 동호회 생활을 더 편하게.</h1>
      <p className="mt-3 text-body text-text-muted">출석, 경기 기록, 공지를 한곳에서 확인하세요.</p>

      <div className="mt-8">
        <SocialLoginButtons />
      </div>

      <div className="mt-5 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border-main" />
        <span className="text-caption text-text-muted">또는</span>
        <span className="h-px flex-1 bg-border-main" />
      </div>

      <Link href="/guest" className="btn btn-ghost mt-5 w-full">
        게스트로 동호회 살펴보기
      </Link>

      <p className="mt-5 text-caption text-text-muted">
        계속하면 <Link href="/terms" className="text-brand underline underline-offset-2">이용약관</Link> 및{" "}
        <Link href="/privacy" className="text-brand underline underline-offset-2">개인정보 처리방침</Link>에 동의하는 것으로 봅니다.
      </p>
    </div>
  )
}
