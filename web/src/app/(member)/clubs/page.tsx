import type { Metadata } from "next"

import { PageHeading } from "@/components/layout/PageTop"

import ClubSearch from "./ClubSearch"

/*
 * 동호회 찾아보기 (/clubs). 로그인한 앱 회원만 (DECIDE-18)
 * 기준: [[10 게스트 페이지 설계]] · [[14 웹 폴더 구조]]
 * TODO: 뒤로가기는 "← 동호회 선택"(02 문서)인데, 동호회 선택 화면 경로가 아직 정해지지 않아 두지 않았다.
 */
export const metadata: Metadata = { title: "동호회 찾아보기" }

export default function ClubsPage() {
  return (
    <main className="page-container py-6 md:py-8">
      <PageHeading title="동호회 찾아보기" description="동호회를 둘러보고 게스트 참가를 신청할 수 있어요." />
      <div className="mt-6">
        <ClubSearch />
      </div>
    </main>
  )
}
