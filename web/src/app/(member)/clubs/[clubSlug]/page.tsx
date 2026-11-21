import { CalendarDays } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { GENDER_LABELS } from "@/features/club/constants"
import { CLUB_SEARCH_ITEMS, GUEST_SESSIONS, findClub, isPublicField } from "@/mocks"

import { BackLink, PageHeading } from "@/components/layout/PageTop"
import StatusBadge from "@/components/ui/StatusBadge"

/*
 * 동호회 공개 홈페이지 (/clubs/[clubSlug])
 * 기준: [[09 JSON 데이터 모델]] Club — 가입 모집·게스트 신청은 독립 상태, 게스트가 닫히면 버튼 숨김
 *       [[02 UI 화면 흐름]] 뒤로가기(← 동호회 목록)
 * 로그인한 앱 회원만 보는 화면(DECIDE-18). DECIDE-08(비로그인 가입 신청)은 해당 없음
 * TEMP: DECIDE-07 주 행동 · UNDEF-17 연락처 미표시 · UNDEF-18 일정 3개
 * Cache Components: generateStaticParams로 공용 목업 동호회를 미리 만들고, params는 Suspense 안에서 읽는다.
 */
export const metadata: Metadata = { title: "동호회 공개 홈페이지" }

export function generateStaticParams() {
  return CLUB_SEARCH_ITEMS.map((club) => ({ clubSlug: club.slug }))
}

type Params = Promise<{ clubSlug: string }>

export default function DraftClubPublicPage({ params }: { params: Params }) {
  return (
    <main className="page-container py-6 md:py-8">
      <BackLink href="/clubs" label="동호회 목록" />
      {/* DECIDE-09: 왼쪽 시작선 고정. 1024px 이상은 본문 + 오른쪽 신청 카드 2단 */}
      <div>
        <Suspense fallback={<p className="mt-4 text-body text-text-muted">동호회 정보를 불러오는 중이에요.</p>}>
          <ClubPublicHome params={params} />
        </Suspense>
      </div>
    </main>
  )
}

async function ClubPublicHome({ params }: { params: Params }) {
  const { clubSlug } = await params
  const club = findClub(clubSlug)
  if (!club) notFound()

  const { membership, guest } = club.recruitment
  const sessions = (GUEST_SESSIONS[club.slug] ?? []).slice(0, 3)

  /* 반응형
   *  - 모바일·태블릿: 제목 → 신청 카드 → 기본 정보 → 일정 (신청을 먼저 보이게)
   *  - 1024px 이상: 왼쪽 본문 + 오른쪽 20rem 신청 카드(스크롤해도 따라옴)
   */
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-x-8">
      {/* 뒤로가기는 2단 그리드 밖(위)에 둔다. 그래야 PC 오른쪽 신청 카드가 제목과 같은 높이에서 시작한다 */}
      <div className="lg:col-start-1">
        <PageHeading title={club.name} description={club.summary} />
        {/* 상태 배지는 제목 영역 밖, 바로 아래에 둔다 */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
            {membership.isOpen ? (
              <StatusBadge label="가입 모집 중" className="border-brand bg-brand-subtle text-brand" />
            ) : (
              <StatusBadge label="가입 마감" className="border-border-strong bg-surface text-text-muted" />
            )}
            {guest.isOpen && (
              <StatusBadge label="게스트 신청 가능" className="border-success bg-success/10 text-success" />
            )}
        </div>
      </div>

      {/* TEMP: DECIDE-07 — 게스트가 열려 있으면 게스트 신청이 Primary, 가입 신청은 Secondary */}
      <section
        className="card mt-6 p-5 lg:sticky lg:top-16 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:mt-4"
      >
        {guest.isOpen || membership.isOpen ? (
          <div className="flex flex-col gap-3 md:flex-row lg:flex-col">
            {guest.isOpen && (
              <Link href={`/guest/submit/${club.slug}`} className="btn btn-primary w-full md:w-auto lg:w-full">
                게스트 참가 신청
              </Link>
            )}
            {membership.isOpen && (
              // TODO: 가입 신청 화면이 생기면 Link로 바꾼다. 지금은 연결할 화면이 없어 비활성
              <button
                type="button"
                disabled
                className={`btn w-full md:w-auto lg:w-full ${guest.isOpen ? "btn-secondary" : "btn-primary"}`}
              >
                가입 신청
              </button>
            )}
          </div>
        ) : (
          <p className="text-body">지금은 가입 신청과 게스트 신청을 받지 않아요.</p>
        )}
      </section>

      <section className="mt-8 lg:col-start-1">
        <h2 id="club-info" className="text-heading-2">
          기본 정보
        </h2>
        <dl className="card mt-3 grid gap-3 text-body sm:grid-cols-[7rem_1fr]">
          <dt className="font-semibold text-text-muted">지역</dt>
          <dd className="-mt-2 sm:mt-0">
            {club.region.sidoName} {club.region.sigunguName}
          </dd>
          <dt className="font-semibold text-text-muted">체육관</dt>
          <dd className="-mt-2 sm:mt-0">{club.venueName}</dd>
          <dt className="font-semibold text-text-muted">운동 시간</dt>
          <dd className="-mt-2 sm:mt-0">{club.activitySummary}</dd>
          {/* UNDEF-28: 동호회가 회원 수를 숨기면 줄 자체를 뺀다 */}
          {isPublicField(club.slug, "memberCount") && (
            <>
              <dt className="font-semibold text-text-muted">회원 수</dt>
              <dd className="-mt-2 tabular-nums sm:mt-0">{club.memberCount}명</dd>
            </>
          )}
          <dt className="font-semibold text-text-muted">가입 조건</dt>
          <dd className="-mt-2 sm:mt-0">
            {GENDER_LABELS[club.membershipCondition.gender]} · {club.membershipCondition.skillLevels.join(", ")}
          </dd>
          <dt className="font-semibold text-text-muted">가입 모집</dt>
          {/* DECIDE-12: 마감 예약 없음 → 날짜 없이 현재 상태만 */}
          <dd className="-mt-2 sm:mt-0">{membership.isOpen ? "모집 중" : "마감"}</dd>
        </dl>
      </section>

      <section className="mt-8 lg:col-start-1">
        <h2 id="club-sessions" className="text-heading-2">
          다가오는 운동
        </h2>
        {sessions.length > 0 ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {sessions.map((session) => (
              <li key={session.id} className="card flex items-center gap-3 py-3">
                <CalendarDays className="size-5 shrink-0 text-text-muted" />
                <span className="text-body font-semibold">{session.dateLabel}</span>
                <span className="text-body tabular-nums text-text-muted">{session.timeLabel}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="card mt-3 text-body text-text-muted">공개된 운동 일정이 없어요.</p>
        )}
      </section>
    </div>
  )
}
