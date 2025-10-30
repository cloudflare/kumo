import React from "react";
import { cn } from "../utils";

interface ComponentPreviewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A container for displaying component examples with a nice preview area
 */
export function ComponentPreview({ children, className }: ComponentPreviewProps) {
  return (
    <div
      className={cn(
        "flex min-h-[350px] w-full items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-surface p-10",
        className
      )}
    >
      {children}
    </div>
  );
}
