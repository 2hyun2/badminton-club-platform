"use client"

import { CheckCircle2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"

import { CheckboxInput, RadioInput } from "@/components/ui/controls"
import { PageHeading } from "@/components/layout/PageTop"
import StatusBadge from "@/components/ui/StatusBadge"
import { ModalShell, useModalState } from "@/components/ui/Modal"
import {
  GUEST_FORM_SKILL_OPTIONS,
  GUEST_MESSAGE_MAX,
  GUEST_STATUS,
  getGuestPrivacyNotice,
} from "@/features/guest/constants"
import type { GuestSessionOption } from "@/types/guest"

/*
 * 게스트 참가 신청서 (/me/guest/[clubSlug])
 * 기준: [[10 게스트 페이지 설계]] 2 · [[04 개인정보 및 게스트 양식 정책]] · DECIDE-16·18
 *  - 로그인한 앱 회원만 신청. 전화번호·비밀번호·접근 코드 없음
 *  - 계정이 곧 한 사람이라는 보장이 없으므로 동호회 게스트 양식은 그대로 받음
 *  - 양식 답변은 운영진의 해당 신청 상세에서만 보임
 *  - 개인정보 항목이 있으면 제출 버튼 바로 위에 동호회별 안내 + 필수 동의
 *  - 02: 작성 중인 값이 있으면 떠나기 확인
 *  - DECIDE-19: 날짜 버튼 → 그날 시간대가 2개 이상일 때만 시간 선택. 2주 범위·게스트 켠 일정만 오는 것은 서버 몫
 * TEMP: UNDEF-19 항목 구성 · UNDEF-33 계정 정보 중 동호회에 전달할 범위(시안은 이름을 양식에서 다시 받음)
 */

type FormValues = {
  date: string
  sessionId: string
  name: string
  skillLevel: string
  message: string
  consent: boolean
}

type FieldKey = "date" | "sessionId" | "name" | "consent"
type FormErrors = Partial<Record<FieldKey, string>>

const EMPTY: FormValues = {
  date: "",
  sessionId: "",
  name: "",
  skillLevel: "",
  message: "",
  consent: false,
}

/** 화면에 보이는 순서대로 검사해 첫 오류 칸으로 Focus를 옮긴다. */
const FIELD_ORDER: FieldKey[] = ["date", "sessionId", "name", "consent"]

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.date) errors.date = "참가할 날짜를 선택해 주세요."
  else if (!values.sessionId) errors.sessionId = "참가할 시간을 선택해 주세요."
  if (values.name.trim().length < 2) errors.name = "이름을 2자 이상 입력해 주세요."
  if (!values.consent) errors.consent = "개인정보 수집·이용에 동의해야 신청할 수 있어요."
  return errors
}

function isDirty(values: FormValues) {
  return (Object.keys(EMPTY) as (keyof FormValues)[]).some((key) => values[key] !== EMPTY[key])
}

/** 같은 날짜의 일정끼리 묶는다. 서버가 날짜순으로 보내 준다고 가정 */
function groupByDate(sessions: GuestSessionOption[]) {
  const groups: { date: string; sessions: GuestSessionOption[] }[] = []
  for (const session of sessions) {
    const last = groups[groups.length - 1]
    if (last && last.date === session.dateLabel) last.sessions.push(session)
    else groups.push({ date: session.dateLabel, sessions: [session] })
  }
  return groups
}

type Props = {
  clubSlug: string
  clubName: string
  sessions: GuestSessionOption[]
}

