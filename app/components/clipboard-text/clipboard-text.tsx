import { CheckIcon, ClipboardIcon } from "@phosphor-icons/react";
import { Button } from "../button/button";
import { cn } from "../utils";
import { useCallback, useEffect, useState } from "react";
import { inputVariants } from "../input/input";

export function ClipboardText({ text, className }: ClipboardTextProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        return;
      }
    } catch {
      // Fall through to manual fallback
    }

    if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      const selection = document.getSelection();
      const previousRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch (error) {
        console.warn("Clipboard copy failed", error);
      } finally {
        document.body.removeChild(textarea);
        if (previousRange) {
          selection?.removeAllRanges();
          selection?.addRange(previousRange);
        }
      }
    }
  }, [text]);

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
        className="rounded-none border-l! border-neutral-200! dark:border-neutral-800! px-3"
        onClick={copyToClipboard}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        aria-pressed={copied}
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}

interface ClipboardTextProps {
  text: string;
  className?: string;
}
