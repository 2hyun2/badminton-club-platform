import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import RichTextView from "@/components/editor/RichTextView"
import { BackLink } from "@/components/layout/PageTop"
import { clubSitePath, publishedOnly } from "@/features/club-site/constants"
import { CLUB_SEARCH_ITEMS, getClubSite } from "@/mocks"

import { PAGE_FALLBACK, loadClub, requireMenu } from "../../_shared"

/* 공지사항 상세 (/clubs/[clubSlug]/notices/[noticeId]). 목록으로 돌아가는 BackLink를 둔다 (DECIDE-13) */
/** 글 제목을 페이지 제목으로. 비공개·없는 글은 메뉴 이름만 */
export async function generateMetadata({ params }: PageProps<"/clubs/[clubSlug]/notices/[noticeId]">): Promise<Metadata> {
  const { clubSlug, noticeId } = await params
  const notice = publishedOnly(getClubSite(clubSlug).notices).find((item) => item.id === noticeId)
  return { title: notice ? notice.title : "공지사항" }
}

export function generateStaticParams() {
  return CLUB_SEARCH_ITEMS.flatMap((club) =>
    publishedOnly(getClubSite(club.slug).notices).map((notice) => ({ clubSlug: club.slug, noticeId: notice.id })),
  )
}

type Params = PageProps<"/clubs/[clubSlug]/notices/[noticeId]">["params"]

export default function ClubNoticePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubNotice params={params} />
    </Suspense>
  )
}

async function ClubNotice({ params }: { params: Params }) {
  const { clubSlug, noticeId } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "notices")
  // 비공개 글은 주소로 들어와도 404. 같은 동호회 안에서만 찾는다
  const notice = publishedOnly(site.notices).find((item) => item.id === noticeId)
  if (!notice) notFound()

  return (
    <main className="page-container py-6 md:py-8">
      <BackLink href={clubSitePath(club.slug, "/notices")} label="공지사항 목록" />
      <article className="mt-4 max-w-[48rem]">
        <h1 className="text-heading-1">
          {notice.isPinned && <span className="mr-1 text-brand">[필독]</span>}
          {notice.title}
        </h1>
        <p className="mt-2 text-body-sm tabular-nums text-text-muted">{notice.dateLabel}</p>
        <RichTextView content={notice.body} className="mt-6 border-t border-border-main pt-6" />
      </article>
    </main>
  )
}
