import React from "react";
import { cn } from "../utils";

interface CalloutProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "error";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * A callout component for highlighting important information
 */
export function Callout({ children, variant = "info", icon, className }: CalloutProps) {
  const variantStyles = {
    info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-100",
    warning: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900 text-yellow-900 dark:text-yellow-100",
    error: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-900 dark:text-red-100",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 my-6",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex gap-3">
        {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 text-sm leading-relaxed [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
