import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Button } from "../button";
import { inputVariants } from "../input";
import { cn } from "../../utils/cn";

/** ClipboardText size variant definitions mapping sizes to their Tailwind classes. */
export const KUMO_CLIPBOARD_TEXT_VARIANTS = {
  size: {
    sm: {
      classes: "text-xs",
      buttonSize: "sm" as const,
      description: "Small clipboard text for compact UIs",
    },
    base: {
      classes: "text-sm",
      buttonSize: "base" as const,
      description: "Default clipboard text size",
    },
    lg: {
      classes: "text-sm",
      buttonSize: "lg" as const,
      description: "Large clipboard text for prominent display",
    },
  },
} as const;

export const KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS = {
  size: "lg",
} as const;

// Derived types from KUMO_CLIPBOARD_TEXT_VARIANTS
export type KumoClipboardTextSize =
  keyof typeof KUMO_CLIPBOARD_TEXT_VARIANTS.size;

export interface KumoClipboardTextVariantsProps {
  /**
   * Size of the clipboard text field.
   * - `"sm"` — Small clipboard text for compact UIs
   * - `"base"` — Default clipboard text size
   * - `"lg"` — Large clipboard text for prominent display
   * @default "lg"
   */
  size?: KumoClipboardTextSize;
}

export function clipboardTextVariants({
  size = KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
}: KumoClipboardTextVariantsProps = {}) {
  return cn(
    // Base styles
    "flex items-center overflow-hidden bg-kumo-base px-0 font-mono",
    // Apply size styles from KUMO_CLIPBOARD_TEXT_VARIANTS
    KUMO_CLIPBOARD_TEXT_VARIANTS.size[size].classes,
  );
}

// Legacy type alias for backwards compatibility
export type ClipboardTextSize = KumoClipboardTextSize;

/**
 * ClipboardText component props.
 *
 * @example
 * ```tsx
 * <ClipboardText text="sk_live_abc123" />
 * <ClipboardText text="npm install @cloudflare/kumo" size="sm" />
 * ```
 */
export interface ClipboardTextProps extends KumoClipboardTextVariantsProps {
  /** The text to display and copy to clipboard. */
  text: string;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Callback fired after text is copied to clipboard. */
  onCopy?: () => void;
}

/**
 * Read-only text field with a one-click copy-to-clipboard button.
 *
 * @example
 * ```tsx
 * <ClipboardText text="0c239dd2" />
 * ```
 */
export const ClipboardText = forwardRef<HTMLDivElement, ClipboardTextProps>(
  (
    {
      text,
      className,
      size = KUMO_CLIPBOARD_TEXT_DEFAULT_VARIANTS.size,
      onCopy,
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const sizeConfig = KUMO_CLIPBOARD_TEXT_VARIANTS.size[size];

    const copyToClipboard = useCallback(async () => {
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          onCopy?.();
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
        const previousRange = selection?.rangeCount
          ? selection.getRangeAt(0)
          : null;
        textarea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          onCopy?.();
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
    }, [text, onCopy]);

    useEffect(() => {
      if (copied) {
        const timeoutId = setTimeout(() => {
          setCopied(false);
        }, 2000);

        return () => clearTimeout(timeoutId);
      }
    }, [copied]);

    return (
      <div
        ref={ref}
        className={cn(
          inputVariants({ size: sizeConfig.buttonSize }),
          clipboardTextVariants({ size }),
          className,
        )}
      >
        <span className="grow px-4">{text}</span>
        <Button
          size={sizeConfig.buttonSize}
          variant="ghost"
          className="rounded-none border-l! border-kumo-line! px-3"
          onClick={copyToClipboard}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          aria-pressed={copied}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
        <span className="sr-only" aria-live="polite">
          {copied ? "Copied to clipboard" : ""}
        </span>
      </div>
    );
  },
);

ClipboardText.displayName = "ClipboardText";
