import { ChevronRight, Link2, Plus, Search } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { PageHeading } from "@/components/layout/PageTop"
import StatusBadge from "@/components/ui/StatusBadge"
import { MEMBERSHIP_ROLE_LABELS, myClubPath, sortMyMemberships } from "@/features/me/constants"
import { ME_WITH_CLUBS, ME_WITHOUT_CLUBS } from "@/mocks"
import type { MeSummary, MyMembership } from "@/types/me"

/*
 * 내 동호회 (/me) = 로그인·온보딩 뒤 첫 화면 (DECIDE-23, 02 전체 흐름의 "동호회 선택")
 *  - 소속이 하나여도 자동으로 들어가지 않고 항상 목록을 보여 준다. 마지막으로 들어간 동호회는 맨 위
 *  - 활동 중 → 회원용 동호회 내부(/me/clubs/[slug]). 가입 승인 대기 → 들어갈 수 없고 공개 홈페이지만
 *  - 소속 없음 → 동호회 만들기 · 초대 링크로 가입 · 동호회 찾아보기 (14 웹 폴더 구조)
 *  - 02 뒤로가기 표: 로그인 뒤 공통 시작점이라 뒤로가기 없음
 * TEMP: 목업 확인용으로 ?state=empty 이면 소속 없는 상태를 보여 준다. API가 생기면 지운다
 * TODO: /me/clubs/[slug] 내부 홈은 아직 없다
 */
export const metadata: Metadata = { title: "내 동호회" }

export default function MePage({ searchParams }: PageProps<"/me">) {
  return (
    <main className="page-container py-6 md:py-8">
      <Suspense fallback={<p className="text-body text-text-muted">불러오는 중이에요.</p>}>
        <MyClubs searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function MyClubs({ searchParams }: { searchParams: PageProps<"/me">["searchParams"] }) {
  const { state } = await searchParams
  const me: MeSummary = state === "empty" ? ME_WITHOUT_CLUBS : ME_WITH_CLUBS
  const memberships = sortMyMemberships(me.memberships, me.lastSelectedClubSlug)

  if (memberships.length === 0) {
    return (
      <>
        <PageHeading title="내 동호회" description={`${me.displayName}님, 아직 가입한 동호회가 없어요.`} />
        <ul className="mt-6 grid gap-3 md:grid-cols-3">
          <li>
            <Link href="/clubs" className="card card-link flex h-full flex-col gap-2">
              <Search className="size-6 text-brand" />
              <span className="text-heading-3">동호회 찾아보기</span>
              <span className="text-body text-text-muted">가까운 동호회를 찾아 가입하거나 게스트로 참가해 보세요.</span>
            </Link>
          </li>
          <li className="card flex h-full flex-col gap-2">
            <Link2 className="size-6 text-text-muted" />
            <span className="text-heading-3">초대 링크로 가입</span>
            {/* TODO: 초대 링크·QR 가입 화면이 생기면 연결한다 */}
            <span className="text-body text-text-muted">운영진에게 받은 초대 링크나 QR을 열면 가입 신청 화면으로 이어져요.</span>
          </li>
          <li className="card flex h-full flex-col gap-2">
            <Plus className="size-6 text-text-muted" />
            <span className="text-heading-3">동호회 만들기</span>
            <span className="text-body text-text-muted">새 동호회를 만들고 회원을 초대해요.</span>
            {/* TODO: 동호회 만들기 화면이 생기면 Link로 바꾼다 */}
            <button type="button" disabled className="btn btn-secondary mt-auto self-start">
              준비 중
            </button>
          </li>
        </ul>
      </>
    )
  }

  return (
    <>
      <PageHeading title="내 동호회" description={`${me.displayName}님, 들어갈 동호회를 골라 주세요.`} />
      <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {memberships.map((membership) => (
          <li key={membership.clubSlug} className="min-w-0">
            <MembershipCard membership={membership} isLast={membership.clubSlug === me.lastSelectedClubSlug} />
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h2 className="text-heading-2">다른 동호회</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link href="/clubs" className="btn btn-secondary">
            <Search className="size-5" />
            동호회 찾아보기
          </Link>
          <Link href="/me/guest-applications" className="btn btn-ghost">
            게스트 신청 내역
          </Link>
        </div>
      </section>
    </>
  )
}

function MembershipCard({ membership, isLast }: { membership: MyMembership; isLast: boolean }) {
  const role = MEMBERSHIP_ROLE_LABELS[membership.role]

  if (membership.status === "pending") {
    return (
      <div className="card flex h-full flex-col gap-2">
        <StatusBadge label="가입 승인 대기" className="self-start border-warning bg-warning/10 text-warning" />
        <span className="text-heading-3">{membership.clubName}</span>
        <span className="text-body text-text-muted">운영진이 확인하면 들어갈 수 있어요.</span>
        <Link
          href={`/clubs/${membership.clubSlug}`}
          className="mt-auto self-start text-body-sm font-semibold text-brand underline-offset-2 hover:underline"
        >
          동호회 홈페이지 보기
        </Link>
      </div>
    )
  }

  return (
    <Link href={myClubPath(membership.clubSlug)} className="card card-link flex h-full items-center gap-3">
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <StatusBadge label={role} className="border-brand bg-brand-subtle text-brand" />
          {isLast && <span className="text-body-sm text-text-muted">마지막으로 본 동호회</span>}
        </span>
        <span className="mt-2 block text-heading-3">{membership.clubName}</span>
      </span>
      <ChevronRight className="size-6 shrink-0 text-text-muted" />
    </Link>
  )
}
