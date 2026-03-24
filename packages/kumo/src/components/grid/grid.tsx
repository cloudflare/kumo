import React from "react";
import { cn } from "../../utils/cn";

/** Grid variant and gap definitions mapping layout names to their responsive Tailwind classes. */
export const KUMO_GRID_VARIANTS = {
  variant: {
    "2up": {
      classes: "grid-cols-1 md:grid-cols-2",
      description:
        "Grid items stack on small screens, display side-by-side on medium screens and up",
    },
    "side-by-side": {
      classes: "grid-cols-2",
      description: "Grid items always displayed side-by-side",
    },
    "2-1": {
      classes: "grid-cols-1 md:grid-cols-[2fr_1fr]",
      description:
        "Two-thirds / one-third split (66%/33%) on medium screens and up",
    },
    "1-2": {
      classes: "grid-cols-1 md:grid-cols-[1fr_2fr]",
      description:
        "One-third / two-thirds split (33%/66%) on medium screens and up",
    },
    "1-3up": {
      classes: "grid-cols-1 lg:grid-cols-3",
      description:
        "Grid items stack on small screens, expand to 3 across on large screens",
    },
    "3up": {
      classes: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      description:
        "Grid items stack on small screens, 2 across on medium, 3 across on large",
    },
    "4up": {
      classes: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      description:
        "Grid items stack on small screens, progressively increase columns at larger breakpoints",
    },
    "6up": {
      classes: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
      description: "Grid items start at 2 across, expand to 6 across on XL",
    },
    "1-2-4up": {
      classes: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      description:
        "Grid items stack on small screens, 2 across on medium, 4 across on large",
    },
  },
  gap: {
    none: {
      classes: "gap-0",
      description: "No gap between grid items",
    },
    sm: {
      classes: "gap-3",
      description: "Small gap between grid items",
    },
    base: {
      classes: "gap-2 md:gap-6 lg:gap-8",
      description: "Default responsive gap between grid items",
    },
    lg: {
      classes: "gap-8",
      description: "Large gap between grid items",
    },
  },
} as const;

export const KUMO_GRID_DEFAULT_VARIANTS = {
  gap: "base",
} as const;

export type KumoGridVariant = keyof typeof KUMO_GRID_VARIANTS.variant;
export type KumoGridGap = keyof typeof KUMO_GRID_VARIANTS.gap;

/**
 * Grid component props.
 *
 * @example
 * ```tsx
 * <Grid variant="3up" gap="sm">
 *   <GridItem><Surface className="p-4">1</Surface></GridItem>
 *   <GridItem><Surface className="p-4">2</Surface></GridItem>
 *   <GridItem><Surface className="p-4">3</Surface></GridItem>
 * </Grid>
 * ```
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Grid items to render. */
  children?: React.ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Show dividers between grid items on mobile (only works with `"4up"` variant). */
  mobileDivider?: boolean;
  /**
   * Gap size between grid items.
   * - `"none"` — No gap
   * - `"sm"` — 12px gap
   * - `"base"` — Responsive gap (8px → 24px → 32px)
   * - `"lg"` — 32px gap
   * @default "base"
   */
  gap?: KumoGridGap;
  /**
   * Responsive column layout variant.
   * - `"2up"` — 1 col → 2 cols at md
   * - `"side-by-side"` — Always 2 cols
   * - `"2-1"` — 66%/33% split at md
   * - `"1-2"` — 33%/66% split at md
   * - `"3up"` — 1 → 2 → 3 cols
   * - `"4up"` — 1 → 2 → 3 → 4 cols
   * - `"6up"` — 2 → 3 → 4 → 6 cols
   * - `"1-2-4up"` — 1 → 2 → 4 cols
   */
  variant?: KumoGridVariant;
}

/** GridItem component props — a single cell within a Grid. */
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Content for this grid cell. */
  children?: React.ReactNode;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

interface GridContextValue {
  variant?: KumoGridVariant;
  gap: KumoGridGap;
  mobileDivider?: boolean;
}

const GridContext = React.createContext<GridContextValue>({
  gap: "base",
});

export function gridVariants({
  variant,
  gap = KUMO_GRID_DEFAULT_VARIANTS.gap,
}: {
  variant?: KumoGridVariant;
  gap?: KumoGridGap;
} = {}) {
  return cn(
    "grid",
    variant && KUMO_GRID_VARIANTS.variant[variant].classes,
    KUMO_GRID_VARIANTS.gap[gap].classes,
  );
}

export function gridItemVariants({
  variant,
  mobileDivider,
}: {
  variant?: KumoGridVariant;
  mobileDivider?: boolean;
} = {}) {
  return cn(
    mobileDivider &&
      variant === "4up" &&
      "border-b border-kumo-line pb-8 md:border-b-0 md:pb-0",
  );
}

/**
 * Responsive CSS grid layout container with preset column configurations.
 *
 * @example
 * ```tsx
 * <Grid variant="2up" gap="base">
 *   <GridItem>Left</GridItem>
 *   <GridItem>Right</GridItem>
 * </Grid>
 * ```
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      className,
      mobileDivider,
      gap = KUMO_GRID_DEFAULT_VARIANTS.gap,
      variant,
      ...props
    },
    ref,
  ) => {
    return (
      <GridContext.Provider value={{ variant, gap, mobileDivider }}>
        <div
          ref={ref}
          className={cn(gridVariants({ variant, gap }), className)}
          {...props}
        >
          {children}
        </div>
      </GridContext.Provider>
    );
  },
);

Grid.displayName = "Grid";

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, className, ...props }, ref) => {
    const { variant, mobileDivider } = React.useContext(GridContext);

    return (
      <div
        ref={ref}
        className={cn(gridItemVariants({ variant, mobileDivider }), className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GridItem.displayName = "GridItem";
