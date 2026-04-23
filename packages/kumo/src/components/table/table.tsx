import { forwardRef } from "react";
import { cn } from "../../utils";
import { Checkbox, type CheckboxChangeEventDetails } from "../checkbox";

/** Table layout and row variant definitions mapping names to their Tailwind classes. */
export const KUMO_TABLE_VARIANTS = {
  layout: {
    auto: {
      classes: "",
      description: "Auto table layout - columns resize based on content",
    },
    fixed: {
      classes: "table-fixed",
      description:
        "Fixed table layout - columns have equal width, controlled via colgroup",
    },
  },
  variant: {
    default: {
      classes: "",
      description: "Default row variant",
    },
    selected: {
      classes: "bg-kumo-tint",
      description: "Selected row variant",
    },
  },
  sticky: {
    left: {
      classes: "sticky left-0",
      description: "Pin column to the left edge of the scroll container",
    },
    right: {
      classes: "sticky right-0",
      description: "Pin column to the right edge of the scroll container",
    },
  },
} as const;

export type KumoTableStickyColumn = keyof typeof KUMO_TABLE_VARIANTS.sticky;

/**
 * Shared sticky-column styles for `<th>` and `<td>`.
 *
 * - Opaque background so scrolling content doesn't show through.
 * - Gradient fade on the inner edge so the sticky boundary isn't a hard clip.
 * - z-index kept to z-0/z-1/z-2 within the table's `isolate` stacking context:
 *   - `z-0` — normal cells (default)
 *   - `z-1` — sticky body cells (`<td>`)
 *   - `z-2` — sticky header cells (`<th>`) so they sit above sticky body cells
 *
 * Header cells use `:has()` to detect if they're in a compact header (which has
 * `bg-kumo-elevated`) and adjust both the background and gradient fade colors.
 */
const stickyColumnClasses = (
  side: KumoTableStickyColumn,
  /** "head" renders at z-2, "cell" at z-1 */
  element: "head" | "cell",
) => {
  const base = KUMO_TABLE_VARIANTS.sticky[side].classes;
  const z = element === "head" ? "z-2" : "z-1";

  const fadePosition = side === "right" ? "before:-left-6" : "before:-right-6";
  const fadeBase =
    "before:pointer-events-none before:absolute before:inset-y-0 before:w-6";

  if (element === "cell") {
    // Body cells always use kumo-base
    const fade =
      side === "right"
        ? "before:bg-gradient-to-r before:from-transparent before:to-kumo-base"
        : "before:bg-gradient-to-l before:from-transparent before:to-kumo-base";
    return cn(base, z, "bg-kumo-base", fadeBase, fadePosition, fade);
  }

  // Header cells: use kumo-base by default, kumo-elevated when in compact header
  // The compact header applies a data attribute we can target with :has()
  const bg = "bg-kumo-base group-data-[compact]/header:bg-kumo-elevated";
  const fade =
    side === "right"
      ? "before:bg-gradient-to-r before:from-transparent before:to-kumo-base group-data-[compact]/header:before:to-kumo-elevated"
      : "before:bg-gradient-to-l before:from-transparent before:to-kumo-base group-data-[compact]/header:before:to-kumo-elevated";

  return cn(base, z, bg, fadeBase, fadePosition, fade);
};

export const KUMO_TABLE_DEFAULT_VARIANTS = {
  layout: "auto",
  variant: "default",
} as const;

export type KumoTableRowVariant = keyof typeof KUMO_TABLE_VARIANTS.variant;
export type KumoTableLayout = keyof typeof KUMO_TABLE_VARIANTS.layout;

/**
 * Table root — applies layout, borders, padding, and header styles.
 *
 * @example
 * ```tsx
 * <Table layout="fixed">
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.Head>Name</Table.Head>
 *       <Table.Head>Status</Table.Head>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body>
 *     <Table.Row>
 *       <Table.Cell>Worker A</Table.Cell>
 *       <Table.Cell>Active</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table>
 * ```
 */
