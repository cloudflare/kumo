#!/usr/bin/env node
/**
 * Get documentation for a specific Kumo component
 * Usage: kumo doc <ComponentName>
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface PropInfo {
  type: string;
  optional?: boolean;
  required?: boolean;
  values?: string[];
  descriptions?: Record<string, string>;
  default?: string;
  description?: string;
}

interface SubComponent {
  description?: string;
  props?: Record<string, PropInfo>;
  renderElement?: string;
}

interface ComponentInfo {
  name: string;
  description: string;
  importPath: string;
  category: string;
  props: Record<string, PropInfo>;
  examples: string[];
  colors: string[];
  subComponents?: Record<string, SubComponent>;
}

interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentInfo>;
}

/**
 * Get the path to the component registry JSON file
 */
function getRegistryPath(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // When bundled and running from dist/command-line/, go up 2 levels to package root then into ai/
  return join(__dirname, "..", "..", "ai", "component-registry.json");
}

/**
 * Load the component registry
 */
function loadRegistry(): ComponentRegistry {
  const registryPath = getRegistryPath();
  const content = readFileSync(registryPath, "utf-8");
  return JSON.parse(content) as ComponentRegistry;
}

/**
 * Find a component by name (case-insensitive)
 */
function findComponent(
  registry: ComponentRegistry,
  name: string,
): ComponentInfo | null {
  const lowerName = name.toLowerCase();

  // Exact match first
  for (const [key, component] of Object.entries(registry.components)) {
    if (key.toLowerCase() === lowerName) {
      return component;
    }
  }

  return null;
}

/**
 * Find similar component names for suggestions
 */
function findSimilar(registry: ComponentRegistry, name: string): string[] {
  const lowerName = name.toLowerCase();
  const componentNames = Object.keys(registry.components);

  return componentNames
    .filter(
      (n) =>
        n.toLowerCase().includes(lowerName) ||
        lowerName.includes(n.toLowerCase()),
    )
    .slice(0, 5);
}

/**
 * Format a prop for display
 */
function formatProp(name: string, prop: PropInfo): string {
  const parts: string[] = [];

  // Type
  let typeStr = prop.type;
  if (prop.values && prop.values.length > 0) {
    typeStr = prop.values.map((v) => `"${v}"`).join(" | ");
  }

  // Required/optional
  const required = prop.required === true || prop.optional === false;
  const requiredStr = required ? "(required)" : "";

  // Default
  const defaultStr = prop.default ? `[default: ${prop.default}]` : "";

  parts.push(`  ${name}: ${typeStr} ${requiredStr} ${defaultStr}`.trim());

  // Description
  if (prop.description) {
    parts.push(`    ${prop.description}`);
  }

  // Variant descriptions
  if (prop.descriptions && Object.keys(prop.descriptions).length > 0) {
    for (const [value, desc] of Object.entries(prop.descriptions)) {
      parts.push(`    - "${value}": ${desc}`);
    }
  }

  return parts.join("\n");
}

/**
 * Format documentation for a single component
 */
function formatComponentDoc(component: ComponentInfo): string {
  const lines: string[] = [];

  lines.push(`# ${component.name}\n`);
  lines.push(`${component.description}\n`);
  lines.push(
    `**Import:** \`import { ${component.name} } from "${component.importPath}";\`\n`,
  );
  lines.push(`**Category:** ${component.category}\n`);

  // Props
  const propEntries = Object.entries(component.props);
  if (propEntries.length > 0) {
    lines.push("## Props\n");
    for (const [propName, propInfo] of propEntries) {
      lines.push(formatProp(propName, propInfo));
      lines.push("");
    }
  }

  // Sub-components
  if (component.subComponents) {
    lines.push("## Sub-Components\n");
    for (const [subName, subInfo] of Object.entries(component.subComponents)) {
      lines.push(`### ${component.name}.${subName}`);
      if (subInfo.description) {
        lines.push(subInfo.description);
      }
      if (subInfo.renderElement) {
        lines.push(`Renders: ${subInfo.renderElement}`);
      }
      if (subInfo.props) {
        lines.push("Props:");
        for (const [propName, propInfo] of Object.entries(subInfo.props)) {
          const required = propInfo.required ? "(required)" : "";
          lines.push(`  - ${propName}: ${propInfo.type} ${required}`);
        }
      }
      lines.push("");
    }
  }

  // Examples
  if (component.examples && component.examples.length > 0) {
    lines.push("## Examples\n");
    for (const example of component.examples.slice(0, 3)) {
      lines.push("```tsx");
      lines.push(example);
      lines.push("```\n");
    }
    if (component.examples.length > 3) {
      lines.push(
        `(${component.examples.length - 3} more examples available in Storybook)`,
      );
    }
  }

  // Colors (semantic tokens used)
  if (component.colors && component.colors.length > 0) {
    lines.push("\n## Semantic Tokens Used\n");
    lines.push(component.colors.join(", "));
  }

  return lines.join("\n");
}

/**
 * Output documentation for all components
 */
export function docs(): void {
  try {
    const registry = loadRegistry();
    const components = Object.values(registry.components);

    console.log(`# Kumo Component Documentation\n`);
    console.log(`${components.length} components available\n`);
    console.log("---\n");

    for (const component of components) {
      console.log(formatComponentDoc(component));
      console.log("\n---\n");
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(
        "Error: Component registry not found. Run `pnpm codegen:registry` first.",
      );
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Get documentation for a specific component
 */
export function doc(componentName?: string): void {
  // If no component name provided, show all docs
  if (!componentName) {
    docs();
    return;
  }

  try {
    const registry = loadRegistry();
    const component = findComponent(registry, componentName);

    if (!component) {
      const similar = findSimilar(registry, componentName);
      console.error(`Component "${componentName}" not found.`);
      if (similar.length > 0) {
        console.error(`\nDid you mean: ${similar.join(", ")}?`);
      }
      console.error(`\nRun "kumo ls" to see all available components.`);
      process.exit(1);
    }

    console.log(formatComponentDoc(component));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(
        "Error: Component registry not found. Run `pnpm codegen:registry` first.",
      );
      process.exit(1);
    }
    throw error;
  }
}
