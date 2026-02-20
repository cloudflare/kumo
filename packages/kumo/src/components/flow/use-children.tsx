import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

// ============================================================================
// Types
// ============================================================================
export type DescendantInfo<T = Record<string, unknown>> = {
  id: string;
  props: T;
  renderOrder: number;
};

type DescendantsContextType<DescendantType = Record<string, unknown>> = {
  register: (
    id: string,
    renderOrder: number,
    props?: DescendantType
  ) => { unregister: () => void };
  descendants: DescendantInfo<DescendantType>[];
  claimRenderOrder: (id: string) => number;
};

// ============================================================================
// Context
// ============================================================================

const DescendantsContext = createContext<DescendantsContextType | null>(null);

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that manages descendant registration and provides access to all registered descendants.
 * This hook contains all the logic for tracking and managing descendants.
 *
 * @returns The descendants context value with register function and descendants array
 */
export function useDescendants<
  DescendantType extends Record<string, unknown>
>(): DescendantsContextType<DescendantType> {
  const [registeredDescendants, setRegisteredDescendants] = useState<
    DescendantInfo<DescendantType>[]
  >([]);
  const descendantsRef = useRef<Map<string, DescendantInfo<DescendantType>>>(
    new Map()
  );

  // Track render order - resets each render cycle
  const renderOrderCounterRef = useRef(0);
  const renderOrderMapRef = useRef<Map<string, number>>(new Map());

  // Reset counter at the start of each render cycle
  // This runs synchronously during render, before any children claim their order
  renderOrderCounterRef.current = 0;
  renderOrderMapRef.current.clear();

  // Called during render to claim a slot in the render order
  const claimRenderOrder = useCallback((id: string): number => {
    if (!renderOrderMapRef.current.has(id)) {
      renderOrderMapRef.current.set(id, renderOrderCounterRef.current++);
    }
    return renderOrderMapRef.current.get(id) as number;
  }, []);

  const register = useCallback(
    (
      id: string,
      renderOrder: number,
      props: DescendantType = {} as DescendantType
    ) => {
      // Add descendant to the map with render order
      const descendantInfo: DescendantInfo<DescendantType> = {
        id,
        props,
        renderOrder
      };
      descendantsRef.current.set(id, descendantInfo);

      // Update state with all descendants sorted by render order
      const sortedDescendants = Array.from(
        descendantsRef.current.values()
      ).sort((a, b) => a.renderOrder - b.renderOrder);
      setRegisteredDescendants(sortedDescendants);

      // Return unregister function
      const unregister = () => {
        descendantsRef.current.delete(id);
        const remainingDescendants = Array.from(
          descendantsRef.current.values()
        ).sort((a, b) => a.renderOrder - b.renderOrder);
        setRegisteredDescendants(remainingDescendants);
      };

      return { unregister };
    },
    []
  );

  const contextValue: DescendantsContextType<DescendantType> = useMemo(
    () => ({
      register,
      descendants: registeredDescendants,
      claimRenderOrder
    }),
    [register, registeredDescendants, claimRenderOrder]
  );

  return contextValue;
}

// ============================================================================
// Provider Component
// ============================================================================

type DescendantsProviderProps<T extends Record<string, unknown>> = {
  value: DescendantsContextType<T>;
  children: ReactNode;
};

export function DescendantsProvider<T extends Record<string, unknown>>({
  value,
  children
}: DescendantsProviderProps<T>) {
  return (
    <DescendantsContext.Provider
      value={value as unknown as DescendantsContextType}
    >
      {children}
    </DescendantsContext.Provider>
  );
}

// ============================================================================
// Context Hook
// ============================================================================

/**
 * Hook to access the descendants context from within a DescendantsProvider.
 * This allows callers to access the descendants data and register function.
 *
 * @returns The descendants context value
 * @throws Error if used outside of DescendantsProvider
 */
export function useDescendantsContext<
  T extends Record<string, unknown>
>(): DescendantsContextType<T> {
  const context = useContext(DescendantsContext);

  if (!context) {
    throw new Error(
      'useDescendantsContext must be used within DescendantsProvider'
    );
  }

  return context as DescendantsContextType<T>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that allows a descendant component to register itself with a parent
 * and returns the index of the descendant in the parent's list.
 *
 * @example
 * ```tsx
 * function Parent() {
 *   return (
 *     <DescendantsProvider>
 *       <Descendant />
 *       <Descendant />
 *       <Descendant />
 *     </DescendantsProvider>
 *   );
 * }
 *
 * function Descendant() {
 *   const index = useDescendantIndex();
 *   return <div>I am descendant {index}</div>;
 * }
 *
 * // With props
 * function Descendant() {
 *   const index = useDescendantIndex({ name: "Descendant 1", type: "primary" });
 *   return <div>I am descendant {index}</div>;
 * }
 * ```
 */
// ============================================================================
// Descendant Index Hook
// ============================================================================

export function useDescendantIndex<T extends Record<string, unknown>>(
  props?: T
) {
  const context = useDescendantsContext<T>();
  const id = useId();

  // Claim render order during render (synchronously, not in useEffect)
  // This captures the order in which descendants render
  const renderOrder = context.claimRenderOrder(id);

  const unregisterRef = useRef<(() => void) | null>(null);
  const registerRef = useRef(context.register);

  // Keep refs in sync with context
  registerRef.current = context.register;

  useEffect(() => {
    // Register or update this descendant with its render order
    const { unregister } = registerRef.current(id, renderOrder, props);

    // Store unregister function if not already stored
    if (!unregisterRef.current) {
      unregisterRef.current = unregister;
    }

    // Cleanup: unregister when component unmounts
    return () => {
      if (unregisterRef.current) {
        unregisterRef.current();
        unregisterRef.current = null;
      }
    };
  }, [id, renderOrder, props]);

  // Derive index from sorted descendants array
  const index = useMemo(() => {
    return context.descendants.findIndex(descendant => descendant.id === id);
  }, [context.descendants, id]);

  const getPrevious = useCallback((): DescendantInfo<T> | undefined => {
    if (index <= 0) return undefined;
    return context.descendants[index - 1];
  }, [context.descendants, index]);

  const getNext = useCallback((): DescendantInfo<T> | undefined => {
    if (index < 0 || index >= context.descendants.length - 1) return undefined;
    return context.descendants[index + 1];
  }, [context.descendants, index]);

  return { index, id, getPrevious, getNext };
}
