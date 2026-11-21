/** 상태 배지: 상태색 점 + 텍스트, 높이 28px, radius-full */
export default function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-body-sm font-semibold ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
