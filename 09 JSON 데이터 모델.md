---
type: data-contract
status: draft
created: 2026-11-06
tags:
  - json
  - data-model
  - api
---

# JSON 데이터 모델

> [!summary] 사용 원칙
> 화면 설계, 목업 데이터, API 요청·응답은 이 JSON 구조를 먼저 기준으로 한다. 실제 PostgreSQL은 이 관계를 테이블로 안전하게 저장하지만, 기획 단계에서는 SQL보다 이 문서를 읽는다.

> [!tip] 한글 주석 문서
> 이 문서는 실제 JSON 구조를 간결하게 보는 기준이다. 각 데이터가 무슨 뜻인지 쉽게 읽는 한글 주석 버전은 [[12 유저 데이터 설계]]처럼 개별 설계 문서에 `JSONC` 형식으로 함께 작성한다. `JSONC`의 `//` 주석은 문서용이며 실제 API에는 넣지 않는다.

## 앱 회원 `User`

```json
{
  "id": "usr_01J...",
  "status": "active",
  "profile": {
    "displayName": "홍길동",
    "photoMediaId": null
  },
  "contact": {
    "phone": null,
    "phoneVerifiedAt": null
  },
  "preferences": {
    "lastSelectedClubId": "clb_hanbit",
    "locale": "ko-KR",
    "timezone": "Asia/Seoul"
  },
  "createdAt": "2026-11-07T10:00:00+09:00",
  "updatedAt": "2026-11-07T10:00:00+09:00",
  "deletedAt": null
}
```

- 앱 회원의 전역 정보만 가진다.
- 동호회 등급, 레이팅, 회비, 역할은 여기 넣지 않는다.
- 소셜 로그인 수단은 `UserAuthIdentity`, 약관 동의 이력은 `UserConsent`로 별도 관리한다. 자세한 기준은 [[12 유저 데이터 설계]]를 따른다.

## 내 동호회 소속 한도 `MembershipCapacity`

```jsonc
{
  "maxClubSlots": 5, // 활성 소속과 가입 승인 대기가 함께 쓰는 전체 한도
  "activeCount": 2, // 현재 정식 회원인 동호회 수
  "pendingCount": 1, // 가입 승인 대기 중인 동호회 수
  "usedCount": 3, // activeCount + pendingCount
  "remainingCount": 2 // 새로 가입 신청할 수 있는 남은 수
}
```

- `active`와 `pending` 상태는 각각 동호회 소속 슬롯 1개를 사용한다.
- 게스트 신청은 동호회 소속이 아니므로 한도에 포함하지 않는다.
- 이 구조는 `내 계정 > 내 동호회`와 새 동호회 가입 신청 화면에 함께 표시한다.

## 동호회 `Club`

```json
{
  "id": "clb_hanbit",
  "name": "한빛 배드민턴",
  "slug": "hanbit-badminton",
  "visibility": "public",
  "summary": "즐겁고 안전하게 운동하는 배드민턴 동호회",
  "contact": {
    "type": "kakao_channel",
    "value": "https://pf.kakao.com/example"
  },
  "createdAt": "2026-11-06T10:00:00+09:00"
}
```

## 동호회 미디어 저장공간 `ClubMediaUsage`

동호회가 사진을 얼마나 썼는지와, 플랜이 허용하는 총량을 별도로 관리한다. 개인 회원별 용량이 아니다.

```jsonc
{
  "clubId": "clb_hanbit", // 어느 동호회의 사진 공간인지
  "quotaBytes": 52428800, // 플랜이 허용한 전체 저장공간. 예시는 50MB
  "usedBytes": 12582912, // 현재 보관 중인 최적화 사진의 총용량. 예시는 약 12MB
  "updatedAt": "2026-11-07T10:00:00+09:00" // 마지막으로 용량을 계산한 시각
}
```

```jsonc
{
  "id": "med_01J...", // 사진 파일의 내부 번호
  "clubId": "clb_hanbit", // 사진을 소유한 동호회
  "category": "venue", // club_cover / venue / notice / post 중 어디에 쓰는 사진인지
  "file": {
    "contentType": "image/webp", // 서버가 최적화해 저장한 파일 형식
    "byteSize": 734003, // 이 사진이 할당량에서 차지하는 용량
    "width": 1600, // 저장된 사진 너비
    "height": 900 // 저장된 사진 높이
  },
  "createdByMembershipId": "mbr_01J...", // 업로드한 동호회 운영자
  "createdAt": "2026-11-07T10:00:00+09:00",
  "deletedAt": null // 삭제하면 할당량 사용량에서 제외
}
```

