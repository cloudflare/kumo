/**
 * Component Metadata Generator for AI/Agent Consumption
 *
 * This script auto-discovers components from the filesystem and uses
 * ts-json-schema-generator to derive props directly from TypeScript types,
 * then enriches with variant descriptions from KUMO_*_VARIANTS.
 *
 * Components are auto-discovered from src/components/ subdirectories.
 * Each component must export KUMO_<NAME>_VARIANTS and KUMO_<NAME>_DEFAULT_VARIANTS
 *
 * Run: pnpm codegen:registry
 * Output: ai/component-registry.json (committed to git)
 *
 * Performance optimizations:
 * - Hash-based caching: Skip regeneration for unchanged components
 * - Parallel processing: Process components concurrently (8 at a time)
 * - Skip inherited props by default: Opt-in with --inherited-props flag
 */

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as tsj from "ts-json-schema-generator";
import type { Definition } from "ts-json-schema-generator";

// Internal module imports
import type {
  CLIFlags,
  CacheFile,
  ComponentConfig,
  ComponentSchema,
  PropSchema,
  SubComponentSchema,
  ProcessComponentResult,
  GenerateRegistryResult,
} from "./types.js";
import type { BlockSchema } from "../../src/registry/types.js";
import {
  CACHE_VERSION,
  loadCache,
  saveCache,
  getCachedComponent,
  hashFileContent,
  createCacheEntry,
} from "./cache.js";
import {
  toScreamingSnakeCase,
  extractSemanticColors,
  extractBlockDependencies,
  getBlockFiles,
} from "./utils.js";
import { discoverComponents, discoverBlocks } from "./discovery.js";
import { shouldSkipProp } from "./props-filter.js";
import {
  detectSubComponents,
  extractSubComponentProps,
} from "./sub-components.js";
import { generateAIContext } from "./markdown-generator.js";
import { generateSchemasFile } from "./schema-generator.js";
import {
  PASSTHROUGH_COMPONENT_DOCS,
  ADDITIONAL_COMPONENT_PROPS,
  PROP_TYPE_OVERRIDES,
  COMPONENT_STYLING_METADATA,
} from "./metadata.js";

// External imports - demo examples from kumo-docs-astro
import { existsSync } from "node:fs";

// Type for demo metadata (matches kumo-docs-astro output)
interface DemoMetadata {
  generatedAt: string;
  version: string;
  components: Record<
    string,
    {
      componentName: string;
      sourceFile: string;
      demos: Array<{
        name: string;
        code: string;
        description?: string;
      }>;
    }
  >;
}

/**
 * Load demo examples from kumo-docs-astro's generated metadata file.
 * Returns a map compatible with the existing storyExamples interface.
 */
