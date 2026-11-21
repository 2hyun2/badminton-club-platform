import type { Metadata } from "next"
import { Suspense } from "react"

import { CLUB_SEARCH_ITEMS } from "@/mocks"

import ClubSiteNav from "./ClubSiteNav"
import { loadClub } from "./_shared"

/*
 * 동호회 홈페이지 공통 틀 (DECIDE-21)
 *  - 로그인 없이 누구나 본다. 가입·게스트 신청 버튼을 누를 때만 로그인
 *  - 머리글(동호회 이름 + 메뉴) / 본문 / 바닥글(동호회 이름·주소)
 * Cache Components: generateStaticParams로 목업 동호회를 미리 만들고, params는 Suspense 안에서 읽는다
 */
export function generateStaticParams() {
  return CLUB_SEARCH_ITEMS.map((club) => ({ clubSlug: club.slug }))
}

/**
 * 동호회마다 따로 쓰는 메타데이터. 하위 페이지 제목 뒤에 동호회 이름이 붙는다
 * 예: 홈 "한빛 배드민턴", 공지사항 "공지사항 · 한빛 배드민턴"
 */
export async function generateMetadata({ params }: LayoutProps<"/clubs/[clubSlug]">): Promise<Metadata> {
  const { clubSlug } = await params
  const { club } = loadClub(clubSlug)
  return {
    title: { template: `%s · ${club.name}`, default: club.name },
    // 설명: 동호회 한 줄 소개. 소개 글 첫 문단은 인사말인 경우가 많아 쓰지 않는다
    description: club.summary,
  }
}

export default function ClubSiteLayout({ children, params }: LayoutProps<"/clubs/[clubSlug]">) {
  return (
    <div className="-my-6 flex min-h-dvh flex-col">
      <Suspense fallback={<div className="min-h-16 border-b border-border-main bg-surface" />}>
        <SiteHeader params={params} />
      </Suspense>
      <div className="flex-1">{children}</div>
      <Suspense fallback={null}>
        <SiteFooter params={params} />
      </Suspense>
    </div>
  )
}

async function SiteHeader({ params }: { params: LayoutProps<"/clubs/[clubSlug]">["params"] }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  return <ClubSiteNav clubSlug={club.slug} clubName={club.name} hiddenMenus={site.hiddenMenus} />
}

async function SiteFooter({ params }: { params: LayoutProps<"/clubs/[clubSlug]">["params"] }) {
  const { clubSlug } = await params
  const { club } = loadClub(clubSlug)

  // 도움 연락처는 02 기준대로 가입 안내 페이지 하단에만 둔다 (바닥글과 중복하지 않음)
  return (
    <footer className="mt-12 border-t border-border-main bg-surface">
      <div className="page-container py-8">
        <p className="text-body font-bold">{club.name}</p>
        <p className="mt-1 text-body-sm text-text-muted">
          {club.venueName} · {club.venueAddress}
        </p>
      </div>
    </footer>
  )
}
