"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  className?: string;
  children: React.ReactNode;
}

export function CardSpotlight({
  children,
  className = "",
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { left, top } = containerRef.current!.getBoundingClientRect();
      mouseX.current = event.clientX - left;
      mouseY.current = event.clientY - top;

      const spotlight = containerRef.current!.querySelector(
        ".spotlight"
      ) as HTMLElement;
      if (spotlight) {
        spotlight.style.background = `radial-gradient(600px circle at ${mouseX.current}px ${mouseY.current}px, rgba(245, 158, 11, 0.15), transparent 40%)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMounted]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg bg-background/80 backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900/90",
        className
      )}
    >
      {/* Spotlight effect */}
      <div className="spotlight absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-accent/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]" />

      {children}
    </div>
  );
}
