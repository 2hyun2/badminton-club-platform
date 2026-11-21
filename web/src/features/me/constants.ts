import type { MembershipRole, MyMembership } from "@/types/me"

/** 역할 이름 (07 동호회 홈 화면 설계의 클럽장·매니저·일반 회원) */
export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  owner: "클럽장",
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
