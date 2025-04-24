"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { CardSpotlight } from "./card-spotlight";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
}: FeatureCardProps) {
  return (
    <CardSpotlight className={className}>
      <div className="p-8 relative z-10 flex flex-col h-full">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </div>
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground flex-grow">{description}</p>
      </div>
    </CardSpotlight>
  );
}
