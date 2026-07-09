import React, {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useId,
  useRef,
  useState,
} from "react";
import { ScrollArea as ScrollAreaBase } from "@base-ui/react/scroll-area";

import { CaretRightIcon } from "@phosphor-icons/react";
import { cn } from "../../utils/cn";
import { useLinkComponent } from "../../utils/link-provider";
import { Tooltip, TooltipProvider } from "../tooltip";

// ============================================================================
// Variants (required by Kumo convention)
// ============================================================================

/** Sidebar variant definitions mapping layout, collapse, and side options. */
export const KUMO_SIDEBAR_VARIANTS = {
  variant: {
    sidebar: {
      classes: "",
      description: "Standard sidebar with border separator",
    },
    floating: {
      classes: "",
      description: "Floating sidebar with shadow and rounded corners",
    },
    inset: {
      classes: "",
      description: "Inset sidebar within the content area",
    },
  },
  collapsible: {
    icon: {
      classes: "",
      description: "Collapses to show icons only",
    },
    offcanvas: {
      classes: "",
      description: "Slides off screen when collapsed",
    },
    none: {
      classes: "",
      description: "Cannot be collapsed",
    },
  },
  side: {
    left: {
      classes: "",
      description: "Left-aligned sidebar",
    },
    right: {
      classes: "",
      description: "Right-aligned sidebar",
    },
  },
} as const;

export const KUMO_SIDEBAR_DEFAULT_VARIANTS = {
  variant: "sidebar",
  collapsible: "icon",
  side: "left",
} as const;

export const KUMO_SIDEBAR_STYLING = {
  width: {
    expanded: "16.25rem",
    icon: "57px",
  },
  mobile: {
    breakpoint: 768,
  },
} as const;

export type SidebarSide = "left" | "right";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "icon" | "offcanvas" | "none";

// ============================================================================
// Constants
// ============================================================================

const SIDEBAR_WIDTH = "16.25rem";
const SIDEBAR_WIDTH_ICON = "57px";
const SIDEBAR_EASING = "cubic-bezier(0.77, 0, 0.175, 1)";
const SIDEBAR_ANIMATION_DURATION_MS = 250;
const MOBILE_BREAKPOINT = 768;
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// ============================================================================
// Mobile detection hook
// ============================================================================

function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

// ============================================================================
// Context
// ============================================================================

export type SidebarState = "expanded" | "collapsed" | "peeking";