function loadDemoExamples(): Map<string, { aiExamples: string[] }> {
  const demoMetadataPath = join(
    __dirname,
    "../../../kumo-docs-astro/dist/demo-metadata.json",
  );

  if (!existsSync(demoMetadataPath)) {
    console.warn(
      `Warning: demo-metadata.json not found at ${demoMetadataPath}`,
    );
    console.warn(
      "Run 'pnpm --filter @cloudflare/kumo-docs-astro codegen:demos' first",
    );
    return new Map();
  }

  const metadata: DemoMetadata = JSON.parse(
    readFileSync(demoMetadataPath, "utf-8"),
  );

  const examples = new Map<string, { aiExamples: string[] }>();

  for (const [componentName, data] of Object.entries(metadata.components)) {
    examples.set(componentName, {
      aiExamples: data.demos.map((demo) => demo.code),
    });
  }

  return examples;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(__dirname, "../../src/components");
const blocksDir = join(__dirname, "../../src/blocks");
const rootDir = join(__dirname, "../..");
const cacheDir = join(__dirname, "../../.cache");
const cachePath = join(cacheDir, "component-registry-cache.json");

// =============================================================================
// CLI Flags
// =============================================================================

function parseCLIFlags(): CLIFlags {
  const args = process.argv.slice(2);
  return {
    includeInheritedProps: args.includes("--inherited-props"),
    noCache: args.includes("--no-cache"),
    verbose: args.includes("--verbose"),
  };
}

const CLI_FLAGS = parseCLIFlags();

// =============================================================================
// JSON Schema Type Conversion
// =============================================================================

function jsonSchemaTypeToString(def: Definition): string {
  if (def.$ref) {
    // Extract type name from $ref like "#/definitions/ReactNode"
    const refName = decodeURIComponent(def.$ref.split("/").pop() || "unknown");
    // Simplify common React types
    if (refName.includes("ReactNode") || refName.includes("ReactElement")) {
      return "ReactNode";
    }
    return refName;
  }
  if (def.enum) {
    return "enum";
  }
  if (def.type === "array") {
    const itemType = def.items
      ? jsonSchemaTypeToString(def.items as Definition)
      : "unknown";
    return `${itemType}[]`;
  }
  if (def.anyOf || def.oneOf) {
    const types = (def.anyOf || def.oneOf) as Definition[];
    const typeStrings = types
      .map((t) => jsonSchemaTypeToString(t))
      .filter((t) => t !== "undefined" && t !== "null");
    // Simplify if it includes ReactNode variants
    if (typeStrings.some((t) => t.includes("React"))) {
      return "ReactNode";
    }
    return typeStrings.join(" | ");
  }
  if (def.type) {
    return Array.isArray(def.type) ? def.type.join(" | ") : def.type;
  }
  return "unknown";
}

/**
 * Resolve a $ref to its actual definition.
 * Returns the resolved definition or the original if no $ref.
 */
function resolveRef(
  def: Definition,
  allDefinitions?: Record<string, Definition>,
): Definition {
  if (!def.$ref || !allDefinitions) {
    return def;
  }
  const refName = decodeURIComponent(def.$ref.split("/").pop() || "");
  const resolved = allDefinitions[refName];
  return resolved || def;
}

function convertToPropSchema(
  propName: string,
  def: Definition,
  required: boolean,
  // biome-ignore lint/suspicious/noExplicitAny: Variants have varying shapes
  variants?: Record<string, Record<string, any>>,
  defaults?: Record<string, string>,
  allDefinitions?: Record<string, Definition>,
): PropSchema {
  // Resolve $ref to get the actual definition (for enum detection)
  const resolvedDef = resolveRef(def, allDefinitions);

  const prop: PropSchema = {
    type: jsonSchemaTypeToString(def),
  };

  if (required) {
    prop.required = true;
  } else {
    prop.optional = true;
  }

  if (def.description) {
    prop.description = def.description;
  }

  // Handle enums - check both original def and resolved def (for $ref cases)
  if (def.enum) {
    prop.values = def.enum as string[];
    prop.type = "enum";
  } else if (resolvedDef.enum) {
    // Enum found via $ref resolution (e.g., KumoCodeLang)
    prop.values = resolvedDef.enum as string[];
    prop.type = "enum";
  }

  // Enrich with variant descriptions and classes if this prop is a variant
  if (variants && propName in variants) {
    const variantDef = variants[propName];
    prop.values = Object.keys(variantDef);
    prop.type = "enum";

    const descriptions: Record<string, string> = {};
    const classes: Record<string, string> = {};
    const stateClassesMap: Record<string, Record<string, string>> = {};

    for (const [key, val] of Object.entries(variantDef)) {
      if (val.description) {
        descriptions[key] = val.description;
      }
      if (val.classes) {
        classes[key] = val.classes;
      }
      if (val.stateClasses) {
        stateClassesMap[key] = val.stateClasses;
      }
    }

    if (Object.keys(descriptions).length > 0) {
      prop.descriptions = descriptions;
    }
    if (Object.keys(classes).length > 0) {
      prop.classes = classes;
    }
    if (Object.keys(stateClassesMap).length > 0) {
      prop.stateClasses = stateClassesMap;
    }
  }

  // Add default value from variants defaults
  if (defaults && propName in defaults) {
    prop.default = defaults[propName];
  }

  return prop;
}

// =============================================================================
// Props Generation from TypeScript Types
// =============================================================================

/** Derive propsType from component name */
function getPropsType(config: ComponentConfig): string {
  return config.propsType ?? `${config.name}Props`;
}

/** Derive sourceFile from component config */
function getSourceFile(config: ComponentConfig): string {
  return config.sourceFile;
}

function generatePropsFromType(
  config: ComponentConfig,
): Record<string, PropSchema> {
  const sourceFile = getSourceFile(config);
  const propsType = getPropsType(config);
  const sourcePath = join(config.sourceDir, sourceFile);

  try {
    const tsjConfig: tsj.Config = {
      path: sourcePath,
      tsconfig: join(rootDir, "tsconfig.json"),
      type: propsType,
      skipTypeCheck: true,
      expose: "all",
    };

    const schema = tsj.createGenerator(tsjConfig).createSchema(propsType);
    const props: Record<string, PropSchema> = {};

    // Get the main type definition, following $ref if needed
    let mainDef = schema.definitions?.[propsType] as Definition;
    if (!mainDef) {
      console.warn(`Warning: Could not find type ${propsType}`);
      return {};
    }

    // Follow $ref chain to get the actual definition
    // This handles cases like: ExpandableProps -> React.PropsWithChildren<...>
    while (
      mainDef.$ref &&
      !mainDef.properties &&
      !mainDef.allOf &&
      !mainDef.anyOf &&
      !mainDef.oneOf
    ) {
      const refName = decodeURIComponent(mainDef.$ref.split("/").pop()!);
      const refDef = schema.definitions?.[refName] as Definition;
      if (!refDef) break;
      mainDef = refDef;
    }

    // Helper: collect properties and required fields from a schema part
    // biome-ignore lint/suspicious/noExplicitAny: JSON Schema types are complex
    function collectFromParts(parts: Definition[]): {
      // biome-ignore lint/suspicious/noExplicitAny: JSON Schema types are complex
      properties: Record<string, any>;
      required: string[];
    } {
      // biome-ignore lint/suspicious/noExplicitAny: JSON Schema types are complex
      let properties: Record<string, any> = {};
      let required: string[] = [];

      for (const part of parts) {
        if (part.$ref) {
          const refName = decodeURIComponent(part.$ref.split("/").pop()!);
          const refDef = schema.definitions?.[refName] as Definition;
          if (refDef?.properties) {
            properties = { ...properties, ...refDef.properties };
          }
          if (refDef?.required) {
            required = [...required, ...(refDef.required as string[])];
          }
          // Recursively handle nested allOf/anyOf in referenced definitions
          if (refDef?.allOf) {
            const nested = collectFromParts(refDef.allOf as Definition[]);
            properties = { ...properties, ...nested.properties };
            required = [...required, ...nested.required];
          }
        } else if (part.properties) {
          properties = { ...properties, ...part.properties };
          if (part.required) {
            required = [...required, ...(part.required as string[])];
          }
        }
      }
      return { properties, required };
    }

    // Handle intersection types (allOf) - merge all properties
    // biome-ignore lint/suspicious/noExplicitAny: JSON Schema types are complex
    let allProperties: Record<string, any> = {};
    let allRequired: string[] = [];

    if (mainDef.allOf) {
      const result = collectFromParts(mainDef.allOf as Definition[]);
      allProperties = result.properties;
      allRequired = result.required;
    } else if (mainDef.anyOf || mainDef.oneOf) {
      // Handle union types (anyOf/oneOf) — e.g. discriminated unions like ButtonProps
      // Merge properties from all union members. Properties that only appear in
      // some members are marked as optional.
      const unionMembers = (mainDef.anyOf || mainDef.oneOf) as Definition[];
      // biome-ignore lint/suspicious/noExplicitAny: JSON Schema types are complex
      const memberProps: Array<{
        // biome-ignore lint/suspicious/noExplicitAny: JSON Schema types are complex
        properties: Record<string, any>;
        required: string[];
      }> = [];

      for (const member of unionMembers) {
        const collected = collectFromParts([member]);
        memberProps.push(collected);
      }

      // Merge all member properties
      for (const mp of memberProps) {
        allProperties = { ...allProperties, ...mp.properties };
      }

      // A prop is required only if it's required in ALL union members
      const allPropNames = Object.keys(allProperties);
      allRequired = allPropNames.filter((prop) =>
        memberProps.every((mp) => mp.required.includes(prop)),
      );
    } else if (mainDef.properties) {
      allProperties = mainDef.properties;
      allRequired = (mainDef.required as string[]) || [];
    }

    // Convert each property
    for (const [propName, propDef] of Object.entries(allProperties)) {
      // Skip internal React props and inherited DOM props we don't want to expose
      if (shouldSkipProp(propName, CLI_FLAGS)) {
        continue;
      }

      props[propName] = convertToPropSchema(
        propName,
        propDef as Definition,
        allRequired.includes(propName),
        config.variants,
        config.defaults,
        schema.definitions as Record<string, Definition>,
      );
    }

    return props;
  } catch (error) {
    console.warn(
      `Warning: Could not generate schema for ${getPropsType(config)}:`,
      error,
    );
    // Fallback: generate props from variants only
    return generatePropsFromVariantsOnly(config);
  }
}

/**
 * Fallback props generation when ts-json-schema-generator fails.
 * Extracts props from the KUMO_*_VARIANTS object only.
 * This is useful for components with complex generic types.
 */
function generatePropsFromVariantsOnly(
  config: ComponentConfig,
): Record<string, PropSchema> {
  const props: Record<string, PropSchema> = {};

  // Add variant props from the config
  for (const [propName, variantDef] of Object.entries(config.variants)) {
    const values = Object.keys(variantDef);
    const descriptions: Record<string, string> = {};

    for (const [key, val] of Object.entries(variantDef)) {
      if (val.description) {
        descriptions[key] = val.description;
      }
    }

    props[propName] = {
      type: "enum",
      values,
      ...(config.defaults[propName] && { default: config.defaults[propName] }),
      ...(Object.keys(descriptions).length > 0 && { descriptions }),
    };
  }

  // Add common props that most components have
  props.className = { type: "string", description: "Additional CSS classes" };
  props.children = { type: "ReactNode", description: "Child elements" };

  console.log(
    `  → Fallback: generated ${Object.keys(props).length} props from variants`,
  );
  return props;
}

// =============================================================================
// Process Individual Component
// =============================================================================

interface ProcessComponentInput {
  config: ComponentConfig;
  variantConstants: Map<string, string[]>;
  storyExamples: Map<string, { aiExamples: string[] }>;
  cache: CacheFile;
}

async function processComponent(
  input: ProcessComponentInput,
): Promise<ProcessComponentResult> {
  const { config, cache } = input;
  const sourcePath = join(config.sourceDir, getSourceFile(config));
  const storyPath = join(
    config.sourceDir,
    config.dirName,
    `${config.dirName}.stories.tsx`,
  );

  // Compute hashes for cache checking
  const sourceHash = hashFileContent(sourcePath);
  const storyHash = hashFileContent(storyPath);

  // Check cache
  const cachedMetadata = getCachedComponent(
    config.name,
    sourceHash,
    storyHash,
    cache,
    CLI_FLAGS,
  );

  if (cachedMetadata) {
    if (CLI_FLAGS.verbose) {
      console.log(`  ✓ ${config.name} (cached)`);
    } else {
      console.log(`✓ ${config.name} (cached)`);
    }
    const colors = extractSemanticColors(sourcePath);
    return {
      name: config.name,
      category: config.category,
      schema: cachedMetadata,
      colors,
      cached: true,
      cacheEntry: {
        componentName: config.name,
        sourceHash,
        storyHash,
        cacheVersion: CACHE_VERSION,
        generatedAt: cache.entries[config.name]?.generatedAt || Date.now(),
        metadata: cachedMetadata,
      },
    };
  }

  // Not cached, regenerate
  if (CLI_FLAGS.verbose) {
    console.log(`  → ${config.name} (regenerating)`);
  } else {
    console.log(`→ ${config.name} (regenerating)`);
  }

  const props = generatePropsFromType(config);

  // Inject additional props for components with important inherited props
  const additionalProps = ADDITIONAL_COMPONENT_PROPS[config.name];
  if (additionalProps) {
    for (const [propName, propSchema] of Object.entries(additionalProps)) {
      if (!props[propName]) {
        props[propName] = propSchema;
      } else {
        if (propSchema.type) {
          props[propName].type = propSchema.type;
        }
        if (propSchema.description) {
          props[propName].description = propSchema.description;
        }
      }
    }
  }

  // Apply type overrides
  const typeOverrides = PROP_TYPE_OVERRIDES[config.name];
  if (typeOverrides) {
    for (const [propName, newType] of Object.entries(typeOverrides)) {
      if (props[propName]) {
        props[propName].type = newType;
      }
    }
  }

  const colors = extractSemanticColors(sourcePath);

  // Determine examples
  let examples: readonly string[];
  if (config.examples !== undefined) {
    examples = config.examples;
  } else {
    const extracted = input.storyExamples.get(config.name);
    examples = extracted?.aiExamples ?? [];
    if (examples.length > 0 && CLI_FLAGS.verbose) {
      console.log(
        `    → Auto-extracted ${examples.length} examples from stories`,
      );
    }
  }

  // Detect and process sub-components
  const detectedSubComponents = detectSubComponents(sourcePath);
  let subComponentSchemas: Record<string, SubComponentSchema> | undefined;

  if (detectedSubComponents.length > 0) {
    subComponentSchemas = {};

    for (const subComp of detectedSubComponents) {
      let subProps = extractSubComponentProps(sourcePath, subComp, CLI_FLAGS);
      let description = subComp.description;
      let usageExamples: string[] | undefined;
      let renderElement: string | undefined;

      if (subComp.isPassThrough && subComp.baseComponent) {
        const passthroughDoc =
          PASSTHROUGH_COMPONENT_DOCS[subComp.baseComponent];
        if (passthroughDoc) {
          description = passthroughDoc.description;
          subProps = passthroughDoc.props;
          usageExamples = passthroughDoc.usageExamples;
          renderElement = passthroughDoc.renderElement;
        }
      }

      subComponentSchemas[subComp.name] = {
        name: subComp.name,
        description,
        props: subProps,
        ...(subComp.isPassThrough && { isPassThrough: true }),
        ...(subComp.baseComponent && { baseComponent: subComp.baseComponent }),
        ...(usageExamples && { usageExamples }),
        ...(renderElement && { renderElement }),
      };
    }

    if (CLI_FLAGS.verbose && Object.keys(subComponentSchemas).length > 0) {
      console.log(
        `    → Processed ${Object.keys(subComponentSchemas).length} sub-components`,
      );
    }
  }

  // Get styling metadata - prefer extracted from component file, fallback to hardcoded metadata
  const stylingMetadata =
    config.styling ?? COMPONENT_STYLING_METADATA[config.name];

  const schema: ComponentSchema = {
    name: config.name,
    type: config.type,
    description: config.description,
    importPath: "@cloudflare/kumo",
    category: config.category,
    props,
    examples,
    colors,
    ...(config.baseStyles && { baseStyles: config.baseStyles }),
    ...(subComponentSchemas && { subComponents: subComponentSchemas }),
    ...(stylingMetadata && { styling: stylingMetadata }),
  };

  return {
    name: config.name,
    category: config.category,
    schema,
    colors,
    cached: false,
    cacheEntry: createCacheEntry(config.name, sourceHash, storyHash, schema),
  };
}

// =============================================================================
// Parallel Processing
// =============================================================================

async function processComponentsInParallel(
  configs: ComponentConfig[],
  variantConstants: Map<string, string[]>,
  storyExamples: Map<string, { aiExamples: string[] }>,
  cache: CacheFile,
): Promise<ProcessComponentResult[]> {
  const BATCH_SIZE = 8; // Process 8 components concurrently
  const results: ProcessComponentResult[] = [];

  for (let i = 0; i < configs.length; i += BATCH_SIZE) {
    const batch = configs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((config) =>
        processComponent({ config, variantConstants, storyExamples, cache }),
      ),
    );
    results.push(...batchResults);
  }

  return results;
}

