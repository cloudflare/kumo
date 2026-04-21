import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { KumoInputSize } from "../input/input";
import type { FieldProps } from "../field/field";

// Spacing model
//
// Each element type has a fixed outer padding. The container uses has-[] CSS
// to reduce the input's padding on sides that touch an addon.
//
//   Input outer:       px-3 (12px base) — full padding when at the edge
//   Input seam:        pl-2 / pr-2 (8px base) — applied by container has-[]
//   Addon outer:       pl-2 / pr-2 (8px base) — on the container-edge side
//   Addon seam:        nothing — input owns the gap entirely
//
// has-[] rules on the container override [&_input]:pl-{seam} when a start
// addon is present, and [&_input]:pr-{seam} when an end addon is present.

export interface InputGroupSizeTokens {
  /** Full outer padding — matches standalone Input (e.g. px-3). */
  inputOuter: string;
  /**
   * Directional outer padding for Addon at the container edge.
   *
   * These MUST be static pl-/pr- strings (not derived at runtime via
   * `"px-N".replace(…)`) so Tailwind JIT can detect them during its
   * source-file scan. Dynamic string construction produces class names
   * that never appear as literals, so Tailwind never generates the CSS.
   */
  addonOuterStart: string;
  addonOuterEnd: string;
  /**
   * Reduced outer padding when the Addon contains a Button.
   * Buttons have their own internal padding, so the Addon can use
   * less outer padding to keep the visual gap balanced.
   */
  addonButtonOuterStart: string;
  addonButtonOuterEnd: string;
  /** pr- for suffix when no end addon. */
  suffixPad: string;
  fontSize: string;
  /** Icon size in px. */
  iconSize: number;
}

export const INPUT_GROUP_SIZE: Record<KumoInputSize, InputGroupSizeTokens> = {
  xs: {
    inputOuter: "px-1.5",
    addonOuterStart: "pl-1.5",
    addonOuterEnd: "pr-1.5",
    addonButtonOuterStart: "pl-1",
    addonButtonOuterEnd: "pr-1",
    suffixPad: "pr-1.5",
    fontSize: "text-xs",
    iconSize: 10,
  },
  sm: {
    inputOuter: "px-2",
    addonOuterStart: "pl-1.5",
    addonOuterEnd: "pr-1.5",
    addonButtonOuterStart: "pl-1",
    addonButtonOuterEnd: "pr-1",
    suffixPad: "pr-2",
    fontSize: "text-xs",
    iconSize: 13,
  },
  base: {
    inputOuter: "px-3",
    addonOuterStart: "pl-2",
    addonOuterEnd: "pr-2",
    addonButtonOuterStart: "pl-1",
    addonButtonOuterEnd: "pr-1",
    suffixPad: "pr-3",
    fontSize: "text-base",
    iconSize: 18,
  },
  lg: {
    inputOuter: "px-4",
    addonOuterStart: "pl-2.5",
    addonOuterEnd: "pr-2.5",
    addonButtonOuterStart: "pl-1.5",
    addonButtonOuterEnd: "pr-1.5",
    suffixPad: "pr-4",
    fontSize: "text-base",
    iconSize: 20,
  },
};

// Build the has-[] container classes that reduce input padding when addons
// are present. These are static strings so Tailwind JIT can detect them.
export const INPUT_GROUP_HAS_CLASSES: Record<KumoInputSize, string> = {
  xs: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1",
  ].join(" "),
  sm: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-1.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-1.5",
  ].join(" "),
  base: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2",
  ].join(" "),
  lg: [
    "has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2.5",
    "has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2.5",
  ].join(" "),
};

// Context

/**
 * Props for `InputGroup.Root`. Focus mode is auto-detected from children
 * (see `detectFocusMode`), so it is not part of the public or internal API.
 */
export interface InputGroupRootPropsInternal
  extends HTMLAttributes<HTMLElement>,
    Partial<
      Pick<
        FieldProps,
        "label" | "description" | "error" | "required" | "labelTooltip"
      >
    > {
  size?: KumoInputSize | undefined;
  disabled?: boolean;
}

