import { Eye, EyeSlash } from "@phosphor-icons/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
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
import {
  Field,
  normalizeFieldError,
  type FieldErrorMatch,
} from "../field/field";

export const KUMO_SENSITIVE_INPUT_VARIANTS = KUMO_INPUT_VARIANTS;

export const KUMO_SENSITIVE_INPUT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

type Mode = "masked" | "revealed" | "empty";

/**
 * Localizable secondary labels and status messages for SensitiveInput.
 * These English defaults do not replace the field's required accessible name.
 */
export interface SensitiveInputLabels {
  /** Visible masked value text. @default "••••••••" */
  maskedValue?: string;
  /** Visible reveal hint shown on hover/focus while masked. @default "Click to reveal" */
  clickToReveal?: string;
  /** Accessible label for the masked reveal button. @default "Reveal value" */
  revealValue?: string;
  /** Accessible label for the hide button. @default "Hide value" */
  hideValue?: string;
  /** Visible label for the copy button. @default "Copy" */
  copy?: string;
  /** Accessible label for the copy button. @default "Copy to clipboard" */
  copyToClipboard?: string;
  /** Visible/accessibility label for the copied state. @default "Copied" */
  copied?: string;
  /** Live-region status after revealing the value. @default "Value revealed" */
  valueRevealed?: string;
  /** Live-region status after hiding the value. @default "Value hidden" */
  valueHidden?: string;
  /** Live-region status after copying the value. @default "Copied to clipboard" */
  copiedToClipboard?: string;
  /** Screen-reader hint for the reveal button. @default "Press Enter or Space to reveal." */
  revealInstruction?: string;
}

const DEFAULT_LABELS: Required<SensitiveInputLabels> = {
  maskedValue: "••••••••",
  clickToReveal: "Click to reveal",
  revealValue: "Reveal value",
  hideValue: "Hide value",
  copy: "Copy",
  copyToClipboard: "Copy to clipboard",
  copied: "Copied",
  valueRevealed: "Value revealed",
  valueHidden: "Value hidden",
  copiedToClipboard: "Copied to clipboard",
  revealInstruction: "Press Enter or Space to reveal.",
};

