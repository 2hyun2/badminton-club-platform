import { renderToReactElement } from "@tiptap/static-renderer/pm/react"

import { RICH_TEXT_CLASS, createRichTextExtensions, sanitizeRichText, type RichTextDoc } from "@/features/editor/rich-text"

/*
 * 저장된 본문(JSON)을 화면에 그린다. 편집기 없이 서버에서도 그릴 수 있다
 * 편집기와 같은 기능 목록만 쓰므로, 허용하지 않은 요소는 나오지 않는다
 */
type Props = {
  content: RichTextDoc
  className?: string
  /** 작성 중 미리보기 전용: 이 브라우저에서 고른 사진도 보여 준다. 공개 화면에서는 쓰지 않는다 */
  allowLocalPreview?: boolean
}

export default function RichTextView({ content, className = "", allowLocalPreview = false }: Props) {
  return (
    <div className={`${RICH_TEXT_CLASS} ${className}`}>
      {renderToReactElement({ content: sanitizeRichText(content, allowLocalPreview), extensions: createRichTextExtensions() })}
    </div>
  )
}
