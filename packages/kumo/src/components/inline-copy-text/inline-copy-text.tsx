import { CheckIcon, CopySimpleIcon } from "@phosphor-icons/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "../../utils/cn";

const COPIED_FEEDBACK_MS = 1500;

/**
 * InlineCopyText has no visual variants. The required exports are kept for the
 * Kumo variant standard.
 */
export const KUMO_INLINE_COPY_TEXT_VARIANTS = {} as const;

export const KUMO_INLINE_COPY_TEXT_DEFAULT_VARIANTS = {} as const;

/** Base classes shared by every InlineCopyText. */
export const KUMO_INLINE_COPY_TEXT_STYLING = {
  baseClasses:
    "group/inline-copy flex min-w-0 max-w-full cursor-pointer items-center gap-1 rounded-xs border-0 bg-transparent p-0 font-mono text-sm text-kumo-subtle hover:text-kumo-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand",
} as const;

export interface InlineCopyTextLabels {
  /** Accessible name before the text is copied. @default "Copy to clipboard" */
  copyAction?: string;
  /** Accessible name and live-region message after copying. @default "Copied" */
  copied?: string;
}

/**
 * InlineCopyText component props.
 *
 * @example
 * ```tsx
 * <InlineCopyText
 *   text="0c239dd2"
 *   labels={{ copyAction: "Copy database ID", copied: "Copied" }}
 * />
 * ```
 */
export interface InlineCopyTextProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "onCopy"
> {
  /** The text to display and copy to the clipboard. */
  text: string;
  /** If provided, this text is copied instead of the displayed `text`. */
  textToCopy?: string;
  /** Callback fired after text is copied successfully. */
  onCopy?: () => void;
  /** Accessible labels for localization. */
  labels?: InlineCopyTextLabels;
}

/**
 * Compact, borderless copy control for IDs and other short values displayed
 * inline or inside dense table cells.
 *
 * The copy icon appears when the control is hovered or focused. It also
 * responds to an enclosing unnamed Tailwind `group`, allowing table rows to
 * reveal the icon when the row is hovered. After a successful copy, the icon
 * changes to a checkmark and the copied message is announced.
 */
export const InlineCopyText = forwardRef<
  HTMLButtonElement,
  InlineCopyTextProps
>(
  (
    {
      text,
      textToCopy,
      className,
      onClick,
      onCopy,
      labels: {
        copyAction = "Copy to clipboard",
        copied: copiedLabel = "Copied",
      } = {},
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (resetTimeoutRef.current !== null) {
          clearTimeout(resetTimeoutRef.current);
        }
      };
    }, []);

    const copyToClipboard = useCallback(async () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
      }

      try {
        await navigator.clipboard.writeText(textToCopy ?? text);
        setCopied(true);
        resetTimeoutRef.current = setTimeout(() => {
          setCopied(false);
          resetTimeoutRef.current = null;
        }, COPIED_FEEDBACK_MS);
        onCopy?.();
      } catch (error) {
        setCopied(false);
        console.warn("Clipboard copy failed", error);
      }
    }, [onCopy, text, textToCopy]);

    return (
      <button
        {...props}
        ref={ref}
        type="button"
        data-kumo-component="InlineCopyText"
        className={cn(KUMO_INLINE_COPY_TEXT_STYLING.baseClasses, className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            void copyToClipboard();
          }
        }}
        aria-label={copied ? copiedLabel : copyAction}
      >
        <span className="min-w-0 truncate">{text}</span>
        {copied ? (
          <CheckIcon aria-hidden size={14} className="shrink-0" />
        ) : (
          <CopySimpleIcon
            aria-hidden
            size={14}
            className={cn(
              "shrink-0 opacity-0 transition-opacity motion-reduce:transition-none",
              "group-hover/inline-copy:opacity-100 group-focus-visible/inline-copy:opacity-100",
              "group-focus-within:opacity-100 group-hover:opacity-100",
            )}
          />
        )}
        <span className="sr-only" aria-live="polite">
          {copied ? copiedLabel : ""}
        </span>
      </button>
    );
  },
);

InlineCopyText.displayName = "InlineCopyText";
