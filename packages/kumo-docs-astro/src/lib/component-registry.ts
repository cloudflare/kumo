/**
 * Utility to load and query component registry data for documentation.
 * Reads from the auto-generated component-registry.json in the kumo package.
 */

// Import the registry JSON from the kumo package export
import registry from "@cloudflare/kumo/ai/component-registry.json";

// Import shared types from @cloudflare/kumo
import type {
  ComponentRegistry,
  ComponentSchema,
  PropSchema,
  SubComponentSchema,
} from "@cloudflare/kumo";

// Re-export types for convenience
export type { PropSchema, SubComponentSchema as SubComponentData };

// Alias for backwards compatibility
export type ComponentData = ComponentSchema;
export type { ComponentRegistry };

// Cast through unknown since the JSON structure may have extra fields
const typedRegistry = registry as unknown as ComponentRegistry;

/**
 * Get data for a component, including support for sub-component notation.
 *
 * @param componentName - e.g., "Button", "Dialog", or "Dialog.Root"
 * @returns Component or sub-component data, or null if not found
 */
export function getComponentData(componentName: string): {
  name: string;
  description: string;
  props: Record<string, PropSchema>;
  isSubComponent: boolean;
  parentName?: string;
} | null {
  // Check for sub-component notation: "Dialog.Root" -> parent="Dialog", sub="Root"
  if (componentName.includes(".")) {
    const [parentName, subName] = componentName.split(".");
    const parent = typedRegistry.components[parentName];

    if (!parent?.subComponents?.[subName]) {
      return null;
    }

    const sub = parent.subComponents[subName];
    return {
      name: `${parentName}.${subName}`,
      description: sub.description,
      props: sub.props,
      isSubComponent: true,
      parentName,
    };
  }

  // Regular component lookup
  const component =
    typedRegistry.components[componentName] ||
    typedRegistry.blocks?.[componentName];
  if (!component) {
    return null;
  }

  return {
    name: component.name,
    description: component.description,
    props: component.props,
    isSubComponent: false,
  };
}

/**
 * Get all sub-component names for a compound component.
 *
 * @param componentName - e.g., "Dialog"
 * @returns Array of sub-component names, or empty array if none
 */
export function getSubComponentNames(componentName: string): string[] {
  const component = typedRegistry.components[componentName];
  if (!component?.subComponents) {
    return [];
  }
  return Object.keys(component.subComponents);
}

/**
 * Check if a component has sub-components (is a compound component).
 */
export function hasSubComponents(componentName: string): boolean {
  const component = typedRegistry.components[componentName];
  return (
    !!component?.subComponents &&
    Object.keys(component.subComponents).length > 0
  );
}

/**
 * Format a prop type for display.
 * Handles enums by joining values with " | ".
 */
export function formatPropType(prop: PropSchema): string {
  if (prop.type === "enum" && prop.values) {
    return prop.values.map((v) => `"${v}"`).join(" | ");
  }
  return prop.type;
}

/**
 * Get the default value for display, or "-" if none.
 */
export function formatDefault(prop: PropSchema): string {
  if (prop.default !== undefined) {
    // Don't double-quote if it's already a quoted string or a boolean/number
    if (prop.type === "enum" || prop.type === "string") {
      return `"${prop.default}"`;
    }
    return String(prop.default);
  }
  return "-";
}
