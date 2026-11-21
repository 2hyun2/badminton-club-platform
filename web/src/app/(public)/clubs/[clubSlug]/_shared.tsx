import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { isMenuVisible } from "@/features/club-site/constants"
import { findClub, getClubSite } from "@/mocks"
import type { ClubSite, ClubSiteMenuKey } from "@/types/club-site"
import type { ClubSearchItem } from "@/types/club"

/* 동호회 홈페이지 페이지들이 함께 쓰는 것 */

/** 주소의 동호회를 찾는다. 없으면 404 */
export function loadClub(clubSlug: string) {
  const club = findClub(clubSlug)
  if (!club) notFound()
  return { club, site: getClubSite(club.slug) }
}

/** 운영진이 숨긴 메뉴는 주소로 들어와도 404 (DECIDE-21 메뉴 단위 공개 설정) */
export function requireMenu(site: ClubSite, key: ClubSiteMenuKey) {
  if (!isMenuVisible(site, key)) notFound()
}

/** 메뉴 페이지의 본문 틀: 제목 + 설명. 홈페이지는 상단 메뉴가 있어 BackLink를 두지 않는다 (UNDEF-44) */
export function SitePage({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <main className="page-container py-8 md:py-10">
      <h1 className="text-heading-1">{title}</h1>
      {description && <p className="mt-2 text-body text-text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </main>
  )
}

/** 비어 있는 게시판·목록 안내 */
export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="card text-body text-text-muted">{children}</p>
}

export const PAGE_FALLBACK = <main className="page-container py-8 text-body text-text-muted">불러오는 중이에요.</main>

/** 가입·게스트 신청 버튼. 누르면 로그인이 필요하다 (DECIDE-21) */
export function JoinActions({ club }: { club: ClubSearchItem }) {
  const { membership, guest } = club.recruitment
  if (!membership.isOpen && !guest.isOpen) {
    return <p className="text-body text-text-muted">지금은 가입 신청과 게스트 신청을 받지 않아요.</p>
  }
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {guest.isOpen && (
        <Link href={`/me/guest/${club.slug}`} className="btn btn-primary">
          게스트 참가 신청
        </Link>
      )}
      {membership.isOpen && (
        // TODO: 가입 신청 화면이 생기면 Link로 바꾼다
        <button type="button" disabled className={`btn ${guest.isOpen ? "btn-secondary" : "btn-primary"}`}>
          가입 신청
        </button>
      )}
    </div>
  )
}

/** 섹션 제목 + [전체 보기]·[자세히 보기] */
export function SectionHeading({ title, moreHref, moreLabel = "전체 보기" }: { title: string; moreHref?: string; moreLabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-heading-2">{title}</h2>
      {moreHref && (
        <Link href={moreHref} className="text-body-sm font-semibold text-brand underline-offset-2 hover:underline">
          {moreLabel}
        </Link>
      )}
    </div>
  )
}