export interface SidebarContextValue {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  variant: "sidebar" | "floating" | "inset";
  side: "left" | "right";
  collapsible: "icon" | "offcanvas" | "none";
  width: number;
  resizable: boolean;
  minWidth: number;
  maxWidth: number;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  setWidth: (width: number) => void;
  isPeeking: boolean;
  peekable: boolean;
  startPeek: () => void;
  stopPeek: () => void;
  contained: boolean;
  animationDuration: number;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Hook to access sidebar state and actions from any descendant component.
 *
 * @example
 * ```tsx
 * const { state, open, toggleSidebar, isMobile } = useSidebar();
 * ```
 *
 * @throws Error if used outside a `Sidebar.Provider`.
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar.Provider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

export interface SidebarProviderProps {
  /** Initial open state when uncontrolled. @default true */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes (controlled mode). */
  onOpenChange?: (open: boolean) => void;
  /** Sidebar layout variant. @default "sidebar" */
  variant?: SidebarVariant;
  /** Which side the sidebar is on. @default "left" */
  side?: SidebarSide;
  collapsible?: "icon" | "offcanvas" | "none";
  /** Enable drag-to-resize on the sidebar edge. @default false */
  resizable?: boolean;
  /** Initial width in pixels when resizable. @default 256 */
  defaultWidth?: number;
  /** Minimum width in pixels when resizing. @default 200 */
  minWidth?: number;
  /** Maximum width in pixels when resizing. @default 480 */
  maxWidth?: number;
  /** Callback when width changes during resize. */
  onWidthChange?: (width: number) => void;
  /**
   * When true, the collapsed sidebar uses absolute positioning instead of fixed,
   * keeping it scoped inside a bounded parent. Useful for demos and embedded sidebars.
   * @default false
   */
  contained?: boolean;
  /**
   * When true, hovering or focusing the collapsed sidebar temporarily expands it.
   * The `state` will be `"peeking"` during the peek. Moving away collapses it back.
   * @default false
   */
  peekable?: boolean;
  /**
   * Duration of sidebar expand/collapse animation in milliseconds.
   * @default 250
   */
  animationDuration?: number;
  /**
   * Viewport width (in px) below which the sidebar renders as a mobile dialog
   * sheet instead of the desktop aside rail.
   * @default 768
   */
  mobileBreakpoint?: number;
  /** Content — typically `<Sidebar>` + main content. */
  children: ReactNode;
  /** Additional CSS classes for the wrapper div. */
  className?: string;
  /** Inline styles for the wrapper div. */
  style?: CSSProperties;
}

/**
 * Sidebar context provider. Manages expand/collapse state and mobile detection.
 * Renders a flex wrapper div with CSS custom properties for sidebar width.
 *
 * @example
 * ```tsx
 * <Sidebar.Provider defaultOpen>
 *   <Sidebar>{...}</Sidebar>
 *   <main className="flex-1">{...}</main>
 * </Sidebar.Provider>
 * ```
 */
const DEFAULT_WIDTH_PX = 256;
const MIN_WIDTH_PX = 200;
const MAX_WIDTH_PX = 480;

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  variant = KUMO_SIDEBAR_DEFAULT_VARIANTS.variant,
  side = KUMO_SIDEBAR_DEFAULT_VARIANTS.side,
  collapsible = KUMO_SIDEBAR_DEFAULT_VARIANTS.collapsible,
  resizable = false,
  defaultWidth = DEFAULT_WIDTH_PX,
  minWidth = MIN_WIDTH_PX,
  maxWidth = MAX_WIDTH_PX,
  onWidthChange,
  contained = false,
  peekable = false,
  animationDuration = SIDEBAR_ANIMATION_DURATION_MS,
  mobileBreakpoint,
  children,
  className,
  style,
}: SidebarProviderProps) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const [_openMobile, _setOpenMobile] = useState(false);
  const [width, setWidthState] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  // When controlled (`openProp` provided), use it directly for mobile too.
  // When uncontrolled, use internal `_openMobile` state.
  const openMobile =
    isMobile && openProp !== undefined ? openProp : _openMobile;

  const setOpenMobile = useCallback(
    (next: boolean) => {
      _setOpenMobile(next);
      // In controlled mode on mobile, notify the consumer
      if (isMobile && openProp !== undefined) {
        setOpenProp?.(next);
      }
    },
    [isMobile, openProp, setOpenProp],
  );

  const setWidth = useCallback(
    (newWidth: number) => {
      const clamped = Math.min(maxWidth, Math.max(minWidth, newWidth));
      setWidthState(clamped);
      onWidthChange?.(clamped);
    },
    [minWidth, maxWidth, onWidthChange],
  );

  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value;
      setOpenProp?.(next);
      _setOpen(next);
    },
    [setOpenProp, open],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setIsPeeking(false);
      setOpen((prev: boolean) => !prev);
    }
  }, [isMobile, openMobile, setOpenMobile, setOpen]);

  const startPeek = useCallback(() => {
    if (peekable && !open && !isMobile) {
      setIsPeeking(true);
    }
  }, [peekable, open, isMobile]);

  const stopPeek = useCallback(() => {
    setIsPeeking(false);
  }, []);

  const state: SidebarState = isPeeking
    ? "peeking"
    : open
      ? "expanded"
      : "collapsed";

  const sidebarWidthValue = resizable ? `${width}px` : SIDEBAR_WIDTH;

  // eslint-disable-next-line react-hooks/exhaustive-deps -- all values are
  // either stable (props, setters) or derived from state that triggers re-render
  const contextValue = useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      variant,
      side,
      collapsible,
      width,
      resizable,
      minWidth,
      maxWidth,
      isResizing,
      setIsResizing,
      setWidth,
      isPeeking,
      peekable,
      startPeek,
      stopPeek,
      contained,
      animationDuration,
    }),
    [state, open, openMobile, isMobile, width, isResizing, isPeeking],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-sidebar-wrapper=""
        data-state={state}
        data-side={side}
        style={
          {
            "--sidebar-width": sidebarWidthValue,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            "--sidebar-animation-duration": `${animationDuration}ms`,
            "--sidebar-easing": SIDEBAR_EASING,
            ...style,
          } as CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper relative isolate flex w-full [--sidebar-bg:var(--color-kumo-base)] [--sidebar-active-bg:var(--color-kumo-tint)]",
          !contained && !isMobile && "min-h-svh",
          "has-data-[variant=inset]:bg-kumo-recessed",
          isResizing && "select-none",
          className,
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

SidebarProvider.displayName = "Sidebar.Provider";

// ============================================================================
// Sidebar Root
// ============================================================================

export interface SidebarRootProps extends ComponentPropsWithoutRef<"aside"> {
  /** Additional CSS classes for the sidebar element. */
  className?: string;
  /** Additional CSS classes for the inner content container. */
  contentClassName?: string;
  /** Sidebar content — Header, Content, Footer, etc. */
  children: ReactNode;
}

/**
 * Main sidebar container. Renders as `<aside>` on desktop, modal sidebar sheet on mobile.
 * Must be used inside `Sidebar.Provider`.
 *
 * @example
 * ```tsx
 * <Sidebar.Provider>
 *   <Sidebar>
 *     <Sidebar.Header>...</Sidebar.Header>
 *     <Sidebar.Content>...</Sidebar.Content>
 *     <Sidebar.Footer>...</Sidebar.Footer>
 *   </Sidebar>
 * </Sidebar.Provider>
 * ```
 */
const SidebarRoot = forwardRef<HTMLElement, SidebarRootProps>(
  ({ className, contentClassName, children, ...props }, ref) => {
    const {
      state,
      open,
      isMobile,
      openMobile,
      setOpenMobile,
      side,
      variant,
      collapsible,
      isResizing,
      resizable,
      width,
      isPeeking,
      startPeek,
      stopPeek,
      contained,
    } = useSidebar();

    // --- Mobile a11y hooks (must be before early returns) ---

    // Imperatively set inert on the mobile sidebar — React 18 doesn't
    // reliably forward the inert attribute as a JSX prop on initial mount.
    const mobileAsideRef = useCallback(
      (node: HTMLElement | null) => {
        if (node) {
          if (!openMobile) {
            node.setAttribute("inert", "");
          } else {
            node.removeAttribute("inert");
          }
        }
      },
      [openMobile],
    );

    // Merge forwarded ref with inert ref for the mobile aside
    const mergedMobileRef = useCallback(
      (node: HTMLElement | null) => {
        mobileAsideRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref, mobileAsideRef],
    );

    // Refs for mobile focus management (declared before effects that use them)
    const triggerRef = useRef<Element | null>(null);
    const mobileNodeRef = useRef<HTMLElement | null>(null);
    const shouldRestoreFocusRef = useRef(false);

    // Escape key closes the mobile sidebar
    useEffect(() => {
      if (!isMobile || !openMobile) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          shouldRestoreFocusRef.current = true;
          setOpenMobile(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isMobile, openMobile, setOpenMobile]);

    // When the mobile sidebar opens, move focus into it;
    // when it closes, return focus to the element that opened it.
    useEffect(() => {
      if (!isMobile) return;
      if (openMobile) {
        triggerRef.current = document.activeElement;
        shouldRestoreFocusRef.current = false;
        // Wait a frame so the aside is no longer inert before focusing
        requestAnimationFrame(() => {
          const firstFocusable = mobileNodeRef.current?.querySelector<HTMLElement>(
            FOCUSABLE_SELECTOR,
          );
          (firstFocusable ?? mobileNodeRef.current)?.focus();
        });
      } else if (
        shouldRestoreFocusRef.current &&
        triggerRef.current instanceof HTMLElement
      ) {
        triggerRef.current.focus();
        shouldRestoreFocusRef.current = false;
        triggerRef.current = null;
      }
    }, [isMobile, openMobile]);

    const handlePeekBlur = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          stopPeek();
        }
      },
      [stopPeek],
    );

    if (collapsible === "none") {
      return (
        <aside
          ref={ref}
          data-state="expanded"
          data-side={side}
          data-variant={variant}
          data-sidebar="sidebar"
          style={{
            width: "var(--sidebar-width)",
            minWidth: "var(--sidebar-width)",
            maxWidth: "var(--sidebar-width)",
          }}
          className={cn(
            "relative flex h-full shrink-0 grow-0 flex-col overflow-hidden bg-(--sidebar-bg) text-kumo-default",
            variant === "sidebar" &&
              (side === "left"
                ? "border-r border-kumo-line"
                : "border-l border-kumo-line"),
            variant === "floating" &&
              "m-2 rounded-lg border border-kumo-line shadow-lg",
            className,
          )}
          {...props}
        >
          {children}
        </aside>
      );
    }

    if (isMobile) {
      return (
        <>
          {/* Backdrop — click to close */}
          <div
            data-sidebar-backdrop=""
            className={cn(
              contained ? "absolute inset-0 z-40 bg-kumo-recessed" : "fixed inset-0 z-40 bg-kumo-recessed",
              "transition-opacity duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
              "motion-reduce:transition-none",
              openMobile ? "opacity-80" : "opacity-0 pointer-events-none",
            )}
            onClick={() => {
              shouldRestoreFocusRef.current = true;
              setOpenMobile(false);
            }}
            aria-hidden="true"
          />

          {/* Mobile sidebar — navigation landmark with focus management */}
          <nav
            ref={(node) => {
              mergedMobileRef(node);
              mobileNodeRef.current = node;
            }}
            tabIndex={-1}
            aria-label="Navigation"
            aria-hidden={!openMobile}
            data-state={openMobile ? "expanded" : "collapsed"}
            data-side={side}
            data-variant={variant}
            data-collapsible={collapsible}
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn(
              contained
                ? "group/sidebar absolute inset-y-0 z-50 flex w-(--sidebar-width) flex-col overflow-hidden"
                : "group/sidebar fixed inset-y-0 z-50 flex w-(--sidebar-width) flex-col overflow-hidden",
              "border-r border-kumo-line bg-(--sidebar-bg) text-kumo-default",
              "transition-transform duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
              "motion-reduce:transition-none",
              side === "left" && "left-0",
              side === "right" && "right-0",
              side === "left" &&
                (openMobile ? "translate-x-0" : "-translate-x-full"),
              side === "right" &&
                (openMobile ? "translate-x-0" : "translate-x-full"),
              className,
            )}
            {...props}
          >
            {children}
          </nav>
        </>
      );
    }

    // --- Desktop two-layer architecture ---
    // Rail: the <aside> whose width drives layout (stays collapsed during peek).
    // Content container: holds actual sidebar content, can overlay when peeking.

    // Rail width: based on open state only (not peeking)
    const collapsedWidth =
      collapsible === "icon" ? "var(--sidebar-width-icon)" : "0px";
    const expandedWidth = resizable ? `${width}px` : "var(--sidebar-width)";
    const railWidth = open ? expandedWidth : collapsedWidth;

    // Content container width: expanded during peek
    const contentExpanded = open || isPeeking;
    const contentWidth = contentExpanded ? expandedWidth : collapsedWidth;

    const borderClasses =
      variant === "sidebar"
        ? side === "left"
          ? "border-r border-kumo-line"
          : "border-l border-kumo-line"
        : variant === "floating"
          ? "border border-kumo-line"
          : "";

    return (
      <aside
        ref={ref}
        data-state={state}
        data-side={side}
        data-variant={variant}
        data-collapsible={collapsible}
        data-sidebar="sidebar"
        style={{ width: railWidth }}
        className={cn(
          "group/sidebar relative h-full shrink-0 grow-0",
          "overflow-visible", // allow content container to overlay when peeking
          "transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
          "motion-reduce:transition-none",
          isResizing && "transition-none!",
          variant === "floating" && "m-2 rounded-lg shadow-lg",
          className,
        )}
        {...props}
      >
        <TooltipProvider>
          {(() => {
            // Separate footer children from the rest so hovering the footer
            // doesn't trigger peeking. Footer is rendered outside the peek zone.
            const childArray = React.Children.toArray(children);
            const footerChildren = childArray.filter(
              (child) =>
                React.isValidElement(child) &&
                (child.type as { displayName?: string })?.displayName ===
                  "Sidebar.Footer",
            );
            const nonFooterChildren = childArray.filter(
              (child) =>
                !React.isValidElement(child) ||
                (child.type as { displayName?: string })?.displayName !==
                  "Sidebar.Footer",
            );

            return (
              <div
                data-sidebar="content-container"
                style={{ width: contentWidth }}
                className={cn(
                  "flex h-full flex-col",
                  "min-w-0 overflow-hidden whitespace-nowrap",
                  "bg-(--sidebar-bg) text-kumo-default",
                  borderClasses,
                  "transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
                  "motion-reduce:transition-none",
                  isResizing && "transition-none!",
                  !open &&
                    cn(
                      contained ? "absolute" : "fixed",
                      "inset-y-0 z-40",
                      side === "left" && "left-0",
                      side === "right" && "right-0",
                    ),
                  open && "relative",
                  contentClassName,
                )}
              >
                {/* Peek zone — header + content (not footer) */}
                <div
                  data-sidebar="peek-zone"
                  className="flex flex-1 flex-col min-h-0"
                  onMouseEnter={startPeek}
                  onMouseLeave={stopPeek}
                  onFocus={startPeek}
                  onBlur={handlePeekBlur}
                >
                  {nonFooterChildren}
                </div>
                {/* Footer — outside peek zone */}
                {footerChildren}
              </div>
            );
          })()}
        </TooltipProvider>
      </aside>
    );
  },
);

