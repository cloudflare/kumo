/**
 * Component discovery for registry generation.
 *
 * Auto-discovers components from the filesystem and builds configurations
 * by parsing index.ts exports and component files.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import type {
  ComponentConfig,
  ComponentType,
  ComponentOverride,
  DetectedExports,
} from "./types.js";
import { toPascalCase } from "./utils.js";
import {
  extractVariantsFromFile,
  extractStylingFromFile,
} from "./variant-parser.js";

// =============================================================================
// Category Configuration
// =============================================================================

/**
 * Category mappings keyed by either component name (PascalCase) or directory
 * name (kebab-case). Component-name keys win when both are present, allowing
 * sibling components in a shared directory to map to different categories.
 */
export const CATEGORY_MAP: Record<string, string> = {
  // Action
  button: "Action",
  Button: "Action",
  LinkButton: "Action",
  RefreshButton: "Action",
  "clipboard-text": "Action",
  // Display
  badge: "Display",
  breadcrumbs: "Display",
  chart: "Data Visualization",
  code: "Display",
  collapsible: "Display",
  empty: "Display",
  "layer-card": "Display",
  meter: "Display",
  text: "Display",
  // Feedback
  banner: "Feedback",
  loader: "Feedback",
  toast: "Feedback",
  // Input
  checkbox: "Input",
  combobox: "Input",
  "date-range-picker": "Input",
  field: "Input",
  input: "Input",
  "input-group": "Input",
  radio: "Input",
  select: "Input",
  switch: "Input",
  // Layout
  grid: "Layout",
  surface: "Layout",
  // Navigation
  "command-palette": "Navigation",
  menubar: "Navigation",
  pagination: "Navigation",
  tabs: "Navigation",
  // Overlay
  dialog: "Overlay",
  dropdown: "Overlay",
  popover: "Overlay",
  tooltip: "Overlay",
  // Blocks
  "page-header": "Layout",
  "resource-list": "Layout",
};

/**
 * Overrides for component metadata that can't be auto-detected.
 * Key is the directory name (kebab-case).
 * Note: Component names and props types are now auto-detected from index.ts exports.
 */
export const COMPONENT_OVERRIDES: Record<string, ComponentOverride> = {};

// =============================================================================
// Export Detection
// =============================================================================

/**
 * Parse index.ts to detect the main component name and props type.
 * This eliminates the need for manual overrides for naming conventions.
 *
 * Detection rules:
 * 1. Component name: First PascalCase named export (not a type)
 * 2. Props type: First export matching *Props pattern
 */
