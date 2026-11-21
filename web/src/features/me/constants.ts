import type { MembershipRole, MyMembership } from "@/types/me"

/**
 * 권한 기본 이름 (DECIDE-26)
 * 화면에는 동호회가 정한 직책(회장·총무·경기이사 등)이 있으면 직책을, 없으면 이 이름을 보여 준다
 * TEMP: UNDEF-61 — 기본 이름 미정. 직책 데이터도 아직 없어 지금은 이 이름만 보인다
 */
export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  admin: "클럽장",
  manager: "매니저",
  member: "회원",
}

/** 마지막 선택 동호회를 맨 위로, 나머지는 받은 순서. 승인 대기는 활동 중 뒤로 */
export function sortMyMemberships(memberships: MyMembership[], lastSelectedClubSlug: string | null) {
  const rank = (item: MyMembership) =>
    item.status === "pending" ? 2 : item.clubSlug === lastSelectedClubSlug ? 0 : 1
  return [...memberships].sort((a, b) => rank(a) - rank(b))
}

/** 회원용 동호회 내부 주소 (DECIDE-23) */
export function myClubPath(clubSlug: string, path = "") {
  return `/me/clubs/${clubSlug}${path}`
}
