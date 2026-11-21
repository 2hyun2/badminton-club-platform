import type { ClubEventStatus, ClubSite, ClubSiteMenuKey } from "@/types/club-site"

/* 아직 아무것도 쓰지 않은 동호회 홈페이지 */
export const EMPTY_CLUB_SITE: ClubSite = {
  hiddenMenus: [],
  banners: [],
  introduction: "",
  officers: [],
  notices: [],
  events: [],
  joinGuide: "",
  helpContact: null,
}

/** 홈페이지 메뉴 (DECIDE-21). path는 /clubs/[clubSlug] 뒤에 붙는다 */
export const CLUB_SITE_MENU: { key: ClubSiteMenuKey | "home"; path: string; label: string }[] = [
  { key: "home", path: "", label: "홈" },
  { key: "about", path: "/about", label: "동호회 소개" },
  { key: "notices", path: "/notices", label: "공지사항" },
  { key: "events", path: "/events", label: "이벤트" },
  { key: "schedule", path: "/schedule", label: "운동 일정" },
  { key: "location", path: "/location", label: "오시는 길" },
  { key: "join", path: "/join", label: "가입 안내" },
]

/** 메뉴 단위 공개 설정 확인. 홈은 항상 보인다 */
export function isMenuVisible(site: Pick<ClubSite, "hiddenMenus">, key: ClubSiteMenuKey | "home") {
  return key === "home" || !site.hiddenMenus.includes(key)
}

/** 글 단위 공개 설정: 공개한 것만 남긴다 */
export function publishedOnly<T extends { isPublished: boolean }>(items: T[]) {
  return items.filter((item) => item.isPublished)
}

export function clubSitePath(clubSlug: string, path = "") {
  return `/clubs/${clubSlug}${path}`
}

/* TEMP: UNDEF-41 — 운영진이 가입 안내를 쓰지 않았을 때 보여 줄 기본 문구 */
export const DEFAULT_JOIN_GUIDE = "가입 신청을 보내면 운영진이 확인한 뒤 결과를 알려 드려요."

/** 도움 연락처 버튼 문구. 행동을 글자로 분명히 쓴다 (02 가입·앱 사용 도움 연락처) */
export const HELP_CONTACT_ACTIONS = {
  phone: { label: "전화하기", href: (value: string) => `tel:${value.replaceAll("-", "")}` },
  email: { label: "메일 보내기", href: (value: string) => `mailto:${value}` },
} as const

/* TEMP: UNDEF-43 — 이벤트 상태 배지 */
export const CLUB_EVENT_STATUS: Record<ClubEventStatus, { label: string; className: string }> = {
  ongoing: { label: "진행 중", className: "border-success bg-success/10 text-success" },
  upcoming: { label: "예정", className: "border-brand bg-brand-subtle text-brand" },
  ended: { label: "종료", className: "border-border-strong bg-surface text-text-muted" },
}

const EVENT_ORDER: ClubEventStatus[] = ["ongoing", "upcoming", "ended"]

/** 진행 중 → 예정 → 종료. 같은 상태끼리는 받은 순서 그대로 */
export function sortClubEvents<T extends { status: ClubEventStatus }>(events: T[]) {
  return [...events].sort((a, b) => EVENT_ORDER.indexOf(a.status) - EVENT_ORDER.indexOf(b.status))
}

/** 고정 공지를 먼저, 나머지는 받은 순서(최근 것부터) */
export function sortClubNotices<T extends { isPinned: boolean }>(notices: T[]) {
  return [...notices.filter((notice) => notice.isPinned), ...notices.filter((notice) => !notice.isPinned)]
}
