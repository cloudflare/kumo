/**
 * UITreeRenderer — renders a UITree as Kumo React components.
 *
 * Recursively traverses the flat UITree structure, resolving each element's
 * type to a Kumo component via the component map, and rendering children
 * by key reference. Wraps each element in an error boundary to prevent
 * individual component failures from crashing the entire tree.
 */

import React, { Component, memo, useMemo } from "react";
import type { ReactNode, ElementType } from "react";
import type { ZodType } from "zod";
import type { UITree, UIElement } from "../streaming/types";
import type { CustomComponentDefinition } from "../catalog/types.js";
import { GridItem } from "../index.js";
import { COMPONENT_MAP, KNOWN_TYPES } from "./component-map.js";
import {
  createActionHandler,
  createClickHandler,
  type ActionDispatch,
} from "../streaming/action-handler";
import {
  coerceElementProps,
  validateElement,
  logValidationError,
  logValidationRepair,
  repairElement,
} from "./element-validator.js";
import type { RuntimeValueStore } from "../streaming/runtime-value-store";
import {
  RuntimeValueStoreProvider,
  useRuntimeValueStoreContext,
} from "../streaming/runtime-value-store-context";
import { sanitizeUrl } from "../streaming/url-policy";

/** Maximum recursion depth to prevent infinite loops from circular refs. */
const MAX_DEPTH = 50;

/** Props that must never be spread onto DOM elements from LLM output. */
const BLOCKED_PROPS = new Set([
  "dangerouslySetInnerHTML",
  "ref",
  "key",
  // `action` is a UIElement top-level field handled by the renderer's action
  // system — if the LLM accidentally nests it inside `props`, strip it so it
  // doesn't leak to React DOM (React 19 only allows `action` on <form>).
  "action",
]);

/**
 * Component types that use onClick for action dispatch instead of onAction.
 * These are native-event components (Button, Link) that don't implement the
 * onAction callback pattern used by stateful wrappers.
 */
const ONCLICK_ACTION_TYPES = new Set(["Button", "Link"]);

const RUNTIME_VALUE_CAPTURE_TYPES = new Set(["Input", "InputArea", "Textarea"]);

const SUBMIT_FORM_RUNTIME_VALUES_KEY = "runtimeValues";

const TWO_COL_GRID_VARIANTS = new Set(["2up", "side-by-side", "2-1", "1-2"]);

const FORM_ROW_CONTROL_TYPES = new Set(["Input", "Select", "Textarea"]);

const FORM_CONTROL_TYPES = new Set([
  "Input",
  "InputArea",
  "Textarea",
  "Select",
  "Checkbox",
  "Switch",
  "Radio",
  "RadioGroup",
]);

const FIELD_CONTROL_TYPES = new Set([
  "Input",
  "InputArea",
  "Textarea",
  "Select",
]);

const CHECKABLE_TYPES = new Set(["Checkbox", "Switch", "Radio", "RadioGroup"]);

type ElementValidation = ReturnType<typeof validateElement>;

const validationCache = new WeakMap<UIElement, ElementValidation>();
const loggedInvalidElements = new WeakSet<UIElement>();

function getElementValidation(
  element: UIElement,
  customSchemas?: Readonly<Record<string, ZodType>> | null,
): ElementValidation {
  // When custom schemas are provided, skip the cache — the same element could
  // be validated with different schema sets in different renderer instances.
  if (customSchemas != null) {
    return validateElement(element, customSchemas);
  }
  const cached = validationCache.get(element);
  if (cached) return cached;
  const result = validateElement(element);
  validationCache.set(element, result);
  return result;
}

function isTwoColFormRowGrid(element: UIElement | undefined): boolean {
  if (!element) return false;
  if (element.type !== "Grid") return false;
  if (!element.children || element.children.length !== 2) return false;

  const props = element.props;
  const variant = props["variant"];
  if (variant !== undefined && typeof variant !== "string") return false;
  if (typeof variant === "string" && !TWO_COL_GRID_VARIANTS.has(variant)) {
    return false;
  }

  // If the model explicitly sets grid-cols via className, don't second-guess it.
  const className = props["className"];
  if (typeof className === "string" && /\bgrid-cols-/.test(className)) {
    return false;
  }

  return true;
}

/**
 * Normalize sibling Grid row variants for form-like layouts.
 *
 * LLM output often emits multiple 2-col Grids for a single form section.
 * When those rows mix variants (e.g. "side-by-side" vs "2-1"), column
 * widths shift between rows and the form looks broken.
 *
 * Heuristic: within any single parent, if there are 2+ sibling 2-child Grid
 * rows that wrap form controls and they don't share the same variant, coerce
 * them all to `variant="2up"`.
 */
