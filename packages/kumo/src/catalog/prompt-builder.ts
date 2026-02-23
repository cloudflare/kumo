/**
 * Prompt builder — generates categorized, scored component documentation
 * from the auto-generated component registry.
 *
 * Reads `component-registry.json` and produces a markdown section suitable
 * for embedding in an LLM system prompt. Features:
 *
 * - **Prop filtering**: skips className, id, on*, set*, aria-* prefixes
 * - **Prop scoring**: required > enum > interesting names (children, variant, size, …)
 * - **Top-N props**: at most `maxPropsPerComponent` (default 10) per entry
 * - **Category grouping**: Layout / Content / Interactive / Data Display / Navigation / Action / Feedback / Brand
 * - **Sub-component docs**: Select.Option, Table.Row, Breadcrumbs.Link, etc.
 * - **Type aliases**: Textarea → InputArea, RadioGroup → Radio.Group
 *
 * @module
 */

// =============================================================================
// Custom component definition (prompt-relevant fields only)
// =============================================================================

/**
 * Structural subset of {@link CustomComponentDefinition} used by the prompt
 * builder. Only the metadata needed for documentation is included — no React
 * component or Zod schema references.
 */
interface CustomPropDefinitionLike {
  readonly type: string;
  readonly description?: string;
  readonly optional?: boolean;
  readonly values?: readonly string[];
  readonly default?: unknown;
}

interface CustomComponentDefinitionLike {
  readonly description?: string;
  readonly props?: Record<string, CustomPropDefinitionLike>;
  readonly category?: string;
}

// =============================================================================
// Registry parsing types (defensive — avoid trusting JSON module typing)
// =============================================================================

interface RegistryProp {
  readonly type: string;
  readonly optional?: boolean;
  readonly values?: readonly string[];
  readonly default?: unknown;
  readonly description?: string;
}

interface RegistrySubComponent {
  readonly description: string;
  readonly props: Record<string, RegistryProp>;
}

interface RegistryComponent {
  readonly description: string;
  readonly category: string;
  readonly props: Record<string, RegistryProp>;
  readonly subComponents?: Record<string, RegistrySubComponent>;
}

interface ParsedRegistry {
  readonly components: Record<string, RegistryComponent>;
}

// =============================================================================
// Prompt builder options
// =============================================================================

/** Options for {@link buildComponentDocs}. */
export interface PromptBuilderOptions {
  /**
   * Maximum number of props to show per component/sub-component.
   * @default 10
   */
  readonly maxPropsPerComponent?: number;

  /**
   * Restrict output to these component names only.
   * When omitted, all registry components (plus aliases & synthetics) are included.
   */
  readonly components?: readonly string[];

  /**
   * Consumer-provided custom component definitions.
   * When present, a `### Custom` section is appended to the component docs.
   */
  readonly customComponents?: Readonly<
    Record<string, CustomComponentDefinitionLike>
  >;
}

// =============================================================================
// Type alias & sub-component resolution
// =============================================================================

interface RegistryRef {
  readonly component: string;
  readonly subComponent?: string;
}

/**
 * Maps UI type names (as the LLM emits them) to their registry location.
 * Aliases point to a different component name; sub-component refs point
 * into the parent's `subComponents` map.
 */
const UI_TYPE_TO_REGISTRY_REF: Readonly<Record<string, RegistryRef>> = {
  // Aliases
  Textarea: { component: "InputArea" },
  RadioGroup: { component: "Radio" },

  // Sub-components
  SelectOption: { component: "Select", subComponent: "Option" },

  BreadcrumbsLink: { component: "Breadcrumbs", subComponent: "Link" },
  BreadcrumbsCurrent: { component: "Breadcrumbs", subComponent: "Current" },
  BreadcrumbsSeparator: {
    component: "Breadcrumbs",
    subComponent: "Separator",
  },

  TableHeader: { component: "Table", subComponent: "Header" },
  TableHead: { component: "Table", subComponent: "Head" },
  TableBody: { component: "Table", subComponent: "Body" },
  TableRow: { component: "Table", subComponent: "Row" },
  TableCell: { component: "Table", subComponent: "Cell" },
  TableFooter: { component: "Table", subComponent: "Footer" },
};

// =============================================================================
// Category grouping
// =============================================================================

/** Prompt group label. Matches the source grouping from kumo-stream. */
type PromptGroup =
  | "Layout"
  | "Content"
  | "Interactive"
  | "Data Display"
  | "Navigation"
  | "Action"
  | "Feedback"
  | "Brand"
  | "Other";

const PROMPT_GROUP_ORDER: readonly PromptGroup[] = [
  "Layout",
  "Content",
  "Interactive",
  "Data Display",
  "Navigation",
  "Action",
  "Feedback",
  "Brand",
  "Other",
];

