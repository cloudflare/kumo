import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface KumoTranslations {
  layerDialog: {
    close: string;
    cancel: string;
  };
}

export type KumoTranslationsPartial = {
  [Key in keyof KumoTranslations]?: Partial<KumoTranslations[Key]>;
};

const defaultTranslations: KumoTranslations = {
  layerDialog: {
    close: "Close",
    cancel: "Cancel",
  },
};

const KumoLocaleContext = createContext<KumoTranslations>(defaultTranslations);

export interface KumoLocaleProviderProps {
  children: ReactNode;
  /**
   * Partial overrides for Kumo's built-in English copy. Components without an
   * override continue to use their English defaults.
   */
  translations?: KumoTranslationsPartial;
}

/**
 * Supplies translations for Kumo-owned UI copy. Explicit component props take
 * precedence over these defaults.
 */
export function KumoLocaleProvider({
  children,
  translations,
}: KumoLocaleProviderProps) {
  const value = useMemo<KumoTranslations>(
    () => ({
      layerDialog: {
        ...defaultTranslations.layerDialog,
        ...translations?.layerDialog,
      },
    }),
    [translations],
  );

  return (
    <KumoLocaleContext.Provider value={value}>
      {children}
    </KumoLocaleContext.Provider>
  );
}

/** @internal Used by Kumo components to resolve translated built-in copy. */
export function useKumoLocale(): KumoTranslations {
  return useContext(KumoLocaleContext);
}
