import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";

/**
 * Portal container type - matches Base UI's FloatingPortal container prop.
 * Supports HTMLElement, ShadowRoot, or a ref to either.
 */
export type PortalContainer =
  | HTMLElement
  | ShadowRoot
  | null
  | RefObject<HTMLElement | ShadowRoot | null>;

const PortalContainerContext = createContext<PortalContainer>(null);

/**
 * KumoPortalProvider — sets the default portal container for all Kumo overlay components.
 *
 * Use this to render Kumo overlays (Dialog, Tooltip, DropdownMenu, Select, Combobox,
 * Popover, CommandPalette, Toast) inside a Shadow DOM or custom container.
 *
 * When not provided, overlays portal to `document.body` (default browser behavior).
 * Individual components can override this via their own `container` prop.
 *
 * @example Shadow DOM usage
 * ```tsx
 * function WebComponent() {
 *   const shadowRef = useRef<ShadowRoot>(null);
 *
 *   useEffect(() => {
 *     shadowRef.current = hostElement.attachShadow({ mode: 'open' });
 *   }, []);
 *
 *   return (
 *     <KumoPortalProvider container={shadowRef.current}>
 *       <App />
 *     </KumoPortalProvider>
 *   );
 * }
 * ```
 *
 * @example Custom container
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={containerRef}>
 *   <KumoPortalProvider container={containerRef}>
 *     <Dialog.Root>...</Dialog.Root>
 *   </KumoPortalProvider>
 * </div>
 * ```
 */
export function KumoPortalProvider({
  container,
  children,
}: {
  /** The container element or ShadowRoot to portal overlays into. */
  container: PortalContainer;
  children: ReactNode;
}) {
  return (
    <PortalContainerContext.Provider value={container}>
      {children}
    </PortalContainerContext.Provider>
  );
}

/**
 * Hook to get the portal container from context.
 * Returns null if no provider is present (defaults to document.body).
 *
 * @internal Used by overlay components to resolve their portal container.
 */
export function usePortalContainer(): PortalContainer {
  return useContext(PortalContainerContext);
}