/** Maps a UI type + its registry category to a prompt group. */
function groupForType(uiType: string, category: string): PromptGroup {
  if (uiType === "CloudflareLogo") return "Brand";
  if (uiType === "ClipboardText") return "Action";

  if (
    uiType === "Surface" ||
    uiType === "Stack" ||
    uiType === "Cluster" ||
    uiType === "Grid" ||
    uiType === "Div"
  ) {
    return "Layout";
  }

  if (uiType.startsWith("Table") || uiType === "Meter") return "Data Display";
  if (
    uiType === "Link" ||
    uiType === "Breadcrumbs" ||
    uiType.startsWith("Breadcrumbs")
  ) {
    return "Navigation";
  }

  switch (category) {
    case "Layout":
      return "Layout";
    case "Display":
      return "Content";
    case "Input":
      return "Interactive";
    case "Navigation":
      return "Navigation";
    case "Action":
      return "Action";
    case "Feedback":
      return "Feedback";
    default:
      return "Other";
  }
}

// =============================================================================
// Prop filtering & scoring
// =============================================================================

/** Prop names that are always skipped in prompt output. */
function shouldSkipProp(name: string): boolean {
  if (
    name === "className" ||
    name === "id" ||
    name === "lang" ||
    name === "title"
  ) {
    return true;
  }
  if (name.startsWith("on")) return true;
  if (name.startsWith("set")) return true;
  if (name.startsWith("aria-")) return true;
  return false;
}

/**
 * Layout-critical props that score at +2.
 * These must surface in the top-N for layout components so the LLM
 * always specifies them rather than relying on defaults.
 */
const LAYOUT_CRITICAL_PROP_NAMES: ReadonlySet<string> = new Set([
  "gap",
  "justify",
]);

/**
 * Short usage hints appended after the component description line for
 * layout components. Helps the LLM understand composition patterns
 * without reading the full system prompt anti-patterns section.
 */
const COMPOSITION_HINTS: Readonly<Record<string, string>> = {
  Surface:
    "Hint: Always wrap children in a Stack. Never nest Surface > Surface without Grid between.",
  Grid: "Hint: Always specify variant (e.g. 2up, 3up, 4up). Use for multi-column layouts and card grids.",
  Stack:
    "Hint: Set gap explicitly (sm for tight groups, base for standard, lg for sections). Use inside Surface.",
  Cluster:
    "Hint: Set justify (start, end, between). Use for button groups and inline items.",
};

/** Props that score higher in the ranking (+1). */
const INTERESTING_PROP_NAMES: ReadonlySet<string> = new Set([
  "children",
  "label",
  "placeholder",
  "defaultValue",
  "value",
  "variant",
  "size",
  "align",
  "wrap",
  "href",
  "tabs",
  "code",
  "text",
  "legend",
  "orientation",
  "error",
  "description",
  "customValue",
  "max",
  "color",
  "layout",
]);

/**
 * Scores a prop for ranking. Higher = more prominent in the prompt.
 *
 * - Required: +3
 * - Enum type: +2
 * - Layout-critical name: +2 (gap, justify — must appear in top-N for layout components)
 * - Interesting name: +1
 */
function scoreProp(name: string, prop: RegistryProp): number {
  const requiredScore = prop.optional === true ? 0 : 3;
  const enumScore = prop.type === "enum" ? 2 : 0;
  const layoutCriticalScore = LAYOUT_CRITICAL_PROP_NAMES.has(name) ? 2 : 0;
  const nameScore = INTERESTING_PROP_NAMES.has(name) ? 1 : 0;
  return requiredScore + enumScore + layoutCriticalScore + nameScore;
}

// =============================================================================
// Registry parsing (defensive — JSON module typing is untrustworthy)
// =============================================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown, path: string): string {
  if (typeof value === "string") return value;
  throw new Error(`[prompt-builder] Expected string at ${path}`);
}

function getBooleanOptional(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  return undefined;
}

function getStringArrayOptional(value: unknown): readonly string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return undefined;
    out.push(item);
  }
  return out;
}

function parseRegistryProp(value: unknown, path: string): RegistryProp {
  if (!isRecord(value)) {
    throw new Error(`[prompt-builder] Expected object at ${path}`);
  }

  return {
    type: getString(value.type, `${path}.type`),
    optional: getBooleanOptional(value.optional),
    values: getStringArrayOptional(value.values),
    default: value.default,
    description:
      typeof value.description === "string" ? value.description : undefined,
  };
}

function parsePropsRecord(
  value: unknown,
  path: string,
): Record<string, RegistryProp> {
  if (!isRecord(value)) {
    throw new Error(`[prompt-builder] Expected object at ${path}`);
  }

  const out: Record<string, RegistryProp> = {};
  for (const [key, prop] of Object.entries(value)) {
    out[key] = parseRegistryProp(prop, `${path}.${key}`);
  }
  return out;
}

