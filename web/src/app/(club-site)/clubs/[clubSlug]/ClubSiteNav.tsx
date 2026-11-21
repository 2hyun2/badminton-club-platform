"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ModalShell, useModalState } from "@/components/ui/Modal"
import { CLUB_SITE_MENU, clubSitePath, isMenuVisible } from "@/features/club-site/constants"
import type { ClubSiteMenuKey } from "@/types/club-site"

/*
 * 동호회 홈페이지 머리글 (DECIDE-21)
 *  - 1024px 이상: 동호회 이름 + 가로 메뉴
 *  - 그 아래: 동호회 이름 + [메뉴] 버튼 → 하단 시트에 메뉴 목록
 *  - 지금 보고 있는 메뉴는 aria-current로 표시하고 글자색을 바꾼다
 */

type Props = {
  clubSlug: string
  clubName: string
  hiddenMenus: ClubSiteMenuKey[]
}

export default function ClubSiteNav({ clubSlug, clubName, hiddenMenus }: Props) {
  const pathname = usePathname()
  const menuModal = useModalState()

  // 운영진이 숨긴 메뉴는 빼고 보여 준다
  const items = CLUB_SITE_MENU.filter((item) => isMenuVisible({ hiddenMenus }, item.key)).map((item) => {
    const href = clubSitePath(clubSlug, item.path)
    // 홈은 정확히 같을 때만, 나머지는 상세 글(/notices/xxx)까지 같은 메뉴로 본다
    const isCurrent = item.path === "" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
    return { ...item, href, isCurrent }
  })

  return (
    <header className="border-b border-border-main bg-surface">
      <div className="page-container flex min-h-16 items-center justify-between gap-4">
        <Link href={clubSitePath(clubSlug)} className="text-heading-3 font-bold">
          {clubName}
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={item.isCurrent ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-lg px-3 text-body font-semibold hover:bg-brand-subtle ${
                    item.isCurrent ? "text-brand" : "text-text-main"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button type="button" className="btn btn-ghost lg:hidden" onClick={menuModal.open}>
          <Menu className="size-5" />
          메뉴
        </button>
      </div>

      <ModalShell state={menuModal} title={`${clubName} 메뉴`} showCloseButton onDismiss={menuModal.close}>
        <nav>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={menuModal.close}
                  aria-current={item.isCurrent ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-lg px-3 text-body font-semibold hover:bg-brand-subtle ${
                    item.isCurrent ? "bg-brand-subtle text-brand" : "text-text-main"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </ModalShell>
    </header>
  )
}
