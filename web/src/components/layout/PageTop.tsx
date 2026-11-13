import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type BackLinkProps = {
    href: string;
    label?: string;
}

type PageHeadingProps = {
    title: string;
    description: string;
}

export function BackLink({href, label = "뒤로가기"} : BackLinkProps) {
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