export function normalizeSiblingFormRowGrids(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  const nextElements: Record<string, UIElement> = { ...elements };

  for (const parent of Object.values(elements)) {
    if (!parent?.children || parent.children.length === 0) continue;

    const rowGridKeys: string[] = [];
    for (const childKey of parent.children) {
      const child = elements[childKey];
      if (!child) continue;
      if (!isTwoColFormRowGrid(child)) continue;

      const grandChildren = child.children;
      if (!grandChildren) continue;
      const t1 = elements[grandChildren[0]]?.type;
      const t2 = elements[grandChildren[1]]?.type;
      if (!t1 || !t2) continue;
      if (!FORM_ROW_CONTROL_TYPES.has(t1) || !FORM_ROW_CONTROL_TYPES.has(t2)) {
        continue;
      }

      rowGridKeys.push(childKey);
    }

    if (rowGridKeys.length < 2) continue;

    const variants = new Set<string>();
    for (const key of rowGridKeys) {
      const v = elements[key]?.props?.["variant"];
      if (typeof v === "string") variants.add(v);
    }

    if (variants.size <= 1) continue;

    for (const key of rowGridKeys) {
      const el = elements[key];
      if (!el) continue;
      if (el.props["variant"] === "2up") continue;
      nextElements[key] = { ...el, props: { ...el.props, variant: "2up" } };
      changed = true;
    }
  }

  return changed ? { ...tree, elements: nextElements } : tree;
}

/**
 * Normalize nested Surfaces.
 *
 * The system prompt says never to nest Surface directly inside Surface, but LLMs
 * still do it. This produces double borders and excessive padding.
 *
 * Heuristic: if a Surface's only child is another Surface, lift the inner
 * Surface's children up into the outer Surface.
 */
export function normalizeNestedSurfaces(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  let nextElements: Record<string, UIElement> | null = null;

  for (const outer of Object.values(elements)) {
    if (!outer || outer.type !== "Surface") continue;
    if (!outer.children || outer.children.length !== 1) continue;

    const innerKey = outer.children[0];
    const inner = elements[innerKey];
    if (!inner || inner.type !== "Surface") continue;
    if (!inner.children || inner.children.length === 0) continue;

    if (nextElements == null) nextElements = { ...elements };

    // Re-parent inner children to outer
    for (const childKey of inner.children) {
      const child = nextElements[childKey];
      if (child) nextElements[childKey] = { ...child, parentKey: outer.key };
    }

    nextElements[outer.key] = { ...outer, children: [...inner.children] };
    changed = true;
  }

  return changed && nextElements != null
    ? { ...tree, elements: nextElements }
    : tree;
}

function normalizeLabelText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function readElementTextLabel(element: UIElement | undefined): string | null {
  if (!element) return null;
  if (element.type !== "Text" && element.type !== "Label") return null;
  const children = (element.props as Record<string, unknown>)["children"];
  if (typeof children !== "string") return null;
  return normalizeLabelText(children);
}

function readFieldLabelProp(element: UIElement | undefined): string | null {
  if (!element) return null;
  if (!FIELD_CONTROL_TYPES.has(element.type)) return null;
  const label = (element.props as Record<string, unknown>)["label"];
  if (typeof label !== "string") return null;
  return normalizeLabelText(label);
}

function isHeadingText(element: UIElement | undefined): boolean {
  if (!element || element.type !== "Text") return false;
  const variant = (element.props as Record<string, unknown>)["variant"];
  return typeof variant === "string" && variant.startsWith("heading");
}

/**
 * Normalize duplicate field labels.
 *
 * LLMs often emit: Text("Email") followed by Input({ label: "Email" }),
 * producing a double label. Prefer the component's built-in `label`.
 */
export function normalizeDuplicateFieldLabels(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  let nextElements: Record<string, UIElement> | null = null;

  for (const parent of Object.values(elements)) {
    const children = parent?.children;
    if (!children || children.length < 2) continue;

    let parentChanged = false;

    const nextChildren: string[] = [];
    for (let i = 0; i < children.length; i++) {
      const k = children[i];
      const el = elements[k];
      const nextKey = children[i + 1];
      const nextEl = nextKey ? elements[nextKey] : undefined;

      const textLabel = readElementTextLabel(el);
      const fieldLabel = readFieldLabelProp(nextEl);

      const shouldDrop =
        textLabel != null &&
        fieldLabel != null &&
        textLabel === fieldLabel &&
        !isHeadingText(el);

      if (shouldDrop) {
        parentChanged = true;
        continue;
      }

      nextChildren.push(k);
    }

    if (!parentChanged) continue;
    if (nextElements == null) nextElements = { ...elements };
    nextElements[parent.key] = { ...parent, children: nextChildren };
    changed = true;
  }

  return changed && nextElements != null
    ? { ...tree, elements: nextElements }
    : tree;
}

