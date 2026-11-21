import type { ClubGenderCondition, ClubSearchFilters, ClubSearchItem } from "@/types/club"
import type { RegionOption } from "@/types/region"

/** 동호회 찾기 첫 진입 시 적용할 필터 값 */
export const DEFAULT_CLUB_SEARCH_FILTERS: ClubSearchFilters = {
  keyword: "",
  sido: "all",
  sigungu: "all",
  gender: "all",
  skillLevel: "all",
  membershipRecruitment: "all",
  guestApplication: "all",
}

/**
 * 배드민턴 급수. 동호인 대회 조 단위, 낮은 순 (UNDEF-37)
 * 온보딩·동호회 찾기 필터·가입 조건·게스트 양식이 함께 쓴다
 */
export const CLUB_SKILL_LEVEL_OPTIONS = ["초심", "D조", "C조", "B조", "A조", "준자강", "자강"] as const

/* TEMP: UNDEF-16 — 성별 조건 문구 */
export const GENDER_LABELS: Record<ClubGenderCondition, string> = {
  all: "성별 무관",
  female: "여성",
  male: "남성",
}

/**
 * 동호회 찾기 지역 필터: 전국 목록을 고정하지 않고,
 * 공개 검색에 노출되는 동호회의 행정구역만 모아 만든다.
 * 실제 서비스에서는 이 계산 결과를 서버가 검색 필터 응답으로 내려준다
 */
export function getClubSearchRegionOptions(clubs: ClubSearchItem[]): RegionOption[] {
  const regions = new Map<string, RegionOption>()

  for (const club of clubs) {
    const { sidoCode, sidoName, sigunguCode, sigunguName } = club.region
    const current = regions.get(sidoCode)

    if (current) {
      if (!current.sigunguOptions.some((option) => option.code === sigunguCode)) {
        current.sigunguOptions.push({ code: sigunguCode, name: sigunguName })
      }
      continue
    }

    regions.set(sidoCode, {
      sidoCode,
      sidoName,
      sigunguOptions: [{ code: sigunguCode, name: sigunguName }],
    })
  }

  return [...regions.values()]
}
