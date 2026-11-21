"use client"

import { AlignCenter, AlignLeft, Bold as BoldIcon, ImagePlus } from "lucide-react"
import { EditorContent, useEditor, useEditorState } from "@tiptap/react"
import { Placeholder, UndoRedo } from "@tiptap/extensions"
import { useRef, useState, type ReactNode } from "react"

import { RICH_TEXT_CLASS, createRichTextExtensions, type RichTextDoc } from "@/features/editor/rich-text"

/*
 * 공지·이벤트 본문 편집기 (DECIDE-22)
 *  - 버튼 4개만: 굵게 · 왼쪽 정렬 · 가운데 정렬 · 사진 넣기. 되돌리기는 Ctrl+Z
 *  - 버튼에 글자를 함께 써서 무슨 버튼인지 바로 알 수 있게 한다
 *  - 사진은 커서가 있는 문단에 들어간다. 그 문단을 [가운데]로 두면 사진도 가운데
 * TEMP: UNDEF-49 — 사진 업로드 서버가 없어 고른 사진은 이 브라우저에서만 보인다(저장되지 않음). 10MB까지
 */

const IMAGE_MAX_BYTES = 10 * 1024 * 1024

export type RichTextEditorProps = {
  /** 편집 영역의 이름표 id. 편집 영역은 input이 아니라서 label for 대신 aria-labelledby로 잇는다 */
  labelledBy: string
  value: RichTextDoc
  onChange: (value: RichTextDoc) => void
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}

export default function RichTextEditorClient({ labelledBy, value, onChange, placeholder = "내용을 입력해 주세요.", invalid, describedBy }: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState("")

  const editor = useEditor({
    extensions: [...createRichTextExtensions(), UndoRedo, Placeholder.configure({ placeholder })],
    content: value,
    // Next.js 서버 렌더링과 어긋나지 않도록 브라우저에서 처음 그린다
    immediatelyRender: false,
    editorProps: {
      attributes: {
        "aria-labelledby": labelledBy,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(invalid ? { "aria-invalid": "true" } : {}),
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      center: current?.isActive({ textAlign: "center" }) ?? false,
    }),
  })

  const addImage = (file: File | undefined) => {
    if (!editor || !file) return
    if (!file.type.startsWith("image/")) {
      setImageError("사진 파일만 넣을 수 있어요.")
      return
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setImageError("사진은 10MB까지 넣을 수 있어요.")
      return
    }
    setImageError("")
    // TODO: 업로드 API가 생기면 서버 주소(https)로 바꾼다
    editor.chain().focus().setImage({ src: URL.createObjectURL(file), alt: "" }).run()
  }

  return (
    <div>
      <div
        className={`overflow-hidden rounded-lg border bg-surface focus-within:border-brand ${
          invalid ? "border-danger" : "border-border-strong"
        }`}
      >
        <div className="flex flex-wrap gap-1 border-b border-border-main bg-app-bg p-1.5">
          <ToolButton pressed={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <BoldIcon className="size-4" />
            굵게
          </ToolButton>
          <ToolButton pressed={state ? !state.center : undefined} onClick={() => editor?.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="size-4" />
            왼쪽
          </ToolButton>
          <ToolButton pressed={state?.center} onClick={() => editor?.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="size-4" />
            가운데
          </ToolButton>
          <ToolButton onClick={() => fileRef.current?.click()}>
            <ImagePlus className="size-4" />
            사진 넣기
          </ToolButton>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              addImage(event.target.files?.[0])
              event.target.value = ""
            }}
          />
        </div>
        <EditorContent
          editor={editor}
          className={`${RICH_TEXT_CLASS} px-3 py-3 [&_.ProseMirror]:min-h-48 [&_.ProseMirror]:outline-none [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-brand [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-text-muted [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]`}
        />
      </div>
      {imageError && <p className="mt-1.5 text-body-sm text-danger">{imageError}</p>}
    </div>
  )
}

function ToolButton({ pressed, onClick, children }: { pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-body-sm font-semibold hover:bg-brand-subtle ${
        pressed ? "bg-brand-subtle text-brand" : "text-text-main"
      }`}
    >
      {children}
    </button>
  )
}
