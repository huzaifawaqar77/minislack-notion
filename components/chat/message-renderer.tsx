"use client";

import React from "react";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

interface MessageRendererProps {
  content: string;
  className?: string;
}

export function MessageRenderer({ content, className }: MessageRendererProps) {
  // Format code blocks with backticks (```code```) to look like code blocks
  const formatCodeBlocks = (text: string) => {
    // Split by code block markers
    const parts = text.split(/```([\s\S]*?)```/);

    if (parts.length <= 1) {
      return <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>;
    }

    return (
      <>
        {parts.map((part, index) => {
          // Even indices are regular text, odd indices are code blocks
          if (index % 2 === 0) {
            return part ? (
              <p key={index} style={{ whiteSpace: "pre-wrap" }}>
                {part}
              </p>
            ) : null;
          } else {
            return (
              <pre
                key={index}
                className="bg-zinc-800 text-zinc-100 rounded-md p-2 my-2 font-mono text-sm"
              >
                <code>{part}</code>
              </pre>
            );
          }
        })}
      </>
    );
  };

  // Check if content contains HTML tags
  const containsHtml = /<[a-z][\s\S]*>/i.test(content);

  if (containsHtml) {
    // Sanitize the HTML content to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "s",
        "code",
        "pre",
        "blockquote",
        "ul",
        "ol",
        "li",
        "a",
        "span",
        "mark",
        "img",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "class",
        "src",
        "alt",
        "width",
        "height",
      ],
    });

    return (
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-code:bg-zinc-800 prose-code:text-zinc-100 prose-code:rounded-md prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm",
          "prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-pre:rounded-md prose-pre:p-2 prose-pre:my-2",
          "prose-a:text-blue-500 prose-a:underline prose-a:cursor-pointer",
          "prose-img:rounded-md prose-img:max-w-full prose-img:max-h-64",
          className
        )}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  } else {
    // For plain text or markdown-like content
    return (
      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-code:bg-zinc-800 prose-code:text-zinc-100 prose-code:rounded-md prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm",
          "prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-pre:rounded-md prose-pre:p-2 prose-pre:my-2",
          "prose-a:text-blue-500 prose-a:underline prose-a:cursor-pointer",
          "prose-img:rounded-md prose-img:max-w-full prose-img:max-h-64",
          className
        )}
      >
        {content.includes("```") ? (
          formatCodeBlocks(content)
        ) : (
          <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
        )}
      </div>
    );
  }
}