function parseSubComponents(
  value: unknown,
  path: string,
): Record<string, RegistrySubComponent> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return undefined;

  const out: Record<string, RegistrySubComponent> = {};
  for (const [key, sub] of Object.entries(value)) {
    if (!isRecord(sub)) continue;
    if (!isRecord(sub.props)) continue;

    out[key] = {
      description: typeof sub.description === "string" ? sub.description : "",
      props: parsePropsRecord(sub.props, `${path}.${key}.props`),
    };
  }
  return out;
}

function parseRegistry(raw: unknown): ParsedRegistry {
  if (!isRecord(raw)) {
    throw new Error("[prompt-builder] Registry JSON is not an object");
  }
  if (!isRecord(raw.components)) {
    throw new Error("[prompt-builder] Registry JSON missing components object");
  }

  const components: Record<string, RegistryComponent> = {};

  for (const [name, comp] of Object.entries(raw.components)) {
    if (!isRecord(comp)) continue;
    if (!isRecord(comp.props)) continue;

    components[name] = {
      description: typeof comp.description === "string" ? comp.description : "",
      category: typeof comp.category === "string" ? comp.category : "Other",
      props: parsePropsRecord(comp.props, `components.${name}.props`),
      subComponents: parseSubComponents(
        comp.subComponents,
        `components.${name}.subComponents`,
      ),
    };
  }

  return { components };
}

// =============================================================================
// Rendering helpers
// =============================================================================

function resolveRegistryRef(uiType: string): RegistryRef {
  return UI_TYPE_TO_REGISTRY_REF[uiType] ?? { component: uiType };
}

function resolveRegistryEntry(
  registry: ParsedRegistry,
  ref: RegistryRef,
): {
  readonly description: string;
  readonly category: string;
  readonly props: Record<string, RegistryProp>;
} | null {
  const comp = registry.components[ref.component];
  if (!comp) return null;

  if (ref.subComponent) {
    const sub = comp.subComponents?.[ref.subComponent];
    if (!sub) return null;
    return {
      description: sub.description,
      category: comp.category,
      props: sub.props,
    };
  }

  return {
    description: comp.description,
    category: comp.category,
    props: comp.props,
  };
}

function formatPropType(prop: RegistryProp): string {
  if (prop.type === "enum" && prop.values && prop.values.length > 0) {
    return prop.values.map((v) => `"${v}"`).join(" | ");
  }
  return prop.type;
}

