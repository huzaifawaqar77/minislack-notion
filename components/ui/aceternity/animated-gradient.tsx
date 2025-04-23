"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  gradientClassName?: string;
}

export function AnimatedGradient({
  children,
  className,
  containerClassName,
  gradientClassName,
}: AnimatedGradientProps) {
  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-accent/30 via-accent/10 to-accent/30 opacity-50",
          "animate-gradient-x",
          gradientClassName
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
