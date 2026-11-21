import type { Metadata } from "next"
import { Suspense } from "react"

import { GENDER_LABELS } from "@/features/club/constants"
import { DEFAULT_JOIN_GUIDE, HELP_CONTACT_ACTIONS } from "@/features/club-site/constants"

import { JoinActions, PAGE_FALLBACK, SitePage, loadClub, requireMenu } from "../_shared"

/*
 * 가입 안내 (/clubs/[clubSlug]/join) (DECIDE-21)
 * 모집 상태 → 가입 조건 → 안내 글(회비 등) → 신청 버튼 → 도움 연락처
 * 신청 버튼을 누를 때만 로그인이 필요하다
 */
export const metadata: Metadata = { title: "가입 안내" }

type Params = PageProps<"/clubs/[clubSlug]/join">["params"]

export default function ClubJoinPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubJoin params={params} />
    </Suspense>
  )
}

async function ClubJoin({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "join")
  const { membership, guest } = club.recruitment
  const contact = site.helpContact

  return (
    <SitePage title="가입 안내">
      <div className="max-w-[40rem]">
        <dl className="card grid gap-3 text-body sm:grid-cols-[7rem_1fr]">
          <dt className="font-semibold text-text-muted">가입 모집</dt>
          {/* DECIDE-12: 마감 예약 없음 → 날짜 없이 현재 상태만 */}
          <dd className="-mt-2 sm:mt-0">{membership.isOpen ? "모집 중" : "마감"}</dd>
          <dt className="font-semibold text-text-muted">게스트 신청</dt>
          <dd className="-mt-2 sm:mt-0">{guest.isOpen ? "받는 중" : "받지 않음"}</dd>
          <dt className="font-semibold text-text-muted">가입 조건</dt>
          <dd className="-mt-2 sm:mt-0">
            {GENDER_LABELS[club.membershipCondition.gender]} · {club.membershipCondition.skillLevels.join(", ")}
          </dd>
        </dl>

        <p className="card mt-4 whitespace-pre-line text-body">{site.joinGuide || DEFAULT_JOIN_GUIDE}</p>

        <div className="mt-6">
          <JoinActions club={club} />
        </div>

        {/* 02: 가입·앱 사용 도움 연락처는 가입 안내 하단. 운영진이 공개에 동의한 수단만 */}
        {contact && (
          <div className="mt-8 border-t border-border-main pt-6">
            <h2 className="text-heading-3">가입·앱 사용 도움</h2>
            <a
              href={HELP_CONTACT_ACTIONS[contact.method].href(contact.value)}
              className="btn btn-secondary mt-3"
            >
              {HELP_CONTACT_ACTIONS[contact.method].label}
            </a>
          </div>
        )}
      </div>
    </SitePage>
  )
}
