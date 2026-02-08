import { Info } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Tooltip } from "../tooltip";

/** Label variant definitions (currently empty, reserved for future additions). */
export const KUMO_LABEL_VARIANTS = {
  // Label currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_LABEL_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_LABEL_VARIANTS
export interface KumoLabelVariantsProps {}

export function labelVariants(_props: KumoLabelVariantsProps = {}) {
  return cn(
    // Base styles - when used standalone, apply text styling
    // When used inside Field, the parent FieldBase.Label provides these styles
    "text-base font-medium text-kumo-default",
  );
}

export function labelContentVariants() {
  return cn(
    // Content wrapper styles - always applied
    "inline-flex items-center gap-1",
  );
}

/**
 * Label component props.
 *
 * @example
 * ```tsx
 * <Label>Email</Label>
 * <Label showOptional>Middle Name</Label>
 * <Label tooltip="We'll use this to send you updates">Email</Label>
 * ```
 */
export interface LabelProps extends KumoLabelVariantsProps {
  /** The label content — can be a string or any React node. */
  children: ReactNode;
  /** When `true`, shows gray "(optional)" text after the label. */
  showOptional?: boolean;
  /** Tooltip content displayed next to the label via an info icon. */
  tooltip?: ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /**
   * When `true`, only renders the inline content (indicators, tooltip) without
   * the outer span with font styling. Useful when composed inside another
   * label element that already provides the text styling.
   * @default false
   */
  asContent?: boolean;
}

/**
 * Label component for form fields.
 *
 * Provides a standardized way to display labels with optional indicators:
 * - Optional indicator: gray "(optional)" text when `showOptional={true}`
 * - Tooltip: info icon with hover tooltip for additional context
 *
 * @example
 * // Basic label
 * <Label>Email</Label>
 *
 * @example
 * // Optional field with indicator
 * <Label showOptional>Middle Name</Label>
 *
 * @example
 * // With tooltip
 * <Label tooltip="We'll use this to send you updates">Email</Label>
 *
 * @example
 * // With ReactNode children
 * <Label>
 *   <span>Custom label with <strong>bold</strong> text</span>
 * </Label>
 */
export function Label({
  children,
  showOptional = false,
  tooltip,
  className,
  asContent = false,
}: LabelProps) {
  const content = (
    <>
      {children}
      {showOptional && (
        <span className="font-normal text-kumo-strong">(optional)</span>
      )}
      {tooltip && (
        <Tooltip content={tooltip}>
          <Info
            className="size-4 cursor-help text-kumo-strong"
            aria-label="More information"
          />
        </Tooltip>
      )}
    </>
  );

  // When used as content inside another styled element, just render inline
  if (asContent) {
    return (
      <span className={cn(labelContentVariants(), className)}>{content}</span>
    );
  }

  // When used standalone, apply full label styling
  return (
    <span className={cn(labelVariants(), labelContentVariants(), className)}>
      {content}
    </span>
  );
}

Label.displayName = "Label";
