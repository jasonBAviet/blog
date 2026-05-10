"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import {
  StarterKit,
  ImageExtension,
  PlaceholderExtension,
  LinkExtension,
  ImageDropPasteExtension,
} from "@/lib/editor-extensions";
import { useCallback, useRef } from "react";

interface PostEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function PostEditor({ content, onChange }: PostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "rounded-lg my-4 max-w-full" },
      }),
      PlaceholderExtension.configure({
        placeholder: "Paste nội dung từ Facebook vào đây...",
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      ImageDropPasteExtension,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[260px] sm:min-h-[300px] px-4 py-3 text-[15px] leading-relaxed font-serif",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const input = fileInputRef.current;
    if (input) {
      input.value = "";
      input.click();
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !editor) return;
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = () => {
          editor
            .chain()
            .focus()
            .setImage({ src: reader.result as string })
            .run();
        };
        reader.readAsDataURL(file);
      }
    },
    [editor]
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Nhập URL liên kết:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-neutral-200 px-2 py-1.5 dark:border-neutral-800">
        <ToolBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="In đậm"
        >
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="In nghiêng"
        >
          <em>I</em>
        </ToolBtn>
        <Separator />
        <ToolBtn
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Tiêu đề H2"
        >
          H2
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Tiêu đề H3"
        >
          H3
        </ToolBtn>
        <Separator />
        <ToolBtn
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Danh sách"
        >
          <BulletIcon />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Danh sách số"
        >
          <OrderedIcon />
        </ToolBtn>
        <ToolBtn
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Trích dẫn"
        >
          <QuoteIcon />
        </ToolBtn>
        <Separator />
        <ToolBtn active={editor.isActive("link")} onClick={addLink} label="Chèn liên kết">
          <LinkIcon />
        </ToolBtn>
        <ToolBtn active={false} onClick={addImage} label="Chèn ảnh">
          <ImageIcon />
        </ToolBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolBtn({
  children,
  active,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={
        "flex h-9 w-9 flex-none items-center justify-center rounded text-xs transition-colors sm:h-7 sm:w-7 " +
        (active
          ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white"
          : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800")
      }
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-0.5 h-4 w-px bg-neutral-200 dark:bg-neutral-700" />;
}

function BulletIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 4.5a1 1 0 110-2 1 1 0 010 2zm3 0h8a.5.5 0 000-1H6a.5.5 0 000 1zm0 3h8a.5.5 0 000-1H6a.5.5 0 000 1zm0 3h8a.5.5 0 000-1H6a.5.5 0 000 1zm-3-1a1 1 0 110-2 1 1 0 010 2zm0 4a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

function OrderedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 3.5h8a.5.5 0 000-1H6a.5.5 0 000 1zm0 3h8a.5.5 0 000-1H6a.5.5 0 000 1zm0 3h8a.5.5 0 000-1H6a.5.5 0 000 1zM2 1.5h1v5h-1v-1h.5V2.5H2v-1zm0 6h1.5a.5.5 0 01.5.5V9h-.5v.5H4v1H2v-1h.5V10h-.5V9.5H3.5V8.5a.5.5 0 01.5-.5H2v-1zm1 4H2v-1h.5v.5H4v1h-.5v.5H4v1H2v-1h.5V12h-.5v-.5H3V11z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M2.5 3a.5.5 0 000 1h11a.5.5 0 000-1h-11zm0 3a.5.5 0 000 1h6a.5.5 0 000-1h-6zM12 7v3h-1V8.5a.5.5 0 00-.5-.5H9v-1h3zM4 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6.354 9.646l3.292-3.292M10.5 7.5l1.146-1.146a3 3 0 00-4.243-4.243L6.257 3.257M5.5 8.5L4.354 9.646a3 3 0 104.243 4.243L9.743 12.74" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M1.5 1.5h13v13h-13v-13zm1 1v11h11v-11h-11zm1.5 8l2-2.5 1.5 2 2.5-3.5L13 10.5H4z" />
    </svg>
  );
}
