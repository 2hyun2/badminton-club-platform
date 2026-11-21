/*
 * 동호회 slug(공개 주소 /clubs/[slug]) 규칙 (DECIDE-23)
 * 공개 주소는 바깥에 공유되므로 한 번 정하면 바꾸기 어렵다
 * 화면·기능 이름과 겹치는 단어는 처음부터 slug로 쓰지 못하게 막는다
 * TODO: 동호회 만들기 화면과 API에서 이 검사를 쓴다. slug를 바꾸면 이전 주소에서 새 주소로 넘겨 준다
 */
export const RESERVED_CLUB_SLUGS = [
  "me",
  "intro",
  "onboarding",
  "account",
  "guest",
  "manage",
  "admin",
  "api",
  "new",
  "search",
  "invite",
  "invites",
  "settings",
] as const

export function isReservedClubSlug(slug: string) {
  return (RESERVED_CLUB_SLUGS as readonly string[]).includes(slug.trim().toLowerCase())
}
