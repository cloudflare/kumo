import { Eye, EyeSlash } from "@phosphor-icons/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { Input as BaseInput } from "@base-ui/react/input";
import {
  inputVariants,
  KUMO_INPUT_VARIANTS,
  type KumoInputSize,
  type KumoInputVariant,
} from "../input/input";
import { Field, type FieldErrorMatch } from "../field/field";

export const KUMO_SENSITIVE_INPUT_VARIANTS = KUMO_INPUT_VARIANTS;

export const KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

type Mode = "masked" | "revealed" | "empty";

/**
 * SensitiveInput component props.
 *
 * @example
 * ```tsx
 * <SensitiveInput label="API Key" defaultValue="sk_live_abc123xyz789" />
 * <SensitiveInput label="Secret" value={secret} onValueChange={setSecret} />
 * ```
 */
export interface SensitiveInputProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "size" | "type" | "value" | "defaultValue"
  > {
  /** Controlled value */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Simplified change handler receiving just the value */
  onValueChange?: (value: string) => void;
  /** Callback fired after value is copied to clipboard */
  onCopy?: () => void;
  /**
   * Size of the input.
   * - `"xs"` — Extra small for compact UIs
   * - `"sm"` — Small for secondary fields
   * - `"base"` — Default input size
   * - `"lg"` — Large for prominent fields
   * @default "base"
   */
  size?: KumoInputSize;
  /**
   * Style variant of the input.
   * - `"default"` — Default input appearance
   * - `"error"` — Error state for validation failures
   * @default "default"
   */
  variant?: KumoInputVariant;
  /** Label content for the input (enables Field wrapper and sets masked state label) - can be a string or any React node */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** Helper text displayed below the input */
  description?: ReactNode;
  /** Error message or validation error object */
  error?: string | { message: ReactNode; match: FieldErrorMatch };
}

/**
 * Password/secret input that masks its value by default and reveals on click.
 * Includes a built-in copy-to-clipboard button on hover.
 *
 * @example
 * ```tsx
 * <SensitiveInput label="API Key" defaultValue="sk_live_abc123xyz789" />
 * ```
 */
