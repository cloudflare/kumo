import {
  Toast,
  ToastManagerAddOptions,
  ToastObject,
} from "@base-ui/react/toast";
import type React from "react";
import { cn } from "../../utils/cn";
import { Button, ButtonProps } from "../../components/button";
import {
  WarningIcon,
  WarningOctagonIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Toast styling configuration for Figma plugin consumption.
 * Toast has no user-facing variants but documents the styling structure.
 */
export const KUMO_TOAST_VARIANTS = {
  root: {
    classes:
      "rounded-lg border border-kumo-fill bg-kumo-control p-4 shadow-lg text-kumo-default",
    description: "Toast container with background, border, and shadow",
  },
  title: {
    classes: "text-[0.975rem] leading-5 font-medium text-kumo-default",
    description: "Toast title with primary text color",
  },
  description: {
    classes: "text-[0.925rem] leading-5 text-kumo-subtle",
    description: "Toast description with muted text color",
  },
  close: {
    classes:
      "absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded border-none bg-transparent text-kumo-subtle hover:bg-kumo-fill-hover hover:text-kumo-strong",
    description: "Close button with X icon",
  },
  variant: {
    default: {
      classes: "border-kumo-fill bg-kumo-control",
      description: "Default toast style",
    },
    error: {
      classes:
        "border-kumo-fill bg-kumo-control [&_[data-toast-icon]]:text-[light-dark(var(--color-red-600),var(--color-red-400))] [&_[data-toast-title]]:text-[light-dark(var(--color-red-600),var(--color-red-400))]",
      description: "Error toast for critical issues",
      icon: WarningOctagonIcon,
    },
    warning: {
      classes:
        "border-kumo-fill bg-kumo-control [&_[data-toast-icon]]:text-[light-dark(var(--color-amber-700),var(--color-amber-500))] [&_[data-toast-title]]:text-[light-dark(var(--color-amber-700),var(--color-amber-500))]",
      description: "Warning toast for cautionary messages",
      icon: WarningIcon,
    },
  },
} as const;

export const KUMO_TOAST_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

/**
 * Toast styling configuration for Figma plugin consumption.
 * Provides structured metadata for generating Toast components in Figma.
 */
export const KUMO_TOAST_STYLING = {
  container: {
    width: 300,
    padding: 16,
    borderRadius: 8,
    background: "color-secondary",
    border: "color-color",
    shadow: "shadow-lg",
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    color: "text-color-surface",
  },
  description: {
    fontSize: 15,
    fontWeight: 400,
    color: "text-color-muted",
  },
  closeButton: {
    size: 20,
    iconSize: 16,
    iconName: "ph-x",
    iconColor: "text-color-muted",
    hoverBackground: "color-color-2",
    hoverColor: "text-color-label",
    borderRadius: 4,
  },
} as const;

// Derived types from KUMO_TOAST_VARIANTS
export type KumoToastVariant = keyof typeof KUMO_TOAST_VARIANTS.variant;
export type KumoToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const KUMO_TOAST_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const satisfies ReadonlyArray<KumoToastPosition>;

const TOAST_VIEWPORT_BASE_CLASSES =
  "fixed z-1 flex w-[calc(100%-2rem)] sm:w-[340px]";

const TOAST_VIEWPORT_POSITION_CLASSES: Record<KumoToastPosition, string> = {
  "top-left": "top-4 left-4 sm:top-8 sm:left-8",
  "top-center":
    "top-4 right-4 left-4 mx-auto sm:top-8 sm:right-auto sm:left-1/2 sm:-translate-x-1/2",
  "top-right": "top-4 right-4 sm:top-8 sm:right-8",
  "bottom-left": "bottom-4 left-4 sm:bottom-8 sm:left-8",
  "bottom-center":
    "right-4 bottom-4 left-4 mx-auto sm:right-auto sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2",
  "bottom-right": "right-4 bottom-4 sm:right-8 sm:bottom-8",
};

const TOAST_ROOT_POSITION_CLASSES: Record<KumoToastPosition, string> = {
  "top-left": "left-0 right-auto top-0 bottom-auto origin-top",
  "top-center": "left-0 right-0 top-0 bottom-auto mx-auto origin-top",
  "top-right": "right-0 left-auto top-0 bottom-auto origin-top",
  "bottom-left": "left-0 right-auto bottom-0 top-auto origin-bottom",
  "bottom-center": "left-0 right-0 bottom-0 top-auto mx-auto origin-bottom",
  "bottom-right": "right-0 left-auto bottom-0 top-auto origin-bottom",
};

type ToastVerticalEdge = "top" | "bottom";
type AnyKumoToast = KumoToastOptions<any>;
type ToastLanes = Record<KumoToastPosition, Array<AnyKumoToast>>;

function getToastVerticalEdge(position: KumoToastPosition): ToastVerticalEdge {
  return position.startsWith("top") ? "top" : "bottom";
}

function groupToastsByPosition(
  toasts: Array<AnyKumoToast>,
  defaultPosition: KumoToastPosition,
): ToastLanes {
  const lanes: ToastLanes = {
    "top-left": [],
    "top-center": [],
    "top-right": [],
    "bottom-left": [],
    "bottom-center": [],
    "bottom-right": [],
  };

  for (const toast of toasts) {
    const resolvedPosition = toast.position ?? defaultPosition;
    lanes[resolvedPosition].push(toast);
  }

  return lanes;
}

export interface KumoToastVariantsProps {
  variant?: KumoToastVariant;
}

export function toastVariants({
  variant = KUMO_TOAST_DEFAULT_VARIANTS.variant,
}: KumoToastVariantsProps = {}) {
  return cn(
    // Base styles for toast root
    "rounded-xl border bg-clip-padding p-4 shadow-lg",
    // Apply variant styles from KUMO_TOAST_VARIANTS
    KUMO_TOAST_VARIANTS.variant[variant].classes,
  );
}

/**
 * Toasty component props.
 *
 * Wrap your app with `<Toasty>` to enable toast notifications.
 * Use `Toast.useToastManager().notify(…)` to create toasts.
 *
 * @example
 * ```tsx
 * // 1. Wrap your app
 * <Toasty>
 *   <App />
 * </Toasty>
 *
 * // 2. Show a toast from any child component
 * const toasts = Toast.useToastManager();
 * toasts.notify({ title: "Saved", description: "Changes saved successfully." });
 * ```
 */
export interface ToastyProps extends KumoToastVariantsProps {
  /** Application content. Toasts render via a portal above this. */
  children: React.ReactNode;
  /** Default position used for toasts unless overridden per toast. @default "bottom-right" */
  position?: KumoToastPosition;
}

type KumoToastOptionsBase = {
  variant?: KumoToastVariant;
  /** Optional per-toast placement override. */
  position?: KumoToastPosition;
  content?: React.ReactNode;
  actions?: Array<ButtonProps>;
  bump?: boolean;
};

export type KumoToastOptions<Data extends object> = ToastObject<Data> &
  KumoToastOptionsBase;

export type KumoToastManagerAddOptions<Data extends object> =
  ToastManagerAddOptions<Data> & KumoToastOptionsBase;

function wrapManagerMethods<
  T extends { add: Function; update: Function; promise: Function },
>(manager: T) {
  return {
    ...manager,

    add: (options: KumoToastManagerAddOptions<any>) => {
      if (options.id) {
        const toasts = (manager as any).toasts as
          | Array<ToastObject<any>>
          | undefined;

        if (toasts) {
          const existingToast = toasts.find((toast) => toast.id === options.id);

          // If toast exists and is not exiting, trigger bump and prevent duplicate
          if (existingToast && existingToast.transitionStatus !== "ending") {
            // Reset animation by disabling then re-enabling
            manager.update(options.id, { bump: false });
            requestAnimationFrame(() => {
              manager.update(options.id, {
                bump: true,
                ...(options.timeout !== undefined && {
                  timeout: options.timeout,
                }),
              });
            });
            return options.id;
          }

          // If toast exists and is exiting, let it finish - don't add duplicate
          if (existingToast && existingToast.transitionStatus === "ending") {
            return options.id;
          }
        }
      }

      return manager.add({
        ...options,
      });
    },

    update: (id: string, options: Partial<KumoToastManagerAddOptions<any>>) => {
      return manager.update(id, {
        ...options,
      });
    },

    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: KumoToastManagerAddOptions<any>;
        success:
          | KumoToastManagerAddOptions<any>
          | ((data: T) => KumoToastManagerAddOptions<any>);
        error:
          | KumoToastManagerAddOptions<any>
          | ((error: Error) => KumoToastManagerAddOptions<any>);
      },
    ) => {
      return manager.promise(promise, {
        loading: { ...options.loading },
        success:
          typeof options.success === "function"
            ? (data: T) => ({
                ...(
                  options.success as (
                    data: T,
                  ) => KumoToastManagerAddOptions<any>
                )(data),
              })
            : { ...options.success },
        error:
          typeof options.error === "function"
            ? (error: Error) => ({
                ...(
                  options.error as (
                    error: Error,
                  ) => KumoToastManagerAddOptions<any>
                )(error),
              })
            : { ...options.error },
      });
    },
  };
}

