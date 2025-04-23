"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText = "Get Started",
  buttonLink = "/register",
  className,
}: PricingCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all duration-300",
        popular && "border-accent/50 shadow-lg shadow-accent/10",
        hovered && "shadow-xl transform -translate-y-1",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <div className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Most Popular
          </div>
        </div>
      )}
      <div className="mb-5">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mb-5">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Free" && (
            <span className="ml-1 text-sm text-muted-foreground">/month</span>
          )}
        </div>
      </div>
      <ul className="mb-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckIcon
              className={cn(
                "mr-2 h-5 w-5",
                feature.included ? "text-accent" : "text-muted-foreground opacity-50"
              )}
            />
            <span
              className={cn(
                "text-sm",
                !feature.included && "text-muted-foreground opacity-50"
              )}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Link href={buttonLink}>
          <Button
            className={cn(
              "w-full",
              popular ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""
            )}
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </div>
  );
}
