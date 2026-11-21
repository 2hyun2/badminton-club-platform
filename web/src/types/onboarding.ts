export type SocialLoginProvider = "kakao" | "google" | "apple"

export type OnboardingGender = "male" | "female"

/** 첫 간편 로그인 뒤 직접 입력하는 기본 정보 (DECIDE-17). 전화번호는 받지 않음 (DECIDE-18) */
export type OnboardingProfileForm = {
  /** 이름. 필수. 소셜 로그인 제공처의 이름을 가져오지 않는다 */
  displayName: string
  /** 성별. 필수 */
  gender: OnboardingGender | ""
  /** 생년월일. 필수. 년·월·일 선택값 */
  birthYear: string
  birthMonth: string
  birthDay: string
  /** 배드민턴 경력. 필수 */
  career: string
  /** 배드민턴 급수(본인 판단). 필수 */
  skillLevel: string
  /** 별명. 선택 */
  nickname: string
  /** 사는 곳. 선택 */
  sidoCode: string
  sigunguCode: string
}

/** 첫 간편 로그인 뒤 받는 동의 */
export type OnboardingConsents = {
  serviceTerms: boolean
  privacyPolicy: boolean
  ageConfirmation: boolean
  /** 알림 수신 동의. 선택 (UNDEF-34) */
  notification: boolean
}

export type FirstLoginSession = {
  /** 첫 로그인에 사용한 제공처. 인증용 식별값이나 토큰은 화면에 두지 않는다 */
  provider: SocialLoginProvider
  isNewUser: true
}