export const useKumoToastManager = () => {
  const manager = Toast.useToastManager();
  return {
    ...wrapManagerMethods(manager),
    toasts: manager.toasts as Array<KumoToastOptions<any>>,
  };
};

export const createKumoToastManager = () => {
  return wrapManagerMethods(Toast.createToastManager());
};

/**
 * Toasty — toast notification provider and viewport.
 *
 * Renders a `Toast.Provider` with fixed-position viewport lanes.
 * Toasts stack with smooth enter/exit animations, swipe-to-dismiss, and expand-on-hover.
 *
 * Built on `@base-ui/react/toast`.
 *
 * @example
 * ```tsx
 * <Toasty>
 *   <App />
 * </Toasty>
 * ```
 */
export function Toasty({ children, position = "bottom-right" }: ToastyProps) {
  return (
    <Toast.Provider>
      {children}
      <Toast.Portal>
        <ToastViewports defaultPosition={position} />
      </Toast.Portal>
    </Toast.Provider>
  );
}

/** Alias for Toasty — provided for discoverability when migrating from other libraries */
export const ToastProvider = Toasty;

function ToastViewports({
  defaultPosition,
}: {
  defaultPosition: KumoToastPosition;
}) {
  const { toasts } = useKumoToastManager();
  const lanes = groupToastsByPosition(toasts, defaultPosition);

  return KUMO_TOAST_POSITIONS.map((position) => {
    return (
      <ToastViewportLane
        key={position}
        position={position}
        toasts={lanes[position]}
      />
    );
  });
}