export const SensitiveInput = forwardRef<HTMLInputElement, SensitiveInputProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onChange,
      onValueChange,
      onCopy,
      size = KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS.size,
      variant = KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS.variant,
      disabled = false,
      readOnly = false,
      id,
      autoComplete = "off",
      className,
      label,
      labelTooltip,
      description,
      error,
      required,
      ...inputProps
    },
    ref,
  ) => {
    // For aria-label, only use string labels (ReactNode labels can't be used for aria-label)
    const ariaLabelFallback =
      typeof label === "string" ? label : "Sensitive value";
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const value = isControlled ? controlledValue : internalValue;
    const hasValue = value.length > 0;

    const [mode, setMode] = useState<Mode>(() =>
      hasValue ? "masked" : "empty",
    );

    const [copied, setCopied] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const liveRegionId = useId();
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const maskedInstructionId = useId();

    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // Reset copied state after 2 seconds
    useEffect(() => {
      if (copied) {
        const timeoutId = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timeoutId);
      }
    }, [copied]);

    const copyToClipboard = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
          if (
            typeof navigator !== "undefined" &&
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
          ) {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            onCopy?.();
            return;
          }
        } catch {
          // Fall through to manual fallback
        }

        if (typeof document !== "undefined") {
          const textarea = document.createElement("textarea");
          textarea.value = value;
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
      },
      [value, onCopy],
    );

    // Sync mode when value changes externally
    const prevHasValueRef = useRef(hasValue);
    if (prevHasValueRef.current !== hasValue) {
      prevHasValueRef.current = hasValue;
      if (!hasValue && mode === "masked") {
        setMode("empty");
      }
    }

    const handleContainerClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        // Ignore clicks that originated from outside (e.g., label click focusing input)
        // Label clicks trigger a click on the input, but the click coordinates are outside the container
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const isClickInsideContainer =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (!isClickInsideContainer) return;
        }
        if (mode === "masked" && hasValue) {
          setMode("revealed");
          if (!readOnly) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }
      },
      [mode, hasValue, disabled, readOnly],
    );

    const handleToggleVisibility = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (mode === "revealed") {
          setMode("masked");
        } else if (mode === "empty" && hasValue) {
          setMode("revealed");
        }
      },
      [mode, hasValue],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onChange?.(e);
        onValueChange?.(newValue);
      },
      [isControlled, onChange, onValueChange],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // Don't mask if focus is moving to a button inside the container (copy/eye buttons)
        if (
          containerRef.current &&
          e.relatedTarget instanceof Node &&
          containerRef.current.contains(e.relatedTarget)
        ) {
          return;
        }
        if (hasValue) {
          setMode("masked");
        }
      },
      [hasValue],
    );

    const handleContainerKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (mode === "masked" && hasValue) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setMode("revealed");
            if (!readOnly) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }
      },
      [mode, hasValue, disabled, readOnly],
    );

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (mode === "revealed" && e.key === "Escape") {
          setMode("masked");
          // Move focus to container to avoid focus trap (input becomes tabIndex={-1})
          setTimeout(() => containerRef.current?.focus(), 0);
        }
      },
      [mode],
    );

    const isMaskedWithValue = mode === "masked" && hasValue;
    const showEyeButton =
      !disabled && (mode === "revealed" || (mode === "empty" && hasValue));

    // Icon sizes matching input sizes
    const iconSize = size === "xs" || size === "sm" ? "size-3" : "size-4";

    const containerClassName = cn(
      inputVariants({ size, variant, parentFocusIndicator: true }),
      "group/container relative flex w-full items-center",
      isMaskedWithValue && !disabled && "cursor-pointer",
      disabled && "cursor-not-allowed",
      className,
    );

    const containerContent = (
      <>
        {/* Input - defines the width, always rendered */}
        <BaseInput
          ref={mergedRef}
          id={inputId}
          type={mode === "revealed" ? "text" : "password"}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
          readOnly={readOnly || isMaskedWithValue}
          autoComplete={autoComplete}
          tabIndex={isMaskedWithValue ? -1 : 0}
          className={cn(
            "w-full border-0 bg-transparent p-0 text-kumo-default ring-0 outline-none placeholder:text-kumo-subtle disabled:cursor-not-allowed disabled:text-kumo-subtle",
            size === "xs" && "pr-5",
            size === "sm" && "pr-6",
            size === "base" && "pr-8",
            size === "lg" && "pr-10",
            isMaskedWithValue && "pointer-events-none text-transparent",
          )}
          aria-hidden={isMaskedWithValue}
          {...inputProps}
        />

        {/* Mask overlay - absolutely positioned, doesn't affect layout */}
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center overflow-hidden select-none",
            // Match input pr padding (space for icon)
            size === "xs" && "right-5",
            size === "sm" && "right-6",
            size === "base" && "right-8",
            size === "lg" && "right-10",
            // Match the padding from inputVariants
            size === "xs" && "px-1.5",
            size === "sm" && "px-2",
            size === "base" && "px-3",
            size === "lg" && "px-4",
            // Hidden when not masked
            !isMaskedWithValue && "invisible",
            // When masked: enable pointer events
            isMaskedWithValue && "pointer-events-auto",
            // Text color - use text-kumo-default to contrast with bg-kumo-control input background
            "text-kumo-default",
            // Hover state - pure CSS, no React state (group for children)
            "group/mask",
          )}
          aria-hidden="true"
        >
          {/* Both texts rendered, stacked. Visibility toggled on hover to prevent layout shift */}
          <span className="relative">
            <span
              className={cn(
                isMaskedWithValue &&
                  !disabled &&
                  "group-focus-within/container:invisible group-hover/mask:invisible",
              )}
            >
              ••••••••
            </span>
            {isMaskedWithValue && !disabled && (
              <span className="invisible absolute left-0 top-0 whitespace-nowrap text-kumo-subtle group-focus-within/container:visible group-hover/mask:visible">
                Click to reveal
              </span>
            )}
          </span>
        </span>

        {/* Eye button - absolutely positioned to the right */}
        <button
          type="button"
          onClick={handleToggleVisibility}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={mode === "revealed" ? "Hide value" : "Reveal value"}
          tabIndex={showEyeButton ? 0 : -1}
          className={cn(
            "absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer text-kumo-subtle outline-none hover:text-kumo-default focus:text-kumo-default",
            // Match right padding from inputVariants
            size === "xs" && "right-1.5",
            size === "sm" && "right-2",
            size === "base" && "right-3",
            size === "lg" && "right-4",
            iconSize,
            !showEyeButton && "pointer-events-none opacity-0",
          )}
        >
          {mode === "revealed" ? (
            <EyeSlash className="size-full" />
          ) : (
            <Eye className="size-full" />
          )}
        </button>

        {/* Copy tab - appears on hover/focus at top right (hidden when disabled) */}
        {hasValue && !disabled && (
          <button
            type="button"
            onClick={copyToClipboard}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={copied ? "Copied" : "Copy to clipboard"}
            className={cn(
              "absolute -top-px right-2 -translate-y-full cursor-pointer rounded-t-md bg-kumo-brand px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-focus-within/container:opacity-100 group-hover/container:opacity-100 hover:brightness-120 focus-visible:outline focus-visible:outline-offset-1 focus-visible:outline-kumo-ring",
            )}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </>
    );

    const input = (
      <div>
        {isMaskedWithValue ? (
          <div
            ref={containerRef}
            // Cannot use <button> here because containerContent contains interactive button elements (Copy, Reveal).
            // Using role="button" with proper keyboard handling instead.
            // oxlint-disable-next-line prefer-tag-over-role
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={containerClassName}
            onClick={handleContainerClick}
            onKeyDown={handleContainerKeyDown}
            aria-label={`${ariaLabelFallback}, masked.`}
            aria-describedby={`${maskedInstructionId} ${liveRegionId}`}
            aria-disabled={disabled}
          >
            {containerContent}
          </div>
        ) : (
          <div ref={containerRef} className={containerClassName}>
            {containerContent}
          </div>
        )}
        {isMaskedWithValue && (
          <span id={maskedInstructionId} className="sr-only">
            Click or press Enter to reveal.
          </span>
        )}
        <span id={liveRegionId} className="sr-only" aria-live="polite">
          {mode === "masked" && hasValue && "Value hidden"}
          {copied && "Copied to clipboard"}
        </span>
      </div>
    );

    // Render with Field wrapper if label is provided
    if (label) {
      return (
        <Field
          label={label}
          required={required}
          labelTooltip={labelTooltip}
          description={description}
          error={
            error
              ? typeof error === "string"
                ? { message: error, match: true }
                : error
              : undefined
          }
        >
          {input}
        </Field>
      );
    }

    // Render bare input without Field wrapper
    return input;
  },
);

SensitiveInput.displayName = "SensitiveInput";
