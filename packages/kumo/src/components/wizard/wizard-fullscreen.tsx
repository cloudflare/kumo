import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { XIcon } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import {
  KumoPortalProvider,
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";
import { widthValueMap, type WizardWidth } from "./wizard-shared";

export interface WizardFullscreenContextValue {
  /** Ref to the close button, used by Wizard's focus trap to include it. */
  closeButtonRef: { current: HTMLButtonElement | null } | null;
  /** Ref to the header content wrapper, used by Wizard's focus trap. */
  headerContentRef: { current: HTMLDivElement | null } | null;
  /** Close handler from Wizard.Fullscreen. */
  onClose?: () => void;
  /** Resolved close-button aria-label. */
  closeLabel: string;
}

export const WizardFullscreenContext =
  createContext<WizardFullscreenContextValue | null>(null);

/**
 * Hook to access the fullscreen container context.
 * @internal
 */
export function useWizardFullscreen(): WizardFullscreenContextValue | null {
  return useContext(WizardFullscreenContext);
}

function useRequiredWizardFullscreen(): WizardFullscreenContextValue {
  const context = useWizardFullscreen();
  if (!context) {
    throw new Error(
      "Wizard.CloseButton must be rendered inside <Wizard.Fullscreen>.",
    );
  }
  return context;
}

// Labels for internationalization of Wizard.Fullscreen aria-labels. All fields are optional with English defaults.
export interface WizardFullscreenLabels {
  // Aria label for the close button. @default "Close"
  close?: string;
}

const DEFAULT_FULLSCREEN_LABELS: Required<WizardFullscreenLabels> = {
  close: "Close",
};

export interface WizardFullscreenProps {
  /**
   * Accessible name for the dialog container (screen-reader only).
   * Sets `aria-label` on the `role="dialog"` element.
   * @default "Fullscreen container"
   */
  "aria-label"?: string;
  /** Wizard content. */
  children: ReactNode;
  /** Override content wrapper classes. */
  className?: string;
  /**
   * Container element for the portal. Use this to render the wizard inside
   * a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.
   * @default document.body (or KumoPortalProvider container if set)
   */
  container?: PortalContainer;
  /**
   * Optional header rendered above the wizard content. When provided,
   * the automatic floating close button is suppressed — use
   * `<Wizard.CloseButton />` inside the header to place it where you want.
   * Header height is measured and exposed as `--wizard-header-height`.
   */
  header?: ReactNode;
  // Labels for internationalization of aria-labels. All labels have English defaults.
  labels?: WizardFullscreenLabels;
  /** Callback when the container requests close (Escape key or close button). */
  onClose?: () => void;
  /** Controls visibility. Returns `null` when `false`. */
  open?: boolean;
  /**
   * Card width preset. Sets `--wizard-card-max-width` on the dialog root
   * so both `Wizard` and `Wizard.Grid` inherit the value.
   * @default "narrow"
   */
  width?: WizardWidth;
}

export interface WizardCloseButtonProps {
  /** Additional CSS classes applied to the button element. */
  className?: string;
}

/**
 * Close button for Wizard.Fullscreen. Must be rendered inside a
 * `Wizard.Fullscreen`. Uses the fullscreen context for `onClose`,
 * `aria-label`, and focus-trap ref.
 *
 * @example
 * ```tsx
 * <Wizard.Fullscreen header={<MyHeader />}>
 *   ...
 * </Wizard.Fullscreen>
 *
 * function MyHeader() {
 *   return (
 *     <div className="flex h-12 items-center">
 *       <span>Title</span>
 *       <Wizard.CloseButton />
 *     </div>
 *   );
 * }
 * ```
 */
export function WizardCloseButton({ className }: WizardCloseButtonProps) {
  const { closeButtonRef, onClose, closeLabel } = useRequiredWizardFullscreen();

  return (
    <Button
      aria-label={closeLabel}
      className={className}
      icon={<XIcon weight="bold" className="size-4" />}
      onClick={onClose}
      ref={closeButtonRef as React.Ref<HTMLButtonElement>}
      shape="square"
      variant="ghost"
    />
  );
}

WizardCloseButton.displayName = "Wizard.CloseButton";

let scrollLockCount = 0;

function lockScroll() {
  if (typeof document === "undefined") return;
  scrollLockCount++;
  if (scrollLockCount === 1) {
    document.body.classList.add("overflow-hidden");
  }
}

function unlockScroll() {
  if (typeof document === "undefined") return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.classList.remove("overflow-hidden");
  }
}