/**
 * Normalize checkbox group label layout.
 *
 * LLMs often render a checkbox group as a 2-column Grid row:
 *   [Text("Notification channels"), Stack([Checkbox, Checkbox, ...])]
 * This makes the group label float mid-row.
 *
 * Heuristic: coerce such Grid rows into a vertical Stack so the label sits
 * above the checkbox list.
 */
export function normalizeCheckboxGroupGrids(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  let nextElements: Record<string, UIElement> | null = null;

  for (const grid of Object.values(elements)) {
    if (!grid || grid.type !== "Grid") continue;
    if (!grid.children || grid.children.length !== 2) continue;

    const left = elements[grid.children[0]];
    const right = elements[grid.children[1]];
    if (!left || !right) continue;
    if (left.type !== "Text" && left.type !== "Label") continue;
    if (right.type !== "Stack") continue;

    const rightChildren = right.children;
    if (!rightChildren || rightChildren.length === 0) continue;
    const allCheckables = rightChildren.every((k) => {
      const t = elements[k]?.type;
      return typeof t === "string" && CHECKABLE_TYPES.has(t);
    });
    if (!allCheckables) continue;

    const props = grid.props as Record<string, unknown>;
    const gap = props["gap"];
    const className = props["className"];

    const nextProps: Record<string, unknown> = {};
    if (typeof className === "string") nextProps["className"] = className;
    if (typeof gap === "string") nextProps["gap"] = gap;

    if (nextElements == null) nextElements = { ...elements };
    nextElements[grid.key] = {
      ...grid,
      type: "Stack",
      props: nextProps,
    };
    changed = true;
  }

  return changed && nextElements != null
    ? { ...tree, elements: nextElements }
    : tree;
}

/**
 * Normalize Surface elements whose children aren't wrapped in a single Stack.
 *
 * LLMs often emit a Surface with multiple direct children (Text, Button, etc.)
 * instead of wrapping them in a Stack for vertical rhythm. Without a Stack the
 * Surface's children render as siblings with no gap, producing a collapsed
 * layout.
 *
 * Heuristic: when a Surface has children that aren't a single Stack, inject a
 * synthetic Stack element that wraps the original children. The Surface then
 * points to this single Stack, which provides consistent `gap="lg"` spacing.
 *
 * Skip when:
 * - Surface has 0 children
 * - Surface has exactly 1 child that IS a Stack
 */
export function normalizeSurfaceOrphans(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  let nextElements: Record<string, UIElement> | null = null;

  for (const el of Object.values(elements)) {
    if (!el || el.type !== "Surface") continue;
    if (!el.children || el.children.length === 0) continue;

    // Skip: single child that is already a Stack
    if (el.children.length === 1) {
      const onlyChild = elements[el.children[0]];
      if (onlyChild?.type === "Stack") continue;
    }

    // Surface has 1+ non-Stack children → wrap in synthetic Stack
    let stackKey = `auto-stack-${el.key}`;

    if (nextElements == null) {
      nextElements = { ...elements };
    }

    // Ensure the synthetic key doesn't collide with an existing element.
    while (stackKey in nextElements) {
      stackKey = `${stackKey}-wrap`;
    }

    const syntheticStack: UIElement = {
      key: stackKey,
      type: "Stack",
      props: { gap: "lg" },
      children: [...el.children],
      parentKey: el.key,
    };

    // Update parent refs on original children
    for (const childKey of el.children) {
      const child = nextElements[childKey];
      if (child) {
        nextElements[childKey] = { ...child, parentKey: stackKey };
      }
    }

    nextElements[stackKey] = syntheticStack;
    nextElements[el.key] = { ...el, children: [stackKey] };
    changed = true;
  }

  return changed && nextElements != null
    ? { ...tree, elements: nextElements }
    : tree;
}

/**
 * Normalize counter layouts.
 *
 * A common counter structure is: Stack[ title(Text), count(Text), actions(Cluster) ].
 * LLMs often forget `Stack.align="center"`, causing the count + actions to feel
 * visually disconnected.
 */
