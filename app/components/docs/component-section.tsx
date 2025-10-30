import React from "react";
import { cn } from "../utils";

interface ComponentSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A section wrapper for component documentation
 */
export function ComponentSection({ children, className }: ComponentSectionProps) {
  return (
    <section className={cn("mb-12", className)}>
      {children}
    </section>
  );
}