/** Public InputGroup.Root props — identical to the internal type. */
export type InputGroupRootProps = InputGroupRootPropsInternal;

export interface InputGroupContextValue {
  size?: KumoInputSize;
  focusMode: "container" | "individual" | "hybrid";
  disabled: boolean;
  error?: FieldProps["error"];
  /** Auto-generated id for the input element; used by the invisible label overlay. */
  inputId: string;
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(
  null,
);

/**
 * Set to `true` by `InputGroup.Addon` so that `InputGroup.Button` can detect
 * whether it's wrapped in an Addon. Ghost buttons should always live inside
 * an Addon for correct spacing.
 */
export const InputGroupAddonContext = createContext(false);

/**
 * Reads InputGroupContext and warns in development when the context is null
 * (i.e. when a sub-component is rendered outside of `<InputGroup>`).
 */
export function useInputGroupContext(componentName: string) {
  const context = useContext(InputGroupContext);
  if (process.env.NODE_ENV !== "production" && !context) {
    console.warn(
      `<InputGroup.${componentName}> must be used within <InputGroup>. Falling back to default values.`,
    );
  }
  return context;
}

/**
 * Partitions InputGroup children for hybrid focus mode.
 *
 * Container zone: Addon, Input, Suffix, text nodes — everything that should
 * share a single container-style border.
 *
 * Individual zone: Direct `InputGroup.Button` elements that manage their own
 * border and focus ring.
 *
 * Uses `displayName` comparison to identify elements, avoiding circular
 * imports between `context.ts` and the sub-component files.
 */
export function partitionChildren(children: ReactNode): {
  containerZone: ReactNode[];
  individualZone: ReactNode[];
} {
  const containerZone: ReactNode[] = [];
  const individualZone: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (
      isValidElement(child) &&
      (child.type as { displayName?: string })?.displayName ===
        "InputGroup.Button"
    ) {
      individualZone.push(child);
    } else {
      containerZone.push(child);
    }
  });

  return { containerZone, individualZone };
}

/**
 * Analyzes the direct children of `InputGroup` to determine the focus mode.
 *
 * Returns `"hybrid"` when BOTH an `InputGroup.Addon` AND a non-ghost direct
 * `InputGroup.Button` are present. In hybrid mode, Addon+Input share a
 * container-style border while Buttons get individual borders.
 *
 * Returns `"individual"` when a non-ghost direct `InputGroup.Button` is
 * present WITHOUT any `InputGroup.Addon`. This signals a toolbar/pagination
 * layout where each element manages its own focus ring.
 *
 * Returns `"container"` (default) in all other cases — the container owns a
 * single shared focus ring.
 *
 * Uses `displayName` comparison to identify elements, avoiding circular
 * imports between `context.ts` and the sub-component files.
 */
export function detectFocusMode(
  children: ReactNode,
): "container" | "individual" | "hybrid" {
  let hasNonGhostDirectButton = false;
  let hasAddon = false;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    // Identify components by displayName to avoid circular imports.
    const type = child.type;
    const displayName =
      typeof type === "function" || typeof type === "object"
        ? (type as { displayName?: string }).displayName
        : undefined;

    if (displayName === "InputGroup.Addon") {
      hasAddon = true;
      return;
    }

    if (displayName !== "InputGroup.Button") return;

    // A direct-child Button is by definition NOT inside an Addon (Addon's
    // children are children of the Addon element, not of InputGroup).
    // Check whether the variant is explicitly non-ghost.
    const variant = (child.props as { variant?: string }).variant;
    if (variant !== undefined && variant !== "ghost") {
      hasNonGhostDirectButton = true;
    }
  });

  if (hasNonGhostDirectButton && hasAddon) return "hybrid";
  if (hasNonGhostDirectButton) return "individual";
  return "container";
}