export function detectExportsFromIndex(dirPath: string): DetectedExports {
  const indexPath = join(dirPath, "index.ts");
  const result: DetectedExports = {
    componentName: null,
    propsType: null,
    registryComponents: null,
  };

  if (!existsSync(indexPath)) {
    return result;
  }

  try {
    const content = readFileSync(indexPath, "utf-8");

    // Detect explicit registration: KUMO_REGISTRY_COMPONENTS = [...]
    // Each listed name becomes its own ComponentConfig sharing the same
    // source directory. Names must be PascalCase and exported by the
    // component file.
    const registryMarkerMatch = content.match(
      /export\s+const\s+KUMO_REGISTRY_COMPONENTS\s*=\s*\[([^\]]*)\]/,
    );
    if (registryMarkerMatch) {
      const names = registryMarkerMatch[1]
        .split(",")
        .map((entry) => entry.trim().replace(/^["']|["']$/g, ""))
        .filter((entry) => /^[A-Z][A-Za-z0-9]*$/.test(entry));
      if (names.length > 0) {
        result.registryComponents = names;
      }
    }

    // Match named exports: export { Foo, Bar, type BazProps } from "./file"
    // Also handles: export { Foo } from "./file"
    const exportPattern = /export\s*\{([^}]+)\}/g;
    let match: RegExpExecArray | null;

    const namedExports: string[] = [];
    const typeExports: string[] = [];

    while ((match = exportPattern.exec(content)) !== null) {
      const exportList = match[1];
      // Split by comma and process each export
      const items = exportList
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const item of items) {
        // Check if it's a type export: "type FooProps" or "type Foo as Bar"
        const typeMatch = item.match(/^type\s+(\w+)(?:\s+as\s+(\w+))?/);
        if (typeMatch) {
          // Use aliased name if present, otherwise original name
          typeExports.push(typeMatch[2] || typeMatch[1]);
        } else {
          // Regular named export, could have "as" alias: "Foo as Bar"
          const nameMatch = item.match(/^(\w+)(?:\s+as\s+(\w+))?/);
          if (nameMatch) {
            // Use aliased name if present, otherwise original name
            namedExports.push(nameMatch[2] || nameMatch[1]);
          }
        }
      }
    }

    // Also match direct exports: export const Foo = ...
    const directExportPattern = /export\s+(?:const|function)\s+(\w+)/g;
    while ((match = directExportPattern.exec(content)) !== null) {
      namedExports.push(match[1]);
    }

    // Find main component: first PascalCase export that's not a type/hook/constant
    for (const name of namedExports) {
      // Skip hooks (useXxx), constants (SCREAMING_CASE), and lowercase names
      if (
        name.startsWith("use") ||
        name === name.toUpperCase() ||
        name[0] !== name[0].toUpperCase()
      ) {
        continue;
      }
      // Skip variant functions (xxxVariants)
      if (name.endsWith("Variants")) {
        continue;
      }
      result.componentName = name;
      break;
    }

    // Find props type: look for ComponentNameProps or any *Props export
    if (result.componentName) {
      // First try exact match: ComponentNameProps
      const exactPropsType = `${result.componentName}Props`;
      if (typeExports.includes(exactPropsType)) {
        result.propsType = exactPropsType;
      }
    }

    // If no exact match, look for any *Props type
    if (!result.propsType) {
      const propsType = typeExports.find((t) => t.endsWith("Props"));
      if (propsType) {
        result.propsType = propsType;
      }
    }

    return result;
  } catch {
    return result;
  }
}

interface BarrelComponentExport extends DetectedExports {
  componentName: string;
  propsType: string;
  sourceFile: string;
}

/**
 * Detect components in a barrel directory that does not have a conventional
 * `{directory}/{directory}.tsx` entry point.
 */