// =============================================================================
// Generate Registry
// =============================================================================

async function generateRegistry(): Promise<GenerateRegistryResult> {
  const startTime = Date.now();

  // Auto-discover components and blocks from filesystem
  const COMPONENTS = await discoverComponents(componentsDir);
  console.log(`\nDiscovered ${COMPONENTS.length} components`);

  const BLOCKS = await discoverBlocks(blocksDir);
  console.log(`Discovered ${BLOCKS.length} blocks`);

  // Load cache
  const cache = loadCache(cachePath);
  if (!CLI_FLAGS.noCache) {
    const cachedCount = Object.keys(cache.entries).length;
    console.log(`Loaded cache with ${cachedCount} entries`);
  }

  // Build variant constants map for propTester parsing (components + blocks)
  const variantConstants = new Map<string, string[]>();
  for (const config of [...COMPONENTS, ...BLOCKS]) {
    const constName = `KUMO_${toScreamingSnakeCase(config.name)}_VARIANTS`;
    for (const [propName, propVariants] of Object.entries(config.variants)) {
      if (typeof propVariants === "object" && propVariants !== null) {
        variantConstants.set(
          `${constName}.${propName}`,
          Object.keys(propVariants),
        );
      }
    }
  }

  // Load examples from demo files (kumo-docs-astro)
  console.log("\nLoading examples from demo files...");
  const storyExamples = loadDemoExamples();

  // Process components in parallel
  console.log("\nProcessing components...");
  const componentResults = await processComponentsInParallel(
    COMPONENTS,
    variantConstants,
    storyExamples,
    cache,
  );

  // Process blocks in parallel
  console.log("\nProcessing blocks...");
  const blockResults = await processComponentsInParallel(
    BLOCKS,
    variantConstants,
    storyExamples,
    cache,
  );

  // Combine and sort results by name for deterministic output
  const allResults = [...componentResults, ...blockResults];
  allResults.sort((a, b) => a.name.localeCompare(b.name));

  // Build registry from results
  const components: Record<string, ComponentSchema> = {};
  const blocks: Record<string, BlockSchema> = {};
  const byCategory: Record<string, string[]> = {};
  const byType: Record<string, string[]> = { component: [], block: [] };
  const componentColors = new Map<string, string[]>();
  const newCache: CacheFile = {
    version: CACHE_VERSION,
    entries: {},
  };

  for (const result of componentResults) {
    components[result.name] = result.schema;
    componentColors.set(result.name, result.colors);
    byType.component.push(result.name);

    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result.name);

    // Store in new cache
    newCache.entries[result.name] = result.cacheEntry;
  }

  // Process block results and build BlockSchema with files and dependencies
  for (const result of blockResults) {
    const blockConfig = BLOCKS.find((b) => b.name === result.name)!;
    const mainFilePath = join(blockConfig.sourceDir, blockConfig.sourceFile);

    // Extract dependencies and files
    const dependencies = extractBlockDependencies(mainFilePath);
    const files = getBlockFiles(blockConfig.sourceDir, blockConfig.dirName);

    blocks[result.name] = {
      ...result.schema,
      type: "block",
      files,
      dependencies,
    };
    componentColors.set(result.name, result.colors);
    byType.block.push(result.name);

    if (!byCategory[result.category]) {
      byCategory[result.category] = [];
    }
    byCategory[result.category].push(result.name);

    // Store in new cache
    newCache.entries[result.name] = result.cacheEntry;
  }

  // Save updated cache
  saveCache(newCache, cachePath, cacheDir);

  // Add InputArea as a synthetic component (uses Input's variants but has its own dimensions)
  // InputArea doesn't exist as a separate component file but needs registry metadata for Figma plugin
  if (COMPONENT_STYLING_METADATA.InputArea) {
    components.InputArea = {
      name: "InputArea",
      type: "component",
      description:
        "Multi-line textarea input with Input variants and InputArea-specific dimensions",
      importPath: "@cloudflare/kumo (synthetic - uses Input component)",
      category: "Input",
      props: {}, // Uses Input's props
      styling: COMPONENT_STYLING_METADATA.InputArea,
      examples: [],
      colors: [],
    };
    // Add to Input category
    if (!byCategory.Input) {
      byCategory.Input = [];
    }
    // Don't add to byName search (it's a synthetic entry for Figma plugin only)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const cached = allResults.filter((r) => r.cached).length;
  const regenerated = allResults.length - cached;

  console.log(
    `\n✓ Completed in ${elapsed}s (${cached} cached, ${regenerated} regenerated)`,
  );

  return {
    registry: {
      version: "1.0.0",
      components,
      blocks,
      search: {
        byCategory,
        byName: allResults.map((r) => r.name),
        byType,
      },
    },
    componentColors,
  };
}

