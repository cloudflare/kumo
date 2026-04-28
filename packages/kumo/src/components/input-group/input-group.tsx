import {
  forwardRef,
  useId,
  useMemo,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
} from "react";
import { cn } from "../../utils/cn";
import { inputVariants } from "../input/input";
import { Field } from "../field/field";
import {
  InputGroupContext,
  INPUT_GROUP_HAS_CLASSES,
  detectFocusMode,
  partitionChildren,
  type InputGroupRootPropsInternal,
} from "./context";
import { Input } from "./input-group-input";
import { Button } from "./input-group-button";
import { Addon } from "./input-group-addon";
import { Suffix } from "./input-group-suffix";

export { type InputGroupRootProps } from "./context";
export { type InputGroupInputProps } from "./input-group-input";
export { type InputGroupButtonProps } from "./input-group-button";
export { type InputGroupAddonProps } from "./input-group-addon";
export { type InputGroupSuffixProps } from "./input-group-suffix";

export const KUMO_INPUT_GROUP_VARIANTS = {
  size: {
    xs: {
      classes: "h-6 text-xs",
      description: "Extra small size.",
    },
    sm: {
      classes: "h-7 text-xs",
      description: "Small size.",
    },
    base: {
      classes: "h-9 text-base",
      description: "Default size.",
    },
    lg: {
      classes: "h-11 text-base",
      description: "Large size.",
    },
  },
} as const;

export const KUMO_INPUT_GROUP_DEFAULT_VARIANTS = {
  size: "base",
} as const;

/**
 * Compound input component for building inputs with icons, addons, inline
 * suffixes, and action buttons. Accepts Field props and wraps content in
 * Field when label is provided.
 *
 * Renders as `<label>` only in standalone container mode (single input, no
 * sibling buttons) so clicking empty space focuses the input. Otherwise
 * renders as `<div>` to avoid nested `<label>` (when Field provides one) or
 * the browser's `:hover` propagation from `<label>` to its first labelable
 * descendant (when multiple labelable controls are siblings).
 *
 * @note Do not wrap InputGroup inside an external Field without using the `label` prop —
 * this creates invalid nested `<label>` elements. Use InputGroup's own `label` prop instead.
 *
 * @example
 * ```tsx
 * <InputGroup label="Email" error={{ message: "Invalid", match: true }}>
 *   <InputGroup.Addon><EnvelopeIcon /></InputGroup.Addon>
 *   <InputGroup.Input placeholder="you@example.com" />
 * </InputGroup>
 * ```
 *
 * @example
 * ```tsx
 * <InputGroup>
 *   <InputGroup.Input placeholder="my-worker" />
 *   <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
 * </InputGroup>
 * ```
 */
const Root = forwardRef<
  HTMLElement,
  PropsWithChildren<InputGroupRootPropsInternal>
