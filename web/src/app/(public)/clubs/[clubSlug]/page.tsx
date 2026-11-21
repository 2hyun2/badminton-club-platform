import { CalendarDays, MapPin } from "lucide-react"
import Link from "next/link"
import { Suspense, type ReactNode } from "react"

import StatusBadge from "@/components/ui/StatusBadge"
import {
  CLUB_EVENT_STATUS,
  DEFAULT_JOIN_GUIDE,
  HELP_CONTACT_ACTIONS,
  clubSitePath,
  isMenuVisible,
  publishedOnly,
  sortClubEvents,
  sortClubNotices,
} from "@/features/club-site/constants"
import { GUEST_SESSIONS } from "@/mocks"

import BannerSlider from "./BannerSlider"
import VenueActions from "./VenueActions"
import { EmptyNote, JoinActions, PAGE_FALLBACK, SectionHeading, loadClub } from "./_shared"

/*
 * 동호회 홈페이지 · 홈 (/clubs/[clubSlug]) (DECIDE-21)
 * 홈 한 페이지에 모든 메뉴 내용을 세로로 이어서 보여 준다. 더 자세히 볼 때만 각 메뉴 페이지로 이동
 * 순서(UNDEF-41): 배너 → 신청 버튼 → 동호회 소개 → 공지사항 → 이벤트 → 운동 일정 → 오시는 길 → 가입 안내
 * 운영진이 숨긴 메뉴의 영역은 홈에서도 뺀다 (메뉴 단위 공개 설정)
 */

const HOME_LIST_LIMIT = 3
const HOME_SESSION_LIMIT = 6

type Params = PageProps<"/clubs/[clubSlug]">["params"]

export default function ClubSiteHomePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubSiteHome params={params} />
    </Suspense>
  )
}

/** 홈의 영역 하나. 영역 사이는 구분선으로 나눈다 */
function HomeSection({ title, moreHref, moreLabel, children }: { title: string; moreHref: string; moreLabel?: string; children: ReactNode }) {
  return (
    <section className="border-t border-border-main py-10">
      <SectionHeading title={title} moreHref={moreHref} moreLabel={moreLabel} />
      <div className="mt-4">{children}</div>
    </section>
  )
}

async function ClubSiteHome({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  const show = (key: Parameters<typeof isMenuVisible>[1]) => isMenuVisible(site, key)

  // 글 단위 공개 설정: 공개한 글만
  const notices = sortClubNotices(publishedOnly(site.notices)).slice(0, HOME_LIST_LIMIT)
  // 홈에는 끝난 이벤트를 올리지 않는다
  const events = sortClubEvents(publishedOnly(site.events).filter((event) => event.status !== "ended")).slice(
    0,
    HOME_LIST_LIMIT,
  )
  const sessions = (GUEST_SESSIONS[club.slug] ?? []).slice(0, HOME_SESSION_LIMIT)
  const publishedBanners = publishedOnly(site.banners)
  // 배너가 없으면 동호회 이름·한 줄 소개로 기본 배너 1장을 만든다
  const banners =
    publishedBanners.length > 0
      ? publishedBanners
      : [{ id: "default", isPublished: true, title: club.name, subtitle: club.summary, imageUrl: null, linkHref: null }]
  const contact = site.helpContact

  return (
    <main className="page-container py-6 md:py-8">
      <h1 className="sr-only">{club.name} 홈</h1>
      <BannerSlider banners={banners} />

      <div className="card my-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-body">
          {club.recruitment.membership.isOpen ? "지금 새 회원을 모집하고 있어요." : "지금은 가입 모집을 쉬고 있어요."}
        </p>
        <JoinActions club={club} />
      </div>

      {show("about") && (
        <HomeSection title="동호회 소개" moreHref={clubSitePath(club.slug, "/about")} moreLabel="자세히 보기">
          {/* 소개 글은 4줄까지만. 전체는 동호회 소개 페이지에서 */}
          <p className="line-clamp-4 whitespace-pre-line text-body">{site.introduction || club.summary}</p>
          {site.officers.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {site.officers.map((officer) => (
                <li key={officer.id} className="rounded-lg border border-border-main bg-surface px-3 py-2 text-body">
                  <span className="font-semibold text-brand">{officer.role}</span> {officer.name}
                </li>
              ))}
            </ul>
          )}
        </HomeSection>
      )}

      {show("notices") && (
        <HomeSection title="공지사항" moreHref={clubSitePath(club.slug, "/notices")}>
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
        </HomeSection>
      )}

      {show("events") && (
        <HomeSection title="이벤트" moreHref={clubSitePath(club.slug, "/events")}>
          {events.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-3">
              {events.map((event) => (
                <li key={event.id}>
                  <Link href={clubSitePath(club.slug, `/events/${event.id}`)} className="card card-link block h-full">
                    <StatusBadge
                      label={CLUB_EVENT_STATUS[event.status].label}
                      className={CLUB_EVENT_STATUS[event.status].className}
                    />
                    <span className="mt-2 block text-heading-3">{event.title}</span>
                    <span className="mt-1 block text-body-sm text-text-muted">{event.periodLabel}</span>
                    <span className="mt-2 block text-body">{event.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>진행 중이거나 예정된 이벤트가 없어요.</EmptyNote>
          )}
        </HomeSection>
      )}

      {show("schedule") && (
        <HomeSection title="운동 일정" moreHref={clubSitePath(club.slug, "/schedule")}>
          <p className="text-body">
            <span className="font-semibold">정기 운동</span> · {club.activitySummary}
          </p>
          {sessions.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <li key={session.id} className="card flex items-center gap-3">
                  <CalendarDays className="size-5 shrink-0 text-text-muted" />
                  <span className="text-body font-semibold">{session.dateLabel}</span>
                  <span className="text-body tabular-nums text-text-muted">{session.timeLabel}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyNote>공개된 운동 일정이 없어요.</EmptyNote>
            </div>
          )}
        </HomeSection>
      )}

      {show("location") && (
        <HomeSection title="오시는 길" moreHref={clubSitePath(club.slug, "/location")} moreLabel="자세히 보기">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-5 shrink-0 text-text-muted" />
            <span>
              <span className="block text-body font-semibold">{club.venueName}</span>
              <span className="block text-body text-text-muted">{club.venueAddress}</span>
            </span>
          </p>
          <div className="mt-4">
            <VenueActions venueName={club.venueName} address={club.venueAddress} location={club.venueLocation} />
          </div>
        </HomeSection>
      )}

      {show("join") && (
        <HomeSection title="가입 안내" moreHref={clubSitePath(club.slug, "/join")} moreLabel="자세히 보기">
          <p className="whitespace-pre-line text-body">{site.joinGuide || DEFAULT_JOIN_GUIDE}</p>
          <div className="mt-4">
            <JoinActions club={club} />
          </div>
          {/* 02: 가입·앱 사용 도움 연락처는 가입 안내 하단 */}
          {contact && (
            <p className="mt-6 flex flex-wrap items-center gap-3 border-t border-border-main pt-4">
              <span className="text-body-sm font-semibold text-text-muted">가입·앱 사용 도움</span>
              <a
                href={HELP_CONTACT_ACTIONS[contact.method].href(contact.value)}
                className="btn btn-ghost"
              >
                {HELP_CONTACT_ACTIONS[contact.method].label}
              </a>
            </p>
          )}
        </HomeSection>
      )}
    </main>
  )
}
