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
        {/* MacBook Pro Container */}
        <div className="relative w-full max-w-4xl">
          {/* MacBook Pro Mockup */}
          <div className="relative w-full">
            {/* Main Body with subtle perspective */}
            <div
              className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              style={{
                perspective: "1000px",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Laptop Lid with Screen */}
              <div
                className="relative w-full h-full bg-[#1e1e1e] rounded-[20px] overflow-hidden"
                style={{
                  transform: "rotateX(5deg)",
                  transformOrigin: "bottom",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.05) inset",
                }}
              >
                {/* Screen Bezel */}
                <div className="absolute inset-[6px] rounded-[16px] bg-[#121212] overflow-hidden">
                  {/* Camera Notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[10px] bg-[#1e1e1e] rounded-b-[10px] z-10"></div>

                  {/* Screen Content */}
                  <div className="absolute inset-[2px] rounded-[14px] overflow-hidden">
                    <div className="w-full h-full p-[8px]">
                      <Image
                        src={screenshotUrl}
                        alt={altText}
                        className="w-full h-full rounded-lg"
                        priority
                        width={1200}
                        height={800}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Base (Keyboard Area) - Just a hint */}
              <div
                className="absolute -bottom-[10px] left-[5%] right-[5%] h-[10px] bg-[#1a1a1a] rounded-b-[10px]"
                style={{
                  transform: "rotateX(80deg)",
                  transformOrigin: "top",
                  boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                }}
              ></div>
            </div>

            {/* Subtle Shadow */}
            <div className="absolute -bottom-6 left-[10%] right-[10%] h-4 bg-black/15 blur-xl rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