SidebarRoot.displayName = "Sidebar";

// ============================================================================
// Sidebar Header
// ============================================================================

/**
 * Top section of the sidebar. Typically contains a logo, title, and action button.
 *
 * @example
 * ```tsx
 * <Sidebar.Header>
 *   <CloudflareLogo />
 *   <span>Design Engineering</span>
 *   <Button shape="square" icon={CaretUpDownIcon} aria-label="Switch" />
 * </Sidebar.Header>
 * ```
 */
const SidebarHeader = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="header"
    className={cn(
      "flex h-[58px] shrink-0 items-center gap-1 border-b border-kumo-line",
      "px-3 overflow-hidden",
      className,
    )}
    {...props}
  />
));

SidebarHeader.displayName = "Sidebar.Header";

// ============================================================================
// Sidebar Content
// ============================================================================

/**
 * Scrollable middle section of the sidebar. Contains nav groups and menus.
 *
 * @example
 * ```tsx
 * <Sidebar.Content>
 *   <Sidebar.Group>...</Sidebar.Group>
 * </Sidebar.Content>
 * ```
 */
const SidebarContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <ScrollAreaBase.Root
    ref={ref}
    data-sidebar="content"
    className={cn("relative min-w-0 flex-1 overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaBase.Viewport
      tabIndex={-1}
      className={cn(
        "h-full px-[11px] py-3 group-not-data-[state=collapsed]/sidebar:px-3.5",
        "transition-[padding] duration-(--sidebar-animation-duration)",
        "overflow-x-hidden!",
        // Scroll fade via CSS mask driven by Base UI overflow CSS variables
        "[mask-image:linear-gradient(to_bottom,transparent_0,black_min(24px,var(--scroll-area-overflow-y-start,24px)),black_calc(100%-min(24px,var(--scroll-area-overflow-y-end,24px))),transparent_100%)]",
      )}
    >
      <ScrollAreaBase.Content className="flex min-w-0! flex-col">
        {children}
      </ScrollAreaBase.Content>
    </ScrollAreaBase.Viewport>
    <ScrollAreaBase.Scrollbar
      orientation="vertical"
      className={cn(
        "flex w-1.5 touch-none select-none p-px",
        "opacity-0 transition-opacity duration-150",
        "data-[scrolling]:opacity-100 data-[hovering]:opacity-100",
      )}
    >
      <ScrollAreaBase.Thumb className="flex-1 rounded-full bg-kumo-line" />
    </ScrollAreaBase.Scrollbar>
  </ScrollAreaBase.Root>
));

SidebarContent.displayName = "Sidebar.Content";

// ============================================================================
// Sidebar Footer
// ============================================================================

/**
 * Bottom-pinned section of the sidebar. Rendered outside the peek zone
 * so hovering the footer doesn't trigger a peek. Tracks sidebar width
 * to stay aligned with the content container.
 *
 * @example
 * ```tsx
 * <Sidebar.Footer>
 *   <Sidebar.Trigger />
 * </Sidebar.Footer>
 * ```
 */
const SidebarFooter = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="footer"
    className={cn(
      "flex h-12 shrink-0 items-center gap-4 overflow-hidden whitespace-nowrap border-t border-kumo-line",
      "px-[11px] group-not-data-[state=collapsed]/sidebar:px-4",
      "bg-(--sidebar-bg)",
      "w-(--sidebar-width)",
      "transition-[width,padding] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
      "motion-reduce:transition-none",
      "sticky bottom-0",
      "group-data-[state=collapsed]/sidebar:w-(--sidebar-width-icon) bg-clip-padding",
      "group-data-[state=collapsed]/sidebar:border-r group-data-[state=collapsed]/sidebar:border-kumo-line",
      className,
    )}
    {...props}
  />
));

SidebarFooter.displayName = "Sidebar.Footer";

// ============================================================================
// Sidebar Group
// ============================================================================

/**
 * Groups related menu items with an optional label.
 *
 * @example
 * ```tsx
 * <Sidebar.Group>
 *   <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
 *   <Sidebar.Menu>...</Sidebar.Menu>
 * </Sidebar.Group>
 * ```
 */
const SidebarGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn("flex min-w-0 flex-col gap-y-px", className)}
    {...props}
  >
    {children}
  </div>
));

SidebarGroup.displayName = "Sidebar.Group";

// ============================================================================
// Sidebar GroupLabel
// ============================================================================

/**
 * Section label for a sidebar group (e.g., "Build", "Protect & Connect").
 * When the sidebar is collapsed, renders as a thin horizontal divider.
 * When it's the first group, the divider is hidden (nothing above to separate from).
 *
 * @example
 * ```tsx
 * <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
 * ```
 */
const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      // Grid-rows for smooth collapse animation
      "grid overflow-hidden",
      "transition-[grid-template-rows,margin,border-color] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
      // Mobile: no collapse animation — sidebar is always expanded
      "group-data-[mobile=true]/sidebar:transition-none",
      // Collapsed: spacer with divider line between icon groups
      "grid-rows-[0fr] my-3 border-b border-kumo-line",
      // First group: no spacer or divider needed
      "[[data-sidebar=group]:first-child_&]:my-0 [[data-sidebar=group]:first-child_&]:border-transparent",
      // Expanded: reveal the label text
      "group-not-data-[state=collapsed]/sidebar:grid-rows-[1fr] group-not-data-[state=collapsed]/sidebar:my-0 group-not-data-[state=collapsed]/sidebar:border-transparent",
      // Mobile: always show labels (sidebar content is always expanded on mobile)
      "group-data-[mobile=true]/sidebar:grid-rows-[1fr] group-data-[mobile=true]/sidebar:my-0 group-data-[mobile=true]/sidebar:border-transparent",
      className,
    )}
    {...props}
  >
    <div className="min-h-0 min-w-0">
      <div
        className={cn(
          "truncate px-3 mt-4 mb-2 text-sm font-medium text-kumo-subtle",
          // First group: less top margin
          "[[data-sidebar=group]:first-child_&]:mt-2",
        )}
      >
        {children}
      </div>
    </div>
  </div>
));

SidebarGroupLabel.displayName = "Sidebar.GroupLabel";

// ============================================================================
// MenuItem / MenuSubItem auto-wrap contexts
// ============================================================================

/**
 * When `true`, indicates the component is already wrapped in a `MenuItem` `<li>`.
 * `MenuButton` checks this: if `false`, it auto-wraps itself in an `<li>`.
 */
const MenuItemContext = createContext(false);

/**
 * When `true`, indicates the component is already wrapped in a `MenuSubItem` `<li>`.
 * `MenuSubButton` checks this: if `false`, it auto-wraps itself in an `<li>`.
 */
const MenuSubItemContext = createContext(false);

// ============================================================================
// Sidebar Menu
// ============================================================================

/**
 * Navigation menu list. Renders as `<ul>`.
 *
 * `MenuButton` auto-wraps in `<li>` so `MenuItem` is optional for simple items.
 *
 * @example Simple usage
 * ```tsx
 * <Sidebar.Menu>
 *   <Sidebar.MenuButton icon={HouseIcon} active>Account home</Sidebar.MenuButton>
 *   <Sidebar.MenuButton icon={GlobeIcon}>Domains</Sidebar.MenuButton>
 * </Sidebar.Menu>
 * ```
 *
 * @example With explicit MenuItem (needed for Collapsible wrapper)
 * ```tsx
 * <Sidebar.Menu>
 *   <Sidebar.MenuItem>
 *     <Sidebar.Collapsible>...</Sidebar.Collapsible>
 *   </Sidebar.MenuItem>
 * </Sidebar.Menu>
 * ```
 */
const SidebarMenu = forwardRef<
  HTMLUListElement,
  ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn(
      "m-0 flex min-w-0 list-none flex-col items-stretch gap-y-px p-0",
      className,
    )}
    {...props}
  />
));

SidebarMenu.displayName = "Sidebar.Menu";

// ============================================================================
// Sidebar MenuItem
// ============================================================================

/**
 * Individual menu list item. Renders as `<li>`.
 *
 * **Optional when using `MenuButton` directly** — `MenuButton` auto-wraps
 * itself in a `<li>` when not already inside a `MenuItem`. Use `MenuItem`
 * explicitly when wrapping a `Collapsible`.
 *
 * @example Explicit usage (wrapping a Collapsible)
 * ```tsx
 * <Sidebar.MenuItem>
 *   <Sidebar.Collapsible>...</Sidebar.Collapsible>
 * </Sidebar.MenuItem>
 * ```
 */