- 화면에는 `12MB / 50MB 사용 중`처럼 사람이 이해할 수 있는 단위로 보여 준다.
- 사진을 교체하거나 삭제하면 사용량을 즉시 다시 계산한다.
- 실제 공개 URL이나 파일 저장 위치는 일반 JSON 응답에 넣지 않는다. 화면이 필요할 때만 접근 권한을 확인해 URL을 발급한다.
- 공지·게시글 이미지 기능을 유료로 열더라도, 저장공간 계산은 같은 동호회 총량에 합산한다.

## 동호회 소속 `Membership`

```json
{
  "id": "mbr_01J...",
  "userId": "usr_01J...",
  "clubId": "clb_hanbit",
  "status": "active",
  "role": "member",
  "tier": "C",
  "rating": 1500,
  "feeStatus": "paid",
  "joinedAt": "2026-11-06T10:00:00+09:00"
}
```

| 필드 | 예시 값 | 의미 |
| --- | --- | --- |
| `status` | `pending`, `active`, `rejected`, `left`, `suspended` | 해당 동호회 가입 상태 |
| `role` | `member`, `manager`, `owner` | 해당 동호회 안의 권한 |
| `feeStatus` | `paid`, `unpaid`, `exempt` | 현재 기준 회비 상태 요약 |

## 운동 일정 `ClubSession`

```json
{
  "id": "ses_20261106_hanbit",
  "clubId": "clb_hanbit",
  "startsAt": "2026-11-06T19:00:00+09:00",
  "endsAt": "2026-11-06T22:00:00+09:00",
  "venue": {
    "name": "OO 체육관",
    "courtCount": 4
  },
  "status": "open"
}
```

## 게스트 신청 `GuestApplication`

```json
{
  "id": "gst_01J...",
  "clubId": "clb_hanbit",
  "sessionId": "ses_20261106_hanbit",
  "applicant": {
    "kind": "registered_user",
    "userId": "usr_01J...",
    "name": "홍길동"
  },
  "status": "pending",
  "formVersion": 3,
  "answers": {
    "phone": "010-1234-5678",
    "tier": "C",
    "experienceYears": 2,
    "message": "체험 참가를 희망합니다."
  },
  "privacy": {
    "consentedAt": "2026-11-06T10:00:00+09:00",
    "piiExpiresAt": "2026-11-13T23:59:59+09:00"
  },
  "review": null,
  "access": {
    "type": "guest_access_code",
    "guestAccessCodeHash": "server-side-hash-only",
    "expiresAt": "2026-11-13T23:59:59+09:00"
  }
}
```

- `applicant.kind`은 `anonymous_guest` 또는 `registered_user`다.
- 앱 회원 게스트는 `userId`를 연결해 `내 계정 > 게스트 신청 내역`에 남긴다.
- `answers`는 클럽장이 설정한 동적 양식이라 JSON 형태로 둔다.
- 비회원 게스트의 전화번호·메모 등 개인정보는 운동 종료일 기준 7일 뒤 `privacy.piiExpiresAt`에 정리 대상이다.

## 비회원 게스트 신청함

비회원은 앱 계정이 없으므로 `내 계정` 대신, 현재 브라우저 또는 앱에서 볼 수 있는 `내 게스트 신청함`을 제공한다.

```json
{
  "guestApplicationInbox": [
    {
      "applicationId": "gst_01J...",
      "clubId": "clb_hanbit",
      "clubName": "한빛 배드민턴",
      "status": "pending",
      "submittedAt": "2026-11-06T10:00:00+09:00",
      "guestAccessCode": "GST-7KQN-4P9M-2X6D",
      "expiresAt": "2026-11-13T23:59:59+09:00"
    }
  ]
}
```

