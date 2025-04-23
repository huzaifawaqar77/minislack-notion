"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";
import { common } from "lowlight";
import "highlight.js/styles/atom-one-dark.css"; // Import a theme for syntax highlighting

interface EnhancedMessageRendererProps {
  content: string;
  className?: string;
}

export function EnhancedMessageRenderer({
  content,
  className,
}: EnhancedMessageRendererProps) {
  const [processedContent, setProcessedContent] = useState<string>(content);

  useEffect(() => {
    // Process the content when it changes
    processContent();
  }, [content]);

  const processContent = () => {
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
          "div",
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
          "style",
          "data-language",
        ],
      });

      setProcessedContent(sanitizedContent);
    } else {
      // For plain text or markdown-like content, format it
      const formattedContent = formatMarkdownLikeContent(content);
      setProcessedContent(formattedContent);
    }
  };

  // Format markdown-like content (for backward compatibility)
  const formatMarkdownLikeContent = (text: string): string => {
    // Handle code blocks with backticks
    let formatted = text.replace(/```([\s\S]*?)```/g, (match, codeContent) => {
      // Try to detect language from the first line
      const firstLine = codeContent.trim().split("\n")[0];
      const languageMatch = firstLine.match(/^([a-zA-Z0-9_+-]+)$/);

      let language = "";
      let code = codeContent;

      // If language is specified in the first line, extract it
      if (languageMatch) {
        language = languageMatch[1].toLowerCase();
        code = codeContent.substring(firstLine.length).trim();
      }

      try {
        // Try to highlight the code with the detected language
        const highlighted = language
          ? hljs.highlight(code, { language }).value
          : hljs.highlightAuto(code).value;

        return `<pre class="bg-zinc-800 text-zinc-100 rounded-md p-2 my-2 font-mono text-sm overflow-auto"><code class="hljs language-${language}">${highlighted}</code></pre>`;
      } catch (error) {
        // Fallback if highlighting fails
        return `<pre class="bg-zinc-800 text-zinc-100 rounded-md p-2 my-2 font-mono text-sm overflow-auto"><code>${DOMPurify.sanitize(
          code
        )}</code></pre>`;
      }
    });

    // Handle inline code with single backticks
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="bg-zinc-800 text-zinc-100 rounded-md px-1 font-mono text-sm">$1</code>'
    );

    // Handle bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Handle italic text
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Handle links
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
    );

    // Wrap in paragraph with pre-wrap for proper whitespace handling
    return `<p style="white-space: pre-wrap;">${formatted}</p>`;
  };

  // Apply syntax highlighting to code blocks after rendering
  useEffect(() => {
    // Find all code blocks and apply syntax highlighting
    const codeBlocks = document.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [processedContent]);

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-code:bg-zinc-800 prose-code:text-zinc-100 prose-code:rounded-md prose-code:px-1 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm",
        "prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-pre:rounded-md prose-pre:p-2 prose-pre:my-2 prose-pre:overflow-auto",
        "prose-a:text-blue-500 prose-a:underline prose-a:cursor-pointer",
        "prose-img:rounded-md prose-img:max-w-full prose-img:max-h-64",
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
