import { inputVariants } from "./input";
import { cn } from "../../utils/cn";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import * as React from "react";
import { Field as FieldBase } from "@base-ui/react/field";
import {
  Field as KumoField,
  normalizeFieldError,
  type FieldErrorMatch,
} from "../field/field";

// useLayoutEffect warns when rendered with react-dom/server (React 18);
// fall back to useEffect on the server where neither runs anyway.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function parsePx(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Measures the content height of a textarea and applies it as an explicit
 * height, optionally clamped to `maxRows`. Handles box-sizing/borders and
 * container width changes (rewrapping).
 */
function useTextareaAutoResize({
  enabled,
  minRows,
  maxRows,
}: {
  enabled: boolean;
  minRows: number;
  maxRows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const minRowsRef = useRef(minRows);
  minRowsRef.current = minRows;
  const maxRowsRef = useRef(maxRows);
  maxRowsRef.current = maxRows;

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!enabledRef.current || !textarea || typeof window === "undefined")
      return;

    const style = window.getComputedStyle(textarea);
    const borders =
      parsePx(style.borderTopWidth) + parsePx(style.borderBottomWidth);
    const padding = parsePx(style.paddingTop) + parsePx(style.paddingBottom);
    const isBorderBox = style.boxSizing === "border-box";

    // Collapsing to `auto` lets scrollHeight report the true content height
    // (needed to shrink); measure-then-write happens within a single layout
    // pass, before paint.
    textarea.style.height = "auto";
    // scrollHeight = content + padding. Convert to the height the current
    // box-sizing expects: border-box needs borders added, content-box needs
    // padding removed.
    let height = isBorderBox
      ? textarea.scrollHeight + borders
      : textarea.scrollHeight - padding;

    const currentMinRows = minRowsRef.current;
    const currentMaxRows = maxRowsRef.current;
    if (currentMinRows > 0 || (currentMaxRows && currentMaxRows > 0)) {
      // Computed line-height is normally a px value, but some environments
      // (e.g. jsdom) can return "normal" or a unitless multiplier like "1.5".
      const fontSize = parsePx(style.fontSize);
      const rawLineHeight = style.lineHeight;
      const lineHeight =
        rawLineHeight === "normal" || rawLineHeight === ""
          ? fontSize * 1.2
          : rawLineHeight.endsWith("px")
            ? parsePx(rawLineHeight)
            : parsePx(rawLineHeight) * fontSize;
      const boxSpacing = isBorderBox ? padding + borders : 0;
      const minHeight = lineHeight * currentMinRows + boxSpacing;
      height = Math.max(height, minHeight);

      if (currentMaxRows && currentMaxRows > 0) {
        const maxHeight = lineHeight * currentMaxRows + boxSpacing;
        if (height > maxHeight) {
          height = maxHeight;
          // Content exceeds the clamp — it must stay scrollable.
          textarea.style.overflowY = "auto";
        } else {
          textarea.style.overflowY = "hidden";
        }
      } else {
        textarea.style.overflowY = "hidden";
      }
    } else {
      textarea.style.overflowY = "hidden";
    }

    textarea.style.height = `${height}px`;
  }, []);

  // Re-measure after every commit while enabled: covers controlled value
  // changes, size/variant/className changes, and anything else that reflows.
  // Two extra synchronous layouts per render is cheap for a textarea and
  // immune to stale-dependency bugs.
  useIsomorphicLayoutEffect(() => {
    if (enabled) resize();
  });

  // Setup/teardown per node while enabled. Restores inline styles when
  // autoResize turns off or on unmount so the manual resize handle behavior
  // returns untouched.
  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Width changes rewrap content and change the required height. Only
    // react to inline-size changes — our own height writes also fire the
    // observer and would otherwise cause redundant resize passes.
    let lastWidth = textarea.clientWidth;
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (textarea.clientWidth !== lastWidth) {
              lastWidth = textarea.clientWidth;
              resize();
            }
          })
        : null;
    observer?.observe(textarea);

    return () => {
      observer?.disconnect();
      textarea.style.height = "";
      textarea.style.overflowY = "";
    };
  }, [enabled, resize]);

  return { textareaRef, resize };
}

