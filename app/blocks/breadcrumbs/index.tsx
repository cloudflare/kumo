import { Link } from "react-router";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from "react";
import { cn } from "~/components/utils";

export type BreadcrumbItem = {
  label: ReactNode;
  to?: string; // If omitted on non-last items, will render a non-clickable span
  icon?: ReactNode;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
  collapsed?: boolean;
};

const getAriaLabel = (label: ReactNode) => (typeof label === "string" ? label : undefined);

type CollapsedLabelProps = {
  label: ReactNode;
  needsSrOnly: boolean;
  expanded: boolean;
};

const FALLBACK_COLLAPSED_WIDTH = 24; // px, approx width of the ellipsis
const COLLAPSED_PADDING = 8;
const EXPANDED_PADDING = 16;

const CollapsedLabel = ({ label, needsSrOnly, expanded }: CollapsedLabelProps) => {
  const [widths, setWidths] = useState<{ collapsed: number; expanded: number }>({
    collapsed: 0,
    expanded: 0,
  });
  const ellipsisRef = useRef<HTMLSpanElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const ellipsisWidth = ellipsisRef.current?.scrollWidth ?? 0;
      const labelWidth = labelRef.current?.scrollWidth ?? 0;
      setWidths({
        collapsed: (ellipsisWidth || FALLBACK_COLLAPSED_WIDTH) + COLLAPSED_PADDING,
        expanded:
          Math.max(labelWidth, ellipsisWidth || FALLBACK_COLLAPSED_WIDTH) + EXPANDED_PADDING,
      });
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      if (labelRef.current) observer.observe(labelRef.current);
      return () => observer.disconnect();
    }

    return undefined;
  }, [label]);

  const style = useMemo(() => {
    if (!widths.collapsed && !widths.expanded) return undefined;
    const targetWidth = expanded ? widths.expanded : widths.collapsed;
    return {
      width: `${targetWidth}px`,
      maxWidth: `${widths.expanded}px`,
    };
  }, [expanded, widths.collapsed, widths.expanded]);

  return (
    <span
      className="relative inline-flex min-w-0 items-center overflow-hidden transition-[width] duration-300 ease-out"
      style={style}
    >
      <span
        ref={ellipsisRef}
        aria-hidden="true"
        className={cn(
          "shrink-0 whitespace-nowrap transition-opacity duration-150 ease-out",
          expanded ? "opacity-0" : "opacity-100"
        )}
      >
        ..
      </span>
      <span
        ref={labelRef}
        className={cn(
          "shrink-0 whitespace-nowrap transition-opacity duration-150 ease-out",
          expanded ? "opacity-100" : "opacity-0"
        )}
        aria-hidden={needsSrOnly}
      >
        {label}
      </span>
      {needsSrOnly && typeof label === "string" ? (
        <span className="sr-only">{label}</span>
      ) : null}
    </span>
  );
};

type BreadcrumbInteractiveProps = {
  item: BreadcrumbItem;
  isLast: boolean;
  collapsed: boolean;
  index: number;
  setItemRef: (index: number) => (element: HTMLElement | null) => void;
};

const BreadcrumbInteractive = ({
  item,
  isLast,
  collapsed,
  index,
  setItemRef,
}: BreadcrumbInteractiveProps) => {
  const [expanded, setExpanded] = useState(false);
  const ariaLabel = collapsed ? getAriaLabel(item.label) : undefined;
  const needsSrOnly = collapsed && !ariaLabel;

  const enable = useCallback(() => {
    if (!collapsed) return;
    setExpanded(true);
  }, [collapsed]);

  const disable = useCallback(() => {
    if (!collapsed) return;
    setExpanded(false);
  }, [collapsed]);

  const eventHandlers = collapsed
    ? {
        onMouseEnter: enable,
        onMouseLeave: disable,
        onFocus: enable,
        onBlur: (event: FocusEvent<HTMLElement>) => {
          if (!collapsed) return;
          const nextTarget = event.relatedTarget as HTMLElement | null;
          if (event.currentTarget.contains(nextTarget)) return;
          setExpanded(false);
        },
      }
    : {};

  if (isLast) {
    return (
      <span
        aria-current="page"
        className="truncate font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1"
        tabIndex={-1}
        ref={setItemRef(index)}
      >
        {item.icon}
        {item.icon ? <span className="hidden sm:inline">{item.label}</span> : item.label}
      </span>
    );
  }

  const icon = item.icon;
  const labelContent = collapsed ? (
    <CollapsedLabel label={item.label} needsSrOnly={needsSrOnly} expanded={expanded} />
  ) : (
    <span className="hidden sm:inline">{item.label}</span>
  );

  if (item.to) {
    return (
      <Link
        to={item.to}
        className={cn(
          "flex items-center gap-1 min-w-0 no-underline text-blue-600 hover:text-neutral-900 dark:text-blue-400 dark:hover:text-neutral-100",
          collapsed ? "overflow-visible" : "truncate"
        )}
        ref={setItemRef(index)}
        aria-label={ariaLabel}
        {...eventHandlers}
      >
        {icon}
        {labelContent}
      </Link>
    );
  }

  return (
    <span
      className={cn(
        "flex items-center gap-1 min-w-0 text-neutral-600 dark:text-neutral-400",
        collapsed ? "overflow-visible" : "truncate"
      )}
      tabIndex={-1}
      ref={setItemRef(index)}
      aria-label={ariaLabel}
      {...eventHandlers}
    >
      {icon}
      {labelContent}
    </span>
  );
};

export function Breadcrumbs({ items, className, collapsed = false }: BreadcrumbsProps) {
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const setItemRef = useCallback(
    (index: number) => (element: HTMLElement | null) => {
      itemRefs.current[index] = element;
    },
    []
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    const focusableItems = itemRefs.current.filter(
      (element): element is HTMLElement => element !== null
    );

    if (focusableItems.length === 0) {
      return;
    }

    const activeElement = event.currentTarget.ownerDocument?.activeElement as HTMLElement | null;
    const currentIndex = activeElement ? focusableItems.indexOf(activeElement) : -1;

    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();

    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= focusableItems.length) {
      return;
    }

    focusableItems[nextIndex]?.focus();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <nav
      className={cn("flex items-center gap-3 px-4 h-[57px] w-full", className)}
      aria-label="Breadcrumb"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="flex items-center min-w-0 gap-3">
            {idx > 0 && (
              <span className={cn("shrink-0 text-neutral-300 dark:text-neutral-700", isLast && 'text-black dark:text-white')}>/</span>
            )}

            <BreadcrumbInteractive
              item={item}
              isLast={isLast}
              collapsed={collapsed}
              index={idx}
              setItemRef={setItemRef}
            />
          </div>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;