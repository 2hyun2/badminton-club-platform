"use client"

import { Clock, MapPin, Search, SlidersHorizontal, Users } from "lucide-react"
import Link from "next/link"
import { useId, useState } from "react"

import {
  CLUB_SKILL_LEVEL_OPTIONS,
  DEFAULT_CLUB_SEARCH_FILTERS,
  GENDER_LABELS,
  getClubSearchRegionOptions,
} from "@/features/club/constants"
import { CLUB_SEARCH_ITEMS, isPublicField } from "@/mocks"
import type { ClubSearchFilters, ClubSearchItem } from "@/types/club"

import { CheckboxInput, RadioInput } from "@/components/ui/controls"
import StatusBadge from "@/components/ui/StatusBadge"
import { ModalShell, useModalState, type DismissReason } from "@/components/ui/Modal"

/*
 * 동호회 찾아보기 (/clubs)
 * 기준: 공용 mocks ClubSearchFilters · [[09 JSON 데이터 모델]] 공개 동호회 검색 카드 · [[01 디자인 시스템]] 선택·필터 모달
 *  - 검색어는 입력 즉시 반영, 나머지 조건은 필터 시트에서 [적용]을 눌러야 반영
 *  - 조건을 바꾼 뒤에는 배경·Esc로 닫히지 않음(×는 취소)
 *  - 가입 모집과 게스트 신청 상태는 서로 독립 → 배지를 따로 표시
 * TEMP: UNDEF-15 카드 항목 순서 · UNDEF-16 성별 필터 의미
 */

type SheetFilters = Omit<ClubSearchFilters, "keyword">

/* 공개 동호회 목록에서 지역 필터 선택지를 만든다. 실제 API가 생기면 서버 응답으로 바꾼다 */
const CLUB_SEARCH_REGIONS = getClubSearchRegionOptions(CLUB_SEARCH_ITEMS)

const DEFAULT_SHEET: SheetFilters = {
  sido: DEFAULT_CLUB_SEARCH_FILTERS.sido,
  sigungu: DEFAULT_CLUB_SEARCH_FILTERS.sigungu,
  gender: DEFAULT_CLUB_SEARCH_FILTERS.gender,
  skillLevel: DEFAULT_CLUB_SEARCH_FILTERS.skillLevel,
  membershipRecruitment: DEFAULT_CLUB_SEARCH_FILTERS.membershipRecruitment,
  guestApplication: DEFAULT_CLUB_SEARCH_FILTERS.guestApplication,
}

const GENDER_OPTIONS: { value: SheetFilters["gender"]; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "female", label: "여성 가입 가능" },
  { value: "male", label: "남성 가입 가능" },
]

function matchesKeyword(club: ClubSearchItem, keyword: string) {
  const word = keyword.trim()
  if (!word) return true
  return [club.name, club.summary, club.venueName, club.region.sigunguName].some((text) => text.includes(word))
}

function matchesSheet(club: ClubSearchItem, filters: SheetFilters) {
  if (filters.sido !== "all" && club.region.sidoCode !== filters.sido) return false
  if (filters.sigungu !== "all" && club.region.sigunguCode !== filters.sigungu) return false
  // TEMP: UNDEF-16 — "여성" 필터는 여성 전용 + 성별 무관 동호회를 함께 보여 준다
  const gender = club.membershipCondition.gender
  if (filters.gender !== "all" && gender !== "all" && gender !== filters.gender) return false
  if (filters.skillLevel !== "all" && !club.membershipCondition.skillLevels.includes(filters.skillLevel)) return false
  if (filters.membershipRecruitment === "open" && !club.recruitment.membership.isOpen) return false
  if (filters.guestApplication === "open" && !club.recruitment.guest.isOpen) return false
  return true
}

function countActive(filters: SheetFilters) {
  return [
    filters.sido !== "all",
    filters.gender !== "all",
    filters.skillLevel !== "all",
    filters.membershipRecruitment === "open",
    filters.guestApplication === "open",
  ].filter(Boolean).length
}

