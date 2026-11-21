import type { Metadata } from "next"
import { Suspense } from "react"

import { GENDER_LABELS } from "@/features/club/constants"
import { isPublicField } from "@/mocks"

import { PAGE_FALLBACK, SitePage, loadClub, requireMenu } from "../_shared"

/*
 * 동호회 소개 (/clubs/[clubSlug]/about) (DECIDE-21)
 * 인사말 → 조직도(임원만) → 기본 정보
 * TEMP: UNDEF-44 — 조직도는 별도 메뉴가 아니라 소개 안에 둔다. 임원이 없으면 조직도 영역을 숨긴다
 */
export const metadata: Metadata = { title: "동호회 소개" }

type Params = PageProps<"/clubs/[clubSlug]/about">["params"]

export default function ClubAboutPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubAbout params={params} />
    </Suspense>
  )
}

async function ClubAbout({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "about")

  return (
    <SitePage title="동호회 소개">
      <section>
        <h2 className="text-heading-2">인사말</h2>
        <p className="card mt-3 whitespace-pre-line text-body">{site.introduction || club.summary}</p>
      </section>

      {site.officers.length > 0 && (
        <section className="mt-10">
          <h2 className="text-heading-2">조직도</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {site.officers.map((officer) => (
              <li key={officer.id} className="card text-center">
                <p className="text-body-sm font-semibold text-brand">{officer.role}</p>
                <p className="mt-1 text-heading-3">{officer.name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-heading-2">기본 정보</h2>
        <dl className="card mt-3 grid gap-3 text-body sm:grid-cols-[7rem_1fr]">
          <dt className="font-semibold text-text-muted">지역</dt>
          <dd className="-mt-2 sm:mt-0">
            {club.region.sidoName} {club.region.sigunguName}
          </dd>
          <dt className="font-semibold text-text-muted">운동 시간</dt>
          <dd className="-mt-2 sm:mt-0">{club.activitySummary}</dd>
          <dt className="font-semibold text-text-muted">체육관</dt>
          <dd className="-mt-2 sm:mt-0">{club.venueName}</dd>
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
        </dl>
      </section>
    </SitePage>
  )
}
