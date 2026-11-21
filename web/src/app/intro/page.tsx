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

      {/* 17 인트로 화면 설계: 로그인 없이 들어가는 게스트 진입은 없다 (DECIDE-18) */}
      <p className="mt-5 text-caption text-text-muted">
        계속하면 <Link href="/terms" className="text-brand underline underline-offset-2">이용약관</Link> 및{" "}
        <Link href="/privacy" className="text-brand underline underline-offset-2">개인정보 처리방침</Link>에 동의하는 것으로 봅니다.
      </p>
    </div>
  )
}
