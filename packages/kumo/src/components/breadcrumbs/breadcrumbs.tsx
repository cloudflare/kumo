import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import { CheckIcon, CopyIcon, DotsThree } from "@phosphor-icons/react";
import { Menu } from "@base-ui/react/menu";
import { Button } from "../../components/button";
import { SkeletonLine } from "../../components/loader/skeleton-line";
import { useLinkComponent } from "../../utils/link-provider";
import { cn } from "../../utils/cn";

// ============================================================================
// Variant Definitions
// ============================================================================

/** Breadcrumbs size variant definitions. */
export const KUMO_BREADCRUMBS_VARIANTS = {
  size: {
    sm: {
      classes: "text-sm h-10 gap-0.5",
      description: "Compact breadcrumbs for dense UIs",
    },
    base: {
      classes: "text-base h-12 gap-1",
      description: "Default breadcrumbs size",
    },
  },
} as const;

export const KUMO_BREADCRUMBS_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoBreadcrumbsSize = keyof typeof KUMO_BREADCRUMBS_VARIANTS.size;

export interface KumoBreadcrumbsVariantsProps {
  /**
   * Size of the breadcrumbs.
   * - `"sm"` — Compact breadcrumbs for dense UIs
   * - `"base"` — Default breadcrumbs size
   * @default "base"
   */
  size?: KumoBreadcrumbsSize;
}

export function breadcrumbsVariants({
  size = KUMO_BREADCRUMBS_DEFAULT_VARIANTS.size,
}: KumoBreadcrumbsVariantsProps = {}) {
  return cn(
    "group mr-4 flex min-w-0 grow items-center overflow-hidden whitespace-nowrap",
    KUMO_BREADCRUMBS_VARIANTS.size[size].classes,
  );
}

// ============================================================================
// Shared Components
// ============================================================================

function Separator() {
  return (
    <span
      className="flex shrink-0 items-center text-kumo-inactive"
      aria-hidden="true"
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M10.75 8.75L14.25 12L10.75 15.25"
        />
      </svg>
    </span>
  );
}

// ============================================================================
// Compound Component API (Legacy)
// ============================================================================

export interface BreadcrumbsItemProps {
  href: string;
  icon?: React.ReactNode;
}

const Link = ({
  href,
  icon,
  children,
}: PropsWithChildren<BreadcrumbsItemProps>) => {
  const LinkComponent = useLinkComponent();

  return (
    <LinkComponent
      to={href}
      className="flex min-w-0 max-w-full items-center gap-1 text-kumo-subtle no-underline"
    >
      {!!icon && <span className="flex shrink-0 items-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </LinkComponent>
  );
};

interface BreadcrumbsCurrentProps {
  loading?: boolean;
  icon?: React.ReactNode;
}

function Current({
  children,
  icon,
  loading,
}: PropsWithChildren<BreadcrumbsCurrentProps>) {
  if (loading) {
    return (
      <div className="flex w-[125px] min-w-0 items-center gap-1">
        {icon && <span className="flex shrink-0 items-center">{icon}</span>}
        <SkeletonLine />
      </div>
    );
  }

  return (
    <div
      className="flex min-w-0 max-w-full items-center gap-1 font-medium"
      aria-current="page"
    >
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </div>
  );
}

function MobileEllipsis() {
  return (
    <span className="flex shrink-0 items-center text-kumo-subtle" aria-hidden>
      ...
    </span>
  );
}

function Clipboard({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;

    const timeoutId = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  const handleCopyDeeplink = async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy deeplink:", err);
    }
  };

  return (
    <Button
      variant="ghost"
      shape="square"
      size="sm"
      className="opacity-0 transition-[opacity] group-hover:opacity-100"
      onClick={handleCopyDeeplink}
      title="Click to copy"
      aria-label="Copy"
    >
      {isCopied ? (
        <CheckIcon weight="bold" className="text-kumo-success" />
      ) : (
        <CopyIcon weight="regular" />
      )}
    </Button>
  );
}

function isComponentElement(
  child: ReactNode,
  component: unknown,
): child is ReactElement {
  return isValidElement(child) && child.type === component;
}

