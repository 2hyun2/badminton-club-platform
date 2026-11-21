import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import StatusBadge from "@/components/ui/StatusBadge"
import { CLUB_EVENT_STATUS, clubSitePath, publishedOnly, sortClubEvents } from "@/features/club-site/constants"

import { EmptyNote, PAGE_FALLBACK, SitePage, loadClub, requireMenu } from "../_shared"

/*
 * 이벤트 목록 (/clubs/[clubSlug]/events) (DECIDE-21: 목록 → 상세 게시판)
 * 대회·친선전·모임처럼 기간이 있는 행사. 진행 중 → 예정 → 종료 순서
 */
export const metadata: Metadata = { title: "이벤트" }

type Params = PageProps<"/clubs/[clubSlug]/events">["params"]

export default function ClubEventsPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubEvents params={params} />
    </Suspense>
  )
}

async function ClubEvents({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "events")
  const events = sortClubEvents(publishedOnly(site.events))

  return (
    <SitePage title="이벤트" description="대회, 친선전, 모임 소식이에요.">
      {events.length > 0 ? (
        <ul className="grid gap-3 md:grid-cols-2">
          {events.map((event) => (
            <li key={event.id}>
              <Link href={clubSitePath(club.slug, `/events/${event.id}`)} className="card card-link block h-full">
                <StatusBadge
                  label={CLUB_EVENT_STATUS[event.status].label}
                  className={CLUB_EVENT_STATUS[event.status].className}
                />
                <span className="mt-2 block text-heading-3">{event.title}</span>
                <span className="mt-1 block text-body-sm text-text-muted">
                  {event.periodLabel} · {event.placeLabel}
                </span>
                <span className="mt-2 block text-body">{event.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote>아직 이벤트가 없어요.</EmptyNote>
      )}
    </SitePage>
  )
}
