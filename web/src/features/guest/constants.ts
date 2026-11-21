import { CLUB_SKILL_LEVEL_OPTIONS } from "@/features/club/constants"
import type { GuestApplicationStatus } from "@/types/guest"

/* TEMP: UNDEF-14 — 게스트 신청 상태 배지 색 */
export const GUEST_STATUS: Record<GuestApplicationStatus, { label: string; className: string }> = {
  pending: { label: "승인 대기", className: "border-warning bg-warning/10 text-warning" },
  approved: { label: "승인", className: "border-success bg-success/10 text-success" },
  rejected: { label: "미승인", className: "border-danger bg-red-50 text-danger" },
  expired: { label: "만료", className: "border-border-strong bg-surface text-text-muted" },
}

/* TEMP: UNDEF-19 · DOC-08 — 게스트 양식 표준 항목과 급수 선택지 */
export const GUEST_FORM_SKILL_OPTIONS = CLUB_SKILL_LEVEL_OPTIONS
export const GUEST_MESSAGE_MAX = 200

/** 04 개인정보 안내 형식. 문구는 앱이 동호회 설정으로 자동 생성한다 */
export function getGuestPrivacyNotice(clubName: string) {
  return [
    ["수집 항목", "이름, 급수, 하고 싶은 말"],
    ["이용 목적", "게스트 참가 심사 및 방문 시 본인 확인"],
    ["열람 권한", `${clubName}의 클럽장·매니저 (해당 신청 상세에서만)`],
    ["보관 기간", "참가일 종료 후 7일까지"],
  ] as const
}
