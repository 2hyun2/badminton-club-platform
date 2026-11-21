import { Check } from "lucide-react"
import type { InputHTMLAttributes } from "react"

/*
 * 기준: [[01 디자인 시스템]] 선택 컨트롤 · 시각 규격
 *  - Checkbox / Radio 표시부 20px × 20px, 전체 터치 영역 최소 40px 높이
 *  - Checkbox: radius-sm 4px / Radio: 완전한 원형
 *  - 선택됨: blue-600 배경 또는 테두리 + 흰색 체크·점
 *  - 선택 안 됨: surface 배경 + 테두리
 * TEMP: DOC-02 — 문서의 미선택 테두리는 `border`(#E2E8F0)지만, 가독성 원칙(컨트롤은 border-strong)과 충돌해 border-strong 사용
 * 서버·클라이언트 컴포넌트 양쪽에서 쓰도록 상태 없는 표시 컴포넌트로만 둔다.
 */

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">

export function CheckboxInput(props: NativeInputProps) {
  return (
    <span className="relative inline-flex size-5 shrink-0">
      <input
        type="checkbox"
        {...props}
        className="peer size-5 cursor-pointer appearance-none rounded-sm disabled:cursor-not-allowed border border-border-strong bg-surface checked:border-brand checked:bg-brand disabled:border-slate-300 disabled:bg-slate-100 disabled:checked:bg-slate-300"
      />
      {/* reset.css의 svg { display: block }이 Tailwind hidden을 덮으므로 감싼 span으로 표시 여부를 제어 (DIFF-10) */}
      <span className="pointer-events-none absolute inset-0 hidden items-center justify-center text-white peer-checked:flex">
        <Check className="size-4" strokeWidth={3} />
      </span>
    </span>
  )
}

export function RadioInput(props: NativeInputProps) {
  return (
    <input
      type="radio"
      {...props}
      className="size-5 shrink-0 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed border border-border-strong bg-surface checked:border-[6px] checked:border-brand disabled:border-slate-300 disabled:bg-slate-100"
    />
  )
}
