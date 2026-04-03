import {
  createContext,
  type ReactNode,
  PropsWithChildren,
  useContext,
  useMemo,
  isValidElement,
  Fragment,
} from "react";
import { defaultTranslation } from "./trans";

/**
 * Recursively makes all properties of an object type optional.
 * Allows partial overrides of nested translation objects.
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Recursively converts all string literal types to `string`.
 * Used to make translation values flexible while preserving structure.
 */
type DeepString<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepString<T[K]> }
    : T;

/**
 * Formats a translation template string with named placeholders.
 * Replaces `{key}` patterns with corresponding values from the provided object.
 *
 * Values can be:
 * - Primitives (string | number) - rendered as-is
 * - React nodes - passed through as-is for custom styling
 *
 * @example
 * // Primitive values
 * formatTranslationTemplate("Showing {start}-{end} of {total}", { start: 1, end: 25, total: 100 })
 * // Returns: ["Showing ", 1, "-", 25, " of ", 100]
 *
 * @example
 * // React node values for custom styling
 * formatTranslationTemplate("Showing {start}-{end} of {total}", {
 *   start: <span className="font-bold">1</span>,
 *   end: <span className="font-bold">25</span>,
 *   total: 100
 * })
 * // Returns: ["Showing ", <span className="font-bold">1</span>, "-", <span className="font-bold">25</span>, " of ", 100]
 */
export function formatTranslationTemplate(
  template: string,
  values: Record<string, ReactNode>,
): ReactNode {
  // Split template by placeholders to get parts and keys
  const parts: ReactNode[] = [];
  const regex = /\{(\w+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  while ((match = regex.exec(template)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      const textBefore = template.slice(lastIndex, match.index);
      parts.push(<Fragment key={partIndex++}>{textBefore}</Fragment>);
    }

    // Get the value for this placeholder
    const key = match[1];
    const value = values[key];

    if (value === undefined) {
      // Keep the placeholder as-is if no value provided
      parts.push(<Fragment key={partIndex++}>{`{${key}}`}</Fragment>);
    } else if (isValidElement(value) || typeof value === "object") {
      // React node - pass through as-is
      parts.push(<Fragment key={partIndex++}>{value}</Fragment>);
    } else {
      // String or number - pass through
      parts.push(<Fragment key={partIndex++}>{value}</Fragment>);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after last placeholder
  if (lastIndex < template.length) {
    const textAfter = template.slice(lastIndex);
    parts.push(<Fragment key={partIndex++}>{textAfter}</Fragment>);
  }

  return parts;
}

/** Type derived from the default translation object with flexible string values */
export type KumoTranslations = DeepString<typeof defaultTranslation>;

/** Partial translation object for merging user overrides with defaults */
export type KumoTranslationsPartial = DeepPartial<KumoTranslations>;

interface KumoLocaleProviderProps {
  /** Partial translation object to merge with default English strings */
  translations?: KumoTranslationsPartial;
  locale?: string;
}

/**
 * Deeply merges user translations with default translations.
 * User translations take precedence over defaults.
 */
function mergeTranslations<T extends object>(
  defaults: T,
  user: DeepPartial<T> | undefined,
): T {
  if (!user) return defaults;

  const result = {} as Record<string, unknown>;

  for (const key of Object.keys(defaults)) {
    const defaultValue = (defaults as Record<string, unknown>)[key];
    const userValue = (user as Record<string, unknown>)[key];

    if (
      typeof defaultValue === "object" &&
      defaultValue !== null &&
      !Array.isArray(defaultValue)
    ) {
      result[key] = mergeTranslations(
        defaultValue as Record<string, unknown>,
        (userValue as DeepPartial<Record<string, unknown>>) ?? undefined,
      );
    } else {
      result[key] = userValue ?? defaultValue;
    }
  }

  return result as T;
}

/**
 * Context for providing localization throughout the Kumo component tree.
 * Provides the translation object containing all UI strings.
 */
interface LocaleContextValue {
  /** Translation object with all localized strings */
  t: KumoTranslations;
  locale?: string;
  /**
   * Formats a translation template string with named placeholders.
   * Replaces `{key}` patterns with corresponding values.
   *
   * Values can be primitives or React nodes for custom styling.
   *
   * @example
   * // Primitive values
   * const text = formatTranslation("Showing {start}-{end} of {total}", { start: 1, end: 25, total: 100 });
   * // Returns: ["Showing ", 1, "-", 25, " of ", 100]
   *
   * @example
   * // React node values for custom styling
   * const text = formatTranslation("Showing {start}-{end} of {total}", {
   *   start: <span className="font-bold">1</span>,
   *   end: <span className="font-bold">25</span>,
   *   total: 100
   * });
   */
  formatTranslation: (
    template: string,
    values: Record<string, ReactNode>,
  ) => ReactNode;
}

const KumoLocaleContext = createContext<LocaleContextValue>({
  t: defaultTranslation,
  formatTranslation: formatTranslationTemplate,
});

/**
 * Hook to access the Kumo locale context for translating component text.
 * @returns An object containing the `t` translation object
 * @example
 * const { t } = useKumoLocale();
 * const buttonText = t.common.copy;
 */
export function useKumoLocale() {
  return useContext(KumoLocaleContext);
}

/**
 * Provider component for Kumo component localization.
 * Wraps your application to provide translated strings for built-in component text.
 *
 * @example
 * <KumoLocaleProvider translations={{ common: { copy: "复制", copied: "已复制" } }}>
 *   <App />
 * </KumoLocaleProvider>
 */
export function KumoLocaleProvider({
  translations,
  locale,
  children,
}: PropsWithChildren<KumoLocaleProviderProps>) {
  /** Memoized context value to prevent unnecessary re-renders */
  const contextValue = useMemo(
    () =>
      ({
        t: Object.freeze(mergeTranslations(defaultTranslation, translations)),
        formatTranslation: formatTranslationTemplate,
        locale,
      }) satisfies LocaleContextValue,
    [translations, locale],
  );

  return (
    <KumoLocaleContext.Provider value={contextValue}>
      {children}
    </KumoLocaleContext.Provider>
  );
}

KumoLocaleProvider.displayName = "KumoLocaleProvider";