const TableRoot = forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    /**
     * Table layout algorithm.
     * - `"auto"` — columns resize based on content
     * - `"fixed"` — equal-width columns, controlled via `<colgroup>`
     * @default "auto"
     */
    layout?: KumoTableLayout;
  }
>(({ layout = "auto", ...props }, ref) => {
  const className = cn(
    "isolate w-full", // isolate creates a stacking context so z-0/z-1/z-2 never leak out
    KUMO_TABLE_VARIANTS.layout[layout].classes,
    "[&_td]:border-b [&_td]:border-kumo-fill [&_tr:last-child_td]:border-b-0", // Row border
    "[&_td]:p-3", // Cell padding
    "[&_th]:border-b [&_th]:border-kumo-fill [&_th]:p-3 [&_th]:font-semibold [&_th]:text-base", // Header styles
    "[&_th]:bg-kumo-base", // Header background color
    "text-left text-kumo-default",
    props.className,
  );

  return <table ref={ref} {...props} className={className} />;
});

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    variant?: "default" | "compact";
    /**
     * Make the header row stick to the top of the scroll container.
     * Requires the table's parent to have a constrained height with
     * `overflow-y: auto`.
     */
    sticky?: boolean;
  }
>(({ variant = "default", sticky, ...props }, ref) => {
  const isCompact = variant === "compact";
  const className = cn(
    "group/header",
    isCompact && "[&_th]:bg-kumo-elevated [&_th]:py-2 text-xs text-kumo-strong",
    sticky && "[&_th]:sticky [&_th]:top-0 [&_th]:z-1",
    props.className,
  );

  return (
    <thead
      ref={ref}
      {...props}
      className={className}
      {...(isCompact && { "data-compact": "" })}
    />
  );
});

const TableHead = forwardRef<
  HTMLTableCellElement,
  React.HTMLAttributes<HTMLTableCellElement> & {
    /**
     * Pin this header cell to the left or right edge of the scroll container.
     * Adds `position: sticky`, an opaque background, and a gradient fade on the
     * inner edge. Sticky header columns render at `z-2` so they sit above both
     * normal cells and sticky body cells (`z-1`).
     */
    sticky?: KumoTableStickyColumn;
  }
>(({ sticky, ...props }, ref) => {
  const className = cn(
    "group relative",
    sticky && stickyColumnClasses(sticky, "head"),
    props.className,
  );
  return <th ref={ref} {...props} className={className} />;
});

const TableRow = forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    variant?: KumoTableRowVariant;
  }
>(({ variant = KUMO_TABLE_DEFAULT_VARIANTS.variant, ...props }, ref) => {
  const className = cn(
    KUMO_TABLE_VARIANTS.variant[variant].classes,
    props.className,
  );

  return <tr ref={ref} {...props} className={className} />;
});

const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => {
  return <tbody ref={ref} {...props} />;
});

const TableCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    /**
     * Pin this cell to the left or right edge of the scroll container.
     * Adds `position: sticky`, an opaque background, and a gradient fade on
     * the inner edge. Requires the table's parent to have `overflow-x: auto`.
     */
    sticky?: KumoTableStickyColumn;
  }
>(({ sticky, ...props }, ref) => {
  const className = cn(
    sticky && stickyColumnClasses(sticky, "cell"),
    props.className,
  );
  return <td ref={ref} {...props} className={className} />;
});

const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => {
  return <tfoot ref={ref} {...props} />;
});

const TableResizeHandle = forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      type="button"
      aria-label="Resize column"
      className={cn(
        "invisible h-full group-hover:visible", // Make the handle invisible by default
        "w-[10px]", // Hitting area
        "flex items-center justify-center", // Center the handle
        "cursor-col-resize touch-none select-none", // Prevent selection and touch events
        "absolute top-0 right-0", // Position the handle
        "m-0 bg-kumo-base p-0", // Override the stratus button styles
        "focus-visible:ring-2 focus-visible:ring-kumo-brand", // Consistent keyboard focus styling
      )}
    >
      <span className="h-5 w-[2px] rounded bg-kumo-hairline" />
    </button>
  );
});

