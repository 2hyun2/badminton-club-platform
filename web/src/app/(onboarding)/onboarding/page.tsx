import type { Metadata } from "next"

import { PageHeading } from "@/components/layout/PageTop"

import OnboardingForm from "./OnboardingForm"

/*
 * 온보딩 (/onboarding): 처음 간편 로그인한 사람이 기본 정보와 동의를 입력하는 화면
 * 기준: [[03 인증 및 계정 정책]] · [[12 유저 데이터 설계]] · DECIDE-17·18
 *  - 소셜 로그인 제공처의 이름은 쓰지 않고 모든 정보를 직접 입력받는다
 *  - 필수: 이름·성별·생년월일·배드민턴 경력·급수 / 선택: 별명·사는 곳 / 알림 수신 동의
 *  - 전화번호는 받지 않는다. 프로필 사진은 설정 > 내 정보에서
 * 뒤로가기는 두지 않는다. 가입을 시작하는 첫 화면이다.
 * TODO: 실제 인증 연결 뒤, 기존 회원은 이 화면을 건너뛰고 동호회 선택으로 보낸다
 */
export const metadata: Metadata = { title: "기본 정보 입력" }

export default function OnboardingPage() {
  return (
    <main className="page-container py-6 md:py-8">
      {/* 입력 폼: 본문 40rem, 왼쪽 정렬 (DECIDE-09) */}
      <div className="max-w-[40rem]">
        <PageHeading
          title="기본 정보 입력"
          description="동호회 활동에 쓰는 정보예요. 처음 한 번만 입력하면 돼요."
        />
        <OnboardingForm />
      </div>
    </main>
  )
}
