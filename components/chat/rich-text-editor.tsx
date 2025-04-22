"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
// Removed Mention extension as it requires additional configuration
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Code as CodeIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Smile,
  Send,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  placeholder?: string;
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
          class:
            "bg-zinc-800 text-zinc-100 rounded-md p-2 my-2 font-mono text-sm",
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
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 text-black rounded px-1",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      // Mention extension removed to simplify implementation
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

  const addEmoji = (emoji: any) => {
    if (editor) {
      editor.commands.insertContent(emoji.native || emoji.emoji);
    }
    setShowEmojiPicker(false);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="bg-zinc-800 text-white rounded-md shadow-lg overflow-hidden flex"
        >
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-white hover:bg-zinc-700",
              editor.isActive("bold") && "bg-zinc-700"
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-white hover:bg-zinc-700",
              editor.isActive("italic") && "bg-zinc-700"
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-white hover:bg-zinc-700",
              editor.isActive("code") && "bg-zinc-700"
            )}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <CodeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-white hover:bg-zinc-700",
              editor.isActive("link") && "bg-zinc-700"
            )}
            onClick={() => {
              const url = window.prompt("URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              } else {
                editor.chain().focus().unsetLink().run();
              }
            }}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      <div className="flex flex-col">
        <EditorContent editor={editor} className="flex-1" />
        <div className="flex items-center px-2 py-1 border-t bg-zinc-50 dark:bg-zinc-900">
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() =>
                      editor.chain().focus().toggleCodeBlock().run()
                    }
                  >
                    <CodeIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Code Block</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-none" align="start">
                <Picker
                  data={data}
                  onEmojiSelect={addEmoji}
                  theme="dark"
                  set="apple"
                  previewPosition="none"
                  skinTonePosition="none"
                  emojiSize={20}
                  emojiButtonSize={28}
                  perLine={8}
                  style={{ border: "none" }}
                />
              </PopoverContent>
            </Popover>
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
