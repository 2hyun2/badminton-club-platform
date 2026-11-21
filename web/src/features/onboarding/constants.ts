import type { OnboardingConsents, OnboardingProfileForm } from "@/types/onboarding"

/** 첫 로그인 뒤 '기본 정보 입력' 화면의 빈 폼 값 (DECIDE-17) */
export const EMPTY_ONBOARDING_PROFILE_FORM: OnboardingProfileForm = {
  displayName: "",
  gender: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  career: "",
  skillLevel: "",
  nickname: "",
  sidoCode: "",
  sigunguCode: "",
}

export const EMPTY_ONBOARDING_CONSENTS: OnboardingConsents = {
  serviceTerms: false,
  privacyPolicy: false,
  ageConfirmation: false,
  notification: false,
}

/* TEMP: UNDEF-35 — 생년월일 년도 범위. 현재 연도를 코드에서 계산하지 않고 고정값으로 둔다 */
const BIRTH_YEAR_MAX = 2026
const BIRTH_YEAR_MIN = 1930

export const BIRTH_YEAR_OPTIONS = Array.from(
  { length: BIRTH_YEAR_MAX - BIRTH_YEAR_MIN + 1 },
  (_, index) => String(BIRTH_YEAR_MAX - index),
)
export const BIRTH_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1))

/** 해당 년·월의 날짜 수. Date 객체 없이 윤년만 계산한다 */
export function getDaysInMonth(year: string, month: string): number {
  const m = Number(month)
  if (m === 2) {
    const y = Number(year)
    const isLeap = y > 0 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)
    return isLeap ? 29 : 28
  }
  return [4, 6, 9, 11].includes(m) ? 30 : 31
}

/* TEMP: UNDEF-36 — 배드민턴 경력 선택지 */
export const CAREER_OPTIONS = [
  { value: "under_1y", label: "1년 미만" },
  { value: "1_3y", label: "1~3년" },
  { value: "3_5y", label: "3~5년" },
  { value: "5_10y", label: "5~10년" },
  { value: "10y_plus", label: "10년 이상" },
] as const

/** 이름 입력 규칙. 중복을 허용하며 실명 여부는 자기 신고다 */
export const DISPLAY_NAME_RULE = { minLength: 2, maxLength: 20 } as const
