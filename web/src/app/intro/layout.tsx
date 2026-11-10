import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "시작하기",
    description: "내 동호회 출석과 경기를 한 곳에서 확인하세요. 간편 로그인하거나 게스트로 둘러볼 수 있어요."
};

export default function IntroLayout({ children }: { children: ReactNode }) {
  return (
      <main className="flex items-center justify-center min-h-dvh">
        <div className="card max-w-xl w-full">{children}</div>
      </main>
  );
}
