import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
    props?: DescendantType,
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

export function useDescendants<
  DescendantType extends Record<string, unknown>,
>(): DescendantsContextType<DescendantType> {
  const [registeredDescendants, setRegisteredDescendants] = useState<
    DescendantInfo<DescendantType>[]
  >([]);
  const descendantsRef = useRef<Map<string, DescendantInfo<DescendantType>>>(
    new Map(),
  );

  // Track render order — resets each render cycle
  const renderOrderCounterRef = useRef(0);
  const renderOrderMapRef = useRef<Map<string, number>>(new Map());

  // Reset counter at the start of each render cycle
  renderOrderCounterRef.current = 0;
  renderOrderMapRef.current.clear();

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
      props: DescendantType = {} as DescendantType,
    ) => {
      const existing = descendantsRef.current.get(id);
      const isNew = existing === undefined;
      const orderChanged = !isNew && existing.renderOrder !== renderOrder;

      const descendantInfo: DescendantInfo<DescendantType> = {
        id,
        props,
        renderOrder,
      };
      descendantsRef.current.set(id, descendantInfo);

      // Only re-sort and notify React when the list structure changed (new
      // entry or render-order shift). Prop-only updates on an already-registered
      // descendant must NOT trigger setRegisteredDescendants — that would cause
      // every consumer of the descendants array to re-render, which fans out
      // into reportTree → setFlowState → context change → children re-render
      // → register again → infinite loop.
      if (isNew || orderChanged) {
        const sorted = Array.from(descendantsRef.current.values()).sort(
          (a, b) => a.renderOrder - b.renderOrder,
        );
        setRegisteredDescendants(sorted);
      }

      const unregister = () => {
        descendantsRef.current.delete(id);
        const remainingDescendants = Array.from(
          descendantsRef.current.values(),
        ).sort((a, b) => a.renderOrder - b.renderOrder);
        setRegisteredDescendants(remainingDescendants);
      };

      return { unregister };
    },
    [],
  );

  const contextValue: DescendantsContextType<DescendantType> = useMemo(
    () => ({
      register,
      descendants: registeredDescendants,
      claimRenderOrder,
    }),
    [register, registeredDescendants, claimRenderOrder],
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
  children,
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
// Context Hooks
// ============================================================================

export function useDescendantsContext<
  T extends Record<string, unknown>,
>(): DescendantsContextType<T> {
  const context = useContext(DescendantsContext);

  if (!context) {
    throw new Error(
      "useDescendantsContext must be used within DescendantsProvider",
    );
  }

  return context as DescendantsContextType<T>;
}

export function useOptionalDescendantsContext<
  T extends Record<string, unknown>,
>(): DescendantsContextType<T> | null {
  const context = useContext(DescendantsContext);
  return context as DescendantsContextType<T> | null;
}

// ============================================================================
// Descendant Index Hook
// ============================================================================

export function useDescendantIndex<T extends Record<string, unknown>>(
  props?: T,
  customId?: string,
) {
  const context = useDescendantsContext<T>();
  const generatedId = useId();
  const id = customId ?? generatedId;

  const renderOrder = context.claimRenderOrder(id);

  // Keep mutable refs so the mount/unmount effect always has current values
  // without needing to re-run (which would cause the unregister/re-register
  // cycle that triggers infinite parent re-renders).
  const registerRef = useRef(context.register);
  registerRef.current = context.register;
  const propsRef = useRef(props);
  propsRef.current = props;
  const renderOrderRef = useRef(renderOrder);
  renderOrderRef.current = renderOrder;

  // Mount: register. Unmount: unregister. Never runs again for the same id.
  useEffect(() => {
    const { unregister } = registerRef.current(
      id,
      renderOrderRef.current,
      propsRef.current,
    );
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Prop / order updates: keep the stored entry fresh without removing it
  // first. register() skips setRegisteredDescendants when the entry already
  // exists at the same order, so this never triggers a parent re-render for
  // pure prop changes.
  //
  // `props` is intentionally excluded from the dependency array: it is an
  // object recreated on every render, so including it would cause this effect
  // to fire every render → register() → setRegisteredDescendants() → parent
  // re-render → new props object → infinite loop. propsRef.current is kept
  // up-to-date synchronously (line above), so the effect always reads the
  // latest props without needing it as a dep.
  useEffect(() => {
    registerRef.current(id, renderOrder, propsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, renderOrder]);

  const index = useMemo(() => {
    return context.descendants.findIndex((descendant) => descendant.id === id);
  }, [context.descendants, id]);

  return { index, id };
}
