import { CalendarDays } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { GUEST_SESSIONS } from "@/mocks"

import { EmptyNote, PAGE_FALLBACK, SitePage, loadClub, requireMenu } from "../_shared"

/*
 * 운동 일정 (/clubs/[clubSlug]/schedule) (DECIDE-21)
 * 정기 운동 시간 + 앞으로 2주 일정(DECIDE-19와 같은 범위)
 * TEMP: UNDEF-47 — 정기 운동 일정 데이터가 없어 게스트를 받는 일정 목록을 대신 보여 준다
 */
export const metadata: Metadata = { title: "운동 일정" }

type Params = PageProps<"/clubs/[clubSlug]/schedule">["params"]

export default function ClubSchedulePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubSchedule params={params} />
    </Suspense>
  )
}

async function ClubSchedule({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "schedule")
  const sessions = GUEST_SESSIONS[club.slug] ?? []

  return (
    <SitePage title="운동 일정">
      <section>
        <h2 className="text-heading-2">정기 운동</h2>
        <p className="card mt-3 text-body">
          {club.activitySummary} · {club.venueName}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-heading-2">앞으로 2주</h2>
        {sessions.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <li key={session.id} className="card flex items-center gap-3">
                <CalendarDays className="size-5 shrink-0 text-text-muted" />
                <span className="text-body font-semibold">{session.dateLabel}</span>
                <span className="text-body tabular-nums text-text-muted">{session.timeLabel}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyNote>공개된 운동 일정이 없어요.</EmptyNote>
          </div>
        )}
      </section>
    </SitePage>
  )
}