export function normalizeCounterStacks(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  let nextElements: Record<string, UIElement> | null = null;

  for (const stack of Object.values(elements)) {
    if (!stack || stack.type !== "Stack") continue;
    if (!stack.children || stack.children.length < 3) continue;

    if (typeof stack.props?.["align"] === "string") continue;

    // Find a Cluster with exactly 2 buttons: increment + decrement.
    const clusterKey = stack.children.find(
      (k) => elements[k]?.type === "Cluster",
    );
    if (!clusterKey) continue;
    const cluster = elements[clusterKey];
    if (!cluster?.children || cluster.children.length !== 2) continue;

    const btnA = elements[cluster.children[0]];
    const btnB = elements[cluster.children[1]];
    if (!btnA || !btnB) continue;
    if (btnA.type !== "Button" || btnB.type !== "Button") continue;

    const nameA = btnA.action?.name;
    const nameB = btnB.action?.name;
    const names = new Set([nameA, nameB]);
    if (!names.has("increment") || !names.has("decrement")) continue;

    // Require a target Text element referenced by the action params.
    const targetA = btnA.action?.params?.["target"];
    const targetB = btnB.action?.params?.["target"];
    const targetKey =
      typeof targetA === "string"
        ? targetA
        : typeof targetB === "string"
          ? targetB
          : null;
    if (!targetKey) continue;
    const target = elements[targetKey];
    if (!target || target.type !== "Text") continue;

    if (nextElements == null) nextElements = { ...elements };
    nextElements[stack.key] = {
      ...stack,
      props: { ...stack.props, align: "center" },
    };

    // Ensure the action row is centered too.
    if (typeof cluster.props?.["justify"] !== "string") {
      nextElements[cluster.key] = {
        ...cluster,
        props: { ...cluster.props, justify: "center" },
      };
    }

    changed = true;
  }

  return changed && nextElements != null
    ? { ...tree, elements: nextElements }
    : tree;
}

/**
 * Normalize form action bars.
 *
 * LLMs often leave submit actions left-aligned, or use a Cluster without
 * `justify`, which looks sloppy in forms.
 *
 * Heuristic: for Stack layouts that contain at least one form control:
 * - If the last child is a submit Button (action submit_form or variant=primary),
 *   make it full-width on mobile and right-aligned on >= sm.
 * - If the last child is a Cluster of Buttons, ensure it spans full width and
 *   right-aligns its content.
 */
export function normalizeFormActionBars(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  let nextElements: Record<string, UIElement> | null = null;

  function appendClassName(existing: unknown, extra: string): string {
    if (typeof existing !== "string" || existing.trim().length === 0) {
      return extra;
    }
    if (existing.includes(extra)) return existing;
    return `${existing} ${extra}`;
  }

  for (const stack of Object.values(elements)) {
    if (!stack || stack.type !== "Stack") continue;
    const children = stack.children;
    if (!children || children.length === 0) continue;

    const hasFormControl = children.some((k) => {
      const t = elements[k]?.type;
      return typeof t === "string" && FORM_CONTROL_TYPES.has(t);
    });
    if (!hasFormControl) continue;

    const lastKey = children[children.length - 1];
    const last = elements[lastKey];
    if (!last) continue;

    // Case A: direct submit button
    if (last.type === "Button") {
      const props = last.props as Record<string, unknown>;
      const actionName = last.action?.name;
      const variant = props["variant"];
      const isSubmit = actionName === "submit_form" || variant === "primary";
      if (!isSubmit) continue;

      if (nextElements == null) nextElements = { ...elements };
      nextElements[last.key] = {
        ...last,
        props: {
          ...props,
          className: appendClassName(
            props["className"],
            "w-full sm:w-auto sm:self-end",
          ),
        },
      };
      changed = true;
      continue;
    }

    // Case B: action Cluster as last child
    if (last.type === "Cluster") {
      const clusterChildren = last.children;
      if (!clusterChildren || clusterChildren.length === 0) continue;

      const allButtons = clusterChildren.every(
        (k) => elements[k]?.type === "Button",
      );
      if (!allButtons) continue;

      const props = last.props as Record<string, unknown>;
      const nextProps: Record<string, unknown> = { ...props };

      // Must span full width for justify-end to visually work.
      nextProps["className"] = appendClassName(props["className"], "w-full");

      if (props["justify"] == null) {
        nextProps["justify"] = "end";
      }

      if (nextElements == null) nextElements = { ...elements };
      nextElements[last.key] = { ...last, props: nextProps };
      changed = true;
    }
  }

  return changed && nextElements != null
    ? { ...tree, elements: nextElements }
    : tree;
}

/**
 * Normalize Select elements missing SelectOption children.
 *
 * A Select with no options is effectively unusable. Rather than rendering an
 * empty dropdown, coerce it into an Input so the user can still provide a
 * value (keeps the label/placeholder intent intact).
 */
