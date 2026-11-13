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
  "recruitment": {
    // 정식 동호회 가입 신청을 받는지 여부
    "membership": {
      "isOpen": false
    },
    // 지인 동반·체험 방문을 위한 게스트 신청 여부. 가입 모집과 독립적이다.
    "guest": {
      "isOpen": true
    }
  },
  "contact": {
    "type": "kakao_channel",
    "value": "https://pf.kakao.com/example"
  },
  "createdAt": "2026-11-06T10:00:00+09:00"
}
```

- `membership.isOpen`과 `guest.isOpen`은 서로 영향을 주지 않는다. 가입 모집을 마감해도 게스트는 받을 수 있고, 반대로 가입은 받되 게스트 신청은 닫을 수 있다.
- 공개 동호회 카드와 홈페이지에서는 두 상태를 각각 `가입 모집 중/마감`, `게스트 신청 가능`으로 표시한다.
- 게스트 신청이 닫힌 동호회는 공개 홈페이지에서 게스트 버튼을 숨기고, 직접 신청 URL로 진입해도 `현재 게스트 신청을 받지 않습니다.` 안내만 보여 준다.

## 공개 동호회 검색 카드 `ClubSearchItem`

`Club` 원본 전체를 검색 목록에 그대로 보내지 않는다. 동호회 찾아보기 화면에는 공개 범위에서 필요한 요약 정보만 보낸다.

```jsonc
{
  "id": "clb_hanbit",
  "slug": "hanbit-badminton",
  "name": "한빛 배드민턴",
  "summary": "즐겁고 안전하게 운동하는 성동구 주말 동호회",
  "region": {
    "sidoCode": "seoul", // 지도 주소를 정규화한 서비스 내부 식별값
    "sidoName": "서울특별시",
    "sigunguCode": "seongdong-gu",
    "sigunguName": "성동구"
  },
  "venueName": "성동구민종합체육센터",
  "activitySummary": "토요일 09:00 · 일요일 10:00",
  "memberCount": 48, // 현재 활성 회원 수를 조회해 만든 화면용 값
  "membershipCondition": {
    "gender": "all", // all / female / male. 공개 모집 조건
    "skillLevels": ["초중급", "중급", "중상급"]
  },
  "recruitment": {
    "membership": { "isOpen": false },
    "guest": { "isOpen": true }
  }
}
```

- 지역 필터의 형식은 `시·도 → 시·군·구`로 고정한다. 전국 목록을 미리 넣지 않고, 현재 공개 검색에 노출되는 동호회의 정규화된 지역만 선택지로 만든다.
- 탐색 화면의 `운동 수준`은 서비스 공통 분류인 `초급`, `초중급`, `중급`, `중상급`, `상급`만 사용한다.
- `membershipCondition.gender`와 `skillLevels`는 공개 동호회 탐색을 위한 모집 조건이다. 회원의 동호회 내부 등급이나 게스트 신청 답변과 같은 값으로 취급하지 않는다.

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

```jsonc
{
  "id": "mbr_01J...",
  "userId": "usr_01J...",
  "clubId": "clb_hanbit",
  "status": "active",
  "role": "member",
  "tier": "C", // 동호회 내부 등급의 표시값. 서비스 공통 급수는 아님
  "rating": 1500,
  "feeStatus": "paid",
  "joinedAt": "2026-11-06T10:00:00+09:00"
}
```

| 필드 | 예시 값 | 의미 |
| --- | --- | --- |
| `status` | `pending`, `active`, `rejected`, `left`, `suspended` | 해당 동호회 가입 상태 |
| `role` | `member`, `manager`, `owner` | 해당 동호회 안의 권한 |
| `tier` | `C`, `1조` 등 | 동호회가 자체적으로 정한 내부 등급 표시값. MVP에서는 고정 목록·등급 설정 화면을 만들지 않는다. |
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
  "formId": "gform_01J...",
  "formVersion": 3,
  "answers": {
    "phone": "010-1234-5678",
    "skillLevel": "중급",
    "experienceYears": 2,
    "message": "체험 참가를 희망합니다."
  },
  "privacy": {
    "consentedAt": "2026-11-06T10:00:00+09:00",
    "piiExpiresAt": "2026-11-13T23:59:59+09:00"
  },
  "review": {
    "decision": null, // approved / rejected / cancelled
    "reviewedByMembershipId": null,
    "reviewedAt": null,
    "reason": null
  },
  "access": {
    "type": "guest_access_code",
    "guestAccessCodeHash": "server-side-hash-only",
    "expiresAt": "2026-11-13T23:59:59+09:00"
  }
}
```

