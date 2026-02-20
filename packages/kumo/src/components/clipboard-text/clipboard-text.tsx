import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { forwardRef, useCallback, useRef, useState } from "react";
import { Toast } from "@base-ui/react/toast";
import { Tooltip } from "@base-ui/react/tooltip";
import { Button } from "../button";
import { inputVariants } from "../input";
import { cn } from "../../utils/cn";

// Create a toast manager for anchored "Copied" toasts
const clipboardToastManager = Toast.createToastManager();

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

const clipboardTextAnimations = {
  slide: {
    initial:
      "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 translate-y-full",
    animate: "translate-y-0 opacity-100",
    end: "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 -translate-y-full",
  },
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
  /**
   * Tooltip config. Shows tooltip on hover, anchored toast on click.
   * @example
   * ```tsx
   * <ClipboardText
   *   text="abc123"
   *   tooltip={{ text: "Copy", copiedText: "Copied!", side: "top" }}
   * />
   * ```
   */
  tooltip?: {
    /** Text shown in tooltip on hover. @default "Copy" */
    text?: string;
    /** Text shown in toast after copying. @default "Copied" */
    copiedText?: string;
    /** Tooltip/toast placement. @default "top" */
    side?: "top" | "bottom" | "left" | "right";
  };
  /** Accessible labels for i18n. */
  labels?: {
    /** @default "Copy to clipboard" */
    copyAction?: string;
  };
}

/**
 * Anchored toasts viewport - renders "Copied" toasts anchored to buttons
 */
function AnchoredToasts() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Viewport className="pointer-events-none fixed inset-0 z-50">
      {toasts.map((toast) => (
        <Toast.Positioner key={toast.id} toast={toast} className="absolute">
          <Toast.Root
            toast={toast}
            className={cn(
              "flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-3 py-1.5 text-xs text-kumo-default font-sans",
              "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill",
            )}
          >
            <Toast.Description />
          </Toast.Root>
        </Toast.Positioner>
      ))}
    </Toast.Viewport>
  );
}

/**
 * Internal wrapper that provides Toast context when tooltip is enabled.
 */
function TooltipWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip.Provider>
      <Toast.Provider toastManager={clipboardToastManager}>
        <AnchoredToasts />
        {children}
      </Toast.Provider>
    </Tooltip.Provider>
  );
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
      tooltip,
      labels: { copyAction = "Copy to clipboard" } = {},
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const sizeConfig = KUMO_CLIPBOARD_TEXT_VARIANTS.size[size];

    // Destructure tooltip config with defaults
    const {
      text: tooltipText = "Copy",
      copiedText = "Copied",
      side: tooltipSide = "top",
    } = tooltip ?? {};

    const copyToClipboard = useCallback(async () => {
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          await navigator.clipboard.writeText(text);
        } else if (typeof document !== "undefined") {
          // Fallback for older browsers
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
          } finally {
            document.body.removeChild(textarea);
            if (previousRange) {
              selection?.removeAllRanges();
              selection?.addRange(previousRange);
            }
          }
        }

        setCopied(true);

        // Show anchored toast if tooltip mode is enabled
        if (tooltip) {
          clipboardToastManager.add({
            description: copiedText,
            positionerProps: {
              anchor: buttonRef.current,
              side: tooltipSide,
              sideOffset: 8,
            },
            timeout: 1500,
            onClose() {
              setCopied(false);
            },
          });
        } else {
          // Reset copied state after delay when no tooltip
          setTimeout(() => setCopied(false), 1500);
        }

        onCopy?.();
      } catch (error) {
        console.warn("Clipboard copy failed", error);
      }
    }, [text, onCopy, tooltip, copiedText, tooltipSide]);

    const copyButton = (
      <Button
        ref={buttonRef}
        size={sizeConfig.buttonSize}
        variant="ghost"
        className="rounded-none border-l! border-kumo-line! px-3 relative overflow-hidden transition-all duration-200"
        onClick={copyToClipboard}
        aria-label={copyAction}
      >
        <span
          className={cn(
            "flex items-center gap-1 transition-all duration-200",
            copied
              ? clipboardTextAnimations.slide.animate
              : clipboardTextAnimations.slide.initial,
          )}
        >
          <CheckIcon />
        </span>
        <span
          className={cn(
            "flex items-center justify-center transition-all duration-200",
            copied
              ? clipboardTextAnimations.slide.end
              : clipboardTextAnimations.slide.animate,
          )}
        >
          <CopyIcon />
        </span>
      </Button>
    );

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
        {tooltip ? (
          <TooltipWrapper>
            <Tooltip.Root
              disabled={copied}
              onOpenChange={(open, eventDetails) => {
                // Prevent tooltip from closing when button is clicked
                if (eventDetails.reason === "trigger-press") {
                  eventDetails.cancel();
                }
              }}
            >
              <Tooltip.Trigger render={copyButton} />
              <Tooltip.Portal>
                <Tooltip.Positioner side={tooltipSide} sideOffset={8}>
                  <Tooltip.Popup
                    className={cn(
                      "flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-3 py-1.5 text-xs text-kumo-default",
                      "shadow-lg shadow-kumo-tip-shadow outline outline-kumo-fill",
                    )}
                  >
                    {tooltipText}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </TooltipWrapper>
        ) : (
          copyButton
        )}
        <span className="sr-only" aria-live="polite">
          {copied ? copiedText : ""}
        </span>
      </div>
    );
  },
);

ClipboardText.displayName = "ClipboardText";
