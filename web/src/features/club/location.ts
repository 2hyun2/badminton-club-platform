/*
 * 체육관 위치 버튼 (DECIDE-20)
 *  - 길찾기는 앱이 직접 하지 않고 카카오맵·네이버 지도로 넘긴다
 *  - [위치 복사]는 주소만 복사한다
 */

type LatLng = { lat: number; lng: number }

/** 카카오맵 길찾기: 목적지가 정해진 상태로 열린다. 형식 /link/to/이름,위도,경도 */
export function getKakaoDirectionsUrl(placeName: string, { lat, lng }: LatLng) {
  return `https://map.kakao.com/link/to/${encodeURIComponent(placeName)},${lat},${lng}`
}

/**
 * 네이버 지도: 주소 검색 결과로 연다. 사용자가 그 화면에서 길찾기를 누른다
 * TEMP: UNDEF-42 — 네이버 웹 길찾기 URL 형식을 공식 문서로 확인하지 못해 검색 URL을 쓴다
 */
export function getNaverMapUrl(address: string) {
  return `https://map.naver.com/p/search/${encodeURIComponent(address)}`
}
