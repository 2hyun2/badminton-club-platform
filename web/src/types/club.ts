/*
 * 동호회 화면에서 쓰는 타입
 * 실제 DB 구조를 그대로 복사하지 않고, 화면에 필요한 정보만 담는다
 */

export type RecruitmentState = {
  /** 정식 동호회 가입 모집 상태 */
  membership: {
    isOpen: boolean
  }
  /** 체험 방문·지인 동반을 위한 게스트 신청 상태. 가입 모집과 독립적이다 */
  guest: {
    isOpen: boolean
  }
}

export type ClubGenderCondition = "all" | "female" | "male"

export type ClubSearchItem = {
  /** 화면 내부에서만 쓰는 동호회 식별값 */
  id: string
  /** 공개 동호회 주소에 쓰일 문자열 */
  slug: string
  name: string
  summary: string
  region: {
    /** 지도 제공처의 값을 서비스 내부에서 정규화한 식별값 */
    sidoCode: string
    sidoName: string
    sigunguCode: string
    sigunguName: string
  }
  venueName: string
  activitySummary: string
  memberCount: number
  membershipCondition: {
    gender: ClubGenderCondition
    skillLevels: string[]
  }
  recruitment: RecruitmentState
}

export type ClubSearchFilters = {
  keyword: string
  sido: string | "all"
  sigungu: string | "all"
  gender: ClubGenderCondition | "all"
  skillLevel: string | "all"
  membershipRecruitment: "all" | "open"
  guestApplication: "all" | "open"
}

/* TEMP: UNDEF-28 — 동호회가 공개 홈·검색 카드에서 숨길 수 있는 항목. 지금은 회원 수만 */
export type ClubPublicField = "memberCount"
