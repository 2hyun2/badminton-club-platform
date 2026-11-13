import type { Metadata } from "next";
import Link from "next/link";

import { BackLink, PageHeading } from "@/components/layout/PageTop";
import { Compass, Inbox, ChevronRight } from "lucide-react";


export const metadata: Metadata = {
    title: "게스트",
    description: "동호회를 찾고, 게스트 신청 목록을 확인해보세요."
}

export default function GuestPage() {
    return (
        <main className="page-container">
            <BackLink href="/intro" label="처음으로"/>

            <PageHeading title="게스트" description="동호회를 둘러보고, 체험 참가를 신청하거나 신청 상태를 확인하세요." />

            <nav className="grid gap-4 md:grid-cols-2 mt-6">
                <Link href="/clubs" className="card flex min-h-24 items-center gap-4 p-5 hover:border-brand">
                    <span className="flex items-center justify-center size-12 text-white bg-brand rounded-full">
                        <Compass className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-heading-3">동호회 찾아보기</span>
                        <span className="mt-1 block text-body-sm text-text-muted">지역, 등급 조건으로 동호회를 찾고 게스트도 신청해요.</span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-text-muted" />
                </Link>
                <Link href="/clubs" className="card flex min-h-24 items-center gap-4 p-5 hover:border-brand">
                    <span className="flex items-center justify-center size-12 text-white bg-brand rounded-full">
                        <Inbox className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-heading-3">게스트 신청 목록</span>
                        <span className="mt-1 block text-body-sm text-text-muted">이 기기에서 신청한 게스트 신청 상태를 확인해요.</span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-text-muted" />
                </Link>
            </nav>

            <div className="border-t border-brand pt-6 mt-6">
                <p className="text-body text-text-muted">로그인하면 기록들을 안전하게 관리할 수 있어요.</p>
                <Link href="/intro" className="btn btn-ghost w-full bg-white mt-2">로그인·회원가입</Link>
            </div>
        </main>
    )
}