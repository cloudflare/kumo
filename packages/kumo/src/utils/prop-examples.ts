/**
 * Generate string examples for component props
 *
 * This is the string-output equivalent of propTester.tsx.
 * Instead of returning JSX elements, it returns string representations
 * suitable for AI/documentation consumption.
 */

export interface PropExampleOptions {
  /** The component name (e.g., "Banner", "Badge") */
  componentName: string;
  /** Base props to include in all examples (as key-value pairs) */
  baseProps?: Record<string, string>;
  /** Children content (if any) */
  children?: string;
}

/**
 * Generate string examples for each prop value
 *
 * @param propValues - Array of prop values to iterate over
 * @param propName - The name of the prop being varied
 * @param options - Component name and base props
 * @returns Array of JSX-like strings, one for each prop value
 *
 * @example
 * propExamples(
 *   ["default", "alert", "error"],
 *   "variant",
 *   { componentName: "Banner", baseProps: { text: '"Message"' } }
 * )
 * // Returns:
 * // ['<Banner variant="default" text="Message" />',
 * //  '<Banner variant="alert" text="Message" />',
 * //  '<Banner variant="error" text="Message" />']
 */
export function propExamples<T extends string | number>(
  propValues: readonly T[] | T[],
  propName: string,
  options: PropExampleOptions,
): string[] {
  const { componentName, baseProps = {}, children } = options;

  return propValues.map((value) => {
    // Build props string
    const allProps: Record<string, string> = {
      [propName]: formatPropValue(value),
      ...baseProps,
    };

    const propsString = Object.entries(allProps)
      .map(([key, val]) => `${key}=${val}`)
      .join(" ");

    if (children) {
      return `<${componentName} ${propsString}>${children}</${componentName}>`;
    }
    return `<${componentName} ${propsString} />`;
  });
}

/**
 * Format a prop value for string output
 */
function formatPropValue(value: string | number): string {
  if (typeof value === "number") {
    return `{${value}}`;
  }
  return `"${value}"`;
}
