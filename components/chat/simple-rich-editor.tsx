"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Placeholder from "@tiptap/extension-placeholder";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Code as CodeIcon,
  Send,
  Loader2,
} from "lucide-react";

interface SimpleRichEditorProps {
  placeholder?: string;
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function SimpleRichEditor({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  className,
}: SimpleRichEditorProps) {
  const [isSending, setIsSending] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-zinc-800 text-zinc-100 rounded-md p-2 my-2 font-mono text-sm",
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: "bg-zinc-800 text-zinc-100 rounded-md px-1 font-mono text-sm",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[60px] p-2",
      },
    },
  });

  const handleSend = useCallback(async () => {
    if (!editor || !editor.getText().trim() || disabled || isSending) return;

    try {
      setIsSending(true);
      const htmlContent = editor.getHTML();
      await onSend(htmlContent);
      editor.commands.clearContent();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [editor, onSend, disabled, isSending]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSend();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSend]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <div className="flex flex-col">
        <EditorContent editor={editor} className="flex-1" />
        <div className="flex items-center px-2 py-1 border-t bg-zinc-50 dark:bg-zinc-900">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code Block"
            >
              <CodeIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="ml-auto">
            <Button
              type="button"
              size="sm"
              disabled={!editor.getText().trim() || disabled || isSending}
              onClick={handleSend}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
