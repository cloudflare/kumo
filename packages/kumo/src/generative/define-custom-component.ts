/**
 * Factory helper for declaring custom component definitions.
 *
 * Freezes the definition to prevent accidental mutation after creation,
 * and provides type inference so consumers get autocomplete + type errors
 * if required fields (like `component`) are missing.
 *
 * @example
 * import { defineCustomComponent } from '@cloudflare/kumo/generative';
 *
 * const BarChart = defineCustomComponent({
 *   component: BarChartImpl,
 *   description: "Renders a bar chart",
 *   props: {
 *     data: { type: "number[]", description: "Chart data points" },
 *   },
 * });
 */

import type { CustomComponentDefinition } from "../catalog/types.js";

/**
 * Creates a frozen {@link CustomComponentDefinition}.
 *
 * The returned object is `Object.freeze`-d so it cannot be mutated at
 * runtime — this makes definitions safe to share across modules and
 * guarantees referential stability for React memoisation.
 *
 * @param definition - Must include at least `component`.
 * @returns A frozen, readonly copy of the definition.
 */
export function defineCustomComponent(
  definition: CustomComponentDefinition,
): Readonly<CustomComponentDefinition> {
  return Object.freeze(definition);
}
