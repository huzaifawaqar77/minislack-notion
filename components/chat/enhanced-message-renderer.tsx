"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css"; // Import a theme for syntax highlighting

// Import specific languages we want to support
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";

// Register the languages
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);

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

      // Process code blocks in HTML content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = sanitizedContent;

      // Find all code blocks
      const codeBlocks = tempDiv.querySelectorAll("pre code");
      codeBlocks.forEach((codeBlock) => {
        // Get the language from the class if available
        const classNames = codeBlock.className.split(" ");
        let language = "";

        for (const className of classNames) {
          if (className.startsWith("language-")) {
            language = className.replace("language-", "");
            break;
          }
        }

        // Only try to highlight if we have a valid language
        if (language && language !== "text") {
          try {
            const code = codeBlock.textContent || "";
            const highlighted = hljs.highlight(code, { language }).value;
            codeBlock.innerHTML = highlighted;
            // Add the language class to ensure proper styling
            codeBlock.className = `hljs language-${language}`;
          } catch (error) {
            console.warn(`Failed to highlight code with language: ${language}`);
            // If highlighting fails, just keep the original content
          }
        }
      });

      setProcessedContent(tempDiv.innerHTML);
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

      // Default to javascript if no language is specified
      if (!language) {
        language = "text";
      }

      try {
        // Only try to highlight if we have a supported language
        let highlighted = code;

        // Check if the language is supported
        if (language !== "text") {
          try {
            highlighted = hljs.highlight(code, { language }).value;
          } catch (e) {
            // If the language isn't supported, try auto-detection
            try {
              highlighted = hljs.highlightAuto(code).value;
            } catch (e2) {
              // If auto-detection fails, just use the plain code
              highlighted = DOMPurify.sanitize(code);
            }
          }
        } else {
          // For plain text, just sanitize
          highlighted = DOMPurify.sanitize(code);
        }

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

  // Create a ref to track if the component is mounted
  const isMounted = useRef(false);

  // Apply syntax highlighting to code blocks after rendering
  useEffect(() => {
    // Set mounted state
    isMounted.current = true;

    // Find all code blocks and apply syntax highlighting
    const applyHighlighting = () => {
      if (!isMounted.current) return;

      const codeBlocks = document.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        try {
          // Get the language from the class if available
          const classNames = block.className.split(" ");
          let language = "";

          for (const className of classNames) {
            if (className.startsWith("language-")) {
              language = className.replace("language-", "");
              break;
            }
          }

          // Only try to highlight if we have a valid language
          if (language && language !== "text") {
            hljs.highlightElement(block as HTMLElement);
          }
        } catch (error) {
          console.warn("Failed to highlight code block:", error);
        }
      });
    };

    // Apply highlighting immediately
    applyHighlighting();

    // And also after a short delay to ensure DOM is fully updated
    const timeoutId = setTimeout(applyHighlighting, 100);

    return () => {
      isMounted.current = false;
      clearTimeout(timeoutId);
    };
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
