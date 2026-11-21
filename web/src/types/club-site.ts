import type { JSONContent } from "@tiptap/core"

/*
 * 동호회 홈페이지 (DECIDE-21)
 * 동호회마다 주어지는 무료 기본 홈페이지. 운영진이 채우는 내용만 담는다
 * 동호회 이름·장소·운동 시간·가입 조건 같은 기본 정보는 ClubSearchItem에서 가져온다
 */

/** 운영진이 숨길 수 있는 메뉴. 홈은 숨길 수 없다 (DECIDE-21 메뉴 단위 공개 설정) */
export type ClubSiteMenuKey = "about" | "notices" | "events" | "schedule" | "location" | "join"

/** 홈 배너 한 장. 이미지가 없으면 글자만 있는 배너로 보인다 */
export type ClubBanner = {
  id: string
  /** 글 단위 공개 설정. false면 운영진만 본다 */
  isPublished: boolean
  title: string
  subtitle: string
  /** 운영진이 올린 이미지 주소. 없으면 null */
  imageUrl: string | null
  /** 배너를 누르면 갈 곳. 없으면 누를 수 없는 배너 */
  linkHref: string | null
}

/** 조직도에 올리는 임원 */
export type ClubOfficer = {
  id: string
  /** 회장, 부회장, 총무처럼 동호회가 직접 쓰는 직책 이름 */
  role: string
  name: string
}

export type ClubNotice = {
  id: string
  isPublished: boolean
  title: string
  dateLabel: string
  /** 목록 맨 위에 고정 */
  isPinned: boolean
  /** 본문. 편집기(Tiptap)가 만든 JSON (DECIDE-22) */
  body: JSONContent
}

export type ClubEventStatus = "upcoming" | "ongoing" | "ended"

/** 대회·친선전·모임처럼 기간이 있는 행사 */
export type ClubEvent = {
  id: string
  isPublished: boolean
  title: string
  status: ClubEventStatus
  periodLabel: string
  placeLabel: string
  summary: string
  /** 본문. 편집기(Tiptap)가 만든 JSON (DECIDE-22) */
  body: JSONContent
}

/**
 * 가입·앱 사용 도움 연락처. 운영진이 공개에 동의한 수단 하나 (02 가입·앱 사용 도움 연락처)
 * 카카오톡 채널은 받지 않는다. 필요하면 운영진이 공지사항에 쓴다 (사용자 결정 2026-11-21)
 */
export type ClubHelpContact = { method: "phone"; value: string } | { method: "email"; value: string }

export type ClubSite = {
  /** 메뉴 단위 공개 설정. 숨긴 메뉴는 머리글·홈에서 빠지고 주소로 들어와도 404 */
  hiddenMenus: ClubSiteMenuKey[]
  banners: ClubBanner[]
  /** 인사말·소개 글. 비어 있으면 club.summary를 대신 쓴다 */
  introduction: string
  officers: ClubOfficer[]
  /** 최근 것부터 */
  notices: ClubNotice[]
  /** 진행 중 → 예정 → 종료 순서는 화면이 정렬한다 */
  events: ClubEvent[]
  /** 가입 안내 글(회비 등). 비어 있으면 기본 문구 */
  joinGuide: string
  helpContact: ClubHelpContact | null
}
