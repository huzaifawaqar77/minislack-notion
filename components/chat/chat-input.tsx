"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EnhancedRichEditor } from "./enhanced-rich-editor";
// Keep the SimpleRichEditor import for backward compatibility
import { SimpleRichEditor } from "./simple-rich-editor";

interface ChatInputProps {
  onSendMessage: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onTyping?: () => void;
}

export function ChatInput({
  onSendMessage,
  placeholder,
  disabled = false,
  className,
  onTyping,
}: ChatInputProps) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || disabled || isSending) return;

      try {
        setIsSending(true);
        // Send the HTML content directly - we'll render it properly
        await onSendMessage(content);
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error; // Re-throw to let the editor component handle it
      } finally {
        setIsSending(false);
      }
    },
    [onSendMessage, disabled, isSending]
  );

  return (
    <div className={cn("p-2", className)}>
      <EnhancedRichEditor
        placeholder={placeholder}
        onSend={handleSend}
        disabled={disabled || isSending}
        className="bg-white dark:bg-zinc-900"
        onTyping={onTyping}
      />
    </div>
  );
}
