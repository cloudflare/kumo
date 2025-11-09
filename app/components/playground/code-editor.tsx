/**
 * Code Editor Component
 * 
 * Simple textarea-based code editor with syntax highlighting
 */

import React from "react";
import { cn } from "../utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export function CodeEditor({ 
  value, 
  onChange, 
  className,
  placeholder = "// Write your code here...",
  readOnly = false,
}: CodeEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };
  
  return (
    <div className={cn("relative w-full h-full", className)}>
      <textarea
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        className={cn(
          "w-full h-full p-4 font-mono text-sm",
          "bg-neutral-50 dark:bg-neutral-900",
          "text-neutral-900 dark:text-neutral-100",
          "border border-neutral-200 dark:border-neutral-800",
          "rounded-lg resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          "placeholder:text-neutral-400",
          readOnly && "cursor-not-allowed opacity-60"
        )}
        style={{
          lineHeight: "1.5",
          tabSize: 2,
        }}
      />
    </div>
  );
}
