import type { Metadata } from "next"

import { BackLink, PageHeading } from "@/components/layout/PageTop"

import ClubSearch from "./ClubSearch"

/*
 * 동호회 찾아보기 (/clubs). 로그인한 앱 회원만 (DECIDE-18)
 * 기준: [[10 게스트 페이지 설계]] · [[14 웹 폴더 구조]]
 * 뒤로가기: 02 표의 "← 동호회 선택" = 내 동호회(/me, DECIDE-23)
 */
export const metadata: Metadata = { title: "동호회 찾아보기" }

export default function ClubsPage() {
  return (
    <main className="page-container py-6 md:py-8">
      <BackLink href="/me" label="내 동호회" />
      <PageHeading title="동호회 찾아보기" description="동호회를 둘러보고 게스트 참가를 신청할 수 있어요." />
      <div className="mt-6">
        <ClubSearch />
      </div>
    </main>
  )
}