export function detectComponentExportsFromIndex(
  dirPath: string,
): BarrelComponentExport[] {
  const indexPath = join(dirPath, "index.ts");
  if (!existsSync(indexPath)) return [];

  const content = readFileSync(indexPath, "utf-8");
  const exports: BarrelComponentExport[] = [];
  const exportPattern = /export\s*\{([^}]+)\}\s*from\s*["'](.+?)["']/g;
  let match: RegExpExecArray | null;

  while ((match = exportPattern.exec(content)) !== null) {
    const sourceName = match[2].replace(/^\.\//, "");
    const sourceFile = [`${sourceName}.tsx`, `${sourceName}.ts`].find((file) =>
      existsSync(join(dirPath, file)),
    );
    if (!sourceFile) continue;

    const namedExports: string[] = [];
    const typeExports: string[] = [];

    for (const item of match[1].split(",").map((value) => value.trim())) {
      const typeMatch = item.match(/^type\s+(\w+)(?:\s+as\s+(\w+))?/);
      if (typeMatch) {
        typeExports.push(typeMatch[2] || typeMatch[1]);
        continue;
      }

      const nameMatch = item.match(/^(\w+)(?:\s+as\s+(\w+))?/);
      if (nameMatch) namedExports.push(nameMatch[2] || nameMatch[1]);
    }

    for (const componentName of namedExports) {
      const propsType = `${componentName}Props`;
      if (typeExports.includes(propsType)) {
        exports.push({ componentName, propsType, sourceFile });
      }
    }
  }

  return exports;
}

/**
 * Detect props type from the main component file by looking for interfaces/types.
 * Checks both exported and non-exported types since many components use internal type aliases.
 * Falls back to standard naming convention if not found in index.ts.
 */
export function detectPropsTypeFromFile(
  filePath: string,
  componentName: string,
): string | null {
  try {
    const content = readFileSync(filePath, "utf-8");

    // Look for interface/type that ends with Props (both exported and non-exported)
    // Pattern: [export] interface FooProps or [export] type FooProps
    const exportedPropsPattern = /export\s+(?:interface|type)\s+(\w+Props)/g;
    const nonExportedPropsPattern =
      /(?:^|\n)\s*(?:interface|type)\s+(\w+Props)\s*[=<{]/g;

    const exportedTypes: string[] = [];
    const nonExportedTypes: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = exportedPropsPattern.exec(content)) !== null) {
      exportedTypes.push(match[1]);
    }

    while ((match = nonExportedPropsPattern.exec(content)) !== null) {
      // Skip if it's actually exported (already captured above)
      if (!exportedTypes.includes(match[1])) {
        nonExportedTypes.push(match[1]);
      }
    }

    // Prefer exact match: ComponentNameProps (check exported first, then non-exported)
    const exactMatch = `${componentName}Props`;
    if (exportedTypes.includes(exactMatch)) {
      return exactMatch;
    }
    if (nonExportedTypes.includes(exactMatch)) {
      return exactMatch;
    }

    // Otherwise return first Props type found (prefer exported)
    return exportedTypes[0] || nonExportedTypes[0] || null;
  } catch {
    return null;
  }
}

// =============================================================================
// Description Extraction
// =============================================================================

/**
 * Extract description text from JSDoc content.
 * Stops at first @tag, markdown heading, or fenced code block.
 */
function extractDescriptionFromJSDoc(jsdocContent: string): string | null {
  const lines: string[] = [];

  for (const rawLine of jsdocContent.split("\n")) {
    const line = rawLine.replace(/^\s*\*\s?/, "").trim();

    // Stop before structured documentation that should not become the summary.
    if (
      line.startsWith("@") ||
      /^#{1,6}\s/.test(line) ||
      line.startsWith("```") ||
      line.startsWith("~~~")
    ) {
      break;
    }

    // Keep the summary to the first paragraph.
    if (line.length === 0) {
      if (lines.length > 0) {
        break;
      }
      continue;
    }

    lines.push(line);
  }

  if (lines.length > 0) {
    return lines.join(" ").replace(/\s+/g, " ").trim();
  }

  return null;
}

/**
 * Extract component description from JSDoc comment or generate a default one.
 * Looks for JSDoc directly before the component function/const declaration.
 *
 * Handles multiple patterns:
 * - export function ComponentName
 * - export const ComponentName = forwardRef
 * - export const ComponentName = Object.assign (compound components)
 *
 * Excludes:
 * - @example blocks and code
 * - @see and other JSDoc tags
 */
export function extractDescription(
  filePath: string,
  componentName: string,
): string {
  try {
    const content = readFileSync(filePath, "utf-8");

    // First, find the position of the component declaration
    // Handles: export function X, export const X =, function X(
    const componentDeclPattern = new RegExp(
      `(?:export\\s+)?(?:function|const)\\s+${componentName}\\s*(?:=|\\()`,
    );
    const componentMatch = content.match(componentDeclPattern);

    if (!componentMatch?.index) {
      return `${componentName} component`;
    }

    const componentPos = componentMatch.index;

    // Find all JSDoc comments in the file
    const jsdocPattern = /\/\*\*\s*\n([\s\S]*?)\*\//g;
    let lastJSDoc: { content: string; endPos: number } | null = null;
    let match: RegExpExecArray | null;

    while ((match = jsdocPattern.exec(content)) !== null) {
      const jsdocEndPos = match.index + match[0].length;

      // Only consider JSDoc comments that appear before the component
      if (jsdocEndPos > componentPos) {
        break;
      }

      // Check if this JSDoc is immediately before the component
      // (only whitespace/newlines between JSDoc end and component declaration)
      const textBetween = content.slice(jsdocEndPos, componentPos);
      if (/^\s*$/.test(textBetween)) {
        lastJSDoc = { content: match[1], endPos: jsdocEndPos };
      }
    }

    // Extract description from the closest JSDoc
    if (lastJSDoc) {
      const description = extractDescriptionFromJSDoc(lastJSDoc.content);
      if (description) {
        return description;
      }
    }

    // Generate default description from component name
    return `${componentName} component`;
  } catch {
    return `${componentName} component`;
  }
}

