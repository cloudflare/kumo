/**
 * Element validator — validates LLM-generated UIElement props against Kumo Zod schemas.
 *
 * Uses the auto-generated ComponentPropsSchemas from ai/schemas.
 * Elements whose type maps to a schema get validated; types without schemas
 * (sub-components, aliases, Div) pass through unchecked.
 */

import type { ZodType } from "zod";
import {
  ComponentPropsSchemas,
  validateElementProps,
  type SafeParseResult,
} from "../../ai/schemas.js";
import type { UIElement } from "../streaming/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeProps(input: unknown): Record<string, unknown> {
  return isRecord(input) ? input : {};
}

// ---------------------------------------------------------------------------
// Enum Coercion
// ---------------------------------------------------------------------------

/**
 * Maps `ComponentType.propName` → `{ invalidValue → validValue }`.
 *
 * LLMs frequently hallucinate enum values that are semantically close
 * (e.g. "success" for Badge instead of "primary", or "medium" for a gap
 * instead of "base"). Rather than stripping these via repair, we silently
 * coerce them to the nearest valid value BEFORE Zod validation so the
 * corrected value survives into the rendered component.
 *
 * Flow: coerce → validate → (if still invalid) repair (strip remaining)
 */
const ENUM_COERCION_MAP: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  // Badge.variant — valid: primary, secondary, destructive, outline, beta
  "Badge.variant": {
    info: "primary",
    success: "primary",
    error: "destructive",
    danger: "destructive",
    warning: "outline",
    negative: "destructive",
    positive: "primary",
    caution: "outline",
  },
  // Stack.gap — valid: none, xs, sm, base, lg, xl
  "Stack.gap": {
    medium: "base",
    large: "lg",
    small: "sm",
    extra: "xl",
  },
  // Grid.gap — valid: none, sm, base, lg
  "Grid.gap": {
    medium: "base",
    large: "lg",
    small: "sm",
  },
  // Text.variant — valid: heading1..3, body, secondary, success, error, mono, mono-secondary
  "Text.variant": {
    title: "heading2",
    subtitle: "heading3",
    caption: "secondary",
  },
};

/**
 * Apply enum coercions to an element's props in-place (returns new object).
 *
 * For each `Type.propName` entry in ENUM_COERCION_MAP, if the element's type
 * matches and the prop value is a recognized invalid value, replace it with
 * the mapped valid value.
 *
 * Returns the original element unchanged if no coercions applied.
 */
export function coerceElementProps(element: UIElement): UIElement {
  const { type } = element;
  const props = normalizeProps(element.props);
  let coerced: Record<string, unknown> | null = null;

  for (const [mapKey, corrections] of Object.entries(ENUM_COERCION_MAP)) {
    const [mapType, propName] = mapKey.split(".");
    if (mapType !== type) continue;

    const currentValue = props[propName];
    if (typeof currentValue !== "string") continue;

    const correctedValue = corrections[currentValue];
    if (correctedValue == null) continue;

    // Lazily clone props on first coercion
    if (coerced == null) {
      coerced = { ...props };
    }
    coerced[propName] = correctedValue;
  }

  if (coerced == null) {
    // Preserve referential stability when nothing changes; this keeps
    // WeakMap/WeakSet caches effective in the renderer.
    if (props === element.props) return element;
    return { ...element, props };
  }
  return { ...element, props: coerced };
}

// ---------------------------------------------------------------------------
// Type → Schema Mapping
// ---------------------------------------------------------------------------

/**
 * Maps COMPONENT_MAP type names to ComponentPropsSchemas keys.
 *
 * kumo uses aliases (Textarea→InputArea, RadioGroup→Radio) and
 * compound sub-components (TableRow, SelectOption) that don't have their
 * own top-level schemas. This map resolves the indirection.
 *
 * Types not in this map AND not in ComponentPropsSchemas are skipped
 * (no schema validation = pass through).
 */
const TYPE_TO_SCHEMA_KEY: Record<
  string,
  keyof typeof ComponentPropsSchemas | null