const SidebarMenuItem = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<"li">
>(({ className, children, ...props }, ref) => (
  <MenuItemContext.Provider value={true}>
    <li
      ref={ref}
      data-sidebar="menu-item"
      className={cn(
        "relative group-data-[state=collapsed]/sidebar:overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  </MenuItemContext.Provider>
));

SidebarMenuItem.displayName = "Sidebar.MenuItem";

// ============================================================================
// Sidebar MenuButton
// ============================================================================

export type SidebarMenuButtonSize = "base" | "sm";

export interface SidebarMenuButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  > {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  active?: boolean;
  /**
   * Button size.
   * - `"base"` — Standard nav item
   * - `"sm"` — Compact nav item
   * @default "base"
   */
  size?: SidebarMenuButtonSize;
  href?: string;
  /** Link target — only meaningful when `href` is provided. */
  target?: React.HTMLAttributeAnchorTarget;
  tooltip?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Primary interactive element inside a menu item. Renders as a `<button>` or link.
 * Supports icons, active state, and auto-tooltip when the sidebar is collapsed.
 *
 * **Auto-wraps in `<li>`** when not already inside a `Sidebar.MenuItem`.
 * Use `MenuItem` explicitly only when wrapping a `Collapsible`.
 *
 * @example Simple usage (auto-wrapped in `<li>`)
 * ```tsx
 * <Sidebar.Menu>
 *   <Sidebar.MenuButton icon={GlobeIcon} active>Domains</Sidebar.MenuButton>
 *   <Sidebar.MenuButton icon={ClockIcon} href="/recents">Recents</Sidebar.MenuButton>
 * </Sidebar.Menu>
 * ```
 *
 * @example With Collapsible (explicit MenuItem needed)
 * ```tsx
 * <Sidebar.MenuItem>
 *   <Sidebar.Collapsible>
 *     <Sidebar.CollapsibleTrigger render={<Sidebar.MenuButton icon={CodeIcon}>Compute<Sidebar.MenuChevron /></Sidebar.MenuButton>} />
 *     <Sidebar.CollapsibleContent>...</Sidebar.CollapsibleContent>
 *   </Sidebar.Collapsible>
 * </Sidebar.MenuItem>
 * ```
 */
const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  (
    {
      className,
      icon: IconProp,
      active = false,
      size = "base",
      href,
      target,
      tooltip,
      children,
      ...props
    },
    ref,
  ) => {
    const { state, peekable } = useSidebar();
    const LinkComponent = useLinkComponent();
    const isInsideMenuItem = useContext(MenuItemContext);

    // Render icon — supports both component types and React elements
    const iconNode = (() => {
      if (!IconProp) return null;
      if (React.isValidElement(IconProp)) return IconProp;
      const Comp = IconProp as React.ComponentType<{ className?: string }>;
      return (
        <Comp
          className={cn(
            "shrink-0 opacity-40",
            size === "base" ? "size-4" : "size-3.5",
          )}
        />
      );
    })();

    const content = (
      <div
        className={cn(
          "flex flex-1 items-center min-w-0 gap-3",
          "translate-x-[-3px] group-not-data-[state=collapsed]/sidebar:translate-x-0",
          "transition-transform duration-(--sidebar-animation-duration)",
        )}
      >
        {iconNode}
        <span
          className={cn(
            "flex flex-1 items-center gap-2 min-w-0 text-left overflow-hidden",
          )}
        >
          {React.Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <span className="truncate">{child}</span>
            ) : (
              child
            ),
          )}
        </span>
      </div>
    );

    const buttonClasses = cn(
      // Layout
      "group/menu-button relative flex w-full min-w-0 items-center gap-2.5 rounded-lg outline-none cursor-pointer",
      "before:absolute before:inset-x-0 before:-inset-y-px",
      // Sizing
      size === "base" && "min-h-8.5 px-3 py-0 text-sm font-medium",
      size === "sm" && "min-h-7 px-2 py-0 text-sm",
      "text-kumo-default",
      "transition-[color,box-shadow,outline] duration-(--sidebar-animation-duration)",
      !active && "hover:bg-(--sidebar-active-bg)",
      // Active state
      active && "bg-(--sidebar-active-bg)",
      // When a child sub-button is active, don't show active styling on the parent trigger
      "has-[[data-active]]:bg-transparent has-[[data-active]]:hover:bg-(--sidebar-active-bg)",
      // Focus
      "focus:outline-none focus-visible:text-kumo-strong focus-visible:bg-(--sidebar-active-bg)",
      className,
    );

    let button: React.ReactNode;

    if (href) {
      button = (
        <LinkComponent
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cn(buttonClasses, "no-underline!")}
          href={href}
          to={href}
          target={target}
          data-active={active || undefined}
          data-sidebar="menu-button"
          data-kumo-component="Sidebar"
          data-kumo-part="menu-button-link"
          data-size={size}
          onClick={
            props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
          }
        >
          {content}
        </LinkComponent>
      );
    } else {
      button = (
        <button
          ref={ref}
          type="button"
          className={buttonClasses}
          data-active={active || undefined}
          data-sidebar="menu-button"
          data-kumo-component="Sidebar"
          data-kumo-part="menu-button"
          data-size={size}
          {...props}
        >
          {content}
        </button>
      );
    }

    // Always wrap in Tooltip when tooltip text is provided so the DOM
    // structure stays stable across expand/collapse — preventing React from
    // remounting the button (which would kill CSS transitions).
    // The tooltip popup only shows when collapsed and peeking is disabled —
    // when peekable, hovering reveals the full sidebar so tooltips are redundant.
    const showTooltip = state === "collapsed" && !peekable;
    if (tooltip) {
      button = (
        <Tooltip
          content={tooltip}
          disabled={!showTooltip}
          side="right"
          render={button}
        />
      );
    }

    // Auto-wrap in <li> when not already inside a MenuItem
    if (!isInsideMenuItem) {
      return (
        <li
          data-sidebar="menu-item"
          className="relative group-data-[state=collapsed]/sidebar:overflow-hidden"
        >
          {button}
        </li>
      );
    }

    return button;
  },
);

SidebarMenuButton.displayName = "Sidebar.MenuButton";

// ============================================================================
// Sidebar MenuBadge
// ============================================================================

/**
 * Badge pill displayed inside a menu button (e.g., "Beta", "New").
 * Uses dashed border styling matching the Cloudflare design system.
 *
 * @example
 * ```tsx
 * <Sidebar.MenuSubButton>
 *   Containers
 *   <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
 * </Sidebar.MenuSubButton>
 * ```
 */
const SidebarMenuBadge = forwardRef<
  HTMLSpanElement,
  ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "inline-flex shrink-0 items-center rounded-full border border-dashed border-kumo-line",
      "select-none px-1.5 py-0.5 text-[11px]/none font-medium text-kumo-strong",
      // Hidden when collapsed
      "group-data-[state=collapsed]/sidebar:hidden",
      className,
    )}
    {...props}
  />
));

SidebarMenuBadge.displayName = "Sidebar.MenuBadge";

// ============================================================================
// Sidebar MenuSub
// ============================================================================

/**
 * Indented sub-menu container for child navigation items. Renders as `<ul>` with
 * a left border accent for visual hierarchy.
 *
 * `MenuSubButton` auto-wraps in `<li>` so `MenuSubItem` is optional.
 *
 * @example
 * ```tsx
 * <Sidebar.MenuSub>
 *   <Sidebar.MenuSubButton active>Workers & Pages</Sidebar.MenuSubButton>
 *   <Sidebar.MenuSubButton>Durable Objects</Sidebar.MenuSubButton>
 * </Sidebar.MenuSub>
 * ```
 */
const SidebarMenuSub = forwardRef<
  HTMLUListElement,
  ComponentPropsWithoutRef<"ul">
>(({ className, children, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "relative m-0 flex min-w-0 list-none flex-col gap-y-px p-0 pl-7 pr-0 overflow-hidden",
      className,
    )}
    {...props}
  >
    <div className="absolute left-[19px] inset-y-px w-px bg-kumo-line z-10" />
    {children}
  </ul>
));

SidebarMenuSub.displayName = "Sidebar.MenuSub";

// ============================================================================
// Sidebar MenuSubItem
// ============================================================================

/**
 * Individual item inside a sub-menu. Renders as `<li>`.
 *
 * **Optional when using `MenuSubButton` directly** — `MenuSubButton` auto-wraps
 * itself in a `<li>` when not already inside a `MenuSubItem`.
 */
const SidebarMenuSubItem = forwardRef<
  HTMLLIElement,
  ComponentPropsWithoutRef<"li">
>(({ className, children, ...props }, ref) => (
  <MenuSubItemContext.Provider value={true}>
    <li
      ref={ref}
      data-sidebar="menu-sub-item"
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </li>
  </MenuSubItemContext.Provider>
));

SidebarMenuSubItem.displayName = "Sidebar.MenuSubItem";

// ============================================================================
// Sidebar MenuSubButton
// ============================================================================

export interface SidebarMenuSubButtonProps
  extends ComponentPropsWithoutRef<"button"> {
  /** Marks this sub-item as currently active/selected. @default false */
  active?: boolean;
  /** Navigation URL. When set, renders as a link via LinkProvider. */
  href?: string;
}

/**
 * Button inside a sub-menu item. Does not render an icon (sub-items are
 * indented instead). Supports active state and link rendering.
 *
 * **Auto-wraps in `<li>`** when not already inside a `Sidebar.MenuSubItem`.
 *
 * @example Simple usage (auto-wrapped in `<li>`)
 * ```tsx
 * <Sidebar.MenuSub>
 *   <Sidebar.MenuSubButton active>Workers & Pages</Sidebar.MenuSubButton>
 *   <Sidebar.MenuSubButton href="/observability">Observability</Sidebar.MenuSubButton>
 * </Sidebar.MenuSub>
 * ```
 */
const SidebarMenuSubButton = forwardRef<
  HTMLButtonElement,
  SidebarMenuSubButtonProps
