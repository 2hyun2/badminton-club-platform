import { CalendarDays } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageHeading } from "@/components/layout/PageTop"
import StatusBadge from "@/components/ui/StatusBadge"
import { GUEST_STATUS } from "@/features/guest/constants"
import { GUEST_INBOX_ITEMS, findClub } from "@/mocks"
import type { GuestInboxItem } from "@/types/guest"

/*
 * 게스트 신청 내역 (/me/guest-applications). 로그인한 앱 회원만 (DECIDE-16)
 * 기준: [[10 게스트 페이지 설계]] 1
 *  - 카드에는 동호회·일정·상태·신청일만. 양식 답변은 보이지 않음
 *  - 방문 당일 게스트가 "승인" 카드를 보여 주고 운영진이 이름을 맞춰 확인
 * TODO: 신청 내역 API 연결. 지금은 목업 데이터
 * TODO: 뒤로가기는 "← 내 계정"인데, 내 계정 화면이 아직 없어 두지 않았다.
 */
export const metadata: Metadata = { title: "게스트 신청 내역" }

export default function GuestApplicationsPage() {
  const items = GUEST_INBOX_ITEMS

  return (
    <main className="page-container py-6 md:py-8">
      <PageHeading title="게스트 신청 내역" description="다른 동호회에 신청한 게스트 참가 상태를 확인해요." />

      <div className="mt-6">
        {items.length > 0 ? (
          <>
            {/* 요약 카드: 768px 이상 2열 */}
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((item) => (
                <li key={item.applicationId} className="min-w-0">
                  <ApplicationCard item={item} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-body-sm text-text-muted">
              방문하는 날에는 &lsquo;승인&rsquo; 신청을 운영진에게 보여 주세요.
            </p>
            <Link href="/clubs" className="btn btn-secondary mt-6 w-full md:w-auto">
              동호회 찾아보기
            </Link>
          </>
        ) : (
          <div className="max-w-[40rem]">
            <div className="card py-6 text-center">
              <p className="text-body font-semibold">아직 게스트 신청이 없어요.</p>
            </div>
            <Link href="/clubs" className="btn btn-secondary mt-6 w-full md:w-auto">
              동호회 찾아보기
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

function ApplicationCard({ item }: { item: GuestInboxItem }) {
  const club = findClub(item.clubSlug)
  const status = GUEST_STATUS[item.status]

  return (
    <article className="card flex h-full flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 break-keep text-heading-3">{club?.name ?? "알 수 없는 동호회"}</h2>
        <StatusBadge label={status.label} className={status.className} />
      </div>
      <p className="flex items-center gap-2 text-body">
        <CalendarDays className="size-4 shrink-0 text-text-muted" />
        <span>
          <span className="tabular-nums">{item.sessionLabel}</span>
          {club && ` · ${club.venueName}`}
        </span>
      </p>
      <p className="text-body-sm text-text-muted">
        신청일 <span className="tabular-nums">{item.submittedLabel}</span>
      </p>
      {item.status === "rejected" && (
        <p className="text-body-sm text-text-muted">자세한 사유는 동호회에 문의해 주세요.</p>
      )}
    </article>
  )
}
