import type { Extensions, JSONContent } from "@tiptap/core"
import Bold from "@tiptap/extension-bold"
import Document from "@tiptap/extension-document"
import HardBreak from "@tiptap/extension-hard-break"
import Image from "@tiptap/extension-image"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import TextAlign from "@tiptap/extension-text-align"

/*
 * 공지·이벤트 본문 (DECIDE-22: Tiptap, 기능 최소)
 *  - 쓸 수 있는 것: 글, 줄바꿈, 굵게, 사진, 왼쪽·가운데 정렬
 *  - 사진은 문단 안에 들어가는 방식(inline)이라 문단을 가운데 정렬하면 사진도 가운데로 간다
 *  - 저장은 HTML이 아니라 JSON. 화면에는 허용한 요소만 나온다
 * 편집기와 공개 화면이 같은 목록을 써야 저장한 내용이 그대로 보인다
 */

export type RichTextDoc = JSONContent

export const RICH_TEXT_ALIGNMENTS = ["left", "center"] as const

export function createRichTextExtensions(): Extensions {
  return [
    Document,
    Paragraph,
    Text,
    Bold,
    HardBreak,
    Image.configure({ inline: true, allowBase64: false }),
    TextAlign.configure({ types: ["paragraph"], alignments: [...RICH_TEXT_ALIGNMENTS], defaultAlignment: "left" }),
  ]
}

/** 편집기와 공개 화면이 같이 쓰는 본문 모양. 큰 글씨 기준(본문 16px)을 따른다 */
export const RICH_TEXT_CLASS =
  "text-body [&_p]:min-h-[1.5em] [&_p+p]:mt-3 [&_strong]:font-bold [&_img]:my-2 [&_img]:inline-block [&_img]:max-h-[32rem] [&_img]:max-w-full [&_img]:rounded-lg"

/**
 * 사진 주소 검사. Tiptap 정적 렌더러는 주소 형식을 검사하지 않으므로 직접 거른다
 * 허용: https 주소, 같은 사이트 경로(/로 시작)
 * TODO: 실제 업로드가 생기면 우리 저장소 주소만 허용으로 좁힌다
 */
export function isSafeImageSrc(src: unknown, allowLocalPreview = false): src is string {
  if (typeof src !== "string") return false
  // 작성 중 미리보기에서만: 이 브라우저에서 고른 사진(blob:)
  if (allowLocalPreview && src.startsWith("blob:")) return true
  return src.startsWith("https://") || (src.startsWith("/") && !src.startsWith("//"))
}

/** 공개 화면에 내보내기 전에 허용하지 않는 사진을 뺀다 */
export function sanitizeRichText(doc: RichTextDoc, allowLocalPreview = false): RichTextDoc {
  const content = doc.content
    ?.filter((node) => node.type !== "image" || isSafeImageSrc(node.attrs?.src, allowLocalPreview))
    .map((node) => sanitizeRichText(node, allowLocalPreview))
  return content ? { ...doc, content } : doc
}

/** 줄바꿈 글을 본문 JSON으로 바꾼다. 빈 줄은 빈 문단 */
export function richTextFromPlain(text: string): RichTextDoc {
  return {
    type: "doc",
    content: text.split("\n").map((line) =>
      line ? { type: "paragraph", content: [{ type: "text", text: line }] } : { type: "paragraph" },
    ),
  }
}

/** 글자도 사진도 없는 본문인지 */
export function isRichTextEmpty(doc: RichTextDoc): boolean {
  const hasContent = (node: JSONContent): boolean =>
    (node.type === "text" && Boolean(node.text?.trim())) ||
    node.type === "image" ||
    (node.content ?? []).some(hasContent)
  return !hasContent(doc)
}
