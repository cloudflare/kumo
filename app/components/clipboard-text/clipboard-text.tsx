import { CheckIcon, ClipboardIcon } from "@phosphor-icons/react";
import { Button } from "../button/button";
import { cn } from "../utils";
import { useEffect, useState } from "react";
import { inputVariants } from "../input/input";

export function ClipboardText({ text, className }: ClipboardTextProps) {
  const [copied, setCopied] = useState(false);

  const mergedClassName = cn(
    inputVariants({
      size: "lg",
    }),
    "flex items-center bg-surface px-0 overflow-hidden text-sm font-mono",
    className
  );

  useEffect(() => {
    if (copied) {
      const timeoutId = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [copied]);

  return (
    <div className={mergedClassName}>
      <span className="grow px-4">{text}</span>
      <Button
        size="lg"
        variant="ghost"
        className="rounded-none !border-l !border-neutral-200 dark:!border-neutral-800 px-3"
        onClick={() => {
          window.navigator.clipboard.writeText(text);
          setCopied(true);
        }}
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </Button>
    </div>
  );
}

interface ClipboardTextProps {
  text: string;
  className?: string;
}
