"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { common, createLowlight } from "lowlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

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
  FileCode,
  Languages,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Create a lowlight instance with common languages
const lowlight = createLowlight(common);

interface EnhancedRichEditorProps {
  placeholder?: string;
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  onTyping?: () => void;
}

export function EnhancedRichEditor({
  placeholder = "Type a message...",
  onSend,
  disabled = false,
  className,
  onTyping,
}: EnhancedRichEditorProps) {
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("js");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Available languages for code blocks from common languages
  const languages = [
    { name: "Plain Text", value: "text" },
    { name: "HTML", value: "html" },
    { name: "CSS", value: "css" },
    { name: "JavaScript", value: "js" },
    { name: "TypeScript", value: "typescript" },
    { name: "Python", value: "python" },
    { name: "Java", value: "java" },
    { name: "C", value: "c" },
    { name: "C++", value: "cpp" },
    { name: "C#", value: "csharp" },
    { name: "PHP", value: "php" },
    { name: "Ruby", value: "ruby" },
    { name: "Go", value: "go" },
    { name: "Rust", value: "rust" },
    { name: "Shell", value: "bash" },
    { name: "JSON", value: "json" },
    { name: "Markdown", value: "markdown" },
    { name: "YAML", value: "yaml" },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable the default code block to use our custom one
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "bg-zinc-800 text-zinc-100 rounded-md p-2 my-2 font-mono text-sm overflow-auto",
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
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert focus:outline-none max-w-none min-h-[60px] p-2",
      },
    },
    onUpdate: ({ editor }) => {
      // Trigger typing indicator
      if (onTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        onTyping();
        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 2000);
      }
    },
  });

  // Handle sending the message
  const handleSend = useCallback(async () => {
    if (!editor || disabled || isSending) return;

    const content = editor.getHTML();
    if (!content || content === "<p></p>") return;

    try {
      setIsSending(true);
      await onSend(content);
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
      if (event.key === "Enter" && !event.shiftKey && !disabled && !isSending) {
        event.preventDefault();
        handleSend();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSend, disabled, isSending]);

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    if (editor) {
      editor.commands.insertContent(emoji.native);
      setShowEmojiPicker(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        editor.chain().focus().setImage({ src: result }).run();
      }
    };
    reader.readAsDataURL(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Insert a code block with the selected language
  const insertCodeBlock = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .toggleCodeBlock({ language: selectedLanguage })
        .run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Bubble menu for selected text */}
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
            editor.isActive("highlight") && "bg-zinc-700"
          )}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <span className="px-1 bg-yellow-200 text-black rounded text-xs">
            H
          </span>
        </Button>
      </BubbleMenu>

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
                    disabled={disabled}
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
                    disabled={disabled}
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
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={disabled}
                  >
                    <CodeIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Inline Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Code Block with Language Selection */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        disabled={disabled}
                      >
                        <FileCode className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Code Block</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="start">
                <div className="p-2">
                  <div className="mb-2 text-sm font-medium">
                    Select Language
                  </div>
                  <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.value}
                        className={cn(
                          "cursor-pointer",
                          selectedLanguage === lang.value &&
                            "bg-zinc-100 dark:bg-zinc-800"
                        )}
                        onClick={() => {
                          setSelectedLanguage(lang.value);
                          insertCodeBlock();
                        }}
                      >
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                        disabled={disabled}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-auto p-0" align="start">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                  set="native"
                />
              </PopoverContent>
            </Popover>

            {/* Image Upload */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                  >
                    <ImageIcon className="h-4 w-4" />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload Image</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="ml-auto">
            <Button
              variant="default"
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSend}
              disabled={disabled || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
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