function ToastViewportLane({
  position,
  toasts,
}: {
  position: KumoToastPosition;
  toasts: Array<AnyKumoToast>;
}) {
  if (toasts.length === 0) return null;

  return (
    <Toast.Viewport
      data-kumo-toast-viewport="true"
      data-kumo-toast-position={position}
      className={cn(
        TOAST_VIEWPORT_BASE_CLASSES,
        TOAST_VIEWPORT_POSITION_CLASSES[position],
      )}
    >
      <ToastList position={position} toasts={toasts} />
    </Toast.Viewport>
  );
}

function ToastList({
  position,
  toasts,
}: {
  position: KumoToastPosition;
  toasts: Array<AnyKumoToast>;
}) {
  const verticalEdge = getToastVerticalEdge(position);

  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "absolute z-[calc(1000-var(--toast-index))] h-[var(--height)] w-full select-none",
        TOAST_ROOT_POSITION_CLASSES[position],
        toastVariants({ variant: toast.variant }),
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        verticalEdge === "top"
          ? "[--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] data-[starting-style]:[transform:translateY(-150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]"
          : "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] data-[starting-style]:[transform:translateY(150%)] [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
        verticalEdge === "top"
          ? "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']"
          : "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-[ending-style]:opacity-0 data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))] data-[limited]:opacity-0",
        "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        toast.bump && "animate-toast-bump",
      )}
    >
      <div className="absolute inset-0 rounded-[11px] bg-kumo-control/90"></div>
      <Toast.Content className="isolate flex flex-col gap-1 transition-opacity [transition-duration:250ms] data-[behind]:pointer-events-none data-[behind]:opacity-0 data-[expanded]:pointer-events-auto data-[expanded]:opacity-100">
        {toast.content ?? (
          <>
            <div className="flex items-start gap-2">
              <ToastIcon variant={toast.variant} />
              <div className="flex flex-col gap-1 overflow-hidden">
                <Toast.Title
                  data-toast-title
                  className="text-[0.975rem] leading-5 font-medium text-kumo-default"
                />
                <Toast.Description className="text-[0.925rem] leading-5 text-kumo-subtle" />

                {!!toast.actions && (
                  <div className="mt-2 flex min-w-0 flex-nowrap gap-2 overflow-x-auto p-px">
                    {toast.actions.map((actionProps, idx) => (
                      <Button key={idx} {...actionProps} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        <Toast.Close
          className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded border-none bg-transparent text-current/50 hover:bg-kumo-contrast/10 hover:text-current"
          aria-label="Close"
        >
          <XIcon className="h-3 w-3" />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

function ToastIcon({ variant }: { variant?: KumoToastVariant }) {
  if (!variant || variant === "default") return null;
  const variantConfig = KUMO_TOAST_VARIANTS.variant[variant];
  if (!("icon" in variantConfig)) return null;
  const Icon = variantConfig.icon;
  return (
    <Icon data-toast-icon className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
  );
}

