import { MapPin } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { PAGE_FALLBACK, SitePage, loadClub, requireMenu } from "../_shared"
import VenueActions from "../VenueActions"

/*
 * 오시는 길 (/clubs/[clubSlug]/location) (DECIDE-20·21)
 * 체육관 이름·주소 + [위치 복사](주소만) + 카카오맵·네이버 지도 길찾기
 * TODO: 카카오 지도 API 키가 생기면 화면 안 지도를 넣는다
 */
export const metadata: Metadata = { title: "오시는 길" }

type Params = PageProps<"/clubs/[clubSlug]/location">["params"]

export default function ClubLocationPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <ClubLocation params={params} />
    </Suspense>
  )
}

async function ClubLocation({ params }: { params: Params }) {
  const { clubSlug } = await params
  const { club, site } = loadClub(clubSlug)
  requireMenu(site, "location")

  return (
    <SitePage title="오시는 길">
      <div className="card max-w-[40rem]">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-5 shrink-0 text-text-muted" />
          <span>
            <span className="block text-heading-3">{club.venueName}</span>
            <span className="mt-1 block text-body text-text-muted">{club.venueAddress}</span>
          </span>
        </p>
        <div className="mt-4">
          <VenueActions venueName={club.venueName} address={club.venueAddress} location={club.venueLocation} />
        </div>
      </div>
    </SitePage>
  )
}
