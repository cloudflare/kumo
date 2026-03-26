import React, {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog as DialogBase } from "@base-ui/react/dialog";
import { motion, useReducedMotion } from "motion/react";

import {
  CaretRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
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
    expanded: "16rem",
    icon: "3rem",
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

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_ANIMATION_DURATION_MS = 200;
const SIDEBAR_EASING = "cubic-bezier(0.77,0,0.175,1)";

// ============================================================================
// Mobile detection hook
// ============================================================================

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

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
  /** @internal Start peeking (called by SidebarRoot on mouse/focus enter). */
  startPeek: () => void;
  /** @internal Stop peeking (called by SidebarRoot on mouse/focus leave). */
  stopPeek: () => void;
  /** Animation duration in milliseconds for structural transitions. */
  animationDuration: number;
  /** Keyboard shortcut string (e.g. "mod+b") from Provider, used by Trigger tooltip. */
  keyboardShortcut?: string;
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
   * When true, hovering or focusing the collapsed sidebar temporarily expands
   * it ("peeking"). Moving the cursor/focus away collapses it back.
   * @default false
   */
  peekable?: boolean;
  /**
   * Keyboard shortcut string that toggles the sidebar (e.g. `"mod+b"`).
   * `mod` maps to `Meta` on macOS and `Control` elsewhere.
   * @default undefined
   */
  keyboardShortcut?: string;
  /**
   * Duration in milliseconds for structural sidebar animations (expand/collapse,
   * sliding views, grid-row transitions). Matches Stratus `SIDEBAR_NAV_ANIMATION_DURATION`.
   * @default 200
   */
  animationDuration?: number;
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
  peekable = false,
  keyboardShortcut,
  animationDuration = SIDEBAR_ANIMATION_DURATION_MS,
  children,
  className,
  style,
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);
  const [width, setWidthState] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

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
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev: boolean) => !prev);
    }
  }, [isMobile, setOpen]);

  // --- Peeking ---
  const startPeek = useCallback(() => setIsPeeking(true), []);
  const stopPeek = useCallback(() => setIsPeeking(false), []);

  // Cancel peeking when sidebar is explicitly opened
  useEffect(() => {
    if (open) setIsPeeking(false);
  }, [open]);

  // --- Keyboard shortcut ---
  useEffect(() => {
    if (!keyboardShortcut) return;

    const parts = keyboardShortcut.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const needsMod = parts.includes("mod");
    const needsShift = parts.includes("shift");
    const needsAlt = parts.includes("alt");

    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key) return;
      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPhone|iPad/.test(navigator.userAgent);
      const modPressed = isMac ? e.metaKey : e.ctrlKey;
      if (needsMod && !modPressed) return;
      if (needsShift && !e.shiftKey) return;
      if (needsAlt && !e.altKey) return;

      e.preventDefault();
      toggleSidebar();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [keyboardShortcut, toggleSidebar]);

  const baseState: "expanded" | "collapsed" = open ? "expanded" : "collapsed";
  const state: SidebarState =
    !open && peekable && isPeeking ? "peeking" : baseState;

  const sidebarWidthValue = resizable ? `${width}px` : SIDEBAR_WIDTH;

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
      animationDuration,
      keyboardShortcut,
    }),
    [
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
      animationDuration,
      keyboardShortcut,
    ],
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
          "group/sidebar-wrapper flex min-h-svh w-full",
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
  /** Sidebar content — Header, Content, Footer, etc. */
  children: ReactNode;
}