export default function GuestApplyForm({ clubSlug, clubName, sessions }: Props) {
  const router = useRouter()
  const leaveModal = useModalState()
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const formId = useId()
  const fieldId = (key: string) => `${formId}-${key}`
  const backHref = `/clubs/${clubSlug}`
  const dirty = isDirty(values) && !submitted

  // 새로고침·탭 닫기에도 작성 중 내용 경고 (02 떠나기 확인)
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // 일부 브라우저(구형 Chrome·Safari)는 returnValue가 설정돼야 경고 창을 띄운다.
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const dateGroups = groupByDate(sessions)
  const sessionsOfDate = dateGroups.find((group) => group.date === values.date)?.sessions ?? []

  // 날짜를 바꾸면 시간 선택을 초기화한다. 그날 시간대가 하나뿐이면 바로 정한다
  const selectDate = (date: string) => {
    const daySessions = dateGroups.find((group) => group.date === date)?.sessions ?? []
    setValues((current) => ({
      ...current,
      date,
      sessionId: daySessions.length === 1 ? daySessions[0].id : "",
    }))
    setErrors((current) => ({ ...current, date: undefined, sessionId: undefined }))
  }

  const goBack = () => {
    if (dirty) leaveModal.open()
    else router.push(backHref)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    const firstError = FIELD_ORDER.find((key) => nextErrors[key])
    if (firstError) {
      document.getElementById(fieldId(firstError))?.focus()
      return
    }
    // TODO: 신청 API 연결. 지금은 목업이라 등록 성공으로 가정한다.
    setSubmitted(true)
  }

  if (submitted) {
    const session = sessions.find((item) => item.id === values.sessionId)
    return (
      <SubmitDone
        clubName={clubName}
        sessionLabel={session ? `${session.dateLabel} ${session.timeLabel}` : ""}
        backHref={backHref}
      />
    )
  }

  const privacyRows = getGuestPrivacyNotice(clubName)
  const messageLength = values.message.length

  return (
    <>
      {/* 떠나기 확인이 필요해 BackLink 대신 버튼을 쓴다. 모양은 BackLink와 같게 */}
      <button type="button" className="btn btn-ghost pl-2" onClick={goBack}>
        <ChevronLeft className="size-6" />
        돌아가기
      </button>
      <PageHeading
        title="게스트 참가 신청"
        description={
          <>
            <span className="font-semibold text-text-main">{clubName}</span>에 체험 참가를 신청해요. 운영진이 확인한
            뒤 승인 여부를 알려 드려요.
          </>
        }
      />

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <fieldset aria-describedby={errors.date ? fieldId("date-error") : undefined}>
          <legend className="label">
            참가 희망 날짜 <span className="text-danger">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {dateGroups.map((group, index) => (
              <label
                key={group.date}
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-lg border bg-surface px-2 text-body font-semibold has-checked:border-brand has-checked:bg-brand-subtle has-checked:text-brand has-focus-visible:outline-2 has-focus-visible:outline-brand ${
                  errors.date ? "border-danger" : "border-border-strong"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  id={index === 0 ? fieldId("date") : undefined}
                  name={fieldId("date")}
                  value={group.date}
                  checked={values.date === group.date}
                  onChange={() => selectDate(group.date)}
                />
                {group.date}
              </label>
            ))}
          </div>
          <FieldError id={fieldId("date-error")} message={errors.date} />
        </fieldset>

        {sessionsOfDate.length === 1 && (
          <p className="-mt-3 text-body text-text-muted">
            참가 시간 <span className="font-semibold tabular-nums text-text-main">{sessionsOfDate[0].timeLabel}</span>
          </p>
        )}

        {sessionsOfDate.length > 1 && (
          <fieldset aria-describedby={errors.sessionId ? fieldId("sessionId-error") : undefined}>
            <legend className="label">
              참가 시간 <span className="text-danger">*</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {sessionsOfDate.map((session, index) => (
                <label
                  key={session.id}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-surface px-3 has-checked:border-brand has-checked:bg-brand-subtle ${
                    errors.sessionId ? "border-danger" : "border-border-strong"
                  }`}
                >
                  <RadioInput
                    id={index === 0 ? fieldId("sessionId") : undefined}
                    name={fieldId("session")}
                    value={session.id}
                    checked={values.sessionId === session.id}
                    onChange={() => update("sessionId", session.id)}
                    aria-invalid={errors.sessionId ? true : undefined}
                  />
                  <span className="text-body font-semibold tabular-nums">{session.timeLabel}</span>
                </label>
              ))}
            </div>
            <FieldError id={fieldId("sessionId-error")} message={errors.sessionId} />
          </fieldset>
        )}

        <div>
          <label htmlFor={fieldId("name")} className="label">
            이름 <span className="text-danger">*</span>
          </label>
          <input
            id={fieldId("name")}
            className={`input ${errors.name ? "border-danger" : ""}`}
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? fieldId("name-error") : undefined}
          />
          <FieldError id={fieldId("name-error")} message={errors.name} />
        </div>

        <div>
          <label htmlFor={fieldId("skill")} className="label">
            급수 <span className="font-normal text-text-muted">(선택)</span>
          </label>
          <select
            id={fieldId("skill")}
            className="input"
            value={values.skillLevel}
            onChange={(event) => update("skillLevel", event.target.value)}
          >
            <option value="">선택 안 함</option>
            {GUEST_FORM_SKILL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={fieldId("message")} className="label">
            하고 싶은 말 <span className="font-normal text-text-muted">(선택)</span>
          </label>
          <textarea
            id={fieldId("message")}
            rows={3}
            maxLength={GUEST_MESSAGE_MAX}
            className="input h-auto min-h-24 py-2"
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            aria-describedby={fieldId("message-count")}
          />
          <p id={fieldId("message-count")} className="mt-1.5 text-right text-body-sm tabular-nums text-text-muted">
            {messageLength}/{GUEST_MESSAGE_MAX}
          </p>
        </div>

        {/* 04: 개인정보 항목이 있으면 제출 버튼 바로 위에 안내 + 필수 동의 */}
        <section className="rounded-lg border border-border-main bg-app-bg p-4">
          <h2 className="text-body font-semibold">개인정보 수집·이용 안내</h2>
          <dl className="mt-3 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-body-sm">
            {privacyRows.map(([term, detail]) => (
              <div key={term} className="contents">
                <dt className="font-semibold text-text-muted">{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-body-sm text-text-muted">
            동의를 거부할 수 있지만, 동의하지 않으면 게스트 참가 신청을 할 수 없어요.
          </p>

          <label className="mt-3 flex min-h-10 cursor-pointer items-center gap-3 text-body font-semibold has-disabled:cursor-not-allowed">
            <CheckboxInput
              id={fieldId("consent")}
              checked={values.consent}
              onChange={(event) => update("consent", event.target.checked)}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? fieldId("consent-error") : undefined}
            />
            위 개인정보 수집·이용에 동의합니다. (필수)
          </label>
          <FieldError id={fieldId("consent-error")} message={errors.consent} />
        </section>

        <ul className="flex list-disc flex-col gap-1 pl-5 text-body-sm text-text-muted">
          <li>본인의 정확한 정보를 입력해 주세요.</li>
          <li>다른 사람의 정보를 입력하지 마세요.</li>
          <li>허위 정보나 운영 방해가 확인되면 신청이 취소될 수 있어요.</li>
        </ul>

        <button type="submit" className="btn btn-primary w-full md:w-auto md:self-end">
          신청하기
        </button>
      </form>

      {/* TEMP: UNDEF-13 — 떠나기 확인 형태 */}
      <ModalShell
        state={leaveModal}
        title="작성 중인 신청서가 있어요"
        showCloseButton
        onDismiss={leaveModal.close}
        footer={
          <>
            <button type="button" className="btn btn-ghost w-full md:w-auto" onClick={leaveModal.close}>
              계속 작성
            </button>
            <button type="button" className="btn btn-danger w-full md:w-auto" onClick={() => router.push(backHref)}>
              나가기
            </button>
          </>
        }
      >
        <p className="text-body">지금 나가면 입력한 내용이 저장되지 않아요.</p>
      </ModalShell>
    </>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-body-sm font-semibold text-danger">
      {message}
    </p>
  )
}

/*
 * DECIDE-16: 신청 완료. 신청 상태는 로그인한 계정의 게스트 신청 내역에서 확인한다고 안내.
 */
function SubmitDone({
  clubName,
  sessionLabel,
  backHref,
}: {
  clubName: string
  sessionLabel: string
  backHref: string
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // 화면이 신청서에서 완료로 바뀌었음을 스크린 리더에 알리기 위해 제목으로 Focus 이동
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="max-w-[32rem]">
      <CheckCircle2 className="size-10 text-success" />
      <h1 ref={headingRef} tabIndex={-1} className="mt-3 text-heading-1 outline-none">
        신청이 접수됐어요
      </h1>
      <p className="mt-2 text-body text-text-muted">
        {clubName} · {sessionLabel}
      </p>
      <div className="mt-3">
        <StatusBadge label={GUEST_STATUS.pending.label} className={GUEST_STATUS.pending.className} />
      </div>

      <section className="card mt-6 p-5">
        <p className="text-body">승인 결과는 게스트 신청 내역에서 확인할 수 있어요.</p>
        <p className="mt-2 text-body-sm text-text-muted">
          방문하는 날에는 &lsquo;승인&rsquo; 신청을 운영진에게 보여 주세요.
        </p>
      </section>

      <div className="mt-6 flex flex-col gap-3">
        <Link href="/me/guest-applications" className="btn btn-primary w-full">
          게스트 신청 내역으로
        </Link>
        <Link href={backHref} className="btn btn-ghost w-full">
          동호회 홈페이지로
        </Link>
      </div>
    </div>
  )
}
