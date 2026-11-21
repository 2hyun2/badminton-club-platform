/*
 * 로그인한 나(/me) 기준 데이터 (12 유저 데이터 설계 me.memberships)
 * 화면에 필요한 값만 담는다. 로그인 식별값·동의 이력은 넣지 않는다
 */

/** 동호회 안에서의 역할 (09 Membership.role) */
export type MembershipRole = "owner" | "manager" | "member"

/** 가입 상태. active = 활동 중, pending = 가입 승인 대기 */
export type MembershipStatus = "active" | "pending"

export type MyMembership = {
  clubSlug: string
  clubName: string
  status: MembershipStatus
  role: MembershipRole
}

export type MeSummary = {
  displayName: string
  memberships: MyMembership[]
  /** 마지막으로 들어간 동호회. 자동 진입에는 쓰지 않고 목록 맨 위에 두는 데만 쓴다 (DECIDE-23) */
  lastSelectedClubSlug: string | null
}