function getMobileBreadcrumbChildren(children: ReactNode[]): ReactNode[] {
  const breadcrumbItems = children.filter(
    (child) =>
      isComponentElement(child, Link) || isComponentElement(child, Current),
  ) as ReactElement[];

  if (breadcrumbItems.length <= 2) {
    return children;
  }

  const [parentItem, currentItem] = breadcrumbItems.slice(-2);
  const trailingItems: ReactNode[] = [
    <MobileEllipsis key="kumo-breadcrumb-mobile-ellipsis" />,
    <Separator key="kumo-breadcrumb-mobile-separator-leading" />,
    cloneElement(parentItem, { key: "kumo-breadcrumb-mobile-parent" }),
    <Separator key="kumo-breadcrumb-mobile-separator-trailing" />,
    cloneElement(currentItem, { key: "kumo-breadcrumb-mobile-current" }),
  ];

  const extras = children.filter(
    (child) =>
      !isComponentElement(child, Link) &&
      !isComponentElement(child, Current) &&
      !isComponentElement(child, Separator),
  );

  return [...trailingItems, ...extras];
}

/**
 * Breadcrumbs component props for compound component API.
 *
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Link href="/docs">Docs</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Current>Current Page</Breadcrumbs.Current>
 * </Breadcrumbs>
 * ```
 */
export interface BreadcrumbsProps
  extends PropsWithChildren, KumoBreadcrumbsVariantsProps {
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
}

function CompoundBreadcrumbs({
  children,
  size = "base",
  className,
}: BreadcrumbsProps) {
  const childArray = Children.toArray(children);
  const mobileChildren = getMobileBreadcrumbChildren(childArray);

  return (
    <nav
      className={cn(breadcrumbsVariants({ size }), className)}
      aria-label="breadcrumb"
    >
      <div className="contents sm:hidden">{mobileChildren}</div>
      <div className="hidden sm:contents">{childArray}</div>
    </nav>
  );
}

// ============================================================================
// Items-based API with Overflow Support
// ============================================================================

/**
 * A single breadcrumb item in the items-based API.
 */
export interface BreadcrumbItem {
  /** Display text for the breadcrumb. */
  label: string;
  /** URL for anchor navigation (renders `<a>` element). */
  href?: string;
  /** Custom element to render (e.g., router Link). Takes precedence over `href`. */
  render?: ReactElement;
  /** Optional icon displayed before the label. */
  icon?: ReactNode;
  /** Show loading skeleton instead of label (only applies to currentItem). */
  loading?: boolean;
}

/**
 * Props for items-based Breadcrumbs API with automatic overflow handling.
 */
export interface BreadcrumbsItemsProps extends KumoBreadcrumbsVariantsProps {
  /** Array of breadcrumb items (ancestors of current page). */
  items: BreadcrumbItem[];
  /** The current page item (never collapses into overflow). */
  currentItem: BreadcrumbItem;
  /**
   * Which end to collapse items from when space is limited.
   * @default "start"
   */
  collapseFrom?: "start" | "end";
  /**
   * Minimum number of ancestor items to keep visible (excluding current).
   * Only applied if there's room; won't cause truncation.
   * @default 1
   */
  minVisibleItems?: number;
  /** Additional CSS classes. */
  className?: string;
}

// Layout constants for TreeMenu (pixels)
const TREE_INDENT = 8;

const TREE_MENU_ITEM_CLASS =
  "flex h-9 min-w-0 cursor-pointer items-center gap-2 rounded px-3 text-sm text-kumo-default outline-none select-none data-highlighted:bg-kumo-tint/60";

/**
 * L-shaped connector icon for tree hierarchy visualization.
 */