- `applicant.kind`은 `anonymous_guest` 또는 `registered_user`다.
- 앱 회원 게스트는 `userId`를 연결해 `내 계정 > 게스트 신청 내역`에 남긴다.
- `formId`와 `formVersion`은 신청 당시 공개된 양식을 가리킨다. 양식 정의가 바뀌어도 과거 신청을 같은 기준으로 해석할 수 있어야 한다.
- `answers`는 클럽장이 설정한 동적 양식이라 JSON 형태로 둔다.
- 승인·거절·취소의 운영 이력은 `review`와 별도 상태 이력으로 보존하며, `reason`에는 거절·취소 사유만 넣는다.
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

## 인증 수단 `UserAuthIdentity`

한 사람이 카카오·Google·Apple을 함께 연결할 수 있으므로, `User` 안에 제공자 하나만 저장하지 않는다.

```jsonc
{
  "id": "auth_01J...", // 로그인 수단 연결 자체의 고유 번호
  "userId": "usr_01J...", // 연결된 앱 회원
  "provider": "kakao", // kakao / google / apple
  "providerUserId": "oauth-provider-id", // 제공자 내부 식별값. 화면에는 노출하지 않음
  "connectedAt": "2026-11-07T10:00:00+09:00",
  "lastSignedInAt": "2026-11-07T10:00:00+09:00"
}
```

액세스 토큰·갱신 토큰은 일반 JSON 응답이나 `User` 데이터에 넣지 않는다.

## 약관 동의 `UserConsent`

동의 여부 하나만 덮어쓰지 않고, 문서 버전과 동의 시각을 기록한다.

```jsonc
{
  "id": "con_01J...",
  "userId": "usr_01J...",
  "type": "service_terms", // service_terms / privacy_policy / age_confirmation
  "version": "2026-11-01",
  "agreedAt": "2026-11-07T10:00:00+09:00",
  "withdrawnAt": null
}
```

## 게스트 신청 양식 `GuestForm`

양식의 정의와 신청 당시의 답변은 분리한다. 신청에는 `formVersion`을 남겨 나중에 양식이 바뀌어도 당시 기준을 재현한다.

```jsonc
{
  "id": "gform_01J...",
  "clubId": "clb_hanbit",
  "version": 3,
  "status": "published", // draft / published / archived
  "fields": [
    {
      "key": "name",
      "type": "text", // text / phone / select / number / textarea
      "label": "이름",
      "required": true,
      "privacy": {
        "isPersonalData": true,
        "purpose": "게스트 참가 심사 및 참가 일정 안내"
      }
    },
    {
      "key": "skillLevel",
      "type": "select",
      "label": "급수",
      "required": false,
      "options": ["초심", "A", "B", "C", "D"]
    }
  ],
  "privacy": {
    "retentionDaysAfterSession": 7,
    "viewerRoles": ["owner", "manager"]
  },
  "updatedByMembershipId": "mbr_01J...",
  "updatedAt": "2026-11-07T10:00:00+09:00"
}
```

`fields`와 `answers`에는 초기 버전에서 허용한 표준 항목만 사용한다. 클럽장이 임의의 민감정보나 자유로운 개인정보 수집 문구를 추가하지 않게 한다.

게스트 양식의 `skillLevel`은 동호회가 방문 심사를 위해 받는 답변이다. 선택지는 동호회가 정할 수 있으며, 공개 동호회 탐색의 공통 `운동 수준`을 기본 제안값으로만 제공한다. `Membership.tier`와 같은 의미로 연결하지 않는다.

## 출석 원본 `Attendance`

`SessionParticipant`는 해당 운동의 현재 참가자 상태를 보여 주는 연결 데이터이고, 입장·퇴장 이력은 별도 출석 기록으로 남긴다.

