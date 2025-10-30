import React from "react";
import { cn } from "../utils";
import { ComponentPreview } from "./component-preview";
import { CodeBlock } from "../code/code";

interface ComponentExampleProps {
  children: React.ReactNode;
  code?: string;
  className?: string;
}

/**
 * Shows a component example with optional code snippet
 */
export function ComponentExample({ children, code, className }: ComponentExampleProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <ComponentPreview>{children}</ComponentPreview>
      {code && (
        <CodeBlock lang="tsx" code={code} />
      )}
    </div>
  );
}
