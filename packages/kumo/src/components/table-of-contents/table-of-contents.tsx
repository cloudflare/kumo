import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "../../utils/cn";

/** TableOfContents item state variant definitions. */
export const KUMO_TABLE_OF_CONTENTS_VARIANTS = {
  state: {
    default: {
      classes:
        "text-kumo-subtle hover:border-kumo-line hover:text-kumo-default hover:font-medium",
      description: "Inactive section link",
    },
    active: {
      classes: "border-kumo-brand font-medium text-kumo-default",
      description: "Currently visible / active section",
    },
  },
} as const;

export const KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS = {
  state: "default",
} as const;

export type KumoTableOfContentsState =
  keyof typeof KUMO_TABLE_OF_CONTENTS_VARIANTS.state;

const ITEM_BASE =
  "block w-full truncate border-l-2 border-transparent py-0.5 pl-4 text-sm text-left no-underline";

export type TableOfContentsProps = React.HTMLAttributes<HTMLElement>;

const TableOfContentsRoot = forwardRef<HTMLElement, TableOfContentsProps>(
  (
    { className, "aria-label": ariaLabel = "Table of contents", ...props },
    ref,
  ) => (
    <nav ref={ref} aria-label={ariaLabel} className={className} {...props} />
  ),
);

export type TableOfContentsTitleProps =
  React.HTMLAttributes<HTMLParagraphElement>;

const TableOfContentsTitle = forwardRef<
  HTMLParagraphElement,
  TableOfContentsTitleProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "mb-3 text-xs font-semibold tracking-wide text-kumo-subtle uppercase",
      className,
    )}
    {...props}
  />
));

export type TableOfContentsListProps = React.HTMLAttributes<HTMLUListElement>;

const TableOfContentsList = forwardRef<
  HTMLUListElement,
  TableOfContentsListProps
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "flex flex-col gap-2 border-l-2 border-kumo-hairline",
      className,
    )}
    {...props}
  />
));
export interface TableOfContentsItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Whether this item represents the currently active section. */
  active?: boolean;
  /**
   * Custom element to render as the link. Use this to integrate with
   * framework routers (e.g., Next.js `<Link>`, React Router `<NavLink>`).
   * The element receives all anchor props including `href`, `className`, and `children`.
   *
   * @example
   * ```tsx
   * <TableOfContents.Item render={<Link />} href="/intro" active>
   *   Introduction
   * </TableOfContents.Item>
   * ```
   */
  render?: React.ReactElement;
}

const TableOfContentsItem = forwardRef<
  HTMLAnchorElement,
  TableOfContentsItemProps
>(({ active = false, className, children, render, ...props }, ref) => {
  const stateClasses = active
    ? KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes
    : KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes;

  const combinedClassName = cn(ITEM_BASE, stateClasses, className);

  const innerContent = (
    <span className="block min-w-0 leading-5">{children}</span>
  );

  const sharedProps = {
    ref,
    "aria-current": active ? ("true" as const) : undefined,
    className: combinedClassName,
    children: innerContent,
    ...props,
  };

  // If a render prop is provided, clone it with our props
  if (render && isValidElement(render)) {
    return <li className="-ml-0.5">{cloneElement(render, sharedProps)}</li>;
  }

  // Default to anchor tag
  return (
    <li className="-ml-0.5">
      {/* oxlint-disable-next-line anchor-has-content -- children are in sharedProps */}
      <a {...sharedProps} />
    </li>
  );
});

export interface TableOfContentsGroupProps extends Omit<
  React.HTMLAttributes<HTMLLIElement>,
  "title"
> {
  /** Label displayed above the group's items. */
  label: string;
  /** URL the group label links to. When provided, the label renders as a clickable link with item styling. */
  href?: string;
  /** Whether this group's label represents the currently active section. Only applies when `href` is provided. */
  active?: boolean;
}

const NESTED_UL_CLASSES =
  "flex flex-col gap-2 border-l-2 border-kumo-hairline [&>li>a]:pl-7 [&>li>button]:pl-7";

const TableOfContentsGroup = forwardRef<
  HTMLLIElement,
  TableOfContentsGroupProps
>(({ label, href, active = false, className, children, ...props }, ref) => {
  if (href) {
    const stateClasses = active
      ? KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes
      : KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes;

    return (
      <li
        ref={ref}
        className={cn("-ml-0.5 flex flex-col gap-2", className)}
        {...props}
      >
        <a
          href={href}
          aria-current={active ? ("true" as const) : undefined}
          className={cn(ITEM_BASE, stateClasses)}
        >
          <span className="block min-w-0 leading-5">{label}</span>
        </a>
        <ul className={cn(NESTED_UL_CLASSES)}>{children}</ul>
      </li>
    );
  }

  return (
    <li
      ref={ref}
      className={cn("-ml-0.5 flex flex-col gap-2", className)}
      {...props}
    >
      <p className="py-0.5 pl-4 text-sm leading-5 font-medium text-kumo-subtle">
        {label}
      </p>
      <ul className={cn(NESTED_UL_CLASSES)}>{children}</ul>
    </li>
  );
});

TableOfContentsRoot.displayName = "TableOfContents";
TableOfContentsTitle.displayName = "TableOfContents.Title";
TableOfContentsList.displayName = "TableOfContents.List";
TableOfContentsItem.displayName = "TableOfContents.Item";
TableOfContentsGroup.displayName = "TableOfContents.Group";

/**
 * TableOfContents — presentational compound component for section navigation.
 *
 * Purely visual; all interaction logic (scroll tracking, active state management)
 * is left to the consumer.
 *
 * @example
 * ```tsx
 * <TableOfContents>
 *   <TableOfContents.Title>On this page</TableOfContents.Title>
 *   <TableOfContents.List>
 *     <TableOfContents.Item href="#intro" active>Introduction</TableOfContents.Item>
 *     <TableOfContents.Group label="Getting Started">
 *       <TableOfContents.Item href="#install">Installation</TableOfContents.Item>
 *       <TableOfContents.Item href="#setup">Setup</TableOfContents.Item>
 *     </TableOfContents.Group>
 *   </TableOfContents.List>
 * </TableOfContents>
 * ```
 */
export const TableOfContents = Object.assign(TableOfContentsRoot, {
  Title: TableOfContentsTitle,
  List: TableOfContentsList,
  Item: TableOfContentsItem,
  Group: TableOfContentsGroup,
});
