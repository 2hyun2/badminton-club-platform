import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

type BackLinkProps = {
    href: string;
    // 어디로 돌아가는지 화면마다 직접 적는다 (DECIDE-13)
    label: string;
}

type PageHeadingProps = {
    title: string;
    // 신청서처럼 동호회 이름을 굵게 넣는 설명이 있어 ReactNode로 받는다
    description?: ReactNode;
}

export function BackLink({href, label} : BackLinkProps) {
    return (
        <Link href={href} className="btn btn-ghost pl-2">
            <ChevronLeft className="size-6" />
            {label}
        </Link>
    )
}

export function PageHeading({title, description} : PageHeadingProps) {
    return (
        <div className="mt-4">
            <h1 className="text-heading-1">{title}</h1>
            {description && <p className="text-body text-text-muted mt-2">{description}</p>}
        </div>
    )
}