// =============================================================================
// Directory Discovery
// =============================================================================

/**
 * Discover all component directories in a given source directory.
 * Returns array of directory names (kebab-case)
 */
export function discoverDirs(sourceDir: string): string[] {
  const entries = readdirSync(sourceDir);
  return entries.filter((entry) => {
    const fullPath = join(sourceDir, entry);
    if (!statSync(fullPath).isDirectory()) return false;
    // Check if main component file exists
    const mainFile = join(fullPath, `${entry}.tsx`);
    return existsSync(mainFile);
  });
}

// =============================================================================
// Component Configuration Building
// =============================================================================

/**
 * Look up a category by component name first, then directory name. Allows
 * directories that register multiple components to map each to its own
 * category.
 */
function resolveCategory(componentName: string, dirName: string): string {
  return CATEGORY_MAP[componentName] || CATEGORY_MAP[dirName] || "Other";
}

/**
 * Convert a PascalCase component name to its `KUMO_<NAME>_VARIANTS` constant.
 *   "Button"     -> "KUMO_BUTTON_VARIANTS"
 *   "LinkButton" -> "KUMO_LINK_BUTTON_VARIANTS"
 */
function variantConstNameFor(componentName: string): string {
  const screaming = componentName
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toUpperCase();
  return `KUMO_${screaming}_VARIANTS`;
}

/**
 * Build a single ComponentConfig for a named component sharing a directory.
 */
function buildConfig(
  params: {
    componentName: string;
    propsType: string;
    sourceDir: string;
    dirName: string;
    type: ComponentType;
    /** When true, scope variant lookup to the component's named constant. */
    scopedVariants: boolean;
  },
  override: ComponentOverride,
): ComponentConfig {
  const {
    componentName,
    propsType,
    sourceDir,
    dirName,
    type,
    scopedVariants,
  } = params;
  const mainFile = join(sourceDir, dirName, `${dirName}.tsx`);

  const variantsData = scopedVariants
    ? extractVariantsFromFile(mainFile, variantConstNameFor(componentName))
    : extractVariantsFromFile(mainFile);

  const category =
    override.category || resolveCategory(componentName, dirName);

  const description =
    override.description || extractDescription(mainFile, componentName);

  const styling = extractStylingFromFile(mainFile);

  return {
    name: componentName,
    propsType,
    sourceFile: `${dirName}/${dirName}.tsx`,
    dirName,
    sourceDir,
    type,
    description,
    category,
    variants: variantsData?.variants ?? {},
    defaults: variantsData?.defaults ?? {},
    ...(variantsData?.baseStyles && { baseStyles: variantsData.baseStyles }),
    ...(styling && { styling }),
    // Note: subComponents are added later by processComponent in index.ts
  };
}

/**
 * Auto-discover and build configurations from a source directory.
 * Component/block names and props types are detected from index.ts exports.
 *
 * Directories may opt into multi-component registration by exporting
 * `KUMO_REGISTRY_COMPONENTS` from `index.ts`. When present, one
 * `ComponentConfig` is emitted per listed name.
 */