function TreeConnector() {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 16 20"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M1 0 V12 H15"
        className="stroke-kumo-hairline"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Renders overflow breadcrumb items as an indented tree structure
 * with disconnected L-shaped connectors showing hierarchy.
 */
function TreeMenu({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col py-1">
      {items.map((item, i) => {
        const paddingLeft = i === 0 ? 12 : 12 + i * TREE_INDENT;

        return (
          <Menu.Item
            key={i}
            render={
              item.render ?? (
                <a href={item.href ?? "#"} aria-label={item.label} />
              )
            }
            closeOnClick
            className={TREE_MENU_ITEM_CLASS}
            style={{ paddingLeft }}
          >
            {i > 0 && <TreeConnector />}
            <span className="min-w-0 truncate">{item.label}</span>
          </Menu.Item>
        );
      })}
    </div>
  );
}

/**
 * Items-based breadcrumbs with automatic overflow handling.
 * Measures items and collapses them into a dropdown when they don't fit.
 */
function ItemsBreadcrumbs({
  items,
  currentItem,
  collapseFrom = "start",
  minVisibleItems = 0,
  size = "base",
  className,
}: BreadcrumbsItemsProps) {
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [overflowCount, setOverflowCount] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [currentItemWidth, setCurrentItemWidth] = useState(0);
  const [measured, setMeasured] = useState(false);
  const LinkComponent = useLinkComponent();

  // Measure all items once on mount/change
  useEffect(() => {
    if (!measureRef.current) return;

    const measureContainer = measureRef.current;
    const itemEls = measureContainer.querySelectorAll("[data-measure-item]");
    const currentEl = measureContainer.querySelector("[data-measure-current]");

    const widths = Array.from(itemEls).map(
      (el) => el.getBoundingClientRect().width,
    );
    const currentWidth = currentEl?.getBoundingClientRect().width ?? 100;

    setItemWidths(widths);
    setCurrentItemWidth(currentWidth);
    setMeasured(true);
  }, [items, currentItem]);

  // Compute overflow based on cached widths
  useEffect(() => {
    if (!measured || !containerRef.current) return;

    const computeOverflow = () => {
      const container = containerRef.current;
      if (!container) return;

      // Be conservative - subtract buffer for measurement inaccuracies
      const containerWidth = container.offsetWidth - 16;
      const overflowButtonWidth = 48; // button + ring + padding
      const separatorWidth = 32; // separator + gaps (24px icon + gaps)

      // Start with current item width + its preceding separator
      let usedWidth = currentItemWidth + separatorWidth;
      let visibleCount = 0;

      // Measure from end to preserve parent context
      for (let i = items.length - 1; i >= 0; i--) {
        const itemWidth = itemWidths[i] ?? 80;
        const neededWidth = separatorWidth + itemWidth;

        const willHaveOverflow = i > 0;
        const overflowSpace = willHaveOverflow
          ? overflowButtonWidth + separatorWidth
          : 0;

        if (usedWidth + neededWidth + overflowSpace <= containerWidth) {
          usedWidth += neededWidth;
          visibleCount++;
        } else {
          break;
        }
      }

      // Honor minVisibleItems if it fits
      const overflowNeeded = items.length - visibleCount;
      if (overflowNeeded > 0 && overflowNeeded < items.length) {
        const minVisible = Math.min(minVisibleItems, items.length);
        if (visibleCount < minVisible) {
          let testWidth =
            currentItemWidth + overflowButtonWidth + separatorWidth;
          for (let i = items.length - minVisible; i < items.length; i++) {
            testWidth += separatorWidth + (itemWidths[i] ?? 80);
          }
          if (testWidth <= containerWidth) {
            visibleCount = minVisible;
          }
        }
      }

      setOverflowCount(items.length - visibleCount);
    };

    computeOverflow();

    const observer = new ResizeObserver(computeOverflow);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measured, items.length, itemWidths, currentItemWidth, minVisibleItems]);

  // Split items
  const overflowItems =
    collapseFrom === "start"
      ? items.slice(0, overflowCount)
      : items.slice(items.length - overflowCount);

  const visibleItems =
    collapseFrom === "start"
      ? items.slice(overflowCount)
      : items.slice(0, items.length - overflowCount);

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        className="pointer-events-none absolute flex items-center gap-1 text-sm opacity-0"
        aria-hidden
      >
        {items.map((item, index) => (
          <span
            key={index}
            data-measure-item
            className="flex shrink-0 items-center gap-1 whitespace-nowrap"
          >
            {item.icon}
            <span>{item.label}</span>
          </span>
        ))}
        <span
          data-measure-current
          className="flex shrink-0 items-center gap-1 font-medium whitespace-nowrap"
        >
          {currentItem.icon}
          <span>{currentItem.label}</span>
        </span>
      </div>

      <nav
        ref={containerRef}
        className={cn(
          "group flex min-w-0 max-w-full items-center",
          KUMO_BREADCRUMBS_VARIANTS.size[size].classes,
          className,
        )}
        aria-label="Breadcrumb"
      >
        {/* Overflow menu */}
        {overflowItems.length > 0 && (
          <>
            <Menu.Root>
              <Menu.Trigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Show collapsed breadcrumbs"
                    icon={<DotsThree weight="bold" size={16} />}
                    className="shrink-0"
                  />
                }
              />
              <Menu.Portal>
                <Menu.Positioner sideOffset={8} align="start">
                  <Menu.Popup className="min-w-48 rounded-lg bg-kumo-control p-2 text-kumo-default shadow-lg ring ring-kumo-line">
                    <TreeMenu
                      items={
                        collapseFrom === "start"
                          ? overflowItems
                          : [...overflowItems].reverse()
                      }
                    />
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
            <Separator />
          </>
        )}

        {/* Visible items */}
        {visibleItems.map((item, i) => {
          const renderProps = item.render?.props as
            | { className?: string }
            | undefined;

          return (
            <span key={i} className="contents">
              {item.render ? (
                cloneElement(
                  item.render,
                  {
                    className: cn(
                      "flex shrink-0 items-center gap-1 text-kumo-subtle hover:text-kumo-default whitespace-nowrap no-underline",
                      renderProps?.className,
                    ),
                  } as React.HTMLAttributes<HTMLElement>,
                  item.icon,
                  <span>{item.label}</span>,
                )
              ) : (
                <LinkComponent
                  to={item.href ?? "#"}
                  className="flex shrink-0 items-center gap-1 text-kumo-subtle hover:text-kumo-default whitespace-nowrap no-underline"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </LinkComponent>
              )}
              <Separator />
            </span>
          );
        })}

        {/* Current item */}
        {currentItem.loading ? (
          <div className="flex w-[125px] min-w-0 items-center gap-1">
            {currentItem.icon && (
              <span className="flex shrink-0 items-center">
                {currentItem.icon}
              </span>
            )}
            <SkeletonLine />
          </div>
        ) : (
          <span
            className="flex shrink-0 items-center gap-1 font-medium whitespace-nowrap"
            aria-current="page"
          >
            {currentItem.icon && (
              <span className="flex shrink-0 items-center">
                {currentItem.icon}
              </span>
            )}
            <span>{currentItem.label}</span>
          </span>
        )}
      </nav>
    </>
  );
}