>(
  (
    {
      size = "base",
      children,
      className,
      disabled = false,
      label,
      description,
      error,
      required,
      labelTooltip,
      ...rest
    },
    forwardedRef,
  ) => {
    const inputId = useId();
    const focusMode = detectFocusMode(children);

    const contextValue = useMemo(
      () => ({
        size,
        focusMode,
        disabled,
        error,
        inputId,
      }),
      [size, focusMode, disabled, error, inputId],
    );

    // When label is provided, Field already renders a <label> with htmlFor
    // that handles click-to-focus. Using <div> avoids nested <label> elements
    // (invalid HTML with undefined assistive technology behavior).
    // When standalone (no label), a native <label> preserves click-to-focus.
    const containerClassName = cn(
      // Establish positioning context and make the whole area a click target
      "relative w-full cursor-text",
      // inputVariants provides base ring-kumo-line; must come before state overrides
      inputVariants({ size }),
      // Subtle drop shadow to separate the group from the page surface
      "shadow-xs",
      // Disabled state: prevent interaction and dim the entire group
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Container mode: clip children to rounded corners and show a shared focus ring
      // Individual mode: disable container ring/shadow so each child owns its own border
      focusMode === "container"
        ? [
            "overflow-hidden",
            // Focus state must come AFTER inputVariants to override ring-kumo-line
            "focus-within:ring-kumo-focus",
          ]
        : // isolate creates a new stacking context so z-index in children doesn't leak out
          "isolate overflow-visible ring-0 shadow-none",
      // Error state must also come after inputVariants
      "has-[input[aria-invalid=true]]:ring-kumo-danger",
      // Reset horizontal padding — children handle their own spacing
      "px-0",
      // Horizontal layout with no gap — children control their own internal spacing
      "flex items-center gap-0",
      // When a suffix is present, let the input shrink to its content width
      // so the suffix stays visually adjacent
      "has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
      "has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full",
      "has-[[data-slot=input-group-suffix]]:[&_input]:grow-0",
      "has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
      // Size-specific padding adjustments when addons or suffixes are present
      INPUT_GROUP_HAS_CLASSES[size],
      className,
    );

    // Data attributes drive CSS selectors in kumo-binding.css (focus outline)
    // and enable child components to query their parent's state.
    const dataProps = {
      "data-slot": "input-group" as const,
      "data-focus-mode": focusMode,
      "data-disabled": disabled ? ("" as const) : undefined,
    };

    // Hybrid mode: splits children into two rendering zones:
    // 1. Container zone (Addon + Input + Suffix) — shares a single border/ring
    // 2. Individual zone (standalone Buttons) — each button owns its own border
    // This lets inputs and addons look unified while buttons remain independent.
    if (focusMode === "hybrid") {
      // Partition children by type: addons/inputs/suffixes → container, buttons → individual
      const { containerZone, individualZone } = partitionChildren(children);

      // Override focusMode to "container" for children inside the zone
      // so InputGroup.Input uses container-mode styling (ring-0!, no own border).
      const containerZoneContext = {
        ...contextValue,
        focusMode: "container" as const,
      };

      const hybridContent = (
        <>
          {/* Container zone wrapper — shares a single border/ring */}
          <InputGroupContext.Provider value={containerZoneContext}>
            <div
              data-slot="input-group-container-zone"
              className={cn(
                // Base input sizing/shape from shared variant function
                inputVariants({ size }),
                // Clip children to rounded corners within the zone
                "overflow-hidden",
                // Show red ring on validation error
                "has-[input[aria-invalid=true]]:ring-kumo-danger",
                // Reset horizontal padding — children handle their own spacing
                "px-0",
                // Fill available width but allow shrinking when sibling buttons are present
                "flex min-w-0 flex-1 items-center gap-0",
                // Use a clean 1px CSS border instead of ring+shadow from inputVariants
                // so the zone matches adjacent individual-mode buttons exactly.
                "ring-0 shadow-none",
                "border border-kumo-line",
                "focus-within:ring-1 focus-within:ring-kumo-focus",
                // Collapse double borders between zone and adjacent individual-mode button
                "not-first:border-l-0",
                // Inherit border-radius from the outer container on outer edges only;
                // inner edges are flat so they butt cleanly against sibling buttons
                "first:rounded-l-[inherit] last:rounded-r-[inherit] rounded-none",
                // Size-specific padding adjustments when addons or suffixes are present
                INPUT_GROUP_HAS_CLASSES[size],
                // When a suffix is present, let the input shrink to its content width
                "has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
                "has-[[data-slot=input-group-suffix]]:[&_input]:max-w-full",
                "has-[[data-slot=input-group-suffix]]:[&_input]:grow-0",
                "has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
              )}
            >
              {/* When label exists, an invisible <label> overlay enables click-to-focus
                  inside the container zone without nesting visible <label> elements */}
              {label && (
                // eslint-disable-next-line jsx-a11y/label-has-associated-control -- invisible overlay for click-to-focus; the visible Field label handles a11y
                <label
                  htmlFor={inputId}
                  // Positioned behind children (z-0) so it catches clicks on empty space
                  className="absolute inset-0 z-0 cursor-text !mb-0"
                  aria-hidden="true"
                />
              )}
              {containerZone}
            </div>
          </InputGroupContext.Provider>
          {/* Individual zone — buttons with their own borders */}
          {individualZone}
        </>
      );

      // Hybrid always uses a <div> container (never <label>) because
      // individual-zone buttons are siblings — wrapping them in a <label>
      // would be semantically incorrect.
      const hybridContainer = (
        <InputGroupContext.Provider value={contextValue}>
          <div
            ref={forwardedRef as React.Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {hybridContent}
          </div>
        </InputGroupContext.Provider>
      );

      if (label) {
        return (
          <Field
            label={label}
            description={description}
            error={error}
            required={required}
            labelTooltip={labelTooltip}
          >
            {hybridContainer}
          </Field>
        );
      }

      return hybridContainer;
    }

    // Container / Individual mode (non-hybrid)
    // Use <label> only when there's exactly one labelable descendant; otherwise <label> would propagate :hover to its first labelable descendant.
    const useLabelContainer = !label && focusMode === "container";
    const container = (
      <InputGroupContext.Provider value={contextValue}>
        {/* When label is set, use <div> to avoid nested <label> (Field provides one).
            An invisible <label> overlay handles click-to-focus on empty space. */}
        {label ? (
          <div
            ref={forwardedRef as React.Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- invisible overlay for click-to-focus; the visible Field label handles a11y */}
            <label
              htmlFor={inputId}
              // Positioned behind children (z-0) so it catches clicks on empty space
              className="absolute inset-0 z-0 !mb-0"
              aria-hidden="true"
            />
            {children}
          </div>
        ) : useLabelContainer ? (
          // Standalone container mode: <label> enables click-to-focus on empty space.
          <label
            ref={forwardedRef as React.Ref<HTMLLabelElement>}
            {...dataProps}
            className={cn(containerClassName, "!mb-0")}
            {...rest}
          >
            {children}
          </label>
        ) : (
          // Individual mode: <div> avoids :hover propagating to the first labelable sibling.
          <div
            ref={forwardedRef as React.Ref<HTMLDivElement>}
            {...dataProps}
            className={containerClassName}
            {...rest}
          >
            {children}
          </div>
        )}
      </InputGroupContext.Provider>
    );

    if (label) {
      return (
        <Field
          label={label}
          description={description}
          error={error}
          required={required}
          labelTooltip={labelTooltip}
        >
          {container}
        </Field>
      );
    }

    return container;
  },
);
Root.displayName = "InputGroup";

/** @deprecated Use `InputGroup.Addon` instead. */
const Label = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Addon>
>((props, ref) => <Addon ref={ref} align="start" {...props} />);
Label.displayName = "InputGroup.Label";

/** @deprecated Use `InputGroup.Suffix` instead. */
const Description = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Suffix>
>((props, ref) => <Suffix ref={ref} {...props} />);
Description.displayName = "InputGroup.Description";

export const InputGroup = Object.assign(Root, {
  Input,
  Button,
  Addon,
  Suffix,
  /** @deprecated Use `InputGroup.Addon` instead. */
  Label,
  /** @deprecated Use `InputGroup.Suffix` instead. */
  Description,
});
