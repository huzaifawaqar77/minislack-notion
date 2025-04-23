"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  children: React.ReactNode;
}

export function Spotlight({
  children,
  className = "",
}: SpotlightProps) {
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
      
      const spotlight = containerRef.current!.querySelector(".spotlight") as HTMLElement;
      if (spotlight) {
        spotlight.style.background = `radial-gradient(600px circle at ${mouseX.current}px ${mouseY.current}px, rgba(120, 255, 180, 0.15), transparent 40%)`;
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
        "relative w-full overflow-hidden rounded-md bg-background",
        className
      )}
    >
      <div className="spotlight absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </div>
  );
}
