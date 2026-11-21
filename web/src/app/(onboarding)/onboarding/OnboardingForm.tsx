"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useId, useState, type FormEvent, type ReactNode } from "react"

import { CheckboxInput, RadioInput } from "@/components/ui/controls"
import { CLUB_SKILL_LEVEL_OPTIONS } from "@/features/club/constants"
import {
  BIRTH_MONTH_OPTIONS,
  BIRTH_YEAR_OPTIONS,
  CAREER_OPTIONS,
  DISPLAY_NAME_RULE,
  EMPTY_ONBOARDING_CONSENTS,
  EMPTY_ONBOARDING_PROFILE_FORM,
  getDaysInMonth,
} from "@/features/onboarding/constants"
import { KOREA_REGIONS } from "@/lib/regions"
import type { OnboardingConsents, OnboardingGender, OnboardingProfileForm } from "@/types/onboarding"

/*
 * 온보딩 입력 폼
 *  - 오류는 제출할 때 한꺼번에 보여 주고, 첫 오류 칸으로 Focus를 옮긴다 (게스트 신청서와 같은 방식)
 *  - 필수 동의 3개 + 선택 동의 1개. "전체 동의"는 네 개를 한 번에 켜고 끈다
 * TEMP: UNDEF-34 알림 동의 선택 · UNDEF-35 생년월일 입력 방식 · UNDEF-36 경력 선택지
 *       UNDEF-37 급수 선택지 · UNDEF-38 사는 곳 선택지 · 완료 뒤 /me (DECIDE-23)
 */

type FieldKey = "displayName" | "gender" | "birth" | "career" | "skillLevel" | "consents"
type FormErrors = Partial<Record<FieldKey, string>>

const FIELD_ORDER: FieldKey[] = ["displayName", "gender", "birth", "career", "skillLevel", "consents"]

const GENDER_OPTIONS: { value: OnboardingGender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
]

/* TEMP: 연령 확인 기준(만 14세)은 문서에 없음. 국내 개인정보 동의 연령 기준을 임시로 사용 */
const CONSENT_ITEMS: { key: keyof OnboardingConsents; label: string; required: boolean; href?: string }[] = [
  { key: "serviceTerms", label: "서비스 이용약관 동의", required: true, href: "/terms" },
  { key: "privacyPolicy", label: "개인정보 처리방침 동의", required: true, href: "/privacy" },
  { key: "ageConfirmation", label: "만 14세 이상입니다", required: true },
  { key: "notification", label: "알림 수신 동의", required: false },
]

function validate(profile: OnboardingProfileForm, consents: OnboardingConsents): FormErrors {
  const errors: FormErrors = {}
  const name = profile.displayName.trim()
  if (name.length < DISPLAY_NAME_RULE.minLength || name.length > DISPLAY_NAME_RULE.maxLength) {
    errors.displayName = `이름을 ${DISPLAY_NAME_RULE.minLength}~${DISPLAY_NAME_RULE.maxLength}자로 입력해 주세요.`
  }
  if (!profile.gender) errors.gender = "성별을 선택해 주세요."
  if (!profile.birthYear || !profile.birthMonth || !profile.birthDay) errors.birth = "생년월일을 모두 선택해 주세요."
  if (!profile.career) errors.career = "배드민턴 경력을 선택해 주세요."
  if (!profile.skillLevel) errors.skillLevel = "배드민턴 급수를 선택해 주세요."
  const missingRequired = CONSENT_ITEMS.some((item) => item.required && !consents[item.key])
  if (missingRequired) errors.consents = "필수 항목에 모두 동의해야 시작할 수 있어요."
  return errors
}