/**
 * Main sidebar container. Renders as `<aside>` on desktop, Dialog sheet on mobile.
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
  ({ className, children, ...props }, ref) => {
    const {
      state,
      isMobile,
      openMobile,
      setOpenMobile,
      side,
      variant,
      collapsible,
      isResizing,
      resizable,
      width,
      open,
      peekable,
      startPeek,
      stopPeek,
    } = useSidebar();

    // Peek handlers — only active when collapsed and peekable
    const canPeek = peekable && !open && !isMobile && collapsible !== "none";
    const isMouseOverRef = useRef(false);

    const isInFooter = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      !!el.closest('[data-sidebar="footer"]');

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent) => {
        isMouseOverRef.current = true;
        // Don't start peek when mouse enters through the footer zone
        if (canPeek && !isInFooter(e.target)) startPeek();
      },
      [canPeek, startPeek],
    );

    const handleMouseLeave = useCallback(() => {
      isMouseOverRef.current = false;
      if (canPeek) stopPeek();
    }, [canPeek, stopPeek]);

    const handleFocusIn = useCallback(
      (e: React.FocusEvent) => {
        if (
          canPeek &&
          !isInFooter(e.target) &&
          (e.target as HTMLElement).matches(":focus-visible")
        ) {
          startPeek();
        }
      },
      [canPeek, startPeek],
    );

    const handleFocusOut = useCallback(
      (e: React.FocusEvent) => {
        // Don't close peek if mouse is still over the sidebar
        if (isMouseOverRef.current) return;
        if (canPeek && !e.currentTarget.contains(e.relatedTarget as Node)) {
          stopPeek();
        }
      },
      [canPeek, stopPeek],
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
            "relative flex h-full shrink-0 grow-0 flex-col overflow-hidden bg-kumo-base text-kumo-default",
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
        <DialogBase.Root open={openMobile} onOpenChange={setOpenMobile}>
          <DialogBase.Portal>
            <DialogBase.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <DialogBase.Popup
              className={cn(
                "fixed inset-y-0 z-50 flex w-[--sidebar-width] flex-col bg-kumo-base p-0",
                "duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
                side === "left" &&
                "left-0 data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
                side === "right" &&
                "right-0 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
              )}
              style={
                {
                  "--sidebar-width": SIDEBAR_WIDTH,
                  transitionProperty: "transform, opacity",
                  transitionTimingFunction:
                    "var(--default-transition-timing-function)",
                } as CSSProperties
              }
            >
              <div
                data-sidebar="sidebar"
                data-mobile="true"
                className={cn(
                  "flex h-full w-full flex-col bg-kumo-base text-kumo-default",
                  className,
                )}
              >
                {children}
              </div>
            </DialogBase.Popup>
          </DialogBase.Portal>
        </DialogBase.Root>
      );
    }

    // Resolve the target width from CSS variables or literal values
    const collapsedWidth =
      collapsible === "icon" ? "var(--sidebar-width-icon)" : "0px";
    const expandedWidth = resizable ? `${width}px` : "var(--sidebar-width)";
    const isPeeking = state === "peeking";
    const targetWidth = isPeeking
      ? expandedWidth
      : state === "expanded"
        ? expandedWidth
        : collapsedWidth;

    return (
      <aside
        ref={ref}
        data-state={state}
        data-side={side}
        data-variant={variant}
        data-collapsible={collapsible}
        data-sidebar="sidebar"
        style={{ width: targetWidth }}
        className={cn(
          "group/sidebar relative flex h-full shrink-0 grow-0 flex-col",
          // overflow-hidden makes flex min-width resolve to 0 (per spec),
          // preventing children from pushing the sidebar wider than its width
          "min-w-0 overflow-hidden whitespace-nowrap",
          "bg-kumo-base text-kumo-default",
          // Transition width — uses configurable duration + easing from Provider
          "transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) will-change-[width]",
          "motion-reduce:transition-none",
          // Disable transition during resize drag
          isResizing && "transition-none!",
          variant === "sidebar" &&
          (side === "left"
            ? "border-r border-kumo-line"
            : "border-l border-kumo-line"),
          variant === "floating" &&
          "m-2 rounded-lg border border-kumo-line shadow-lg",
          // Peeking: elevated shadow to distinguish from persistent expand
          isPeeking && "shadow-xl z-50",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        {...props}
      >
        {/* TooltipProvider groups all collapsed-state tooltips so hovering
            between icons shows tooltips instantly (no repeated delay). */}
        <TooltipProvider>{children}</TooltipProvider>
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
      "flex items-center gap-2 border-b border-kumo-line px-2 py-3",
      "overflow-hidden",
      // Collapsed: just remove border, keep same height
      "group-data-[state=collapsed]/sidebar:border-b-0",
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
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn(
      "flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 py-2",
      // Collapsed: flatten spacing so icons are evenly spaced
      "group-data-[state=collapsed]/sidebar:gap-0 group-data-[state=collapsed]/sidebar:py-0",
      "group-data-[state=collapsed]/sidebar:overflow-x-hidden",
      className,
    )}
    {...props}
  />
));

SidebarContent.displayName = "Sidebar.Content";

// ============================================================================
// Sidebar Footer
// ============================================================================

/**
 * Bottom-pinned footer of the sidebar. Contains the toggle trigger and optional
 * action buttons. Hovering the footer does **not** trigger peeking — it
 * explicitly cancels any active peek so the sidebar stays collapsed.
 *
 * Matches Stratus NavFooter dimensions: `h-12`, `px-3.5`, `w-[260px]` expanded,
 * fixed to viewport bottom when collapsed.
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
>(({ className, onMouseEnter, ...props }, ref) => {
  const { stopPeek } = useSidebar();

  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn(
        "flex h-12 shrink-0 items-center gap-4 overflow-hidden whitespace-nowrap border-t border-kumo-line px-3.5",
        "bg-kumo-base",
        // Width tracks the sidebar — expanded uses full sidebar width
        "w-(--sidebar-width)",
        // Transition width to match sidebar expand/collapse animation
        "transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
        "motion-reduce:transition-none",
        // Sticky keeps the footer pinned to the bottom of the sidebar
        // (container-relative), unlike fixed which would escape demo bounds.
        "sticky bottom-0",
        // When collapsed: icon-only width, add right border
        "group-data-[state=collapsed]/sidebar:w-(--sidebar-width-icon)",
        "group-data-[state=collapsed]/sidebar:border-r group-data-[state=collapsed]/sidebar:border-kumo-line",
        className,
      )}
      onMouseEnter={(e) => {
        // Prevent peeking when mouse enters or hovers over the footer
        stopPeek();
        onMouseEnter?.(e);
      }}
      {...props}
    />
  );
});

SidebarFooter.displayName = "Sidebar.Footer";

// ============================================================================
// Sidebar Group
// ============================================================================

// ============================================================================
// Unified collapse context (powers both Group and Collapsible)
// ============================================================================

/**
 * Shared context for sidebar collapsible sections.
 * Used by both `Sidebar.Group` (collapsible) and `Sidebar.Collapsible`.
 * Provides open state, toggle, and a generated content ID for
 * `aria-controls` / `aria-hidden` wiring.
 */
