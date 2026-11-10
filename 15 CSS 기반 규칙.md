---
type: frontend-foundation
status: draft
created: 2026-11-09
updated: 2026-11-10
tags:
  - css
  - reset
  - nextjs
  - design-system
---

# CSS Reset과 전역 기반 규칙

## 문서 역할: Design · CSS · 적용

UI 항목은 [[01 디자인 시스템]]의 공통 기록 형식을 따른다.

| 구분 | 이 문서에서 확인할 내용 | 다른 문서에서 확인할 내용 |
| --- | --- | --- |
| Design | - | 목적·시각 규칙은 [[01 디자인 시스템]] |
| CSS | 실제 파일 위치, 토큰 연결, 공통 클래스, reset·접근성 규칙 | 화면별 유틸리티 조합은 구현 파일 |
| 적용 | 적용을 위한 기술 제약과 확인 사항 | 실제 화면·경로·상태는 각 화면 설계 문서 |

화면 문서에서 새 Box·Text·Section을 정할 때는 먼저 Design을 확정하고, 이 문서에서 공통 CSS로 묶을지 판단한 뒤, 화면 문서의 적용 위치와 함께 구현한다.

## 실제 파일 위치

```text
<web-root>/src/app/
├─ css/
│  ├─ globals.css
│  └─ reset.css
└─ fonts/
```

이전 문서의 `src/styles/reset.css`, `src/app/globals.css` 위치는 현재 코드와 다르므로 사용하지 않는다.

## Reset 원칙

- `reset.css`는 Tailwind layer 밖에서 먼저 적용한다. 현재는 문제를 확인하며 조정하는 방식으로 유지한다.
- Reset은 박스 계산, 기본 여백, 미디어 표시 방식처럼 브라우저 차이만 최소한으로 정리한다.
- 버튼·입력창의 테두리·높이·배경 등 디자인 규격은 reset이 아니라 `.btn`, `.input` 같은 공통 클래스에서 정한다.
- `outline: none`, 링크 밑줄 전체 제거처럼 접근성을 없애는 reset은 쓰지 않는다.

## 현재 알려진 충돌

| 규칙 | 문제 | 나중의 해결 방법 |
| --- | --- | --- |
| `button, input { color: inherit; font: inherit; }` | layer 밖의 reset이 Tailwind의 `text-body-sm`, `font-semibold`, `text-white`를 덮을 수 있다. | reset을 `@layer base`에 넣거나, 해당 줄을 reset에서 제거한다. |
| `body { color: var(--color-text); background: var(--color-bg); }` | 실제 토큰은 `--color-text-main`, `--color-app-bg`라서 이름이 맞지 않는다. | 실제 토큰 이름으로 변경한다. |
| `body { font-family: Pretendard, ...; }` | `next/font/local`은 해시된 글꼴 이름을 사용하므로 직접 `Pretendard`를 쓰면 매칭되지 않을 수 있다. | layout에서 `variable: "--font-pretendard"`를 설정하고 `@theme inline`의 `--font-sans`에 연결한다. |

## 폰트 연결 목표

```tsx
// layout.tsx의 방향 예시
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard"
});
```

```css
/* globals.css의 방향 예시 */
@theme inline {
  --font-sans: var(--font-pretendard), -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

실제 폰트 파일명과 import 경로는 구현 시점의 파일 구조에 맞춘다.

## 공통 CSS 컴포넌트 클래스

묶는 클래스는 아래 기본 다섯 개만 둔다.

```text
.btn + 종류 4개
.input
.label
.card
.page-container
```

클래스를 만들 기준은 다음 세 가지다. 둘 이상 해당할 때만 묶는다.

1. 디자인 문서에 규격이 고정되어 있다.
2. 같은 CSS 조합이 반복된다.
3. hover·focus·disabled 같은 상태 규칙이 얽혀 있다.

### `.btn`

```text
.btn
├─ .btn-primary
├─ .btn-secondary
├─ .btn-ghost
└─ .btn-danger
```

- `.btn`은 40px 높이, nowrap, 글자 굵기, 테두리 두께, focus·disabled 동작처럼 모든 버튼이 공유하는 규칙만 가진다.
- 너비, 바깥 여백, 위치는 넣지 않는다. 각 화면에서 `w-full`, `mt-4` 같은 유틸리티로 정한다.
- `.btn-lg`, `.card-lg` 같은 크기 변형 클래스는 만들지 않는다. 필요한 곳에서 유틸리티로 덮어쓴다.

### `.input`, `.label`, `.card`, `.page-container`

- `.input`: 40px 높이, 1px 테두리, focus 상태처럼 모든 입력창의 공통 규칙만 둔다.
- `.label`: 입력 항목명·선택 여부·도움말의 공통 글자 규칙만 둔다.
- `.card`: 배경, 테두리, 기본 radius처럼 공통 골격만 둔다. 내부 여백·너비·위치는 쓰는 곳에서 정한다.
- `.page-container`: 최대 폭과 좌우 거터만 둔다. 화면별 세로 여백과 배치는 각 페이지가 정한다.

같은 CSS 조합을 세 번째 쓰게 되었을 때 이름을 붙이는 것을 기본 원칙으로 한다.

관련: [[01 디자인 시스템]] · [[14 웹 폴더 구조]]
