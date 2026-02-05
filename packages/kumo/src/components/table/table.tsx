import { forwardRef } from "react";
import { cn } from "../../utils";
import { Checkbox } from "../checkbox";

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
} as const;

export const KUMO_TABLE_DEFAULT_VARIANTS = {
  layout: "auto",
  variant: "default",
} as const;

export type KumoTableRowVariant = keyof typeof KUMO_TABLE_VARIANTS.variant;
export type KumoTableLayout = keyof typeof KUMO_TABLE_VARIANTS.layout;

const TableRoot = forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & {
    layout?: KumoTableLayout;
  }
>(({ layout = "auto", ...props }, ref) => {
  const className = cn(
    "w-full",
    KUMO_TABLE_VARIANTS.layout[layout].classes,
    "[&_tr_td]:border-b [&_tr_td]:border-kumo-fill [&_tr:last-child_td]:border-b-0", // Row border
    "[&_tr_td]:p-3", // Cell padding
    "[&_tr_th]:border-b [&_tr_th]:border-kumo-fill [&_tr_th]:p-3 [&_tr_th]:font-semibold", // Header styles
    "[&_tr_th]:bg-kumo-base", // Header background color
    "text-left text-kumo-default",
    props.className,
  );

  return <table ref={ref} {...props} className={className} />;
});

const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => {
  return <thead ref={ref} {...props} />;
});

const TableHead = forwardRef<
  HTMLTableCellElement,
  React.HTMLAttributes<HTMLTableCellElement>
>((props, ref) => {
  const className = cn("group relative", props.className);
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
  React.TdHTMLAttributes<HTMLTableCellElement>
>((props, ref) => {
  return <td ref={ref} {...props} />;
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
      )}
    >
      <span className="h-5 w-[2px] rounded bg-kumo-ring" />
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
    onValueChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
  }
>(
  (
    { checked, indeterminate, onValueChange, label, disabled, ...props },
    ref,
  ) => {
    return (
      <TableCell
        ref={ref}
        {...props}
        className={cn(
          "cursor-pointer p-0 leading-none",
          disabled && "cursor-default",
          props.className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            onValueChange?.(!checked);
          }
        }}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(newChecked) => {
            onValueChange?.(newChecked);
          }}
          aria-label={label ?? "Select row"}
          disabled={disabled}
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
    onValueChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
  }
>(
  (
    { checked, indeterminate, onValueChange, label, disabled, ...props },
    ref,
  ) => {
    return (
      <TableHead
        ref={ref}
        {...props}
        className={cn(
          "cursor-pointer p-0 leading-none",
          disabled && "cursor-default",
          props.className,
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            onValueChange?.(!checked);
          }
        }}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(newChecked) => {
            onValueChange?.(newChecked);
          }}
          aria-label={label ?? "Select all rows"}
          disabled={disabled}
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