function renderPropsLines(
  props: Record<string, RegistryProp>,
  maxProps: number,
): string[] {
  const entries: Array<{ name: string; prop: RegistryProp; score: number }> =
    [];

  for (const [name, prop] of Object.entries(props)) {
    if (shouldSkipProp(name)) continue;

    const score = scoreProp(name, prop);
    if (score <= 0) continue;

    entries.push({ name, prop, score });
  }

  // Immutable sort (oxlint enforces toSorted)
  const sorted = entries.toSorted((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return sorted.slice(0, maxProps).map(({ name, prop }) => {
    const optional = prop.optional === true;
    const defaultPart =
      prop.default === undefined
        ? ""
        : typeof prop.default === "string"
          ? ` (default "${prop.default}")`
          : typeof prop.default === "number" ||
              typeof prop.default === "boolean"
            ? ` (default ${String(prop.default)})`
            : ` (default ${JSON.stringify(prop.default)})`;
    return `  - ${name}${optional ? "?" : ""}: ${formatPropType(prop)}${defaultPart}`;
  });
}

// =============================================================================
// Synthetic entries (not in the registry but needed by generative UI)
// =============================================================================

interface SyntheticEntry {
  readonly description: string;
  readonly propsLines: string[];
}

const SYNTHETIC_TYPES: Readonly<Record<string, SyntheticEntry>> = {
  Div: {
    description:
      "Generic HTML container. Props: className, role, aria-*, data-*.",
    propsLines: [
      "  - className?: string",
      "  - role?: string",
      "  - aria-*: string",
      "  - data-*: string",
    ],
  },
  RadioItem: {
    description: "Radio option item (used as a child of RadioGroup).",
    propsLines: [
      "  - label: string",
      "  - value: string",
      "  - disabled?: boolean",
    ],
  },
};

// =============================================================================
// Default types — all registry components + aliases + sub-component types + synthetics
// =============================================================================

function collectAllTypes(registry: ParsedRegistry): readonly string[] {
  const types = new Set<string>();

  // All top-level registry components
  for (const name of Object.keys(registry.components)) {
    types.add(name);
  }

  // All alias and sub-component types
  for (const uiType of Object.keys(UI_TYPE_TO_REGISTRY_REF)) {
    types.add(uiType);
  }

  // Synthetic types
  for (const uiType of Object.keys(SYNTHETIC_TYPES)) {
    types.add(uiType);
  }

  return Array.from(types).toSorted((a, b) => a.localeCompare(b));
}

// =============================================================================
// Custom component docs rendering
// =============================================================================

/**
 * Convert a {@link CustomPropDefinitionLike} record into the same prop line
 * format used for built-in components, applying the same scoring & top-N logic.
 */
function renderCustomComponentDocs(
  customComponents: Readonly<Record<string, CustomComponentDefinitionLike>>,
  maxProps: number,
): string[] {
  const names = Object.keys(customComponents).toSorted((a, b) =>
    a.localeCompare(b),
  );
  const lines: string[] = [];

  for (const name of names) {
    const def = customComponents[name];
    if (!def) continue;

    const description = def.description ?? "Custom component";
    lines.push(`- **${name}** — ${description}`);

    if (def.props) {
      // Convert CustomPropDefinitionLike → RegistryProp shape for reuse
      const registryProps: Record<string, RegistryProp> = {};
      for (const [propName, propDef] of Object.entries(def.props)) {
        registryProps[propName] = {
          type:
            propDef.values && propDef.values.length > 0 ? "enum" : propDef.type,
          optional: propDef.optional,
          values: propDef.values,
          default: propDef.default,
          description: propDef.description,
        };
      }
      const propLines = renderPropsLines(registryProps, maxProps);
      if (propLines.length > 0) lines.push(...propLines);
    }
  }

  return lines;
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Build a categorized, scored component documentation string from the
 * component registry JSON. Suitable for embedding in an LLM system prompt.
 *
 * @param registryJson - The raw `component-registry.json` content.
 *   Typically: `import registryJson from '@cloudflare/kumo/ai/component-registry.json'`
 * @param options - Filtering and rendering options.
 * @returns Markdown string with components grouped by category.
 *
 * @example
 * ```ts
 * import registryJson from '@cloudflare/kumo/ai/component-registry.json';
 * import { buildComponentDocs } from '@cloudflare/kumo/catalog';
 *
 * // Full docs for all components
 * const docs = buildComponentDocs(registryJson);
 *
 * // Subset
 * const docs = buildComponentDocs(registryJson, {
 *   components: ['Button', 'Input', 'Select', 'Surface'],
 * });
 * ```
 */
export function buildComponentDocs(
  registryJson: unknown,
  options: PromptBuilderOptions = {},
): string {
  const {
    maxPropsPerComponent = 10,
    components: componentFilter,
    customComponents,
  } = options;

  const registry = parseRegistry(registryJson);

  // Determine which UI types to include
  const allTypes = collectAllTypes(registry);
  const typesToInclude: readonly string[] = componentFilter
    ? allTypes.filter((t) => componentFilter.includes(t))
    : allTypes;

  // Group entries by prompt category
  const grouped = new Map<PromptGroup, string[]>();
  for (const group of PROMPT_GROUP_ORDER) grouped.set(group, []);

  for (const uiType of typesToInclude) {
    // Handle synthetic types first
    const synthetic = SYNTHETIC_TYPES[uiType];
    if (synthetic) {
      const group = groupForType(uiType, "Other");
      const lines = grouped.get(group);
      if (!lines) continue;

      lines.push(`- **${uiType}** — ${synthetic.description}`);
      lines.push(...synthetic.propsLines);
      continue;
    }

    // Resolve registry entry
    const ref = resolveRegistryRef(uiType);
    const entry = resolveRegistryEntry(registry, ref);
    if (!entry) continue;

    // Alias annotation
    const aliasNote =
      uiType === "Textarea"
        ? " (alias of InputArea)"
        : uiType === "RadioGroup"
          ? " (alias of Radio)"
          : "";

    const group = groupForType(uiType, entry.category);
    const lines = grouped.get(group);
    if (!lines) continue;

    lines.push(`- **${uiType}**${aliasNote} — ${entry.description}`);
    const hint = COMPOSITION_HINTS[uiType];
    if (hint) lines.push(`  ${hint}`);
    const propLines = renderPropsLines(entry.props, maxPropsPerComponent);
    if (propLines.length > 0) lines.push(...propLines);
  }

  // Assemble output
  const out: string[] = [];
  for (const group of PROMPT_GROUP_ORDER) {
    const lines = grouped.get(group);
    if (!lines || lines.length === 0) continue;
    out.push(`### ${group}`);
    out.push(...lines);
    out.push("");
  }

  // Append custom component docs under ### Custom heading
  if (customComponents) {
    const customLines = renderCustomComponentDocs(
      customComponents,
      maxPropsPerComponent,
    );
    if (customLines.length > 0) {
      out.push(`### Custom`);
      out.push(...customLines);
      out.push("");
    }
  }

  return out.join("\n").trimEnd();
}