> = {
  // Aliases — generative type → kumo schema name
  Textarea: "InputArea",
  RadioGroup: "Radio",

  // Sub-components — no top-level schema exists, skip validation
  RadioItem: null,
  SelectOption: null,
  TableHeader: null,
  TableHead: null,
  TableBody: null,
  TableRow: null,
  TableCell: null,
  TableFooter: null,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Result of validating a single element. */
export type ElementValidationResult =
  | { readonly valid: true }
  | {
      readonly valid: false;
      readonly elementKey: string;
      readonly elementType: string;
      readonly issues: ReadonlyArray<{
        readonly path: string;
        readonly message: string;
      }>;
    };

/** Sentinel for elements that pass validation or have no schema. */
const VALID: ElementValidationResult = { valid: true } as const;

/**
 * Validate an element's props against its component schema.
 *
 * Returns `{ valid: true }` when:
 * - The element's type has a schema and props conform to it
 * - The element's type has no schema (sub-components, Div, unknown types)
 *
 * Returns `{ valid: false, ... }` only when a schema exists and props
 * fail validation.
 *
 * **Important**: Callers should run {@link coerceElementProps} on the element
 * BEFORE calling this function. Coercion fixes commonly hallucinated enum
 * values (e.g. Badge "success" → "primary") so they pass validation and
 * survive into the rendered output. See {@link ENUM_COERCION_MAP}.
 *
 * @param customSchemas - Optional map of custom component type → Zod schema.
 *   When a custom schema exists for the element's type, props are validated
 *   against it. Failures produce the same {@link ElementValidationResult}
 *   shape as built-in failures.
 */
export function validateElement(
  element: UIElement,
  customSchemas?: Readonly<Record<string, ZodType>> | null,
): ElementValidationResult {
  const { type, key } = element;

  // In generative UI, structural children are expressed via UIElement.children
  // (string key arrays). LLMs sometimes also emit `props.children` as an array
  // (redundant key refs or nested objects). Kumo schemas expect props.children
  // to be a scalar (string/number/boolean/null/DynamicValue), so an array value
  // always fails validation. Strip it unconditionally — the renderer already
  // reads structural children from element.children, not props.children.
  const elementForValidation = (() => {
    const props = normalizeProps(element.props);
    if (!Array.isArray(props["children"])) return { ...element, props };
    const { children: _children, ...rest } = props;
    return { ...element, props: rest };
  })();

  // Div is a synthetic container — no Kumo schema
  if (type === "Div") return VALID;

  // Check our alias/sub-component map first
  if (type in TYPE_TO_SCHEMA_KEY) {
    const mapped = TYPE_TO_SCHEMA_KEY[type];
    if (mapped === null) return VALID; // sub-component, no schema

    // Build a synthetic element with the mapped type for validateElementProps
    const syntheticElement = { ...elementForValidation, type: mapped };
    return toResult(
      key,
      type,
      validateElementProps(
        syntheticElement as Parameters<typeof validateElementProps>[0],
      ),
    );
  }

  // Direct match — type exists in ComponentPropsSchemas
  if (type in ComponentPropsSchemas) {
    return toResult(
      key,
      type,
      validateElementProps(
        elementForValidation as Parameters<typeof validateElementProps>[0],
      ),
    );
  }

  // Custom schema — consumer-provided Zod schema for custom component types
  const customSchema = customSchemas?.[type];
  if (customSchema != null) {
    const props = normalizeProps(elementForValidation.props);
    const result = customSchema.safeParse(props);
    return toResult(key, type, result as SafeParseResult<unknown>);
  }

  // Unknown type — no schema to validate against
  return VALID;
}

/** Convert a SafeParseResult to our ElementValidationResult. */
function toResult(
  elementKey: string,
  elementType: string,
  result: SafeParseResult<unknown>,
): ElementValidationResult {
  if (result.success) return VALID;

  const issues = result.error.issues.map((issue) => ({
    path: issue.path.map(String).join(".") || "(root)",
    message: issue.message,
  }));

  return { valid: false, elementKey, elementType, issues };
}

// ---------------------------------------------------------------------------
// Repair
// ---------------------------------------------------------------------------

/**
 * Attempt to repair an element that failed validation by stripping the
 * invalid top-level props identified in the validation issues.
 *
 * LLMs frequently emit props with invalid enum values (e.g. a Text with
 * `variant: "email"` instead of a valid variant). Rather than rejecting the
 * entire element, we strip the offending props and let the component render
 * with its defaults.
 *
 * Only top-level props are stripped (path depth 1). Deeply nested failures
 * are left as-is — stripping a parent object could remove valid sibling
 * fields.
 *
 * Returns `null` if no props can be stripped (e.g. all issues are at root
 * level or deeply nested), signaling the caller should fall back to the
 * original error display.
 */
export function repairElement(
  element: UIElement,
  result: ElementValidationResult & { valid: false },
): UIElement | null {
  // Collect top-level prop names to strip. A top-level issue has a path
  // like "variant" (single segment) — not "(root)" and not "foo.bar".
  const propsToStrip = new Set<string>();
  for (const issue of result.issues) {
    const segments = issue.path.split(".");
    // Only strip when the failing path is exactly one level deep (a prop name)
    if (segments.length === 1 && segments[0] !== "(root)") {
      propsToStrip.add(segments[0]);
    }
  }

  if (propsToStrip.size === 0) return null;

  const originalProps = normalizeProps(element.props);
  const repairedProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(originalProps)) {
    if (!propsToStrip.has(key)) {
      repairedProps[key] = value;
    }
  }

  return { ...element, props: repairedProps };
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

/**
 * Log a validation failure to the console.
 * Called by the renderer when an element fails validation.
 */
export function logValidationError(
  result: ElementValidationResult & { valid: false },
): void {
  const details = result.issues
    .map((i) => `  - ${i.path}: ${i.message}`)
    .join("\n");

  console.warn(
    `[UITreeRenderer] Validation failed for element "${result.elementKey}" (${result.elementType}):\n${details}`,
  );
}

/**
 * Log that an element was repaired (invalid props stripped).
 */
export function logValidationRepair(
  result: ElementValidationResult & { valid: false },
  strippedProps: ReadonlyArray<string>,
): void {
  console.warn(
    `[UITreeRenderer] Repaired element "${result.elementKey}" (${result.elementType}): stripped invalid props [${strippedProps.join(", ")}]`,
  );
}