interface SidebarCollapseContextValue {
  isCollapsible: boolean;
  isOpen: boolean;
  contentId: string;
  toggle: () => void;
}

const SidebarCollapseContext = createContext<SidebarCollapseContextValue>({
  isCollapsible: false,
  isOpen: true,
  contentId: "",
  toggle: () => { },
});

export interface SidebarGroupProps extends ComponentPropsWithoutRef<"div"> {
  /** When true, the group can be expanded/collapsed via its label. @default false */
  collapsible?: boolean;
  /** Initial open state when collapsible and uncontrolled. @default true */
  defaultOpen?: boolean;
  /** Controlled open state (collapsible mode only). */
  open?: boolean;
  /** Callback when open state changes (collapsible mode only). */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Groups related menu items with an optional label.
 * When `collapsible` is set, wraps content with Base UI Collapsible for
 * animated expand/collapse via the group label.
 *
 * @example Non-collapsible group
 * ```tsx
 * <Sidebar.Group>
 *   <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
 *   <Sidebar.Menu>...</Sidebar.Menu>
 * </Sidebar.Group>
 * ```
 *
 * @example Collapsible group (requires GroupContent for animation)
 * ```tsx
 * <Sidebar.Group collapsible defaultOpen>
 *   <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
 *   <Sidebar.GroupContent>
 *     <Sidebar.Menu>...</Sidebar.Menu>
 *   </Sidebar.GroupContent>
 * </Sidebar.Group>
 * ```
 */
const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  (
    {
      className,
      collapsible = false,
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = openProp ?? internalOpen;
    const contentId = useId();

    const toggle = useCallback(() => {
      const next = !isOpen;
      setInternalOpen(next);
      onOpenChange?.(next);
    }, [isOpen, onOpenChange]);

    const contextValue = useMemo<SidebarCollapseContextValue>(
      () => ({ isCollapsible: collapsible, isOpen, contentId, toggle }),
      [collapsible, isOpen, contentId, toggle],
    );

    return (
      <SidebarCollapseContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-sidebar="group"
          className={cn(
            "flex min-w-0 flex-col gap-0.5",
            // Collapsed: remove internal gap so icons stack uniformly
            "group-data-[state=collapsed]/sidebar:gap-0",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </SidebarCollapseContext.Provider>
    );
  },
);

SidebarGroup.displayName = "Sidebar.Group";

// ============================================================================
// Sidebar GroupLabel
// ============================================================================

/**
 * Section label for a sidebar group (e.g., "Build", "Protect & Connect").
 * Hidden when the sidebar is collapsed to icon-only mode.
 *
 * When used inside a collapsible `Sidebar.Group`, renders as a
 * `Collapsible.Trigger` with an auto-rotating chevron.
 *
 * @example
 * ```tsx
 * <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
 * ```
 */
const SidebarGroupLabel = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { isCollapsible, isOpen, contentId, toggle } =
    useContext(SidebarCollapseContext);

  if (isCollapsible) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        data-sidebar="group-label"
        data-open={isOpen ? "" : undefined}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={toggle}
        className={cn(
          "group/group-label flex w-full cursor-pointer items-center px-3 py-1 text-xs font-medium text-kumo-subtle",
          "group-data-[state=collapsed]/sidebar:hidden",
          className,
        )}
        {...(props as ComponentPropsWithoutRef<"button">)}
      >
        <span className="flex-1 truncate text-left">{children}</span>
        <CaretRightIcon
          size={12}
          weight="bold"
          className={cn(
            "ml-auto size-3 shrink-0 text-kumo-subtle transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>
    );
  }

  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "truncate px-3 py-1 text-xs font-medium text-kumo-subtle",
        "group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

SidebarGroupLabel.displayName = "Sidebar.GroupLabel";

// ============================================================================
// Sidebar GroupContent
// ============================================================================

/**
 * Animation wrapper for collapsible group content. Uses CSS grid-rows
 * for smooth height transitions when the group is expanded/collapsed.
 *
 * **Only needed for collapsible groups.** For non-collapsible groups,
 * place `Menu` directly inside `Group` — no wrapper required.
 *
 * @example Collapsible group (GroupContent required)
 * ```tsx
 * <Sidebar.Group collapsible defaultOpen>
 *   <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
 *   <Sidebar.GroupContent>
 *     <Sidebar.Menu>...</Sidebar.Menu>
 *   </Sidebar.GroupContent>
 * </Sidebar.Group>
 * ```
 *
 * @example Non-collapsible group (no GroupContent needed)
 * ```tsx
 * <Sidebar.Group>
 *   <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
 *   <Sidebar.Menu>...</Sidebar.Menu>
 * </Sidebar.Group>
 * ```
 */
const SidebarGroupContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { isCollapsible, isOpen, contentId } =
    useContext(SidebarCollapseContext);

  if (isCollapsible) {
    return (
      <div
        ref={ref}
        id={contentId}
        role="region"
        data-sidebar="group-content"
        aria-hidden={!isOpen}
        {...(!isOpen ? ({ inert: "" } as Record<string, string>) : {})}
        className={cn(
          "grid",
          // Animate height via grid-rows — uses configurable duration + easing from Provider
          "transition-[grid-template-rows] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
          "motion-reduce:transition-none",
          // Default: collapsed
          "grid-rows-[0fr]",
          // When sidebar is expanded, respect group open/close state
          isOpen
            ? "group-data-[state=expanded]/sidebar:grid-rows-[1fr]"
            : "group-data-[state=expanded]/sidebar:grid-rows-[0fr]",
          className,
        )}
        {...props}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("flex flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
});

SidebarGroupContent.displayName = "Sidebar.GroupContent";

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
 * @example With explicit MenuItem (needed for MenuAction sibling)
 * ```tsx
 * <Sidebar.Menu>
 *   <Sidebar.MenuItem>
 *     <Sidebar.MenuButton icon={GearIcon}>Settings</Sidebar.MenuButton>
 *     <Sidebar.MenuAction><PencilIcon /></Sidebar.MenuAction>
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
      "m-0 flex min-w-0 list-none flex-col gap-0.5 p-0",
      "group-data-[state=collapsed]/sidebar:gap-0",
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
 * explicitly when you need to place siblings (e.g., `MenuAction`) alongside
 * a `MenuButton`.
 *
 * @example Explicit usage (needed for MenuAction sibling)
 * ```tsx
 * <Sidebar.MenuItem>
 *   <Sidebar.MenuButton icon={GearIcon}>Settings</Sidebar.MenuButton>
 *   <Sidebar.MenuAction><PencilIcon /></Sidebar.MenuAction>
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
      className={cn("relative", className)}
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
  tooltip?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Primary interactive element inside a menu item. Renders as a `<button>` or link.
 * Supports icons, active state, and auto-tooltip when the sidebar is collapsed.
 *
 * **Auto-wraps in `<li>`** when not already inside a `Sidebar.MenuItem`.
 * Use `MenuItem` explicitly only when you need siblings (e.g., `MenuAction`).
 *
 * When used as a `Collapsible.Trigger` via `render` prop, the expand/collapse chevron
 * auto-rotates thanks to Base UI's `data-panel-open` attribute combined with
 * `group/menu-button` CSS grouping.
 *
 * @example Simple usage (auto-wrapped in `<li>`)
 * ```tsx
 * <Sidebar.Menu>
 *   <Sidebar.MenuButton icon={GlobeIcon} active>Domains</Sidebar.MenuButton>
 *   <Sidebar.MenuButton icon={ClockIcon} href="/recents">Recents</Sidebar.MenuButton>
 * </Sidebar.Menu>
 * ```
 *
 * @example With MenuAction sibling (explicit MenuItem needed)
 * ```tsx
 * <Sidebar.MenuItem>
 *   <Sidebar.MenuButton icon={GearIcon}>Settings</Sidebar.MenuButton>
 *   <Sidebar.MenuAction><PencilIcon /></Sidebar.MenuAction>
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
      tooltip,
      children,
      ...props
    },
    ref,
  ) => {
    const { state } = useSidebar();
    const LinkComponent = useLinkComponent();
    const isInsideMenuItem = useContext(MenuItemContext);

    // Render icon — supports both component types and React elements
    const iconNode = (() => {
      if (!IconProp) return null;
      if (React.isValidElement(IconProp)) return IconProp;
      const Comp = IconProp as React.ComponentType<{ className?: string }>;
      return (
        <Comp
          className={cn("shrink-0", size === "base" ? "size-4" : "size-3.5")}
        />
      );
    })();

    const content = (
      <>
        {iconNode}
        <span
          className={cn(
            "flex flex-1 items-center min-w-0 text-left overflow-hidden",
            "group-data-[state=collapsed]/sidebar:hidden",
          )}
        >
          {children}
        </span>
      </>
    );

    const buttonClasses = cn(
      // Layout
      "group/menu-button flex w-full min-w-0 items-center gap-2 rounded-lg outline-none cursor-pointer",
      // Sizing
      size === "base" && "min-h-[34px] px-3 py-1.5 text-sm font-medium",
      size === "sm" && "min-h-[28px] px-2 py-1 text-sm",
      // Default state — transition includes padding so collapsed centering animates smoothly
      "text-kumo-default",
      "transition-[color,background-color,padding] duration-0 ease-(--sidebar-easing)",
      // Icon color
      "[&>svg]:text-kumo-subtle",
      !active && "hover:bg-kumo-tint",
      // Active state
      active && "bg-kumo-tint",
      // When a child sub-button is active, don't show active styling on the parent trigger
      "has-[[data-active]]:bg-transparent has-[[data-active]]:hover:bg-kumo-tint",
      // Focus
      "focus-visible:ring-1 focus-visible:ring-kumo-ring",
      // Collapsed: px-2 centers the icon (48px sidebar − 16px content padding = 32px;
      // 32px − 2×8px padding = 16px = icon size). Padding transition keeps it smooth.
      "group-data-[state=collapsed]/sidebar:px-2",
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
          data-active={active || undefined}
          data-sidebar="menu-button"
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
          data-size={size}
          {...props}
        >
          {content}
        </button>
      );
    }

    // Wrap in Tooltip when collapsed and tooltip text is provided.
    // Use asChild so TooltipTrigger merges onto the button/link via render prop
    // instead of wrapping it in another <button> (which would cause invalid nesting).
    if (state === "collapsed" && tooltip) {
      button = (
        <Tooltip content={tooltip} side="right" asChild>
          {button}
        </Tooltip>
      );
    }

    // Auto-wrap in <li> when not already inside a MenuItem
    if (!isInsideMenuItem) {
      return (
        <li data-sidebar="menu-item" className="relative">
          {button}
        </li>
      );
    }

    return button;
  },
);

SidebarMenuButton.displayName = "Sidebar.MenuButton";

// ============================================================================
// Sidebar MenuAction
// ============================================================================

/**
 * Right-aligned action button inside a menu item (e.g., settings gear, plus icon).
 * Positioned absolutely so it overlays the menu button.
 * Hidden when the sidebar is collapsed.
 */
const SidebarMenuAction = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-sidebar="menu-action"
    className={cn(
      "absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1",
      "text-kumo-strong hover:bg-kumo-overlay",
      "transition-colors duration-150",
      "group-data-[state=collapsed]/sidebar:hidden",
      className,
    )}
    {...props}
  />
));

SidebarMenuAction.displayName = "Sidebar.MenuAction";

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
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "m-0 ml-3.5 flex min-w-0 list-none flex-col gap-0.5 border-l border-kumo-line p-0 pl-2.5",
      // Hidden when collapsed
      "group-data-[state=collapsed]/sidebar:hidden",
      className,
    )}
    {...props}
  />
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
    "flex w-full min-w-0 items-center gap-2 rounded-lg min-h-[34px] px-3 py-1 text-sm font-medium outline-none",
    "text-kumo-default transition-colors duration-150",
    !active && "hover:bg-kumo-tint",
    active && "bg-kumo-tint",
    "focus-visible:ring-1 focus-visible:ring-kumo-ring",
    className,
  );

  const content = <span className="flex-1 truncate text-left">{children}</span>;

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
  HTMLHRElement,
  ComponentPropsWithoutRef<"hr">
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    data-sidebar="separator"
    className={cn("mx-2 min-h-px h-px border-0 bg-kumo-line", className)}
    {...props}
  />
));

SidebarSeparator.displayName = "Sidebar.Separator";

// ============================================================================
// Sidebar Input
// ============================================================================

export interface SidebarInputProps extends ComponentPropsWithoutRef<"button"> {
  /** Placeholder text displayed inside the search trigger. @default "Search..." */
  placeholder?: string;
  /** Keyboard shortcut hint (e.g., "⌘K"). */
  shortcut?: string;
}

/**
 * Search trigger button styled as an input. Typically opens a command palette.
 *
 * @example
 * ```tsx
 * <Sidebar.Input placeholder="Quick search..." shortcut="⌘K" onClick={openSearch} />
 * ```
 */
const SidebarInput = forwardRef<HTMLButtonElement, SidebarInputProps>(
  (
    { className, placeholder = "Search...", shortcut, children, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      data-sidebar="input"
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
        "bg-kumo-base text-kumo-subtle ring ring-kumo-line",
        "transition-[color,background-color,padding,box-shadow] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
        "hover:bg-kumo-overlay",
        // Collapsed: icon-only, padding centers icon, ring fades via box-shadow transition
        "group-data-[state=collapsed]/sidebar:px-2 group-data-[state=collapsed]/sidebar:ring-0",
        className,
      )}
      {...props}
    >
      <MagnifyingGlassIcon className="size-4 shrink-0 text-kumo-subtle" />
      <span className="flex-1 truncate text-left group-data-[state=collapsed]/sidebar:hidden">
        {children ?? placeholder}
      </span>
      {shortcut && (
        <kbd className="ml-auto font-sans text-xs text-kumo-subtle group-data-[state=collapsed]/sidebar:hidden">
          {shortcut}
        </kbd>
      )}
    </button>
  ),
);

SidebarInput.displayName = "Sidebar.Input";

// ============================================================================
// Sidebar Trigger
// ============================================================================

/**
 * Animated sidebar panel icon. The vertical divider line slides to indicate
 * the current expand/collapse state — matches the Stratus NavFooter icon.
 */
function SidebarPanelIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
    >
      <path d="M21.25 6.72v10.56a2.97 2.97 0 0 1-2.97 2.97H5.72a2.97 2.97 0 0 1-2.97-2.97V6.72a2.97 2.97 0 0 1 2.97-2.97h12.56a2.97 2.97 0 0 1 2.97 2.97" />
      <path
        d="M6.25 7.25v9.5"
        className={cn(
          "transition-transform duration-250",
          open ? "translate-x-px" : "translate-x-[10.5px]",
        )}
      />
    </svg>
  );
}

/** Resolve the display label for the keyboard shortcut (e.g. "⌘B"). */
function formatShortcutHint(shortcut: string): { mod: string; key: string } {
  const parts = shortcut.toLowerCase().split("+");
  const key = parts[parts.length - 1].toUpperCase();
  const hasMod = parts.includes("mod");
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent);
  const mod = hasMod ? (isMac ? "⌘" : "Ctrl") : "";
  return { mod, key };
}

/**
 * Button that toggles the sidebar open/collapsed. Renders an animated panel
 * icon and a tooltip with the keyboard shortcut hint (when `keyboardShortcut`
 * is configured on the Provider).
 *
 * Matches Stratus NavFooter trigger: `size-7`, ghost variant, tooltip on hover.
 *
 * @example
 * ```tsx
 * <Sidebar.Footer>
 *   <Sidebar.Trigger />
 * </Sidebar.Footer>
 * ```
 */
const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button">
>(({ className, children, onClick, ...props }, ref) => {
  const { toggleSidebar, open, keyboardShortcut } = useSidebar();

  const isTouchScreen =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer:coarse)").matches;

  const label = open ? "Collapse sidebar" : "Expand sidebar";

  const shortcutHint = keyboardShortcut
    ? formatShortcutHint(keyboardShortcut)
    : null;

  const tooltipContent =
    !isTouchScreen && shortcutHint ? (
      <span className="inline-flex items-center gap-2">
        {label}{" "}
        <span className="inline-flex items-center text-xs">
          <span className="opacity-50">{shortcutHint.mod}</span>
          {shortcutHint.key}
        </span>
      </span>
    ) : !isTouchScreen ? (
      label
    ) : undefined;

  const button = (
    <button
      ref={ref}
      type="button"
      data-sidebar="trigger"
      aria-label={label}
      aria-expanded={open}
      {...(shortcutHint
        ? {
          "aria-keyshortcuts":
            shortcutHint.mod === "⌘"
              ? `Meta+${shortcutHint.key}`
              : `Control+${shortcutHint.key}`,
        }
        : {})}
      className={cn(
        "grid size-7 place-items-center rounded-md",
        "text-kumo-subtle hover:text-kumo-strong hover:bg-kumo-overlay",
        "transition-colors duration-150",
        "[&_svg]:pointer-events-none",
        className,
      )}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      {...props}
    >
      {children ?? <SidebarPanelIcon open={open} />}
    </button>
  );

  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent} side="top" asChild>
        {button}
      </Tooltip>
    );
  }

  return button;
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
      aria-label="Toggle sidebar"
      tabIndex={-1}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 cursor-pointer transition-all",
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
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const {
    side,
    resizable,
    setIsResizing,
    setWidth,
    setOpen,
    open,
    minWidth,
  } = useSidebar();
  const startX = useRef(0);
  const startWidth = useRef(0);
  const wasCollapsed = useRef(false);

  if (!resizable) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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

  return (
    <div
      ref={ref}
      data-sidebar="resize-handle"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-1 cursor-col-resize transition-colors sm:block",
        "hover:bg-kumo-brand/30 active:bg-kumo-brand/50",
        side === "left" && "right-0",
        side === "right" && "left-0",
        className,
      )}
      onPointerDown={handlePointerDown}
      {...props}
    />
  );
});

SidebarResizeHandle.displayName = "Sidebar.ResizeHandle";

// ============================================================================
// Sidebar MenuChevron
// ============================================================================

/**
 * Auto-rotating chevron for collapsible menu items. Reads open state from
 * the parent `SidebarCollapseContext` and rotates when open.
 *
 * @example
 * ```tsx
 * <Sidebar.CollapsibleTrigger render={<Sidebar.MenuButton icon={ComputeIcon} />}>
 *   Compute
 *   <Sidebar.MenuChevron />
 * </Sidebar.CollapsibleTrigger>
 * ```
 */
function SidebarMenuChevron({ className }: { className?: string }) {
  const { isOpen } = useContext(SidebarCollapseContext);

  return (
    <CaretRightIcon
      size={12}
      weight="bold"
      className={cn(
        "ml-auto shrink-0 text-kumo-subtle transition-transform duration-200",
        // Rotate when the parent collapsible is open
        isOpen && "rotate-90",
        // Hidden when collapsed
        "group-data-[state=collapsed]/sidebar:hidden",
        className,
      )}
    />
  );
}

SidebarMenuChevron.displayName = "Sidebar.MenuChevron";

// ============================================================================
// Collapsible re-exports
// ============================================================================

export interface SidebarCollapsibleProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Initial open state (uncontrolled). @default false */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Collapsible root for sidebar sub-menu expand/collapse.
 * Manages open state internally and shares it with children
 * via `SidebarCollapseContext`.
 *
 * @example
 * ```tsx
 * <Sidebar.Collapsible defaultOpen>
 *   <Sidebar.CollapsibleTrigger render={<Sidebar.MenuButton icon={CodeIcon} />}>
 *     Compute <Sidebar.MenuChevron />
 *   </Sidebar.CollapsibleTrigger>
 *   <Sidebar.CollapsibleContent>
 *     <Sidebar.MenuSub>...</Sidebar.MenuSub>
 *   </Sidebar.CollapsibleContent>
 * </Sidebar.Collapsible>
 * ```
 */
const SidebarCollapsible = forwardRef<HTMLDivElement, SidebarCollapsibleProps>(
  (
    {
      defaultOpen = false,
      open: openProp,
      onOpenChange,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isOpen = openProp ?? internalOpen;
    const contentId = useId();

    const toggle = useCallback(() => {
      const next = !isOpen;
      setInternalOpen(next);
      onOpenChange?.(next);
    }, [isOpen, onOpenChange]);

    const contextValue = useMemo<SidebarCollapseContextValue>(
      () => ({ isCollapsible: true, isOpen, contentId, toggle }),
      [isOpen, contentId, toggle],
    );

    return (
      <SidebarCollapseContext.Provider value={contextValue}>
        <div ref={ref} {...props}>
          {children}
        </div>
      </SidebarCollapseContext.Provider>
    );
  },
);

SidebarCollapsible.displayName = "Sidebar.Collapsible";

export interface SidebarCollapsibleTriggerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /**
   * Element to render as the trigger. The collapsible trigger props
   * (`onClick`, `aria-expanded`, `aria-controls`, `data-open`) are
   * merged onto this element via `React.cloneElement`.
   */
  render: React.ReactElement<Record<string, unknown>>;
  children?: ReactNode;
}

/**
 * Trigger for sidebar collapsible sub-menus. Use the `render` prop to
 * compose with `Sidebar.MenuButton`.
 *
 * @example
 * ```tsx
 * <Sidebar.CollapsibleTrigger render={<Sidebar.MenuButton icon={DiamondIcon} />}>
 *   Compute
 *   <Sidebar.MenuChevron />
 * </Sidebar.CollapsibleTrigger>
 * ```
 */
const SidebarCollapsibleTrigger = forwardRef<
  HTMLButtonElement,
  SidebarCollapsibleTriggerProps
>(({ render, children, ...props }, ref) => {
  const { isOpen, contentId, toggle } = useContext(SidebarCollapseContext);

  const renderProps = render.props as Record<string, unknown>;

  // Merge trigger props onto the render element
  return React.cloneElement(render, {
    ref,
    "aria-expanded": isOpen,
    "aria-controls": contentId,
    "data-open": isOpen ? "" : undefined,
    onClick: (e: React.MouseEvent) => {
      toggle();
      // Preserve any existing onClick on the render element
      if (typeof renderProps.onClick === "function") {
        (renderProps.onClick as (e: React.MouseEvent) => void)(e);
      }
    },
    children: (
      <>
        {renderProps.children as ReactNode}
        {children}
      </>
    ),
    ...props,
  } as Record<string, unknown>);
});

SidebarCollapsibleTrigger.displayName = "Sidebar.CollapsibleTrigger";

/**
 * Animated collapsible content for sidebar sub-menus.
 * Uses the CSS grid-rows technique for smooth height transitions.
 * Includes `aria-hidden` and `inert` on collapsed content for
 * proper accessibility semantics.
 *
 * Animation flow:
 * - **Opening**: `isOpen` → `grid-rows-[1fr]` — CSS transition from 0fr
 * - **Closing**: `!isOpen` → `grid-rows-[0fr]` — CSS transition from 1fr
 */
const SidebarCollapsibleContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  const { isOpen, contentId } = useContext(SidebarCollapseContext);

  return (
    <div
      ref={ref}
      id={contentId}
      role="region"
      data-sidebar="collapsible-content"
      aria-hidden={!isOpen}
      {...(!isOpen ? ({ inert: "" } as Record<string, string>) : {})}
      className={cn(
        "grid",
        // Animate height via grid-rows — same technique as SidebarGroupContent
        "transition-[grid-template-rows] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)",
        "motion-reduce:transition-none",
        // Default: collapsed
        "grid-rows-[0fr]",
        // When open, expand
        isOpen && "grid-rows-[1fr]",
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
// Sidebar SlidingView (individual surface)
// ============================================================================

export interface SidebarSlidingViewProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Unique key identifying this view surface. */
  value: string;
}

/**
 * Individual panel inside `Sidebar.SlidingViews`. Each view is full-width
 * and only the active one is interactive; inactive views are hidden via
 * `aria-hidden` and `inert`.
 *
 * @example
 * ```tsx
 * <Sidebar.SlidingViews activeKey="account">
 *   <Sidebar.SlidingView value="account">...</Sidebar.SlidingView>
 *   <Sidebar.SlidingView value="zone">...</Sidebar.SlidingView>
 * </Sidebar.SlidingViews>
 * ```
 */
const SidebarSlidingView = forwardRef<HTMLDivElement, SidebarSlidingViewProps>(
  ({ value, className, children, ...props }, ref) => {
    const isActive = useContext(SlidingViewActiveContext) === value;
    const shouldReduceMotion = useContext(SlidingViewReducedMotionContext);

    return (
      <div
        ref={ref}
        data-sidebar="sliding-view"
        data-surface-key={value}
        aria-hidden={!isActive}
        className={cn(
          "h-full min-w-full w-full shrink-0",
          "transition-[visibility] duration-0",
          isActive
            ? "visible"
            : cn(
              "invisible pointer-events-none",
              shouldReduceMotion ? "delay-0" : "delay-250",
            ),
          className,
        )}
        {...(isActive ? {} : ({ inert: "" } as Record<string, string>))}
        {...props}
      >
        {children}
      </div>
    );
  },
);

SidebarSlidingView.displayName = "Sidebar.SlidingView";

// ============================================================================
// Sidebar SlidingViews (track container)
// ============================================================================

const SlidingViewActiveContext = createContext<string>("");
const SlidingViewReducedMotionContext = createContext<boolean>(false);

const SLIDE_EASE: [number, number, number, number] = [0.77, 0, 0.175, 1];

export interface SidebarSlidingViewsProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Key of the currently active view. */
  activeKey: string;
  /** Animation direction hint. @default "left" */
  direction?: "left" | "right";
}

/**
 * Horizontally-sliding view container for multi-surface sidebar navigation
 * (e.g., account nav ↔ zone nav). Uses `motion/react` for smooth
 * slide transitions matching the Stratus production easing curve.
 *
 * Respects `prefers-reduced-motion` — disables animation when active.
 *
 * @example
 * ```tsx
 * <Sidebar.SlidingViews activeKey={surface} direction={slideDirection}>
 *   <Sidebar.SlidingView value="account">
 *     <Sidebar.Content>...</Sidebar.Content>
 *   </Sidebar.SlidingView>
 *   <Sidebar.SlidingView value="zone">
 *     <Sidebar.Content>...</Sidebar.Content>
 *   </Sidebar.SlidingView>
 * </Sidebar.SlidingViews>
 * ```
 */
const SidebarSlidingViews = forwardRef<HTMLDivElement, SidebarSlidingViewsProps>(
  ({ activeKey, direction = "left", className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion() ?? false;
    const { animationDuration } = useSidebar();

    // Compute active index from children order
    const childArray = Children.toArray(children).filter(isValidElement);
    const activeIndex = Math.max(
      0,
      childArray.findIndex(
        (child) =>
          isValidElement(child) &&
          (child.props as SidebarSlidingViewProps).value === activeKey,
      ),
    );

    // Convert ms → seconds for motion/react
    const durationSec = shouldReduceMotion ? 0 : animationDuration / 1000;

    return (
      <SlidingViewActiveContext.Provider value={activeKey}>
        <SlidingViewReducedMotionContext.Provider value={shouldReduceMotion}>
          <div
            ref={ref}
            data-sidebar="sliding-views"
            data-direction={direction}
            className={cn(
              "relative min-h-0 flex-1 overflow-hidden",
              className,
            )}
            {...props}
          >
            <motion.div
              className="flex h-full w-full"
              initial={false}
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{
                type: "tween",
                ease: SLIDE_EASE,
                duration: durationSec,
              }}
            >
              {children}
            </motion.div>
          </div>
        </SlidingViewReducedMotionContext.Provider>
      </SlidingViewActiveContext.Provider>
    );
  },
);

SidebarSlidingViews.displayName = "Sidebar.SlidingViews";

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * Sidebar — responsive navigation panel with expand/collapse support.
 *
 * Compound component: `Sidebar` (root `<aside>`), `.Provider`, `.Header`,
 * `.Content`, `.Footer`, `.Group`, `.GroupLabel`, `.GroupContent`,
 * `.Menu`, `.MenuItem`, `.MenuButton`, `.MenuAction`, `.MenuBadge`,
 * `.MenuSub`, `.MenuSubItem`, `.MenuSubButton`, `.Separator`,
 * `.Input`, `.Trigger`, `.Rail`, `.MenuChevron`,
 * `.Collapsible`, `.CollapsibleTrigger`, `.CollapsibleContent`,
 * `.SlidingViews`, `.SlidingView`.
 *
 * Built on `@base-ui/react/collapsible` + `@base-ui/react/dialog`.
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
  GroupContent: SidebarGroupContent,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  MenuButton: SidebarMenuButton,
  MenuAction: SidebarMenuAction,
  MenuBadge: SidebarMenuBadge,
  MenuSub: SidebarMenuSub,
  MenuSubItem: SidebarMenuSubItem,
  MenuSubButton: SidebarMenuSubButton,
  Separator: SidebarSeparator,
  Input: SidebarInput,
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
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarInput,
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