- 이 JSON은 **기기에서 다시 찾아보기 위한 편의 목록**이다. 실제 신청 내용과 승인 상태의 원본은 서버에 있다.
- `guestAccessCode`는 신청번호가 아니라, 타인의 신청을 추측해 조회할 수 없도록 만든 무작위 개인 접근 코드다. 신청 데이터가 동호회 게스트 신청 DB에 등록된 뒤 발행하며, 서버에는 원문이 아닌 해시만 보관한다.
- 제출 완료 화면에서 게스트 접근 코드를 크게 보여 주고 `복사`를 권장한다. 현재 기기에는 신청함을 자동 저장한다.
- 웹에서는 가능하면 `HttpOnly` 보안 쿠키로 접근 권한을 관리하고, 화면용 목록에는 클럽명·상태처럼 민감하지 않은 정보만 저장한다.
- 인트로의 `게스트`는 이 신청함 전용 페이지로 연결한다. 기기에 신청함이 있으면 바로 목록을 보여 주고, 없으면 빈 목록 대신 `게스트 접근 코드 입력` 화면을 보여 준다.
- 브라우저 데이터 삭제·기기 변경으로 신청함이 사라지면 `게스트 접근 코드 입력` 화면에서 복사해 둔 코드를 입력한다.
- 게스트 접근 코드 자체를 잃어버린 비회원의 조회는 전화번호 등 검증 가능한 연락 수단을 필수로 받은 동호회에서만 별도 복구 절차를 제공할 수 있다. 단순 이름·전화번호 입력만으로는 조회를 허용하지 않는다.
- 신청 내용, 전화번호, 메모는 목록에 저장하거나 보여 주지 않는다. 상태 조회 화면에서 접근 권한을 확인한 뒤 필요한 최소 정보만 보여 준다.

## 운동 참가자 `SessionParticipant`

```json
{
  "id": "par_01J...",
  "sessionId": "ses_20261106_hanbit",
  "source": {
    "type": "membership",
    "id": "mbr_01J..."
  },
  "displayName": "홍길동",
  "attendanceStatus": "resting",
  "enteredAt": "2026-11-06T19:12:00+09:00",
  "exitedAt": null
}
```

| `source.type` | 의미 |
| --- | --- |
| `membership` | 정식 동호회 회원이 운동에 참가 |
| `guest_application` | 승인된 게스트 신청자가 임시 참가 |

## 경기 `Match`

```json
{
  "id": "mat_01J...",
  "clubId": "clb_hanbit",
  "sessionId": "ses_20261106_hanbit",
  "court": 1,
  "type": "doubles",
  "mode": "ranked",
  "status": "playing",
  "teams": {
    "a": ["par_01J_1", "par_01J_2"],
    "b": ["par_01J_3", "par_01J_4"]
  },
  "result": null,
  "startedAt": "2026-11-06T20:00:00+09:00"
}
```

## 홈 화면 목업 데이터

```json
{
  "currentClub": "clb_hanbit",
  "myMembership": "mbr_01J...",
  "todaySession": "ses_20261106_hanbit",
  "summary": {
    "presentCount": 18,
    "waitingCount": 4,
    "playingMatchCount": 2
  },
  "myStatus": "resting",
  "activeMatches": ["mat_01J..."],
  "unreadNotificationCount": 3,
  "importantNotificationCount": 1
}
```

## JSON 작성 규칙

- ID는 화면에서 임의의 숫자를 쓰지 않고 문자열 ID를 사용한다.
- 상태값은 자유 텍스트 대신 정해진 영문 값으로 둔다. 화면에는 한국어 라벨을 따로 매핑한다.
- 날짜·시간은 ISO 8601 형식과 시간대를 함께 저장한다.
- 개인정보는 필요한 객체에만 넣고, 회원 목록·경기 목록 응답에 무심코 포함하지 않는다.
- 화면에 필요한 응답은 필요한 정보만 조합해서 내려준다. 모든 데이터를 한 번에 내려주지 않는다.
- 동호회 유료 플랜은 사용자 개인이 아니라 `Club` 기준으로 연결한다. 실제 결제 구현 전에는 플랜 상태와 기능 사용 권한만 분리해 둔다. 자세한 내용은 [[11 수익화 및 플랜 설계]]를 따른다.

관련: [[08 데이터 설계 원칙]] · [[07 동호회 홈 화면 설계]] · [[02 UI 화면 흐름]]
