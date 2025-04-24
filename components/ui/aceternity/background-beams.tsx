"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BackgroundBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  beamColor?: string;
  gridSize?: number;
  beamCount?: number;
  beamOpacity?: number;
  beamLength?: number;
  beamWidth?: number;
  beamSpeed?: number;
}

interface Beam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  speed: number;
  progress: number;
  width: number;
  opacity: number;
  length: number;
  gridX: number;
  gridY: number;
}

export const BackgroundBeams = ({
  className,
  beamColor = "#f59e0b", // Amber-500 color
  gridSize = 10,
  beamCount = 10,
  beamOpacity = 0.5,
  beamLength = 200,
  beamWidth = 2,
  beamSpeed = 0.01,
  ...props
}: BackgroundBeamsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const beamsRef = useRef<Beam[]>([]);
  const gridRef = useRef<{ x: number; y: number }[][]>([]);

  // We'll move the RGB calculation inside useEffect

  useEffect(() => {
    // Set initial size
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } =
          canvasRef.current.parentElement.getBoundingClientRect();
        setSize({ width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;

        // Initialize grid
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;
        const newGrid: { x: number; y: number }[][] = [];

        for (let y = 0; y < gridSize; y++) {
          const row: { x: number; y: number }[] = [];
          for (let x = 0; x < gridSize; x++) {
            row.push({
              x: x * cellWidth + cellWidth / 2,
              y: y * cellHeight + cellHeight / 2,
            });
          }
          newGrid.push(row);
        }

        gridRef.current = newGrid;

        // Initialize beams
        initializeBeams();
      }
    };

    const initializeBeams = () => {
      const beams: Beam[] = [];

      for (let i = 0; i < beamCount; i++) {
        beams.push(createBeam());
      }

      beamsRef.current = beams;
    };

    const createBeam = (): Beam => {
      // Select a random grid point
      const gridX = Math.floor(Math.random() * gridSize);
      const gridY = Math.floor(Math.random() * gridSize);
      const startPoint = gridRef.current[gridY]?.[gridX] || { x: 0, y: 0 };

      // Random angle
      const angle = Math.random() * Math.PI * 2;

      // Random length variation
      const length = beamLength * (0.8 + Math.random() * 0.4);

      // Calculate end point based on angle and length
      const endX = startPoint.x + Math.cos(angle) * length;
      const endY = startPoint.y + Math.sin(angle) * length;

      return {
        startX: startPoint.x,
        startY: startPoint.y,
        endX,
        endY,
        angle,
        speed: beamSpeed * (0.8 + Math.random() * 0.4),
        progress: 0,
        width: beamWidth * (0.8 + Math.random() * 0.4),
        opacity: beamOpacity * (0.7 + Math.random() * 0.3),
        length,
        gridX,
        gridY,
      };
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Animation
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Parse the color to get RGB values for this frame
      const getRgbValues = (hex: string) => {
        const cleanHex = hex.startsWith("#") ? hex.slice(1) : hex;
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return { r, g, b };
      };

      const rgbValues = getRgbValues(beamColor);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw beams
      beamsRef.current.forEach((beam, index) => {
        // Update beam progress
        beam.progress += beam.speed;

        // Reset beam if it's completed
        if (beam.progress >= 1) {
          beamsRef.current[index] = createBeam();
          return;
        }

        // Calculate current position
        const currentProgress = beam.progress;
        const startProgress = Math.max(0, currentProgress - 0.2);
        const endProgress = currentProgress;

        const currentStartX =
          beam.startX + (beam.endX - beam.startX) * startProgress;
        const currentStartY =
          beam.startY + (beam.endY - beam.startY) * startProgress;
        const currentEndX =
          beam.startX + (beam.endX - beam.startX) * endProgress;
        const currentEndY =
          beam.startY + (beam.endY - beam.startY) * endProgress;

        // Draw beam
        ctx.beginPath();
        ctx.moveTo(currentStartX, currentStartY);
        ctx.lineTo(currentEndX, currentEndY);

        // Create gradient for beam
        const gradient = ctx.createLinearGradient(
          currentStartX,
          currentStartY,
          currentEndX,
          currentEndY
        );

        // Fade in and out
        const fadeOpacity = beam.opacity * Math.sin(beam.progress * Math.PI);

        gradient.addColorStop(
          0,
          `rgba(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, 0)`
        );
        gradient.addColorStop(
          0.5,
          `rgba(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, ${fadeOpacity})`
        );
        gradient.addColorStop(
          1,
          `rgba(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, 0)`
        );

        ctx.strokeStyle = gradient;
        ctx.lineWidth = beam.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Add glow effect
        ctx.beginPath();
        ctx.moveTo(currentStartX, currentStartY);
        ctx.lineTo(currentEndX, currentEndY);
        ctx.strokeStyle = `rgba(${rgbValues.r}, ${rgbValues.g}, ${
          rgbValues.b
        }, ${fadeOpacity * 0.3})`;
        ctx.lineWidth = beam.width * 3;
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // Occasionally spawn a new beam
      if (Math.random() < 0.02 && beamsRef.current.length < beamCount * 1.5) {
        beamsRef.current.push(createBeam());
      }

      // Remove excess beams
      while (beamsRef.current.length > beamCount * 1.5) {
        beamsRef.current.shift();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    beamColor,
    gridSize,
    beamCount,
    beamOpacity,
    beamLength,
    beamWidth,
    beamSpeed,
  ]);

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
};
