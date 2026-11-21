"use client"

import dynamic from "next/dynamic"

import type { RichTextEditorProps } from "./RichTextEditorClient"

/*
 * 편집기는 브라우저에서만 그린다
 * Tiptap 내부가 Math.random()을 써서, 서버 미리 그리기(Cache Components prerender)에 넣으면 빌드가 멈춘다
 */
const RichTextEditorClient = dynamic(() => import("./RichTextEditorClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-60 rounded-lg border border-border-strong bg-surface p-3 text-body text-text-muted">
      편집기를 불러오는 중이에요.
    </div>
  ),
})

export default function RichTextEditor(props: RichTextEditorProps) {
  return <RichTextEditorClient {...props} />
}
