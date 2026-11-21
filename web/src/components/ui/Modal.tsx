"use client"

import { X } from "lucide-react"
import { useEffect, useEffectEvent, useId, useRef, useState, type ReactNode } from "react"


/*
 * 기준: [[01 디자인 시스템]] Modal과 닫기 규칙
 *  - 딤은 position: fixed; inset: 0으로 뷰포트 전체를 덮는다(max-width 없음)
 *  - 47.99rem 이하: 하단 시트(위쪽 두 모서리만 radius-lg 12px)
 *  - 48rem 이상: 중앙 다이얼로그, 최대 40rem
 *  - 모바일: 딤 160ms 등장 / 120ms 퇴장, 시트 220ms 등장 / 180ms 퇴장
 *  - 데스크톱: 다이얼로그 180ms 등장 / 140ms 퇴장, 딤은 모바일과 같음
 *  - 드래그 닫기 없음. 상단 × 또는 하단 버튼으로만 닫음
 *  - 본문 여백 20px, 제목·본문 간격 12px, 버튼 영역 구분선 + 16px
 *  - 데스크톱: 보조 왼쪽 / 주요 오른쪽. 모바일: 주요가 하단 넓게, 보조는 그 위
 */

/** 가장 긴 퇴장 시간(모바일 시트 180ms)이 끝난 뒤에 DOM에서 제거한다. */
const UNMOUNT_DELAY_MS = 180

export type DismissReason = "close-button" | "backdrop" | "escape"

export type ModalState = {
  mounted: boolean
  visible: boolean
  open: () => void
  close: () => void
}

export function useModalState(): ModalState {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<number | null>(null)

  const open = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    // 등장 애니메이션의 시작 상태는 CSS @starting-style(Tailwind starting:)로 처리한다.
    setMounted(true)
    setVisible(true)
  }

  const close = () => {
    setVisible(false)
    timerRef.current = window.setTimeout(() => setMounted(false), UNMOUNT_DELAY_MS)
  }

  return { mounted, visible, open, close }
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

type ModalShellProps = {
  state: ModalState
  title: string
  /** 위험 동작 모달은 상단 ×를 쓰지 않는다. */
  showCloseButton: boolean
  onDismiss: (reason: DismissReason) => void
  children: ReactNode
  footer?: ReactNode
}

export function ModalShell({ state, title, showCloseButton, onDismiss, children, footer }: ModalShellProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onDismiss("escape")
      return
    }
    if (event.key !== "Tab" || !panelRef.current) return

    // 키보드 Focus가 모달 밖으로 나가지 않게 처음·끝에서 순환한다.
    const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })

  useEffect(() => {
    if (!state.mounted) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKeyDown = (event: KeyboardEvent) => handleKeyDown(event)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      opener?.focus()
    }
  }, [state.mounted])

  if (!state.mounted) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* TEMP: UNDEF-11 — 딤 색상·투명도는 문서에 없음 */}
      <div
        aria-hidden="true"
        onClick={() => onDismiss("backdrop")}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity ${
          state.visible ? "opacity-100 duration-[160ms] starting:opacity-0" : "opacity-0 duration-[120ms]"
        }`}
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:items-center md:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`pointer-events-auto flex max-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-t-xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-xl transition md:max-h-[calc(100dvh-3rem)] md:max-w-[40rem] md:rounded-xl md:pb-0 ${
            state.visible
              ? "max-md:translate-y-0 max-md:duration-[220ms] max-md:starting:translate-y-full md:opacity-100 md:duration-[180ms] md:starting:opacity-0"
              : "max-md:translate-y-full max-md:duration-[180ms] md:opacity-0 md:duration-[140ms]"
          }`}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            {/* TEMP: UNDEF-12 — 모달 제목 글자 단계는 문서에 없음. heading-3 사용 */}
            <h2 id={titleId} className="pt-2 text-heading-3">
              {title}
            </h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={() => onDismiss("close-button")}
                className="btn btn-ghost size-10 shrink-0 px-0"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto px-5 pb-5 pt-3">{children}</div>

          {footer && (
            <div className="flex flex-col gap-2 border-t border-border-main p-4 md:flex-row md:justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
