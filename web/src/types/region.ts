/** 시·도와 그 아래 시·군·구 선택지 */
export type RegionOption = {
  sidoCode: string
  sidoName: string
  sigunguOptions: { code: string; name: string }[]
}