export function normalizeEmptySelects(tree: UITree): UITree {
  const elements = tree.elements;
  let changed = false;
  const nextElements: Record<string, UIElement> = { ...elements };

  for (const el of Object.values(elements)) {
    if (!el || el.type !== "Select") continue;

    const children = el.children;
    const hasSelectOptions =
      Array.isArray(children) &&
      children.some((k) => elements[k]?.type === "SelectOption");

    if (hasSelectOptions) continue;

    const { children: _children, ...rest } = el;
    nextElements[el.key] = { ...rest, type: "Input" };
    changed = true;
  }

  return changed ? { ...tree, elements: nextElements } : tree;
}

function gridItemClassNameForChild(child: UIElement | undefined): string {
  // Base: allow grid children to shrink (prevents overflow in long labels/inputs)
  // and ensure each logical child becomes exactly one grid cell.
  if (!child) return "min-w-0 w-full";

  // Common form pattern: an expandable/collapsible section should span full row.
  if (child.type === "Collapsible") return "min-w-0 w-full col-span-full";

  return "min-w-0 w-full";
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface UITreeRendererProps {
  /** The UITree to render. */
  readonly tree: UITree;
  /**
   * When true, children referencing nonexistent element keys render as null
   * (invisible) instead of error divs. Set to true during streaming, when
   * parent elements declare child keys before the child elements arrive.
   */
  readonly streaming?: boolean;
  /**
   * Host callback invoked when a component with an `action` field triggers
   * its onAction. Receives a well-formed ActionEvent with actionName,
   * sourceKey, params, and context.
   */
  readonly onAction?: ActionDispatch;
  /** Per-container runtime value store (captures uncontrolled input values). */
  readonly runtimeValueStore?: RuntimeValueStore;
  /**
   * Consumer-provided custom components to extend the rendering pipeline.
   * Keys are the UITree element `type` strings. Custom components are merged
   * over the built-in COMPONENT_MAP — consumer wins on name collision.
   * Props pass through the same sanitizeProps() security pipeline as built-ins.
   */
  readonly customComponents?: Readonly<
    Record<string, CustomComponentDefinition>
  >;
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

class ElementErrorBoundary extends Component<
  { readonly elementKey: string; readonly children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded border border-kumo-danger bg-kumo-danger-tint p-2 text-xs text-kumo-danger">
          Failed to render &ldquo;{this.props.elementKey}&rdquo;
          {this.state.error ? `: ${this.state.error.message}` : ""}
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Filter out blocked props that should never be passed to components. */
function sanitizeProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (BLOCKED_PROPS.has(key)) continue;
    // Block event handler props — LLM output is JSON (no functions) but
    // defense-in-depth prevents any on* prop from reaching React components.
    if (
      key.length > 2 &&
      (key[0] === "o" || key[0] === "O") &&
      (key[1] === "n" || key[1] === "N")
    )
      continue;
    clean[key] = value;
  }
  return clean;
}

/** Resolved component map: type string → React element type. */
type ResolvedComponentMap = Readonly<Record<string, ElementType>>;

/**
 * Merge the built-in COMPONENT_MAP with consumer-provided custom components.
 * Custom components take precedence on name collision.
 */
function mergeComponentMaps(
  customComponents:
    | Readonly<Record<string, CustomComponentDefinition>>
    | undefined,
): ResolvedComponentMap {
  if (!customComponents) return COMPONENT_MAP;

  const merged: Record<string, ElementType> = { ...COMPONENT_MAP };
  for (const [type, def] of Object.entries(customComponents)) {
    merged[type] = def.component;
  }
  return merged;
}

/**
 * Extract Zod schemas from custom component definitions.
 * Returns null when no definitions provide a propsSchema (avoids allocating
 * an empty object on every render).
 */
function extractCustomSchemas(
  customComponents:
    | Readonly<Record<string, CustomComponentDefinition>>
    | undefined,
): Readonly<Record<string, ZodType>> | null {
  if (!customComponents) return null;

  let schemas: Record<string, ZodType> | null = null;
  for (const [type, def] of Object.entries(customComponents)) {
    if (def.propsSchema != null) {
      if (schemas == null) schemas = {};
      schemas[type] = def.propsSchema;
    }
  }
  return schemas;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readEventTargetValue(event: unknown): string | undefined {
  if (!isRecord(event)) return undefined;
  const target = event["target"];
  if (!isRecord(target)) return undefined;
  const value = target["value"];
  return typeof value === "string" ? value : undefined;
}

function chainHandlers(
  first: (event: unknown) => void,
  second: unknown,
): (event: unknown) => void {
  return (event: unknown) => {
    first(event);
    if (typeof second === "function") {
      second(event);
    }
  };
}

function preventDefaultIfPossible(event: unknown): void {
  if (!isRecord(event)) return;
  const preventDefault = event["preventDefault"];
  if (typeof preventDefault === "function") {
    preventDefault();
  }
}

function createSubmitFormClickHandler(
  action: UIElement["action"],
  sourceKey: string,
  dispatch: ActionDispatch,
  runtimeValueStore: RuntimeValueStore,
  existingOnClick?: unknown,
): (...args: unknown[]) => void {
  return (...args: unknown[]) => {
    if (typeof existingOnClick === "function") {
      existingOnClick(...args);
    }

    const runtimeValues = runtimeValueStore.snapshotAll();

    dispatch({
      actionName: action?.name ?? "submit_form",
      sourceKey,
      ...(action?.params != null ? { params: action.params } : undefined),
      context: { [SUBMIT_FORM_RUNTIME_VALUES_KEY]: runtimeValues },
    });
  };
}

// ---------------------------------------------------------------------------
// Element Renderer
// ---------------------------------------------------------------------------

function RenderElement({
  elementKey,
  elements,
  depth = 0,
  streaming = false,
  onAction,
  componentMap,
  customSchemas,
}: {
  readonly elementKey: string;
  readonly elements: Record<string, UIElement>;
  readonly depth?: number;
  readonly streaming?: boolean;
  readonly onAction?: ActionDispatch;
  readonly componentMap: ResolvedComponentMap;
  readonly customSchemas?: Readonly<Record<string, ZodType>> | null;
}): React.JSX.Element | null {
  const runtimeValueStore = useRuntimeValueStoreContext();

  if (depth > MAX_DEPTH) {
    return (
      <div className="text-xs text-kumo-danger">
        Max depth exceeded at: {elementKey}
      </div>
    );
  }

  const rawElement = elements[elementKey];
  if (!rawElement) {
    // Missing keys are expected in generative UI — the LLM may declare child
    // references it never defines (output truncation, token limits, etc.).
    // During streaming they'll appear on the next patch; after streaming ends
    // they're simply incomplete output. Render nothing either way rather than
    // showing distracting error text to the user.
    return null;
  }

  // Coerce known-invalid enum values to valid equivalents BEFORE validation.
  // This preserves the LLM's semantic intent (e.g. Badge "success" → "primary")
  // instead of stripping the prop entirely via repair.
  const element = coerceElementProps(rawElement);

  // Validate the coerced element's props against Kumo schema before rendering.
  // On failure, attempt to repair by stripping invalid props so the
  // component renders with defaults instead of showing an error box.
  // Note: we validate the coerced element (not rawElement) so corrected
  // enum values pass through validation and survive into the rendered output.
  const validation = getElementValidation(element, customSchemas);
  if (!validation.valid) {
    const repaired = repairElement(element, validation);
    if (repaired != null) {
      // Log the repair once per element instance
      if (!loggedInvalidElements.has(element)) {
        loggedInvalidElements.add(element);
        const originalProps = element.props as Record<string, unknown>;
        const repairedProps = repaired.props as Record<string, unknown>;
        const stripped = Object.keys(originalProps).filter(
          (k) => !(k in repairedProps),
        );
        logValidationRepair(validation, stripped);
      }
      // Re-render with the repaired element. We replace the element in a
      // shallow copy of the elements map so downstream rendering uses the
      // cleaned props. This doesn't mutate the original tree.
      const patchedElements = { ...elements, [elementKey]: repaired };
      return (
        <RenderElement
          elementKey={elementKey}
          elements={patchedElements}
          depth={depth}
          streaming={streaming}
          onAction={onAction}
          componentMap={componentMap}
          customSchemas={customSchemas}
        />
      );
    }

    // Repair failed (issues at root level or deeply nested) — show error.
    if (!loggedInvalidElements.has(element)) {
      loggedInvalidElements.add(element);
      logValidationError(validation);
    }
    return (
      <div
        data-key={elementKey}
        className="rounded border border-kumo-warning bg-kumo-warning-tint p-2 text-xs text-kumo-warning"
      >
        Validation failed: &ldquo;{elementKey}&rdquo; ({element.type})
        {validation.issues.length > 0 && (
          <ul className="mt-1 list-inside list-disc">
            {validation.issues.map((issue, i) => (
              <li key={i}>
                {issue.path}: {issue.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const { type, props, children } = element;
  const nextDepth = depth + 1;

  // Handle the special "Div" type — generic HTML container
  if (type === "Div") {
    const safeProps = sanitizeProps(props as Record<string, unknown>);
    const { className, ...rest } = safeProps;
    return (
      <ElementErrorBoundary elementKey={elementKey}>
        <div
          data-key={elementKey}
          className={typeof className === "string" ? className : undefined}
          // Only pass through style, id, and data-* attributes
          {...filterDivProps(rest)}
        >
          {children?.map((childKey: string) => (
            <RenderElement
              key={childKey}
              elementKey={childKey}
              elements={elements}
              depth={nextDepth}
              streaming={streaming}
              onAction={onAction}
              componentMap={componentMap}
              customSchemas={customSchemas}
            />
          ))}
        </div>
      </ElementErrorBoundary>
    );
  }

  const Comp = componentMap[type];
  if (!Comp) {
    return (
      <div className="rounded border border-kumo-warning bg-kumo-warning-tint p-2 text-xs text-kumo-warning">
        Unknown component: {type}
      </div>
    );
  }

  // Separate "children" text prop from structural children keys.
  // Some elements use props.children as text (e.g., Text, Badge, Button)
  // while also having structural children[] array for nested elements.
  const safeProps = sanitizeProps(props as Record<string, unknown>);
  const { children: propsChildren, ...restProps } = safeProps;

  // Tag every rendered element with its key for DOM identification
  restProps["data-key"] = elementKey;

  // Inject action handler when element declares an action field.
  // Button and Link use onClick (they don't have an onAction prop);
  // all other components use the onAction callback pattern.
  if (element.action != null && onAction != null) {
    if (ONCLICK_ACTION_TYPES.has(type)) {
      if (element.action.name === "submit_form" && runtimeValueStore != null) {
        restProps.onClick = createSubmitFormClickHandler(
          element.action,
          elementKey,
          onAction,
          runtimeValueStore,
          restProps.onClick,
        );
      } else {
        restProps.onClick = createClickHandler(
          element.action,
          elementKey,
          onAction,
          restProps.onClick,
        );
      }
    } else {
      restProps.onAction = createActionHandler(
        element.action,
        elementKey,
        onAction,
      );
    }
  }

  // Capture uncontrolled Input/Textarea values into the per-container runtime
  // value store. Avoid controlled mode; just observe onChange.
  if (runtimeValueStore != null && RUNTIME_VALUE_CAPTURE_TYPES.has(type)) {
    const seedValue =
      typeof restProps["value"] === "string"
        ? restProps["value"]
        : typeof restProps["defaultValue"] === "string"
          ? restProps["defaultValue"]
          : undefined;
    if (
      seedValue !== undefined &&
      runtimeValueStore.getValue(elementKey) === undefined &&
      !runtimeValueStore.isTouched(elementKey)
    ) {
      runtimeValueStore.setValue(elementKey, seedValue, { touched: false });
    }

    const existingOnChange = restProps.onChange;
    restProps.onChange = chainHandlers((event: unknown) => {
      const value = readEventTargetValue(event);
      if (value === undefined) return;
      runtimeValueStore.setValue(elementKey, value);
    }, existingOnChange);
  }

  // Apply URL policy to Link hrefs. When blocked, strip href and prevent
  // navigation on click (but still allow any existing onClick/action logic).
  if (type === "Link") {
    const href = restProps["href"];
    if (typeof href === "string") {
      const decision = sanitizeUrl(href);
      if (decision.ok) {
        restProps["href"] = decision.url;
      } else {
        delete restProps["href"];
        const existingOnClick = restProps.onClick;
        restProps.onClick = (...args: unknown[]) => {
          preventDefaultIfPossible(args[0]);
          console.warn(
            `[kumo] blocked Link href (${decision.reason}): ${href}`,
          );
          if (typeof existingOnClick === "function") {
            existingOnClick(...args);
          }
        };
      }
    }
  }

  // Build rendered child elements from children[] key references
  const renderedChildren: ReactNode[] = [];

  // If props.children is a string/number, render it as text content
  if (propsChildren != null && typeof propsChildren !== "object") {
    renderedChildren.push(propsChildren as ReactNode);
  }

  // Render structural children
  if (children && children.length > 0) {
    for (const childKey of children) {
      // Avoid inserting empty grid cells during streaming when child elements
      // haven't arrived yet.
      if (streaming && !elements[childKey]) continue;

      const childNode = (
        <RenderElement
          key={childKey}
          elementKey={childKey}
          elements={elements}
          depth={nextDepth}
          streaming={streaming}
          onAction={onAction}
          componentMap={componentMap}
          customSchemas={customSchemas}
        />
      );

      if (type === "Grid") {
        renderedChildren.push(
          <GridItem
            key={childKey}
            className={gridItemClassNameForChild(elements[childKey])}
          >
            {childNode}
          </GridItem>,
        );
      } else {
        renderedChildren.push(childNode);
      }
    }
  }

  return (
    <ElementErrorBoundary elementKey={elementKey}>
      <Comp {...restProps}>
        {renderedChildren.length > 0 ? renderedChildren : undefined}
      </Comp>
    </ElementErrorBoundary>
  );
}

/** Only allow safe props on native div elements. */
function filterDivProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    // Allow data-* and aria-* attributes, plus role.
    // Blocked: style (CSS injection), id (DOM clobbering), on* (event handlers).
    if (key.startsWith("data-") || key.startsWith("aria-") || key === "role") {
      safe[key] = value;
    }
  }
  return safe;
}

// ---------------------------------------------------------------------------
// Main Renderer
// ---------------------------------------------------------------------------

function inferRootKey(
  elements: Record<string, UIElement>,
  missingRootHint?: string,
): string | null {
  const childKeys = new Set<string>();
  for (const el of Object.values(elements)) {
    if (!el?.children) continue;
    for (const childKey of el.children) {
      if (typeof childKey === "string" && childKey) childKeys.add(childKey);
    }
  }

  const candidates: string[] = [];
  for (const [key, el] of Object.entries(elements)) {
    if (!el) continue;
    const parentKey = el.parentKey;
    if (typeof parentKey === "string" && parentKey) continue;
    if (childKeys.has(key)) continue;
    candidates.push(key);
  }

  if (candidates.length === 0) {
    // If the model set a root key but never defined the root element,
    // fall back to the element(s) that claim that missing root as parent.
    if (missingRootHint) {
      const hintChildren: string[] = [];
      for (const [key, el] of Object.entries(elements)) {
        if (!el) continue;
        if (el.parentKey === missingRootHint) hintChildren.push(key);
      }
      if (hintChildren.length > 0) {
        hintChildren.sort();
        return hintChildren[0] ?? null;
      }
    }

    // Last resort: render *something* rather than returning null.
    const keys = Object.keys(elements);
    if (keys.length === 0) return null;
    keys.sort();
    return keys[0] ?? null;
  }
  if (candidates.length === 1) return candidates[0] ?? null;
  candidates.sort();
  return candidates[0] ?? null;
}

function UITreeRendererImpl({
  tree,
  streaming = false,
  onAction,
  runtimeValueStore,
  customComponents,
}: UITreeRendererProps): React.JSX.Element | null {
  if (Object.keys(tree.elements).length === 0) return null;

  // During streaming, the model can set /root before it defines the root
  // element. The normalization pipeline expects a real root element, so pick a
  // root key that exists before normalizing.
  const rootKey =
    (tree.root && tree.elements[tree.root] ? tree.root : null) ??
    inferRootKey(tree.elements, tree.root || undefined);
  if (!rootKey) return null;

  const normalizedTree = useMemo(() => {
    const treeForNormalize =
      tree.root === rootKey ? tree : { ...tree, root: rootKey };
    return normalizeFormActionBars(
      normalizeCounterStacks(
        normalizeSurfaceOrphans(
          normalizeSiblingFormRowGrids(
            normalizeCheckboxGroupGrids(
              normalizeDuplicateFieldLabels(
                normalizeEmptySelects(
                  normalizeNestedSurfaces(treeForNormalize),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }, [tree, rootKey]);

  // Merge built-in and custom component maps. Memoize to avoid rebuilding on
  // every render — the identity of customComponents is stable when consumers
  // define their map outside the render path (as recommended by docs).
  const resolvedMap = useMemo(
    () => mergeComponentMaps(customComponents),
    [customComponents],
  );

  // Extract Zod schemas from custom component definitions for validation.
  // Only built when at least one custom component provides a propsSchema.
  const resolvedSchemas = useMemo(
    () => extractCustomSchemas(customComponents),
    [customComponents],
  );

  return (
    <RuntimeValueStoreProvider value={runtimeValueStore ?? null}>
      <RenderElement
        elementKey={normalizedTree.root}
        elements={normalizedTree.elements}
        streaming={streaming}
        onAction={onAction}
        componentMap={resolvedMap}
        customSchemas={resolvedSchemas}
      />
    </RuntimeValueStoreProvider>
  );
}

export const UITreeRenderer = memo(UITreeRendererImpl);

/** Check if a UITree has any renderable content. */
export function isRenderableTree(tree: UITree): boolean {
  if (Object.keys(tree.elements).length === 0) return false;
  if (tree.root !== "" && tree.elements[tree.root]) return true;
  return inferRootKey(tree.elements, tree.root || undefined) !== null;
}

/** Get unrecognized types in a tree (for debugging). */
export function getUnknownTypes(tree: UITree): string[] {
  const unknown: string[] = [];
  for (const key of Object.keys(tree.elements)) {
    const el = tree.elements[key];
    if (el && !KNOWN_TYPES.has(el.type) && el.type !== "Div") {
      unknown.push(el.type);
    }
  }
  return [...new Set(unknown)];
}
