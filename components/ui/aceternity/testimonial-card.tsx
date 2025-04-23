"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  avatarSrc?: string;
  className?: string;
}

export function TestimonialCard({
  quote,
  name,
  title,
  avatarSrc,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="mb-4 text-lg font-medium italic text-card-foreground">
        "{quote}"
      </div>
      <div className="mt-auto flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarSrc} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
    </div>
  );
}
