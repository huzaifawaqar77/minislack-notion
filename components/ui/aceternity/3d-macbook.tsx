"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface MacBookProps {
  className?: string;
  screenshotUrl: string;
  altText?: string;
}

export function MacBook({
  className,
  screenshotUrl,
  altText = "App Screenshot",
}: MacBookProps) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* MacBook Frame */}
        <div className="relative w-full max-w-4xl aspect-[16/10] bg-zinc-800 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          {/* Screen Bezel */}
          <div className="absolute inset-[3%] bg-zinc-900 rounded-lg">
            {/* Screen */}
            <div className="absolute inset-[2%] overflow-hidden rounded-md bg-black">
              {/* Screenshot */}
              <div className="relative w-full h-full">
                <Image
                  src={screenshotUrl}
                  alt={altText}
                  className="object-cover w-full h-full"
                  priority
                  width={1200}
                  height={800}
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>

          {/* MacBook Bottom (Keyboard Area) */}
          <div
            className="absolute -bottom-[5%] left-0 right-0 h-[10%] bg-zinc-700 rounded-b-xl"
            style={{ transform: "rotateX(45deg)", transformOrigin: "top" }}
          >
            {/* Trackpad */}
            <div className="absolute top-[20%] left-[30%] right-[30%] bottom-[20%] bg-zinc-800 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
