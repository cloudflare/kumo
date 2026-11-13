import { createContext, useContext, useMemo, type ReactNode } from "react";

export interface KumoTranslations {
  label?: {
    optional: string;
    tooltip: string;
  };
  layerDialog: {
    close: string;
    cancel: string;
  };
}

export type KumoTranslationsPartial = {
  [Key in keyof KumoTranslations]?: Partial<NonNullable<KumoTranslations[Key]>>;
};

type ResolvedKumoTranslations = {
  [Key in keyof KumoTranslations]-?: NonNullable<KumoTranslations[Key]>;
};

const defaultTranslations: ResolvedKumoTranslations = {
  label: {
    optional: "(optional)",
    tooltip: "More information",
  },
  layerDialog: {
    close: "Close",
    cancel: "Cancel",
  },
};

const KumoLocaleContext =
  createContext<ResolvedKumoTranslations>(defaultTranslations);

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
  const value = useMemo<ResolvedKumoTranslations>(
    () => ({
      label: {
        ...defaultTranslations.label,
        ...translations?.label,
      },
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
export function useKumoLocale(): ResolvedKumoTranslations {
  return useContext(KumoLocaleContext);
}
