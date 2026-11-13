import type { Metadata } from "next";
import localFont from "next/font/local"

import './css/globals.css'
import "./css/reset.css"


export const metadata: Metadata = {
  title: "badminton-club-platform",
  description: "hybird app",
};

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`h-full bg-app-bg ${pretendard.variable}`}>
      <body className="min-h-full flex flex-col text-body text-text-main">
        <div className="flex-1 py-6">{children}</div>
      </body>
    </html>
  );
}
