"use client"

import { Copy, Navigation } from "lucide-react"
import { useState } from "react"

import { getKakaoDirectionsUrl, getNaverMapUrl } from "@/features/club/location"

/*
 * 체육관 위치 버튼 (DECIDE-20)
 *  - [위치 복사]: 주소만 복사
 *  - 카카오맵: 목적지가 정해진 길찾기로 연다
 *  - 네이버 지도: 주소 검색 결과로 연다(웹 길찾기 공식 URL이 없음, UNDEF-42). 그래서 버튼 이름도 "찾기"
 */

type Props = {
  venueName: string
  address: string
  location: { lat: number; lng: number }
}

type CopyState = "idle" | "done" | "failed"

const COPY_MESSAGES: Record<CopyState, string> = {
  idle: "",
  done: "주소를 복사했어요.",
  failed: "복사하지 못했어요. 주소를 길게 눌러 직접 복사해 주세요.",
}

export default function VenueActions({ venueName, address, location }: Props) {
  const [copyState, setCopyState] = useState<CopyState>("idle")

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopyState("done")
    } catch {
      setCopyState("failed")
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" className="btn btn-secondary" onClick={copyAddress}>
          <Copy className="size-5" />
          위치 복사
        </button>
        <a
          href={getKakaoDirectionsUrl(venueName, location)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <Navigation className="size-5" />
          카카오맵 길찾기
        </a>
        <a href={getNaverMapUrl(address)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          <Navigation className="size-5" />
          네이버 지도에서 찾기
        </a>
      </div>
      {/* 복사 결과는 화면 읽기 프로그램에도 알린다 */}
      <p aria-live="polite" className={`mt-2 text-body-sm ${copyState === "failed" ? "text-danger" : "text-success"}`}>
        {COPY_MESSAGES[copyState]}
      </p>
    </div>
  )
}