function composeAriaDescribedBy(
  ...ids: Array<string | undefined>
): string | undefined {
  const describedBy = ids.filter(Boolean).join(" ");
  return describedBy || undefined;
}

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
  /** Localizable secondary control labels and live-region status text. */
  labels?: SensitiveInputLabels;
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
      variant: variantProp,
      disabled = false,
      readOnly = false,
      id,
      autoComplete = "off",
      className,
      label,
      labelTooltip,
      description,
      error,
      labels: labelsProp,
      required,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...inputProps
    },
    ref,
  ) => {
    // Deprecation warning for variant="error"
    if (process.env.NODE_ENV !== "production" && variantProp === "error") {
      console.warn(
        '[Kumo SensitiveInput]: variant="error" is deprecated. ' +
          "Error styling is now automatically applied when the `error` prop is truthy. " +
          "Simply remove the variant prop and pass an error message instead.",
      );
    }

    // Auto-apply error styling when error prop is truthy
    // Explicit variant prop takes precedence for backwards compatibility
    const normalizedError = normalizeFieldError(error);
    const variant = variantProp ?? (normalizedError ? "error" : "default");
    const labels = useMemo<Required<SensitiveInputLabels>>(
      () => ({ ...DEFAULT_LABELS, ...labelsProp }),
      [labelsProp],
    );
    const hasAriaLabel = Boolean(ariaLabel);
    const hasAriaLabelledBy = Boolean(ariaLabelledBy);
    const stringLabel = typeof label === "string" ? label : undefined;
    const hasAccessibleName = Boolean(
      hasAriaLabel || hasAriaLabelledBy || stringLabel,
    );

    // A11y enforcement: the component should not invent a generic field name
    // for secrets. Rich labels should be associated with aria-labelledby so the
    // reveal/hide buttons can include that same label in their accessible names.
    if (process.env.NODE_ENV !== "production" && !hasAccessibleName) {
      console.warn(
        "[Kumo SensitiveInput]: SensitiveInput must have an accessible name. Provide either:\n" +
          "  - label prop with string content: <SensitiveInput label='API key' />\n" +
          "  - aria-label: <SensitiveInput aria-label='API key' />\n" +
          "  - aria-labelledby for custom or rich label associations",
      );
    }

    const valueLabel = hasAriaLabel ? ariaLabel : stringLabel;
    const inputAriaLabel = ariaLabel;
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
    const revealButtonRef = useRef<HTMLButtonElement | null>(null);
    const liveRegionId = useId();
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = useId();
    const errorId = useId();
    const maskedInstructionId = useId();
    const revealActionLabelId = useId();
    const feedbackId = !label
      ? normalizedError
        ? errorId
        : description
          ? descriptionId
          : undefined
      : undefined;
    const inputAriaDescribedBy = composeAriaDescribedBy(
      ariaDescribedBy,
      feedbackId,
    );
    const inputAriaInvalid = normalizedError ? true : ariaInvalid;

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

    const revealValue = useCallback(() => {
      if (disabled || !hasValue || mode !== "masked") return;
      setMode("revealed");
      if (!readOnly) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [mode, hasValue, disabled, readOnly]);

    const handleRevealClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (disabled) return;
        revealValue();
      },
      [disabled, revealValue],
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
        // When typing into an empty field, switch to revealed mode
        // so the input shows as type="text" instead of type="password"
        if (mode === "empty" && newValue.length > 0) {
          setMode("revealed");
        }
        onChange?.(e);
        onValueChange?.(newValue);
      },
      [isControlled, onChange, onValueChange, mode],
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

    const handleInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (mode === "revealed" && e.key === "Escape") {
          setMode("masked");
          // Move focus to the native reveal button to avoid a focus trap once the
          // input becomes hidden from assistive technologies again.
          setTimeout(() => revealButtonRef.current?.focus(), 0);
        }
      },
      [mode],
    );

    const isMaskedWithValue = mode === "masked" && hasValue;
    const showEyeButton =
      !disabled && (mode === "revealed" || (mode === "empty" && hasValue));
    const actionLabel =
      mode === "revealed" ? labels.hideValue : labels.revealValue;
    const controlName = valueLabel ? `${actionLabel}: ${valueLabel}` : actionLabel;
    const controlLabelledBy = ariaLabelledBy
      ? `${revealActionLabelId} ${ariaLabelledBy}`
      : undefined;
    const controlAriaLabel = controlLabelledBy ? undefined : controlName;
    const liveRegionText = copied
      ? labels.copiedToClipboard
      : mode === "revealed" && hasValue
        ? labels.valueRevealed
        : mode === "masked" && hasValue
          ? labels.valueHidden
          : "";

    // Icon sizes matching input sizes. Pseudo-elements expand hit areas
    // without changing the visible icon button dimensions.
    const iconSize = size === "xs" || size === "sm" ? "size-3" : "size-4";

    const containerClassName = cn(
      inputVariants({ size, variant, parentFocusIndicator: true }),
      "group/container relative flex w-full items-center",
      // Show browser-native focus outline on container when child input is focused
      "focus-within:outline focus-within:outline-2 focus-within:outline-kumo-focus",
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
          aria-label={inputAriaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={inputAriaDescribedBy}
          aria-invalid={inputAriaInvalid}
          className={cn(
            "w-full border-0 bg-transparent p-0 text-kumo-default ring-0 outline-none kumo-input-placeholder disabled:cursor-not-allowed disabled:text-kumo-subtle",
            size === "xs" && "pr-7.5",
            size === "sm" && "pr-8",
            size === "base" && "pr-9",
            size === "lg" && "pr-10",
            isMaskedWithValue && "pointer-events-none text-transparent",
          )}
          aria-hidden={isMaskedWithValue}
          {...inputProps}
        />

        {controlLabelledBy && (
          <span id={revealActionLabelId} className="sr-only">
            {mode === "revealed" ? labels.hideValue : labels.revealValue}
          </span>
        )}

        {isMaskedWithValue && (
          <button
            ref={revealButtonRef}
            type="button"
            data-kumo-component="SensitiveInput"
            data-kumo-part="reveal"
            onClick={handleRevealClick}
            aria-label={controlAriaLabel}
            aria-labelledby={controlLabelledBy}
            aria-describedby={composeAriaDescribedBy(
              maskedInstructionId,
              liveRegionId,
              feedbackId,
            )}
            disabled={disabled}
            className={cn(
              "absolute inset-y-0 left-0 flex cursor-pointer items-center overflow-hidden bg-transparent border-none shadow-none p-0 m-0 h-auto min-h-0 text-kumo-default select-none",
              // Match input pr padding (space for icon)
              size === "xs" && "right-7.5",
              size === "sm" && "right-8",
              size === "base" && "right-9",
              size === "lg" && "right-10",
              // Match the padding from inputVariants
              size === "xs" && "px-1.5",
              size === "sm" && "px-2",
              size === "base" && "px-3",
              size === "lg" && "px-4",
              "focus:outline-none disabled:cursor-not-allowed",
              // Hover state - pure CSS, no React state (group for children)
              "group/mask",
            )}
          >
            {/* Both texts rendered, stacked. Visibility toggled on hover to prevent layout shift */}
            <span className="relative" aria-hidden="true">
              <span
                className={cn(
                  !disabled &&
                    "group-focus-within/container:invisible group-hover/mask:invisible",
                )}
              >
                {labels.maskedValue}
              </span>
              {!disabled && (
                <span className="invisible absolute left-0 top-0 whitespace-nowrap text-kumo-subtle group-focus-within/container:visible group-hover/mask:visible">
                  {labels.clickToReveal}
                </span>
              )}
            </span>
          </button>
        )}

        {/* Eye button - absolutely positioned to the right */}
        {showEyeButton && (
          <button
            type="button"
            data-kumo-component="SensitiveInput"
            data-kumo-part="toggle-visibility"
            onClick={handleToggleVisibility}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={controlAriaLabel}
            aria-labelledby={controlLabelledBy}
            className={cn(
              "absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer rounded-sm text-kumo-subtle hover:text-kumo-default focus:text-kumo-default focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand",
              "before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
              // Defensive styles to prevent global CSS pollution (e.g., button { background: gray })
              "inline-flex items-center justify-center bg-transparent border-none shadow-none p-0 m-0",
              // Match right padding from inputVariants
              size === "xs" && "right-1.5",
              size === "sm" && "right-2",
              size === "base" && "right-3",
              size === "lg" && "right-4",
            )}
          >
            {mode === "revealed" ? (
              <EyeSlash className={iconSize} aria-hidden="true" />
            ) : (
              <Eye className={iconSize} aria-hidden="true" />
            )}
          </button>
        )}

        {/* Copy tab - appears on hover/focus at top right (hidden when disabled) */}
        {hasValue && !disabled && (
          <button
            type="button"
            data-kumo-component="SensitiveInput"
            data-kumo-part="copy"
            onClick={copyToClipboard}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={copied ? labels.copied : labels.copyToClipboard}
            className={cn(
              "absolute -top-px right-2 inline-flex -translate-y-full cursor-pointer items-center justify-center rounded-t-md bg-kumo-brand px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-focus-within/container:opacity-100 group-hover/container:opacity-100 hover:brightness-120 focus:outline-none focus:ring-kumo-focus/50 focus-visible:ring-2 focus-visible:ring-kumo-brand",
              "before:absolute before:left-1/2 before:top-1/2 before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
              // Defensive styles to prevent global CSS pollution
              "border-none shadow-none m-0",
            )}
          >
            {copied ? labels.copied : labels.copy}
          </button>
        )}
      </>
    );

    const input = (
      <div>
        <div ref={containerRef} className={containerClassName}>
          {containerContent}
        </div>
        {isMaskedWithValue && (
          <span id={maskedInstructionId} className="sr-only">
            {labels.revealInstruction}
          </span>
        )}
        <span id={liveRegionId} className="sr-only" aria-live="polite">
          {liveRegionText}
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
          error={normalizedError}
        >
          {input}
        </Field>
      );
    }

    if (normalizedError || description) {
      return (
        <div className="grid gap-2">
          {input}
          {normalizedError ? (
            <span id={errorId} className="text-sm leading-snug text-kumo-danger">
              {normalizedError.message}
            </span>
          ) : (
            description && (
              <span
                id={descriptionId}
                className="text-sm leading-snug text-kumo-subtle"
              >
                {description}
              </span>
            )
          )}
        </div>
      );
    }

    // Render bare input without Field wrapper
    return input;
  },
);

SensitiveInput.displayName = "SensitiveInput";