// =============================================================================
// Main
// =============================================================================

function printHelp() {
  console.log(`
Kumo Component Registry Generator

Usage:
  pnpm build:ai-metadata [options]

Options:
  --inherited-props    Include inherited HTML props (SLOW: adds ~15s)
                       Default: false (uses minimal static skip list)
  --no-cache           Force full regeneration, ignore cache
                       Default: false (uses hash-based cache)
  --verbose            Show detailed timing and processing info
                       Default: false
  --help               Show this help message

Examples:
  pnpm build:ai-metadata                    # Fast build with cache
  pnpm build:ai-metadata --no-cache         # Full rebuild
  pnpm build:ai-metadata --inherited-props  # Include all HTML props
  pnpm build:ai-metadata --verbose          # Show detailed logs

Performance:
  - Hash-based caching: Skips unchanged components (~1s incremental)
  - Parallel processing: Processes 8 components concurrently
  - Skip inherited props: Saves ~15s (47% of total time)
  
Target: <10s cold build, <1s incremental build
`);
}

async function main() {
  // Handle --help flag
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }

  console.log("Kumo Component Registry Generator");
  console.log("==================================");
  console.log(
    `Flags: ${CLI_FLAGS.includeInheritedProps ? "inherited-props" : "skip-inherited"} | ${CLI_FLAGS.noCache ? "no-cache" : "cache"} | ${CLI_FLAGS.verbose ? "verbose" : "quiet"}`,
  );

  const { registry, componentColors } = await generateRegistry();
  const aiContext = generateAIContext(registry, componentColors);
  const schemasContent = generateSchemasFile(registry);

  // Ensure output directory exists
  const outputDir = join(__dirname, "../../ai");
  mkdirSync(outputDir, { recursive: true });

  // Write JSON registry
  const jsonPath = join(outputDir, "component-registry.json");
  writeFileSync(jsonPath, JSON.stringify(registry, null, 2));
  console.log(`\n✓ Generated ${jsonPath}`);

  // Write markdown context for LLMs
  const mdPath = join(outputDir, "component-registry.md");
  writeFileSync(mdPath, aiContext);
  console.log(`✓ Generated ${mdPath}`);

  // Write Zod schemas for runtime validation
  const schemasPath = join(outputDir, "schemas.ts");
  writeFileSync(schemasPath, schemasContent);
  console.log(`✓ Generated ${schemasPath}`);

  // Also output to stdout for piping
  console.log("\n--- Registry Summary ---");
  console.log(`Components: ${registry.search.byType.component.length}`);
  console.log(`Blocks: ${registry.search.byType.block.length}`);
  console.log(`Total: ${registry.search.byName.length}`);
  console.log(
    `Categories: ${Object.keys(registry.search.byCategory).length} (${Object.keys(registry.search.byCategory).join(", ")})`,
  );
}

// Re-export types for external consumers
export type { ComponentType } from "./types.js";

main().catch(console.error);
