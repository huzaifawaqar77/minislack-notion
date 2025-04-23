"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  children: string;
  className?: string;
  charClassName?: string;
  wordClassName?: string;
  splitBy?: "chars" | "words";
  animation?: "fade-up" | "fade-in" | "slide-in";
}

export function SplitText({
  children,
  className,
  charClassName,
  wordClassName,
  splitBy = "chars",
  animation = "fade-up",
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(".split-text-animated");
    
    elements.forEach((el, index) => {
      const delay = index * 0.05;
      (el as HTMLElement).style.animationDelay = `${delay}s`;
    });
  }, [children]);

  const renderContent = () => {
    if (splitBy === "chars") {
      return children.split("").map((char, index) => (
        <span
          key={index}
          className={cn(
            "split-text-animated inline-block opacity-0",
            animation === "fade-up" && "animate-fade-up",
            animation === "fade-in" && "animate-fade-in",
            animation === "slide-in" && "animate-slide-in",
            charClassName
          )}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));
    } else {
      return children.split(" ").map((word, index) => (
        <span
          key={index}
          className={cn(
            "split-text-animated inline-block opacity-0 mr-[0.25em]",
            animation === "fade-up" && "animate-fade-up",
            animation === "fade-in" && "animate-fade-in",
            animation === "slide-in" && "animate-slide-in",
            wordClassName
          )}
        >
          {word}
        </span>
      ));
    }
  };

  return (
    <div ref={containerRef} className={cn("inline", className)}>
      {renderContent()}
    </div>
  );
}
