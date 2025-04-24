"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CardSpotlight } from "./card-spotlight";
import { CheckCircle } from "lucide-react";

interface AuthStep {
  text: string;
  completed?: boolean;
}

interface AuthStepsCardProps {
  title: string;
  description: string;
  steps: AuthStep[];
  className?: string;
}

export function AuthStepsCard({
  title,
  description,
  steps,
  className,
}: AuthStepsCardProps) {
  return (
    <CardSpotlight className={cn("max-w-md", className)}>
      <div className="p-8 relative z-10">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-accent" />
              </div>
              <span className="text-base">{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </CardSpotlight>
  );
}