function isSameSheet(a: SheetFilters, b: SheetFilters) {
  return (Object.keys(a) as (keyof SheetFilters)[]).every((key) => a[key] === b[key])
}

export default function ClubSearch() {
  const modal = useModalState()
  const [keyword, setKeyword] = useState("")
  const [applied, setApplied] = useState<SheetFilters>(DEFAULT_SHEET)
  const [draft, setDraft] = useState<SheetFilters>(DEFAULT_SHEET)
  const keywordId = useId()
  const genderName = useId()
  const sidoId = useId()
  const sigunguId = useId()
  const skillId = useId()

  const results = CLUB_SEARCH_ITEMS.filter((club) => matchesKeyword(club, keyword) && matchesSheet(club, applied))
  const activeCount = countActive(applied)
  const isChanged = !isSameSheet(draft, applied)
  const sigunguOptions = CLUB_SEARCH_REGIONS.find((region) => region.sidoCode === draft.sido)?.sigunguOptions ?? []

  const openSheet = () => {
    setDraft(applied)
    modal.open()
  }

  const handleDismiss = (reason: DismissReason) => {
    if (reason !== "close-button" && isChanged) return
    modal.close()
  }

  const apply = () => {
    setApplied(draft)
    modal.close()
  }

  const resetAll = () => {
    setKeyword("")
    setApplied(DEFAULT_SHEET)
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={keywordId} className="sr-only">
            동호회 이름·지역·체육관 검색
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-text-muted" />
          <input
            id={keywordId}
            type="search"
            enterKeyHint="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="동호회 이름, 지역, 체육관"
            className="input pl-10"
          />
        </div>
        <button type="button" className="btn btn-secondary shrink-0" onClick={openSheet}>
          <SlidersHorizontal className="size-[18px]" />
          조건 필터{activeCount > 0 && <span className="tabular-nums">({activeCount})</span>}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p aria-live="polite" className="text-body font-semibold">
          동호회 <span className="tabular-nums">{results.length}</span>곳
        </p>
        {(activeCount > 0 || keyword) && (
          <button type="button" className="btn btn-ghost" onClick={resetAll}>
            조건 초기화
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="card mt-3 py-8 text-center">
          <p className="text-body font-semibold">조건에 맞는 동호회가 없어요.</p>
          <p className="mt-2 text-body-sm text-text-muted">검색어나 조건을 줄여 보세요.</p>
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {results.map((club) => (
            <li key={club.id} className="min-w-0">
              <ClubCard club={club} />
            </li>
          ))}
        </ul>
      )}

      <ModalShell
        state={modal}
        title="동호회 조건 필터"
        showCloseButton
        onDismiss={handleDismiss}
        footer={
          <>
            <button type="button" className="btn btn-ghost w-full md:w-auto" onClick={() => setDraft(DEFAULT_SHEET)}>
              선택 초기화
            </button>
            <button type="button" className="btn btn-primary w-full md:w-auto" onClick={apply}>
              적용
            </button>
          </>
        }
      >
        <fieldset>
          <legend className="label">지역</legend>
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <label htmlFor={sidoId} className="sr-only">
                시·도
              </label>
              <select
                id={sidoId}
                className="input"
                value={draft.sido}
                onChange={(event) => setDraft({ ...draft, sido: event.target.value, sigungu: "all" })}
              >
                <option value="all">시·도 전체</option>
                {CLUB_SEARCH_REGIONS.map((region) => (
                  <option key={region.sidoCode} value={region.sidoCode}>
                    {region.sidoName}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor={sigunguId} className="sr-only">
                시·군·구
              </label>
              <select
                id={sigunguId}
                className="input"
                value={draft.sigungu}
                disabled={draft.sido === "all"}
                onChange={(event) => setDraft({ ...draft, sigungu: event.target.value })}
              >
                <option value="all">시·군·구 전체</option>
                {sigunguOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="label">성별 조건</legend>
          <div className="flex flex-col">
            {GENDER_OPTIONS.map((option) => (
              <label key={option.value} className="flex min-h-10 cursor-pointer items-center gap-3 text-body has-disabled:cursor-not-allowed">
                <RadioInput
                  name={genderName}
                  value={option.value}
                  checked={draft.gender === option.value}
                  onChange={() => setDraft({ ...draft, gender: option.value })}
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-body-sm text-text-muted">성별 무관 동호회는 항상 함께 보여요.</p>
        </fieldset>

        <div className="mt-5">
          <label htmlFor={skillId} className="label">
            운동 수준
          </label>
          <select
            id={skillId}
            className="input"
            value={draft.skillLevel}
            onChange={(event) => setDraft({ ...draft, skillLevel: event.target.value })}
          >
            <option value="all">전체</option>
            {CLUB_SKILL_LEVEL_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="mt-5">
          <legend className="label">모집 상태</legend>
          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-body has-disabled:cursor-not-allowed">
            <CheckboxInput
              checked={draft.membershipRecruitment === "open"}
              onChange={(event) => setDraft({ ...draft, membershipRecruitment: event.target.checked ? "open" : "all" })}
            />
            가입 모집 중인 동호회만
          </label>
          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-body has-disabled:cursor-not-allowed">
            <CheckboxInput
              checked={draft.guestApplication === "open"}
              onChange={(event) => setDraft({ ...draft, guestApplication: event.target.checked ? "open" : "all" })}
            />
            게스트 신청 가능한 동호회만
          </label>
        </fieldset>

        {isChanged && (
          <p className="mt-3 text-body-sm text-text-muted">바꾼 조건은 [적용]을 눌러야 목록에 반영돼요.</p>
        )}
      </ModalShell>
    </>
  )
}

function ClubCard({ club }: { club: ClubSearchItem }) {
  const showMemberCount = isPublicField(club.slug, "memberCount")

  return (
    <Link
      href={`/clubs/${club.slug}`}
      className="card flex h-full flex-col gap-3 hover:border-brand hover:bg-brand-subtle"
    >
      <div>
        <h2 className="break-keep text-heading-3">{club.name}</h2>
        <p className="mt-1 text-body text-text-muted">{club.summary}</p>
      </div>

      <dl className="flex flex-col gap-1.5 text-body-sm">
        <div className="flex gap-2">
          <dt>
            <MapPin className="mt-0.5 size-4 text-text-muted" />
            <span className="sr-only">장소</span>
          </dt>
          <dd className="min-w-0">
            {club.region.sigunguName} · {club.venueName}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt>
            <Clock className="mt-0.5 size-4 text-text-muted" />
            <span className="sr-only">운동 시간</span>
          </dt>
          <dd className="min-w-0">{club.activitySummary}</dd>
        </div>
        <div className="flex gap-2">
          <dt>
            <Users className="mt-0.5 size-4 text-text-muted" />
            <span className="sr-only">회원·가입 조건</span>
          </dt>
          <dd className="min-w-0">
            {showMemberCount && (
              <>
                회원 <span className="tabular-nums">{club.memberCount}</span>명 ·{" "}
              </>
            )}
            {GENDER_LABELS[club.membershipCondition.gender]} · {club.membershipCondition.skillLevels.join(", ")}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        {club.recruitment.membership.isOpen ? (
          <StatusBadge label="가입 모집 중" className="border-brand bg-brand-subtle text-brand" />
        ) : (
          <StatusBadge label="가입 마감" className="border-border-strong bg-surface text-text-muted" />
        )}
        {club.recruitment.guest.isOpen && (
          <StatusBadge label="게스트 신청 가능" className="border-success bg-success/10 text-success" />
        )}
      </div>
    </Link>
  )
}