export async function discoverFromDir(
  sourceDir: string,
  type: ComponentType,
): Promise<ComponentConfig[]> {
  const dirs = discoverDirs(sourceDir);
  const configs: ComponentConfig[] = [];

  console.log(`Discovering ${type}s from ${sourceDir}...`);

  for (const dirName of dirs) {
    const dirPath = join(sourceDir, dirName);
    const mainFile = join(dirPath, `${dirName}.tsx`);
    const override = COMPONENT_OVERRIDES[dirName] || {};

    // Auto-detect component name and props type from index.ts
    const detected = detectExportsFromIndex(dirPath);

    // Multi-component path: emit one config per registered component name.
    if (detected.registryComponents && detected.registryComponents.length > 0) {
      for (const componentName of detected.registryComponents) {
        const propsType =
          detectPropsTypeFromFile(mainFile, componentName) ||
          `${componentName}Props`;

        console.log(
          `  ${dirName} → ${componentName} (props: ${propsType}, type: ${type})`,
        );

        configs.push(
          buildConfig(
            {
              componentName,
              propsType,
              sourceDir,
              dirName,
              type,
              scopedVariants: true,
            },
            override,
          ),
        );
      }
      continue;
    }

    // Legacy single-component path.
    const baseName = toPascalCase(dirName);
    const componentName = detected.componentName || baseName;

    let propsType = detected.propsType;
    if (!propsType) {
      propsType = detectPropsTypeFromFile(mainFile, componentName);
    }
    if (!propsType) {
      propsType = `${componentName}Props`;
    }

    console.log(
      `  ${dirName} → ${componentName} (props: ${propsType}, type: ${type})`,
    );

    configs.push(
      buildConfig(
        {
          componentName,
          propsType,
          sourceDir,
          dirName,
          type,
          scopedVariants: false,
        },
        override,
      ),
    );
  }

  for (const entry of readdirSync(sourceDir)) {
    const dirPath = join(sourceDir, entry);
    if (!statSync(dirPath).isDirectory()) continue;
    if (existsSync(join(dirPath, `${entry}.tsx`))) continue;

    for (const detected of detectComponentExportsFromIndex(dirPath)) {
      const mainFile = join(dirPath, detected.sourceFile);
      const variantsData = extractVariantsFromFile(mainFile);
      const styling = extractStylingFromFile(mainFile);

      console.log(
        `  ${entry}/${detected.sourceFile} → ${detected.componentName} (props: ${detected.propsType}, type: ${type})`,
      );

      configs.push({
        name: detected.componentName,
        propsType: detected.propsType,
        sourceFile: `${entry}/${detected.sourceFile}`,
        dirName: entry,
        sourceDir,
        type,
        description: extractDescription(mainFile, detected.componentName),
        category: CATEGORY_MAP[entry] || "Other",
        variants: variantsData?.variants ?? {},
        defaults: variantsData?.defaults ?? {},
        ...(variantsData?.baseStyles && {
          baseStyles: variantsData.baseStyles,
        }),
        ...(styling && { styling }),
      });
    }
  }

  return configs;
}

/**
 * Auto-discover and build component configurations from filesystem.
 * Discovers both components and blocks.
 */
export async function discoverComponents(
  componentsDir: string,
): Promise<ComponentConfig[]> {
  const componentConfigs = await discoverFromDir(componentsDir, "component");

  console.log(`Discovered ${componentConfigs.length} components`);

  // Sort by name for consistent output
  return componentConfigs.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Auto-discover and build block configurations from filesystem.
 * Blocks are composite components installed via CLI.
 */
export async function discoverBlocks(
  blocksDir: string,
): Promise<ComponentConfig[]> {
  const blockConfigs = await discoverFromDir(blocksDir, "block");

  console.log(`Discovered ${blockConfigs.length} blocks`);

  // Sort by name for consistent output
  return blockConfigs.sort((a, b) => a.name.localeCompare(b.name));
}