```jsonc
{
  "id": "att_01J...",
  "sessionParticipantId": "par_01J...",
  "type": "entered", // entered / exited / corrected
  "occurredAt": "2026-11-06T19:12:00+09:00",
  "recordedByMembershipId": "mbr_01J_manager",
  "reason": null
}
```

운영자가 잘못된 출석을 정정해도 기존 기록을 지우기보다 정정 사유와 함께 이력을 남긴다.

## 경기 참가자·결과 `MatchParticipant`

경기 팀과 참가자를 별도 관계로 보관해 회원·게스트 모두 같은 경기 모델을 사용한다.

```jsonc
{
  "id": "matpar_01J...",
  "matchId": "mat_01J...",
  "sessionParticipantId": "par_01J_1",
  "team": "a", // a / b
  "result": "win", // win / loss / draw / null (경기 전)
  "rating": {
    "before": 1500, // 회원 참가자만 기록
    "after": 1512,
    "delta": 12
  } // 게스트 참가자면 rating은 null
}
```

`Match.teams`는 화면 응답을 빠르게 조합하기 위한 팀별 참가자 ID 투영이며, 경기 참가의 원본은 `MatchParticipant` 관계다. `Match.result`에는 종료 시각·점수·무효화 상태를 남기고, 레이팅 변동은 참가자별 스냅샷 또는 별도 이력으로 보존한다. 결과를 다시 계산할 수 있어야 하므로 현재 레이팅 숫자만 덮어쓰지 않는다.

- 게스트는 `Membership`이 없으므로 `rating`은 항상 `null`이고, 레이팅 변동 이력도 남기지 않는다.
- 복식 팀에 게스트와 회원이 함께 있으면 팀 레이팅은 그 회원의 레이팅으로 계산한다. 회원의 ELO는 평소처럼 변동한다.
- 게스트 단식 참가 시 상대 회원 ELO를 반영할지는 **미정**이다.

```jsonc
{
  "status": "completed", // playing / completed / voided
  "result": {
    "score": { "a": 21, "b": 18 },
    "winner": "a",
    "completedAt": "2026-11-06T20:25:00+09:00",
    "voidedAt": null, // playing 상태에서만 기록 가능. 무효화 경기는 레이팅 변동 없음
    "voidReason": null // playing 상태에서만 남기는 무효 사유
  }
}
```

무효화는 결과 확정 전 `playing` 상태에서만 할 수 있다. 레이팅은 `completed` 결과를 확정할 때만 반영하므로, `voided` 경기는 레이팅 변동·원복 대상이 아니다.

## 알림·공지·읽음 기록

개인 알림은 유저별로 저장하고, 동호회 공지는 원본 하나와 유저별 읽음 기록을 분리한다.

```jsonc
{
  "userNotification": {
    "id": "ntf_01J...",
    "userId": "usr_01J...",
    "clubId": "clb_hanbit",
    "type": "membership_approved",
    "priority": "normal", // normal / important
    "title": "한빛 배드민턴 가입이 승인되었어요",
    "body": "이제 동호회 홈과 운동 기록을 확인할 수 있어요.",
    "reference": { "type": "membership", "id": "mbr_01J..." },
    "createdAt": "2026-11-07T10:00:00+09:00",
    "readAt": null,
    "expiresAt": null
  },
  "clubAnnouncement": {
    "id": "ann_01J...",
    "clubId": "clb_hanbit",
    "authorMembershipId": "mbr_01J_manager",
    "audience": { "type": "active_members_at_publish" },
    "priority": "important",
    "title": "이번 주 체육관이 변경됩니다",
    "body": "OO체육관 2층으로 와 주세요.",
    "publishedAt": "2026-11-07T10:00:00+09:00",
    "expiresAt": "2026-11-14T23:59:59+09:00",
    "deletedAt": null
  },
  "announcementReadReceipt": {
    "announcementId": "ann_01J...",
    "userId": "usr_01J...",
    "readAt": "2026-11-07T10:30:00+09:00"
  }
}
```

회원 입장·경기 시작처럼 현재 화면만 갱신하는 실시간 이벤트는 기본적으로 알림함에 저장하지 않는다.

## 1:1 레슨·정산

레슨은 운동 세션·경기와 별도의 예약 기능이다. 승인 시점에만 동호회별 정산 원장을 변동시키며, 잔액이 음수여도 참여를 막지 않는다.

