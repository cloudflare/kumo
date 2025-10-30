import type { ReactNode } from "react";
import { cn } from "../utils";

export type BadgeVariant = "primary" | "secondary" | "destructive" | "outline";

export function Badge({ variant = "primary", className, children }: 
    { variant?: BadgeVariant; className?: string; children: ReactNode }) {
  return (
    <span className={cn(
      "inline-flex items-center w-fit whitespace-nowrap flex-none shrink-0 justify-self-start text-xs font-medium px-2 py-0.5 rounded-full",
      variant === "outline" ? "bg-transparent border border-neutral-200 text-black dark:border-neutral-800 dark:text-white" : "",
      variant === "primary" ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "",
      variant === "secondary" ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100" : "",
      variant === "destructive" ? "bg-red-500 text-white" : "",
      className
    )}>
      {children}
    </span>
  );
}