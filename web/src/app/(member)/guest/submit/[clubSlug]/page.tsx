import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CLUB_SEARCH_ITEMS, GUEST_SESSIONS, findClub } from "@/mocks"

import { BackLink, PageHeading } from "@/components/layout/PageTop"
import GuestApplyForm from "./GuestApplyForm"

/*
 * 게스트 참가 신청 (/guest/submit/[clubSlug]). 로그인한 앱 회원만 (DECIDE-16)
 * 기준: [[10 게스트 페이지 설계]] 4 — guest.isOpen이 false면 신청서 대신
 *       "현재 게스트 신청을 받지 않습니다." 안내 (직접 URL 진입 대비)
 * TEMP: UNDEF-21 — 일정이 없으면 신청서 대신 안내
 */
export const metadata: Metadata = { title: "게스트 참가 신청" }

export function generateStaticParams() {
  return CLUB_SEARCH_ITEMS.map((club) => ({ clubSlug: club.slug }))
}

type Params = Promise<{ clubSlug: string }>

export default function DraftGuestSubmitPage({ params }: { params: Params }) {
  return (
    <main className="page-container py-6 md:py-8">
      <div className="max-w-[40rem]">
        <Suspense fallback={<p className="text-body text-text-muted">신청서를 불러오는 중이에요.</p>}>
          <SubmitContent params={params} />
        </Suspense>
      </div>
    </main>
  )
}

async function SubmitContent({ params }: { params: Params }) {
  const { clubSlug } = await params
  const club = findClub(clubSlug)
  if (!club) notFound()

  const backHref = `/clubs/${club.slug}`
  const sessions = GUEST_SESSIONS[club.slug] ?? []

  if (!club.recruitment.guest.isOpen || sessions.length === 0) {
    return (
      <>
        <BackLink href={backHref} label="돌아가기" />
        <PageHeading title="게스트 참가 신청" />
        <div className="card mt-6 py-8 text-center">
          <p className="text-body font-semibold">
            {club.recruitment.guest.isOpen ? "신청 가능한 운동 일정이 없어요." : "현재 게스트 신청을 받지 않습니다."}
          </p>
          <p className="mt-2 text-body-sm text-text-muted">{club.name}의 다른 소식은 동호회 홈페이지에서 확인해 주세요.</p>
          <Link href={backHref} className="btn btn-secondary mt-5">
            동호회 홈페이지로
          </Link>
        </div>
      </>
    )
  }

  return <GuestApplyForm clubSlug={club.slug} clubName={club.name} sessions={sessions} />
}