```jsonc
{
  "clubCoach": {
    "id": "coach_01J...",
    "clubId": "clb_hanbit",
    "displayName": "김코치",
    "type": "external", // member / external
    "linkedMembershipId": null,
    "status": "active"
  },
  "lessonSession": {
    "id": "lses_01J...",
    "clubId": "clb_hanbit",
    "coachId": "coach_01J...",
    "lessonDate": "2026-11-22",
    "startsAt": "2026-11-22T18:00:00+09:00",
    "endsAt": "2026-11-22T21:00:00+09:00",
    "capacity": 8, // 그날 진행할 레슨 횟수 정원
    "pricePerPerson": 20000, // 레슨 1회 비용
    "approvalMode": "manual",
    "status": "open" // open / closed / completed. full은 저장하지 않고 조회 때 계산
  },
  "lessonApplication": {
    "id": "lapp_01J...",
    "lessonSessionId": "lses_01J...",
    "applicantMembershipId": "mbr_01J...",
    "quantity": 3, // 신청한 레슨 횟수. 1 이상의 정수이며 같은 회원의 중복 신청도 허용
    "status": "pending", // pending / approved / rejected / cancelled / completed / no_show
    "priceSnapshot": 20000,
    "creditStatus": "not_charged", // not_charged / charged / refunded
    "reviewedByMembershipId": null,
    "reviewedAt": null
  },
  "clubSettlementAccount": {
    "clubId": "clb_hanbit",
    "membershipId": "mbr_01J...",
    "balance": -20000 // 양수는 적립 잔액, 음수는 미수금
  },
  "clubSettlementLedger": {
    "id": "ledger_01J...",
    "clubId": "clb_hanbit",
    "membershipId": "mbr_01J...",
    "amount": -20000,
    "type": "lesson_charge", // manual_deposit / dues_charge / lesson_charge / lesson_refund / adjustment
    "description": "1:1 레슨 승인",
    "relatedLessonApplicationId": "lapp_01J...",
    "createdByMembershipId": "mbr_01J_manager",
    "createdAt": "2026-11-22T17:00:00+09:00"
  }
}
```

레슨은 1:1 수업이지만, 서비스가 회원별 시간 순서를 배정하지 않는다. 실제 레슨 순서는 동호회 내부 소통으로 정하고, `LessonSession.capacity`는 그날 진행할 레슨 **횟수**만 관리한다. 같은 회원의 여러 신청을 허용하며, `pending` 또는 `approved` 신청은 각각 `quantity`만큼 정원을 차지한다. 남은 정원은 `capacity - 활성 신청의 quantity 합계`로 계산한다.

신청 처리에서는 `lesson_sessions` 행을 `SELECT ... FOR UPDATE`로 잠근 뒤 활성 신청의 `quantity` 합계와 `capacity`를 확인한다. `full`은 저장하지 않고 조회할 때 계산하는 것을 우선한다. 운영진이 활성 신청 `quantity` 합계보다 정원을 낮춰도 기존 신청은 자동 취소하지 않으며, 필요한 거절·수량 조정은 운영진이 직접 처리한다. 부분 승인이 필요하면 운영진이 `quantity`를 먼저 수정한 뒤 그 신청 전체를 승인한다. 승인 원장 금액은 `priceSnapshot × quantity`다.

신청·승인·취소·환불 정책은 아직 확정하지 않은 부분이 있으므로, 승인된 레슨 취소 시 환불 여부는 `lesson_refund` 원장 생성 규칙으로 나중에 연결한다.

## 동호회 플랜·기능 권한

플랜은 개인이 아니라 동호회에 귀속한다. 실제 결제·카드·영수증은 결제 기능을 도입할 때 별도 구조로 추가한다.

```jsonc
{
  "clubPlan": {
    "clubId": "clb_hanbit",
    "planCode": "free",
    "status": "active",
    "trialEndsAt": null,
    "currentPeriodEndsAt": null,
    "billingManagerMembershipId": "mbr_01J_manager"
  },
  "featureEntitlement": {
    "clubId": "clb_hanbit",
    "feature": "advanced_statistics",
    "enabled": false,
    "source": "plan" // plan / add_on / manual
  }
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