export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
  (props, ref) => {
    const {
      className,
      onValueChange,
      size = "base",
      variant: variantProp,
      onChange,
      label,
      labelTooltip,
      description,
      error,
      autoResize = false,
      minRows = 1,
      maxRows,
      rows,
      ...inputProps
    } = props;

    // Deprecation warning for variant="error"
    if (process.env.NODE_ENV !== "production" && variantProp === "error") {
      console.warn(
        '[Kumo InputArea]: variant="error" is deprecated. ' +
          "Error styling is now automatically applied when the `error` prop is truthy. " +
          "Simply remove the variant prop and pass an error message instead.",
      );
    }

    // Auto-apply error styling when error prop is truthy
    // Explicit variant prop takes precedence for backwards compatibility
    const variant = variantProp ?? (error ? "error" : "default");

    // Extract required from inputProps to pass to Field for label decoration
    const { required } = inputProps;
    const { textareaRef, resize } = useTextareaAutoResize({
      enabled: autoResize,
      minRows,
      maxRows,
    });

    // Forwarded ref may be a React 19 callback ref returning a cleanup
    // function — honor it instead of calling ref(null) on detach.
    const refCleanup = useRef<(() => void) | void>(undefined);
    const setTextareaRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;

        if (typeof ref === "function") {
          if (node) {
            refCleanup.current = ref(node) as (() => void) | void;
          } else if (refCleanup.current) {
            refCleanup.current();
            refCleanup.current = undefined;
          } else {
            ref(null);
          }
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref, textareaRef],
    );

    // Controlled inputs re-render on every keystroke, so the post-render
    // layout effect already re-measures; resizing here too would force a
    // second synchronous layout. Uncontrolled inputs don't re-render, so the
    // change handler is their only resize trigger.
    const isControlled = inputProps.value !== undefined;
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
        if (!isControlled) resize();
      },
      [onChange, onValueChange, resize, isControlled],
    );

    const textareaClassName = cn(
      inputVariants({ size, variant, focusIndicator: true }),
      "h-auto py-2", // Input variant always comes with size, but it does not apply for textarea
      autoResize &&
        "w-full field-sizing-content resize-none scroll-pb-2 [scrollbar-color:var(--color-kumo-line)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:my-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-kumo-line [&::-webkit-scrollbar-corner]:bg-transparent",
      className,
    );

    // Render with Field wrapper if label, error, or description is provided
    // Use FieldBase.Control with render callback to ensure proper label-textarea association.
    // The render callback receives props with the correct id/aria-labelledby from Field context.
    if (label || error || description) {
      return (
        <KumoField
          label={label}
          required={required}
          labelTooltip={labelTooltip}
          description={description}
          error={normalizeFieldError(error)}
        >
          <FieldBase.Control
            render={(controlProps) => (
              <textarea
                {...controlProps}
                ref={setTextareaRef}
                className={textareaClassName}
                onChange={handleChange}
                rows={autoResize ? minRows : rows}
                {...inputProps}
              />
            )}
          />
        </KumoField>
      );
    }

    // Render bare textarea without Field wrapper
    return (
      <textarea
        ref={setTextareaRef}
        className={textareaClassName}
        onChange={handleChange}
        rows={autoResize ? minRows : rows}
        {...inputProps}
      />
    );
  },
);

InputArea.displayName = "InputArea";

/** Alias for InputArea — provided for discoverability when migrating from other libraries */
export const Textarea = InputArea;

/**
 * InputArea component props
 * @property {ReactNode} [label] - Label content for the textarea (enables Field wrapper)
 * @property {ReactNode} [description] - Helper text displayed below the textarea
 * @property {string | { message: ReactNode, match: FieldErrorMatch }} [error] - Error message or validation error object
 */
export type InputAreaProps = {
  onValueChange?: (value: string) => void;
  variant?: "default" | "error";
  size?: "xs" | "sm" | "base" | "lg";
  // Then other custom props
  children?: React.ReactNode;
  className?: string;
  /** Label content for the textarea (enables Field wrapper) - can be a string or any React node */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** Helper text displayed below the textarea */
  description?: ReactNode;
  /** Error message or validation error object */
  error?: string | { message: ReactNode; match: FieldErrorMatch };
  /** Automatically resize the textarea based on its content. */
  autoResize?: boolean;
  /** Minimum number of rows to display when `autoResize` is enabled. @default 1 */
  minRows?: number;
  /** Maximum number of rows to grow to when `autoResize` is enabled; content beyond this scrolls. */
  maxRows?: number;

  // Finally, spread the native input props (least important)
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;