export default function OnboardingForm() {
  const router = useRouter()
  const formId = useId()
  const fieldId = (key: string) => `${formId}-${key}`
  const [profile, setProfile] = useState<OnboardingProfileForm>(EMPTY_ONBOARDING_PROFILE_FORM)
  const [consents, setConsents] = useState<OnboardingConsents>(EMPTY_ONBOARDING_CONSENTS)
  const [errors, setErrors] = useState<FormErrors>({})

  const update = <K extends keyof OnboardingProfileForm>(key: K, value: OnboardingProfileForm[K], errorKey?: FieldKey) => {
    setProfile((current) => ({ ...current, [key]: value }))
    const target = errorKey ?? (key as FieldKey)
    if (target in errors) setErrors((current) => ({ ...current, [target]: undefined }))
  }

  const days = profile.birthYear && profile.birthMonth ? getDaysInMonth(profile.birthYear, profile.birthMonth) : 31
  const dayOptions = Array.from({ length: days }, (_, index) => String(index + 1))
  const sigunguOptions = KOREA_REGIONS.find((region) => region.sidoCode === profile.sidoCode)?.sigunguOptions ?? []

  const allChecked = CONSENT_ITEMS.every((item) => consents[item.key])

  const setConsent = (key: keyof OnboardingConsents, checked: boolean) => {
    setConsents((current) => ({ ...current, [key]: checked }))
    if (errors.consents) setErrors((current) => ({ ...current, consents: undefined }))
  }

  const setAllConsents = (checked: boolean) => {
    setConsents({ serviceTerms: checked, privacyPolicy: checked, ageConfirmation: checked, notification: checked })
    if (errors.consents) setErrors((current) => ({ ...current, consents: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(profile, consents)
    setErrors(nextErrors)
    const firstError = FIELD_ORDER.find((key) => nextErrors[key])
    if (firstError) {
      document.getElementById(fieldId(firstError))?.focus()
      return
    }
    // TODO: 계정 생성 API 연결. 완료 뒤 내 동호회(/me)로 간다 (DECIDE-23)
    router.push("/me")
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8">
      {/* ── 필수 정보 ── */}
      <section className="flex flex-col gap-6">
        <h2 className="text-heading-3">필수 정보</h2>

        <div>
          <label htmlFor={fieldId("displayName")} className="label">
            이름 <span className="text-danger">*</span>
          </label>
          <input
            id={fieldId("displayName")}
            className={`input ${errors.displayName ? "border-danger" : ""}`}
            autoComplete="name"
            maxLength={DISPLAY_NAME_RULE.maxLength}
            value={profile.displayName}
            onChange={(event) => update("displayName", event.target.value)}
            aria-invalid={errors.displayName ? true : undefined}
            aria-describedby={[fieldId("displayName-help"), errors.displayName ? fieldId("displayName-error") : ""]
              .join(" ")
              .trim()}
          />
          <p id={fieldId("displayName-help")} className="mt-1.5 text-body-sm text-text-muted">
            동호회 회원과 운영진에게 보이는 이름이에요. 실명을 권장해요.
          </p>
          <FieldError id={fieldId("displayName-error")} message={errors.displayName} />
        </div>

        <fieldset aria-describedby={errors.gender ? fieldId("gender-error") : undefined}>
          <legend className="label">
            성별 <span className="text-danger">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((option, index) => (
              <label
                key={option.value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border bg-surface px-3 has-checked:border-brand has-checked:bg-brand-subtle ${
                  errors.gender ? "border-danger" : "border-border-strong"
                }`}
              >
                <RadioInput
                  id={index === 0 ? fieldId("gender") : undefined}
                  name={fieldId("gender-group")}
                  value={option.value}
                  checked={profile.gender === option.value}
                  onChange={() => update("gender", option.value)}
                  aria-invalid={errors.gender ? true : undefined}
                />
                <span className="text-body font-semibold">{option.label}</span>
              </label>
            ))}
          </div>
          <FieldError id={fieldId("gender-error")} message={errors.gender} />
        </fieldset>

        <fieldset aria-describedby={errors.birth ? fieldId("birth-error") : undefined}>
          <legend className="label">
            생년월일 <span className="text-danger">*</span>
          </legend>
          <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
            <SelectBox
              id={fieldId("birth")}
              label="년"
              value={profile.birthYear}
              invalid={Boolean(errors.birth)}
              onChange={(value) => update("birthYear", value, "birth")}
              options={BIRTH_YEAR_OPTIONS.map((year) => ({ value: year, label: `${year}년` }))}
            />
            <SelectBox
              id={fieldId("birthMonth")}
              label="월"
              value={profile.birthMonth}
              invalid={Boolean(errors.birth)}
              onChange={(value) => update("birthMonth", value, "birth")}
              options={BIRTH_MONTH_OPTIONS.map((month) => ({ value: month, label: `${month}월` }))}
            />
            <SelectBox
              id={fieldId("birthDay")}
              label="일"
              value={Number(profile.birthDay) > days ? "" : profile.birthDay}
              invalid={Boolean(errors.birth)}
              onChange={(value) => update("birthDay", value, "birth")}
              options={dayOptions.map((day) => ({ value: day, label: `${day}일` }))}
            />
          </div>
          <FieldError id={fieldId("birth-error")} message={errors.birth} />
        </fieldset>

        <div>
          <label htmlFor={fieldId("career")} className="label">
            배드민턴 경력 <span className="text-danger">*</span>
          </label>
          <select
            id={fieldId("career")}
            className={`input ${errors.career ? "border-danger" : ""}`}
            value={profile.career}
            onChange={(event) => update("career", event.target.value)}
            aria-invalid={errors.career ? true : undefined}
            aria-describedby={errors.career ? fieldId("career-error") : undefined}
          >
            <option value="">선택해 주세요</option>
            {CAREER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id={fieldId("career-error")} message={errors.career} />
        </div>

        <div>
          <label htmlFor={fieldId("skillLevel")} className="label">
            배드민턴 급수 <span className="text-danger">*</span>
          </label>
          <select
            id={fieldId("skillLevel")}
            className={`input ${errors.skillLevel ? "border-danger" : ""}`}
            value={profile.skillLevel}
            onChange={(event) => update("skillLevel", event.target.value)}
            aria-invalid={errors.skillLevel ? true : undefined}
            aria-describedby={[fieldId("skillLevel-help"), errors.skillLevel ? fieldId("skillLevel-error") : ""]
              .join(" ")
              .trim()}
          >
            <option value="">선택해 주세요</option>
            {CLUB_SKILL_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <p id={fieldId("skillLevel-help")} className="mt-1.5 text-body-sm text-text-muted">
            스스로 생각하는 수준을 골라 주세요. 동호회 안의 등급은 동호회에서 따로 정해요.
          </p>
          <FieldError id={fieldId("skillLevel-error")} message={errors.skillLevel} />
        </div>
      </section>

      {/* ── 선택 정보 ── */}
      <section className="flex flex-col gap-6 border-t border-border-main pt-6">
        <h2 className="text-heading-3">
          선택 정보 <span className="text-body font-normal text-text-muted">(입력하지 않아도 돼요)</span>
        </h2>

        <div>
          <label htmlFor={fieldId("nickname")} className="label">
            별명
          </label>
          <input
            id={fieldId("nickname")}
            className="input"
            maxLength={DISPLAY_NAME_RULE.maxLength}
            value={profile.nickname}
            onChange={(event) => update("nickname", event.target.value)}
          />
        </div>

        <fieldset>
          <legend className="label">사는 곳</legend>
          <div className="grid grid-cols-2 gap-2">
            <SelectBox
              id={fieldId("sido")}
              label="시·도"
              value={profile.sidoCode}
              onChange={(value) => {
                update("sidoCode", value)
                update("sigunguCode", "")
              }}
              options={KOREA_REGIONS.map((region) => ({ value: region.sidoCode, label: region.sidoName }))}
            />
            <SelectBox
              id={fieldId("sigungu")}
              label="시·군·구"
              value={profile.sigunguCode}
              disabled={sigunguOptions.length === 0}
              onChange={(value) => update("sigunguCode", value)}
              options={sigunguOptions.map((option) => ({ value: option.code, label: option.name }))}
            />
          </div>
          <p className="mt-1.5 text-body-sm text-text-muted">가까운 동호회를 찾을 때 써요.</p>
        </fieldset>
      </section>

      {/* ── 동의 ── */}
      <section className="flex flex-col gap-3 border-t border-border-main pt-6">
        <h2 className="text-heading-3">약관 동의</h2>

        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-border-strong bg-surface px-3 text-body font-semibold has-checked:border-brand has-checked:bg-brand-subtle">
          <CheckboxInput
            id={fieldId("consents")}
            checked={allChecked}
            onChange={(event) => setAllConsents(event.target.checked)}
            aria-invalid={errors.consents ? true : undefined}
            aria-describedby={errors.consents ? fieldId("consents-error") : undefined}
          />
          전체 동의
        </label>

        <ul className="flex flex-col pl-1">
          {CONSENT_ITEMS.map((item) => (
            <li key={item.key} className="flex items-center justify-between gap-3">
              <label className="flex min-h-10 cursor-pointer items-center gap-3 text-body">
                <CheckboxInput checked={consents[item.key]} onChange={(event) => setConsent(item.key, event.target.checked)} />
                <span>
                  {item.label}{" "}
                  <span className={item.required ? "text-danger" : "text-text-muted"}>
                    ({item.required ? "필수" : "선택"})
                  </span>
                </span>
              </label>
              {item.href && (
                <Link href={item.href} className="shrink-0 text-body-sm text-brand underline underline-offset-2">
                  보기
                </Link>
              )}
            </li>
          ))}
        </ul>
        <FieldError id={fieldId("consents-error")} message={errors.consents} />
      </section>

      <button type="submit" className="btn btn-primary w-full md:w-auto md:self-end">
        시작하기
      </button>
    </form>
  )
}

function FieldError({ id, message }: { id: string; message?: string }): ReactNode {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-body-sm font-semibold text-danger">
      {message}
    </p>
  )
}

/** 년·월·일, 시·도처럼 짧은 선택 상자. label은 화면에 보이지 않고 읽기용으로만 둔다 */
function SelectBox({
  id,
  label,
  value,
  options,
  onChange,
  invalid = false,
  disabled = false,
}: {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  invalid?: boolean
  disabled?: boolean
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        className={`input ${invalid ? "border-danger" : ""}`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid ? true : undefined}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