// ============================================================================
// Unified Breadcrumb Component
// ============================================================================

/**
 * Combined props type supporting both APIs.
 * When `items` is provided, uses items-based API with overflow.
 * Otherwise, uses compound component API with children.
 */
export type BreadcrumbsCombinedProps =
  | BreadcrumbsProps
  | (BreadcrumbsItemsProps & { children?: never });

function hasItemsProps(
  props: BreadcrumbsCombinedProps,
): props is BreadcrumbsItemsProps {
  return "items" in props && Array.isArray(props.items);
}

/**
 * Navigation breadcrumb trail showing the current page's location in a hierarchy.
 *
 * Supports two APIs:
 *
 * **Compound Component API** (legacy):
 * ```tsx
 * <Breadcrumbs>
 *   <Breadcrumbs.Link href="/">Home</Breadcrumbs.Link>
 *   <Breadcrumbs.Separator />
 *   <Breadcrumbs.Current>Dashboard</Breadcrumbs.Current>
 * </Breadcrumbs>
 * ```
 *
 * **Items API** (with automatic overflow):
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: "Home", href: "/" },
 *     { label: "Projects", href: "/projects" },
 *   ]}
 *   currentItem={{ label: "Settings" }}
 * />
 * ```
 */
export function Breadcrumb(props: BreadcrumbsCombinedProps) {
  if (hasItemsProps(props)) {
    return <ItemsBreadcrumbs {...props} />;
  }
  return <CompoundBreadcrumbs {...props} />;
}

Breadcrumb.displayName = "Breadcrumbs";
Breadcrumb.Link = Link;
Breadcrumb.Current = Current;
Breadcrumb.Separator = Separator;
Breadcrumb.Clipboard = Clipboard;
