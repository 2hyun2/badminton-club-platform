"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import type { ClubBanner } from "@/types/club-site"

/*
 * 홈 배너 (DECIDE-21)
 *  - TEMP: UNDEF-45 — 저절로 넘어가지 않는다. 이전·다음 버튼으로만 넘긴다(읽는 속도가 느린 사용자 배려)
 *  - 이미지가 없으면 브랜드 색 배경에 글자만
 *  - 배너가 1장이면 넘기기 버튼을 숨긴다
 */
export default function BannerSlider({ banners }: { banners: ClubBanner[] }) {
  const [index, setIndex] = useState(0)
  const count = banners.length
  const banner = banners[index]
  const move = (step: number) => setIndex((current) => (current + step + count) % count)

  const content = (
    <div
      className="flex min-h-56 flex-col justify-end rounded-xl bg-brand bg-cover bg-center p-6 text-white md:min-h-72 md:p-10"
      style={
        banner.imageUrl
          ? { backgroundImage: `linear-gradient(to top, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0.1)), url(${banner.imageUrl})` }
          : undefined
      }
    >
      <p className="text-display md:text-[2rem]">{banner.title}</p>
      <p className="mt-2 text-body md:text-heading-3">{banner.subtitle}</p>
    </div>
  )

  return (
    <section>
      {banner.linkHref ? (
        <Link href={banner.linkHref} className="block rounded-xl">
          {content}
        </Link>
      ) : (
        content
      )}

      {count > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button type="button" className="btn btn-ghost px-2" onClick={() => move(-1)} aria-label="이전 배너">
            <ChevronLeft className="size-5" />
          </button>
          <p className="min-w-12 text-center text-body-sm tabular-nums text-text-muted">
            {index + 1} / {count}
          </p>
          <button type="button" className="btn btn-ghost px-2" onClick={() => move(1)} aria-label="다음 배너">
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </section>
  )
}