>(({ className, active = false, href, children, ...props }, ref) => {
  const LinkComponent = useLinkComponent();
  const isInsideMenuSubItem = useContext(MenuSubItemContext);

  const buttonClasses = cn(
    "group/menu-button relative flex w-full min-w-0 items-center gap-2 rounded-lg min-h-8.5 px-3 py-0 text-sm font-medium outline-none cursor-pointer",
    "before:absolute before:inset-x-0 before:-inset-y-px",
    "text-kumo-default transition-[color] duration-150",
    !active && "hover:bg-(--sidebar-active-bg)",
    active && "bg-(--sidebar-active-bg)",
    "focus:outline-none focus-visible:text-kumo-strong focus-visible:bg-(--sidebar-active-bg)",
    className,
  );

  const content = (
    <span className="flex flex-1 items-center gap-2 min-w-0 text-left overflow-hidden">
      {React.Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <span className="truncate">{child}</span>
        ) : (
          child
        ),
      )}
    </span>
  );

  let button: React.ReactNode;

  if (href) {
    button = (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cn(buttonClasses, "no-underline!")}
        href={href}
        to={href}
        data-active={active || undefined}
        data-sidebar="menu-sub-button"
        data-kumo-component="Sidebar"
        data-kumo-part="menu-sub-button-link"
        onClick={
          props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>
        }
      >
        {content}
      </LinkComponent>
    );
  } else {
    button = (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        data-active={active || undefined}
        data-sidebar="menu-sub-button"
        data-kumo-component="Sidebar"
        data-kumo-part="menu-sub-button"
        {...props}
      >
        {content}
      </button>
    );
  }

  // Auto-wrap in <li> when not already inside a MenuSubItem
  if (!isInsideMenuSubItem) {
    return (
      <li data-sidebar="menu-sub-item" className="relative">
        {button}
      </li>
    );
  }

  return button;
});

SidebarMenuSubButton.displayName = "Sidebar.MenuSubButton";

// ============================================================================
// Sidebar Separator
// ============================================================================

/**
 * Horizontal divider line between sidebar sections.
 */
const SidebarSeparator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="separator"
    className={cn("my-3 px-2", className)}
    {...props}
  >
    <div className="border-b border-kumo-line" />
  </div>
));

SidebarSeparator.displayName = "Sidebar.Separator";

// ============================================================================
// Sidebar Trigger
// ============================================================================

// ============================================================================
// Sidebar PanelIcon
// ============================================================================

/**
 * Animated sidebar panel icon. The vertical divider line slides based
 * on the sidebar's open/closed state.
 */
function SidebarPanelIcon({ className }: { className?: string }) {
  const { open } = useSidebar();

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={cn("shrink-0", className)}
    >
      <path d="M21.25 6.72v10.56a2.97 2.97 0 0 1-2.97 2.97H5.72a2.97 2.97 0 0 1-2.97-2.97V6.72a2.97 2.97 0 0 1 2.97-2.97h12.56a2.97 2.97 0 0 1 2.97 2.97" />
      <path
        d="M6.25 7.25v9.5"
        className={cn(
          "transition-transform duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
          open ? "translate-x-px" : "translate-x-[10.5px]",
        )}
      />
    </svg>
  );
}

SidebarPanelIcon.displayName = "Sidebar.PanelIcon";

/**
 * Button that toggles the sidebar open/collapsed. Uses `toggleSidebar()` from context.
 * Defaults to an animated `SidebarPanelIcon`.
 *
 * @example
 * ```tsx
 * <Sidebar.Trigger />
 * ```
 */
const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, children, onClick, ...props }, ref) => {
  const { open, toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="trigger"
      data-kumo-component="Sidebar"
      data-kumo-part="trigger"
      aria-expanded={open}
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      className={cn(
        "flex shrink-0 size-8.5 justify-center items-center rounded-lg cursor-pointer",
        "text-kumo-subtle hover:text-kumo-default hover:bg-(--sidebar-active-bg)",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kumo-brand",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      {children ?? <SidebarPanelIcon />}
    </button>
  );
});

SidebarTrigger.displayName = "Sidebar.Trigger";

// ============================================================================
// Sidebar Rail
// ============================================================================

/**
 * Invisible interaction strip at the sidebar edge for click-to-toggle.
 * Renders a thin hover-sensitive area between the sidebar and main content.
 */
const SidebarRail = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="rail"
      data-kumo-component="Sidebar"
      data-kumo-part="rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      className={cn(
        "absolute inset-y-0 z-1 hidden w-4 -translate-x-1/2 cursor-pointer transition-all",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5",
        "hover:after:bg-kumo-brand/20",
        "group-data-[side=left]/sidebar-wrapper:right-0",
        "group-data-[side=right]/sidebar-wrapper:left-0",
        "sm:flex",
        className,
      )}
      onClick={toggleSidebar}
      {...props}
    />
  );
});

SidebarRail.displayName = "Sidebar.Rail";

// ============================================================================
// Sidebar ResizeHandle
// ============================================================================

/**
 * Drag handle for resizing the sidebar. Renders when `resizable` is true in
 * both expanded and collapsed states.
 *
 * - **Expanded → drag inward past `minWidth`**: auto-collapses to icon-only.
 * - **Collapsed → drag outward past `minWidth`**: auto-expands and begins
 *   tracking width from `minWidth`.
 */
const SidebarResizeHandle = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => {
  const {
    side,
    resizable,
    setIsResizing,
    setWidth,
    setOpen,
    open,
    minWidth,
    width: currentWidth,
    maxWidth,
  } = useSidebar();
  const startX = useRef(0);
  const startWidth = useRef(0);
  const wasCollapsed = useRef(false);

  if (!resizable) return null;

  const KEYBOARD_STEP = 10;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsResizing(true);
    startX.current = e.clientX;
    wasCollapsed.current = !open;

    const wrapper = (e.currentTarget as HTMLElement).closest(
      "[data-sidebar-wrapper]",
    );
    const sidebar = wrapper?.querySelector("[data-sidebar='sidebar']");
    startWidth.current = sidebar?.getBoundingClientRect().width ?? 0;

    const cleanup = () => {
      setIsResizing(false);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta =
        side === "left"
          ? moveEvent.clientX - startX.current
          : startX.current - moveEvent.clientX;
      const rawWidth = startWidth.current + delta;

      if (wasCollapsed.current) {
        // Dragging outward from collapsed — expand once past minWidth
        if (rawWidth >= minWidth) {
          wasCollapsed.current = false;
          setOpen(true);
          setWidth(rawWidth);
        }
        return;
      }

      // Dragging inward while expanded — collapse when below minWidth
      if (rawWidth < minWidth) {
        setOpen(false);
        wasCollapsed.current = true;
        return;
      }

      setWidth(rawWidth);
    };

    const handlePointerUp = () => {
      cleanup();
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const grow = side === "left" ? "ArrowRight" : "ArrowLeft";
    const shrink = side === "left" ? "ArrowLeft" : "ArrowRight";

    if (e.key === grow) {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setWidth(minWidth);
      } else {
        setWidth(Math.min(currentWidth + KEYBOARD_STEP, maxWidth));
      }
    } else if (e.key === shrink) {
      e.preventDefault();
      const next = currentWidth - KEYBOARD_STEP;
      if (next < minWidth) {
        setOpen(false);
      } else {
        setWidth(next);
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "End") {
      e.preventDefault();
      setOpen(true);
      setWidth(maxWidth);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Resize sidebar"
      tabIndex={0}
      data-sidebar="resize-handle"
      className={cn(
        // Hit area inside the sidebar edge; thin visual line pinned to the edge via ::after
        "absolute inset-y-0 z-2 hidden w-3 cursor-col-resize sm:block",
        "after:absolute after:inset-y-0 after:w-0.5",
        "after:bg-transparent after:transition-colors",
        "hover:after:bg-kumo-hairline active:after:bg-kumo-hairline focus-visible:after:bg-kumo-hairline",
        "focus:outline-none",
        side === "left" && "right-0 after:right-0",
        side === "right" && "left-0 after:left-0",
        className,
      )}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});

SidebarResizeHandle.displayName = "Sidebar.ResizeHandle";

// ============================================================================
// Collapsible context + components (custom implementation, no Base UI dep)
// ============================================================================

interface SidebarCollapseContextValue {
  contentId: string;
  isOpen: boolean;
  isCollapsible: boolean;
  autoScrollOnOpen: boolean;
  toggle: () => void;
}

const SidebarCollapseContext = createContext<SidebarCollapseContextValue>({
  contentId: "",
  isOpen: true,
  isCollapsible: false,
  autoScrollOnOpen: false,
  toggle: () => {},
});

export interface SidebarCollapsibleProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Initial open state (uncontrolled). @default false */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Scroll the expanded content into view after opening. @default false */
  autoScrollOnOpen?: boolean;
}

