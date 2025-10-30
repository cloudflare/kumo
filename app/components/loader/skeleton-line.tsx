"use client";

import React, { useMemo } from "react";
import { cn } from "../utils";

const getRandomWidth = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const getRandomFloat = (min: number, max: number) =>
  (Math.random() * (max - min) + min).toFixed(2);

export const SkeletonLine = ({
  minWidth = 30,
  maxWidth = 100,
  minDuration = 1.3,
  maxDuration = 1.7,
  minDelay = 0,
  maxDelay = 0.5,
  className,
}: {
  minWidth?: number;
  maxWidth?: number;
  minDuration?: number;
  maxDuration?: number;
  minDelay?: number;
  maxDelay?: number;
  className?: string;
}) => {
  const { width, duration, delay } = useMemo(() => {
    return {
      width: getRandomWidth(minWidth, maxWidth),
      duration: getRandomFloat(minDuration, maxDuration),
      delay: getRandomFloat(minDelay, maxDelay),
    };
  }, [minWidth, maxWidth, minDuration, maxDuration, minDelay, maxDelay]);

  const lineStyle: React.CSSProperties & { [key: string]: string } = {
    "--skeleton-width": `${width}%`,
    "--shimmer-duration": `${duration}s`,
    "--shimmer-delay": `${delay}s`,
  };

  return (
    <div className={cn("skeleton-line", className)} style={lineStyle}></div>
  );
};
