import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { clubSitePath, publishedOnly, sortClubNotices } from "@/features/club-site/constants"

import { EmptyNote, PAGE_FALLBACK, SitePage, loadClub, requireMenu } from "../_shared"

/*
 * 공지사항 목록 (/clubs/[clubSlug]/notices) (DECIDE-21: 목록 → 상세 게시판)
 * 필독(고정) 공지를 맨 위, 나머지는 최근 것부터
 * TEMP: UNDEF-46 — 페이지 나누기 없음. 글이 많아지면 정한다
 */
export const metadata: Metadata = { title: "공지사항" }

type Params = PageProps<"/clubs/[clubSlug]/notices">["params"]

export default function ClubNoticesPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubNotices params={params} />
    </Suspense>
  )
}

async function ClubNotices({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "notices")
  const notices = sortClubNotices(publishedOnly(site.notices))

  return (
    <SitePage title="공지사항">
      {notices.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link
                href={clubSitePath(club.slug, `/notices/${notice.id}`)}
                className="card card-link flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-body font-semibold">
                  {notice.isPinned && <span className="mr-1 text-brand">[필독]</span>}
                  {notice.title}
                </span>
                <span className="shrink-0 text-body-sm tabular-nums text-text-muted">{notice.dateLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>아직 공지사항이 없어요.</EmptyNote>
      )}
    </SitePage>
  )
}