/**
 * Special cell that makes the entire cell area a hit target for the checkbox.
 */

const TableCheckCell = forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    checked?: boolean;
    indeterminate?: boolean;
    /**
     * Called when the checkbox's checked state changes. The optional second
     * argument exposes event details from the underlying Checkbox, matching
     * the Checkbox component's signature.
     */
    onCheckedChange?: (
      checked: boolean,
      eventDetails?: CheckboxChangeEventDetails,
    ) => void;
    /** @deprecated Use `onCheckedChange` instead. Will be removed in a future major version. */
    onValueChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
  }
>(
  (
    {
      checked,
      indeterminate,
      onCheckedChange,
      onValueChange,
      label,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <TableCell
        ref={ref}
        {...props}
        className={cn("w-10 leading-none", props.className)}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(newChecked, eventDetails) => {
            onCheckedChange?.(newChecked, eventDetails);
            onValueChange?.(newChecked);
          }}
          aria-label={label ?? "Select row"}
          disabled={disabled}
          className="relative before:absolute before:-inset-3 before:content-['']"
        />
      </TableCell>
    );
  },
);

const TableCheckHead = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    checked?: boolean;
    indeterminate?: boolean;
    /**
     * Called when the checkbox's checked state changes. The optional second
     * argument exposes event details from the underlying Checkbox, matching
     * the Checkbox component's signature.
     */
    onCheckedChange?: (
      checked: boolean,
      eventDetails?: CheckboxChangeEventDetails,
    ) => void;
    /** @deprecated Use `onCheckedChange` instead. Will be removed in a future major version. */
    onValueChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
  }
>(
  (
    {
      checked,
      indeterminate,
      onCheckedChange,
      onValueChange,
      label,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <TableHead
        ref={ref}
        {...props}
        className={cn("w-10 leading-none", props.className)}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(newChecked, eventDetails) => {
            onCheckedChange?.(newChecked, eventDetails);
            onValueChange?.(newChecked);
          }}
          aria-label={label ?? "Select all rows"}
          disabled={disabled}
          className="relative before:absolute before:-inset-3 before:content-['']"
        />
      </TableHead>
    );
  },
);

TableRoot.displayName = "Table";
TableBody.displayName = "Table.Body";
TableHead.displayName = "Table.Head";
TableRow.displayName = "Table.Row";
TableCell.displayName = "Table.Cell";
TableFooter.displayName = "Table.Footer";
TableHeader.displayName = "Table.Header";
TableResizeHandle.displayName = "Table.ResizeHandle";
TableCheckCell.displayName = "Table.CheckCell";
TableCheckHead.displayName = "Table.CheckHead";

/**
 * Table — semantic HTML table with styled rows, cells, and selection support.
 *
 * Compound component: `Table` (Root), `.Header`, `.Head`, `.Body`, `.Row`,
 * `.Cell`, `.Footer`, `.CheckCell`, `.CheckHead`, `.ResizeHandle`.
 *
 * @example
 * ```tsx
 * <Table>
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.CheckHead checked={allSelected} onCheckedChange={toggleAll} />
 *       <Table.Head>Name</Table.Head>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body>
 *     {rows.map((row) => (
 *       <Table.Row key={row.id} variant={selected.has(row.id) ? "selected" : "default"}>
 *         <Table.CheckCell checked={selected.has(row.id)} onCheckedChange={() => toggle(row.id)} />
 *         <Table.Cell>{row.name}</Table.Cell>
 *       </Table.Row>
 *     ))}
 *   </Table.Body>
 * </Table>
 * ```
 */
export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Head: TableHead,
  Row: TableRow,
  Body: TableBody,
  Cell: TableCell,
  CheckCell: TableCheckCell,
  CheckHead: TableCheckHead,
  Footer: TableFooter,
  ResizeHandle: TableResizeHandle,
});