/**
 * Fullscreen modal container for wizard flows. Renders via `createPortal`
 * with `role="dialog"`, `aria-modal`, scroll lock, Escape-to-close, and a
 * floating close button. Portals into the resolved container
 * (prop → KumoPortalProvider → document.body).
 *
 * @example
 * ```tsx
 * <Wizard.Fullscreen open={isOpen} onClose={handleClose}>
 *   <Wizard step={step} onStepChange={setStep}>...</Wizard>
 * </Wizard.Fullscreen>
 * ```
 */
export const WizardFullscreen = forwardRef<
  HTMLDivElement,
  WizardFullscreenProps
>(function WizardFullscreen(
  {
    "aria-label": ariaLabel = "Fullscreen container",
    children,
    className,
    container: containerProp,
    header,
    labels: labelsProp,
    onClose,
    open,
    width = "narrow",
  },
  ref,
) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerContentRef = useRef<HTMLDivElement | null>(null);
  const headerShellRef = useRef<HTMLDivElement | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  // Measure header height with ResizeObserver
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const el = headerShellRef.current;
    if (!el) {
      setHeaderHeight(0);
      return;
    }

    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setHeaderHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [header != null]);

  // Resolve portal container: prop → KumoPortalProvider context → document.body
  const contextContainer = usePortalContainer();
  const resolvedContainer =
    containerProp ??
    contextContainer ??
    (typeof document !== "undefined" ? document.body : null);

  // Merge provided labels with defaults
  const labels = useMemo<Required<WizardFullscreenLabels>>(
    () => ({ ...DEFAULT_FULLSCREEN_LABELS, ...labelsProp }),
    [labelsProp],
  );

  // Context includes close handler and label so WizardCloseButton works
  const contextValue = useMemo<WizardFullscreenContextValue>(
    () => ({
      closeButtonRef,
      headerContentRef,
      onClose,
      closeLabel: labels.close,
    }),
    [onClose, labels.close],
  );

  // Scroll lock — ref-counted so multiple overlays coexist
  useEffect(() => {
    if (!open) return;

    lockScroll();

    return () => unlockScroll();
  }, [open]);

  // Escape-to-close
  useEffect(() => {
    if (!open || !onClose) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose!();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Don't render when closed, or during SSR
  if (!open) return null;

  if (typeof document === "undefined") return null;

  const rootClassName =
    "fixed inset-0 isolate bg-kumo-canvas flex flex-col outline-none";

  const hasHeader = header != null;

  function renderShellContents() {
    return (
      <>
        {hasHeader ? (
          <header ref={headerShellRef} className="shrink-0">
            <div ref={headerContentRef}>{header}</div>
          </header>
        ) : (
          <div className="absolute end-4 top-4 z-10">
            <WizardCloseButton />
          </div>
        )}
        <div
          className={cn("@container/wizard grow overflow-hidden", className)}
        >
          {children}
        </div>
      </>
    );
  }

  const rootElement = (
    <div
      aria-label={ariaLabel}
      aria-modal="true"
      className={rootClassName}
      ref={(node) => {
        portalContainerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      role="dialog"
      style={
        {
          "--wizard-card-max-width": widthValueMap[width],
          "--wizard-header-height": `${headerHeight}px`,
        } as React.CSSProperties
      }
      tabIndex={-1}
    >
      {/* Provider wraps entire tree so floating close and header close both work */}
      <WizardFullscreenContext.Provider value={contextValue}>
        {renderShellContents()}
      </WizardFullscreenContext.Provider>
    </div>
  );

  const portalTarget =
    resolvedContainer && "current" in resolvedContainer
      ? resolvedContainer.current
      : resolvedContainer;

  if (!portalTarget) return null;

  return createPortal(
    <KumoPortalProvider container={portalContainerRef}>
      {rootElement}
    </KumoPortalProvider>,
    portalTarget,
  );
});

WizardFullscreen.displayName = "Wizard.Fullscreen";