/**
 * Collapsible wrapper for sidebar sub-menu expand/collapse.
 * Manages open/close state and provides context to Trigger and Content children.
 *
 * Keyboard behaviour: when a child receives keyboard focus (`focus-visible`)
 * while collapsed, the section auto-expands. It collapses again on blur
 * unless it was explicitly opened via click or a child has `data-active`.
 *
 * @example
 * ```tsx
 * <Sidebar.MenuItem>
 *   <Sidebar.Collapsible defaultOpen>
 *     <Sidebar.CollapsibleTrigger
 *       render={<Sidebar.MenuButton icon={CodeIcon}>Compute<Sidebar.MenuChevron /></Sidebar.MenuButton>}
 *     />
 *     <Sidebar.CollapsibleContent>
 *       <Sidebar.MenuSub>...</Sidebar.MenuSub>
 *     </Sidebar.CollapsibleContent>
 *   </Sidebar.Collapsible>
 * </Sidebar.MenuItem>
 * ```
 */
const SidebarCollapsible = forwardRef<HTMLDivElement, SidebarCollapsibleProps>(
  (
    {
      defaultOpen = false,
      open: openProp,
      onOpenChange,
      autoScrollOnOpen = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = openProp ?? internalOpen;
    const contentId = useId();
    const keyboardExpandedRef = useRef(false);

    const toggle = useCallback(() => {
      const next = !isOpen;
      setInternalOpen(next);
      onOpenChange?.(next);
      // If user explicitly clicks, clear the keyboard-expanded flag
      keyboardExpandedRef.current = false;
    }, [isOpen, onOpenChange]);

    const contextValue = useMemo<SidebarCollapseContextValue>(
      () => ({
        contentId,
        isOpen,
        isCollapsible: true,
        autoScrollOnOpen,
        toggle,
      }),
      [contentId, isOpen, autoScrollOnOpen, toggle],
    );

    const handleFocusIn = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        // Auto-expand on keyboard focus (focus-visible) when collapsed
        if (!isOpen && (e.target as HTMLElement).matches(":focus-visible")) {
          keyboardExpandedRef.current = true;
          setInternalOpen(true);
          onOpenChange?.(true);
        }
      },
      [isOpen, onOpenChange],
    );

    const handleFocusOut = useCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        // Auto-collapse on blur if it was keyboard-expanded (not click-expanded)
        // and no child has data-active
        if (
          keyboardExpandedRef.current &&
          !e.currentTarget.contains(e.relatedTarget as Node) &&
          !e.currentTarget.querySelector("[data-active]")
        ) {
          keyboardExpandedRef.current = false;
          setInternalOpen(false);
          onOpenChange?.(false);
        }
      },
      [onOpenChange],
    );

    return (
      <SidebarCollapseContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-open={isOpen || undefined}
          className={cn("min-w-0", className)}
          onFocus={handleFocusIn}
          onBlur={handleFocusOut}
          {...props}
        >
          {children}
        </div>
      </SidebarCollapseContext.Provider>
    );
  },
);

SidebarCollapsible.displayName = "Sidebar.Collapsible";

export interface SidebarCollapsibleTriggerProps {
  /** Element to render as the trigger. Gets aria-expanded, aria-controls, and onClick merged. */
  render: React.ReactElement;
}

/**
 * Trigger for a sidebar collapsible section. Uses `render` prop to compose
 * with `Sidebar.MenuButton` or `Sidebar.MenuSubButton`.
 *
 * @example
 * ```tsx
 * <Sidebar.CollapsibleTrigger
 *   render={
 *     <Sidebar.MenuButton icon={CodeIcon}>
 *       Compute
 *       <Sidebar.MenuChevron />
 *     </Sidebar.MenuButton>
 *   }
 * />
 * ```
 */
function SidebarCollapsibleTrigger({ render }: SidebarCollapsibleTriggerProps) {
  const { contentId, isOpen, toggle } = useContext(SidebarCollapseContext);

  return React.cloneElement(render, {
    "aria-expanded": isOpen,
    "aria-controls": contentId,
    "data-open": isOpen || undefined,
    onClick: (e: React.MouseEvent) => {
      // Call any existing onClick on the render element
      const existingOnClick = (
        render.props as { onClick?: (e: React.MouseEvent) => void }
      ).onClick;
      existingOnClick?.(e);
      toggle();
    },
  } as Record<string, unknown>);
}

SidebarCollapsibleTrigger.displayName = "Sidebar.CollapsibleTrigger";

/**
 * Animated collapsible content panel. Uses CSS grid-rows for smooth
 * height transitions without measuring DOM height.
 *
 * Always mounted (no unmount on close) so exit animations play.
 */
const SidebarCollapsibleContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { contentId, isOpen: isCollapsibleOpen } = useContext(
    SidebarCollapseContext,
  );
  const { state, animationDuration } = useSidebar();
  const { autoScrollOnOpen } = useContext(SidebarCollapseContext);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const isOpen = isCollapsibleOpen && state !== "collapsed";

  useEffect(() => {
    if (!isOpen || !autoScrollOnOpen) return;

    const timeout = window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      contentRef.current?.scrollIntoView({
        block: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }, animationDuration);

    return () => window.clearTimeout(timeout);
  }, [isOpen, autoScrollOnOpen, animationDuration]);

  // Imperatively set inert — React 18 doesn't reliably forward
  // the inert attribute as a JSX prop on initial mount.
  const inertRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        if (!isOpen) {
          node.setAttribute("inert", "");
        } else {
          node.removeAttribute("inert");
        }
      }
    },
    [isOpen],
  );

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      inertRef(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref, inertRef],
  );

  return (
    <div
      ref={mergedRef}
      id={contentId}
      role="region"
      aria-hidden={!isOpen}
      className={cn(
        "grid",
        "transition-[grid-template-rows] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
        "motion-reduce:transition-none",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
});

SidebarCollapsibleContent.displayName = "Sidebar.CollapsibleContent";

// ============================================================================
// Sidebar MenuChevron
// ============================================================================

/**
 * Auto-rotating chevron for collapsible menu items. Reads open state from
 * the nearest `SidebarCollapseContext` and rotates accordingly.
 *
 * @example
 * ```tsx
 * <Sidebar.CollapsibleTrigger
 *   render={<Sidebar.MenuButton icon={CodeIcon}>Compute<Sidebar.MenuChevron /></Sidebar.MenuButton>}
 * />
 * ```
 */
function SidebarMenuChevron({ className }: { className?: string }) {
  const { isOpen, isCollapsible } = useContext(SidebarCollapseContext);

  return (
    <CaretRightIcon
      size={12}
      weight="bold"
      className={cn(
        "ml-auto shrink-0 opacity-40 group-hover/menu-button:opacity-100 transition-[transform,rotate,opacity] duration-200",
        isCollapsible && isOpen && "rotate-90",
        // Hidden when sidebar is collapsed
        "group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
    />
  );
}

SidebarMenuChevron.displayName = "Sidebar.MenuChevron";

// ============================================================================
// SlidingViews — animated horizontal transitions between navigation surfaces
// ============================================================================

const SlidingViewActiveContext = createContext<string>("");

export interface SidebarSlidingViewsProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Key of the currently active view. Must match a child `SlidingView` value. */
  activeKey: string;
  /**
   * Slide direction for the transition.
   * - `"left"`: new view slides in from the right
   * - `"right"`: new view slides in from the left
   * @default "left"
   */
  direction?: "left" | "right";
}

/**
 * Container for animated horizontal transitions between navigation surfaces
 * (e.g., account ↔ zone). Inactive views are marked `aria-hidden` and `inert`.
 *
 * Animation respects `prefers-reduced-motion`.
 *
 * @example
 * ```tsx
 * <Sidebar.SlidingViews activeKey={surface} direction="left">
 *   <Sidebar.SlidingView value="account">
 *     <Sidebar.Content>...account nav...</Sidebar.Content>
 *   </Sidebar.SlidingView>
 *   <Sidebar.SlidingView value="zone">
 *     <Sidebar.Content>...zone nav...</Sidebar.Content>
 *   </Sidebar.SlidingView>
 * </Sidebar.SlidingViews>
 * ```
 */
const SidebarSlidingViews = forwardRef<
  HTMLDivElement,
  SidebarSlidingViewsProps
>(
  (
    {
      activeKey,
      direction: _direction = "left",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const childArray = React.Children.toArray(children);
    const activeIndex = childArray.findIndex(
      (child) =>
        React.isValidElement(child) &&
        (child.props as { value?: string }).value === activeKey,
    );
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const translateX = activeIndex > 0 ? `-${activeIndex * 100}%` : "0%";

    return (
      <SlidingViewActiveContext.Provider value={activeKey}>
        <div
          ref={ref}
          data-sidebar="sliding-views"
          className={cn(
            "flex flex-1 min-h-0 max-w-(--sidebar-width) overflow-hidden",
            className,
          )}
          {...props}
        >
          <div
            className="flex min-h-0 w-full shrink-0"
            style={{
              transform: `translateX(${translateX})`,
              transition: prefersReducedMotion
                ? "none"
                : `transform var(--sidebar-animation-duration) var(--sidebar-easing)`,
            }}
          >
            {children}
          </div>
        </div>
      </SlidingViewActiveContext.Provider>
    );
  },
);

SidebarSlidingViews.displayName = "Sidebar.SlidingViews";

export interface SidebarSlidingViewProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Unique key matching this view. Must correspond to `activeKey` on `SlidingViews`. */
  value: string;
}

/**
 * Individual panel inside `SlidingViews`. Inactive views are automatically
 * marked `aria-hidden` and `inert` so they're unreachable by keyboard/screen readers.
 */
const SidebarSlidingView = forwardRef<HTMLDivElement, SidebarSlidingViewProps>(
  ({ value, className, children, ...props }, ref) => {
    const activeKey = useContext(SlidingViewActiveContext);
    const isActive = activeKey === value;

    // Imperatively set inert — React 18.2 doesn't reliably forward the inert
    // attribute to the DOM when set as a JSX prop on initial mount.
    const inertRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          if (!isActive) {
            node.setAttribute("inert", "");
          } else {
            node.removeAttribute("inert");
          }
        }
      },
      [isActive],
    );

    // Merge forwarded ref with inert ref
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        inertRef(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref, inertRef],
    );

    return (
      <div
        ref={mergedRef}
        data-sidebar="sliding-view"
        data-value={value}
        aria-hidden={!isActive}
        className={cn(
          "flex w-full shrink-0 flex-col min-h-0",
          !isActive && "pointer-events-none",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SidebarSlidingView.displayName = "Sidebar.SlidingView";

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * Sidebar — responsive navigation panel with expand/collapse support.
 *
 * Compound component: `Sidebar` (root `<aside>`), `.Provider`, `.Header`,
 * `.Content`, `.Footer`, `.Group`, `.GroupLabel`,
 * `.Menu`, `.MenuItem`, `.MenuButton`, `.MenuBadge`,
 * `.MenuSub`, `.MenuSubItem`, `.MenuSubButton`, `.Separator`,
 * `.Trigger`, `.Rail`, `.MenuChevron`,
 * `.Collapsible`, `.CollapsibleTrigger`, `.CollapsibleContent`.
 *
 * @example
 * ```tsx
 * <Sidebar.Provider defaultOpen>
 *   <Sidebar>
 *     <Sidebar.Content>
 *       <Sidebar.Group>
 *         <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
 *         <Sidebar.Menu>
 *           <Sidebar.MenuButton icon={HouseIcon} active>Home</Sidebar.MenuButton>
 *           <Sidebar.MenuButton icon={GlobeIcon}>Domains</Sidebar.MenuButton>
 *         </Sidebar.Menu>
 *       </Sidebar.Group>
 *     </Sidebar.Content>
 *     <Sidebar.Footer>
 *       <Sidebar.Trigger />
 *     </Sidebar.Footer>
 *   </Sidebar>
 * </Sidebar.Provider>
 * ```
 */
export const Sidebar = Object.assign(SidebarRoot, {
  Provider: SidebarProvider,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  GroupLabel: SidebarGroupLabel,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  MenuButton: SidebarMenuButton,
  MenuBadge: SidebarMenuBadge,
  MenuSub: SidebarMenuSub,
  MenuSubItem: SidebarMenuSubItem,
  MenuSubButton: SidebarMenuSubButton,
  Separator: SidebarSeparator,
  Trigger: SidebarTrigger,
  Rail: SidebarRail,
  ResizeHandle: SidebarResizeHandle,
  MenuChevron: SidebarMenuChevron,
  Collapsible: SidebarCollapsible,
  CollapsibleTrigger: SidebarCollapsibleTrigger,
  CollapsibleContent: SidebarCollapsibleContent,
  SlidingViews: SidebarSlidingViews,
  SlidingView: SidebarSlidingView,
});

export {
  SidebarProvider,
  SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  SidebarResizeHandle,
  SidebarMenuChevron,
  SidebarCollapsible,
  SidebarCollapsibleTrigger,
  SidebarCollapsibleContent,
  SidebarSlidingViews,
  SidebarSlidingView,
};
