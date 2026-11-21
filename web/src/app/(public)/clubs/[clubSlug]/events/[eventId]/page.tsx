import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import RichTextView from "@/components/editor/RichTextView"
import { BackLink } from "@/components/layout/PageTop"
import StatusBadge from "@/components/ui/StatusBadge"
import { CLUB_EVENT_STATUS, clubSitePath, publishedOnly } from "@/features/club-site/constants"
import { CLUB_SEARCH_ITEMS, getClubSite } from "@/mocks"

import { PAGE_FALLBACK, loadClub, requireMenu } from "../../_shared"

/* 이벤트 상세 (/clubs/[clubSlug]/events/[eventId]). 목록으로 돌아가는 BackLink를 둔다 (DECIDE-13) */
/** 글 제목을 페이지 제목으로. 비공개·없는 글은 메뉴 이름만 */
export async function generateMetadata({ params }: PageProps<"/clubs/[clubSlug]/events/[eventId]">): Promise<Metadata> {
  const { clubSlug, eventId } = await params
  const event = publishedOnly(getClubSite(clubSlug).events).find((item) => item.id === eventId)
  return { title: event ? event.title : "이벤트" }
}

export function generateStaticParams() {
  return CLUB_SEARCH_ITEMS.flatMap((club) =>
    publishedOnly(getClubSite(club.slug).events).map((event) => ({ clubSlug: club.slug, eventId: event.id })),
  )
}

type Params = PageProps<"/clubs/[clubSlug]/events/[eventId]">["params"]

export default function ClubEventPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubEvent params={params} />
    </Suspense>
  )
}

async function ClubEvent({ params }: { params: Params }) {
  const { clubSlug, eventId } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "events")
  // 비공개 글은 주소로 들어와도 404. 같은 동호회 안에서만 찾는다
  const event = publishedOnly(site.events).find((item) => item.id === eventId)
  if (!event) notFound()

  return (
    <main className="page-container py-6 md:py-8">
      <BackLink href={clubSitePath(club.slug, "/events")} label="이벤트 목록" />
      <article className="mt-4 max-w-[48rem]">
        <StatusBadge label={CLUB_EVENT_STATUS[event.status].label} className={CLUB_EVENT_STATUS[event.status].className} />
        <h1 className="mt-2 text-heading-1">{event.title}</h1>
        <dl className="card mt-4 grid gap-3 text-body sm:grid-cols-[5rem_1fr]">
          <dt className="font-semibold text-text-muted">일시</dt>
          <dd className="-mt-2 sm:mt-0">{event.periodLabel}</dd>
          <dt className="font-semibold text-text-muted">장소</dt>
          <dd className="-mt-2 sm:mt-0">{event.placeLabel}</dd>
        </dl>
        <RichTextView content={event.body} className="mt-6" />
      </article>
    </main>
  )
}
