export type GuestSessionOption = {
  id: string
  dateLabel: string
  timeLabel: string
}

export type GuestApplicationStatus = "pending" | "approved" | "rejected" | "expired"

/** 게스트 신청 내역 카드에 보여 줄 값. 양식 답변은 넣지 않는다. (10 게스트 신청 내역) */
export type GuestInboxItem = {
  applicationId: string
  clubSlug: string
  sessionLabel: string
  status: GuestApplicationStatus
  submittedLabel: string
}
