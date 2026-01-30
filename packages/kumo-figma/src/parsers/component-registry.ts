/**
 * Component Registry Parser
 *
 * Parses component-registry.json to extract component specifications.
 * Provides types and utilities for accessing component metadata.
 */

// Import shared types from @cloudflare/kumo
import type {
  ComponentRegistry,
  ComponentSchema,
  PropSchema,
  SubComponentSchema,
} from "@cloudflare/kumo";

// Re-export with aliases for backwards compatibility
export type { ComponentRegistry };
export type ComponentSpec = ComponentSchema;
export type ComponentProp = PropSchema;
export type SubComponent = SubComponentSchema;

/**
 * Parse component registry JSON
 *
 * @param registryJson - Raw JSON string or parsed object
 * @returns Parsed component registry
 */
export function parseComponentRegistry(
  registryJson: string | ComponentRegistry,
): ComponentRegistry {
  if (typeof registryJson === "string") {
    return JSON.parse(registryJson) as ComponentRegistry;
  }
  return registryJson;
}

/**
 * Get component specification by name
 *
 * @param registry - Component registry
 * @param componentName - Name of component (e.g., "Button", "Badge")
 * @returns Component specification or undefined if not found
 */
export function getComponentSpec(
  registry: ComponentRegistry,
  componentName: string,
): ComponentSpec | undefined {
  return registry.components[componentName];
}

/**
 * Get variant values for a component prop
 *
 * @param spec - Component specification
 * @param propName - Prop name (e.g., "variant", "size")
 * @returns Array of variant values or undefined if prop is not an enum
 *
 * @example
 * const buttonSpec = getComponentSpec(registry, "Button");
 * const variants = getVariantValues(buttonSpec, "variant");
 * // ["primary", "secondary", "ghost", "destructive", "outline"]
 */
export function getVariantValues(
  spec: ComponentSpec,
  propName: string,
): readonly string[] | undefined {
  const prop = spec.props[propName];
  if (prop?.type === "enum" && prop.values) {
    return prop.values;
  }
  return undefined;
}

/**
 * Get default value for a prop
 *
 * @param spec - Component specification
 * @param propName - Prop name
 * @returns Default value or undefined
 */
export function getDefaultValue(
  spec: ComponentSpec,
  propName: string,
): string | number | boolean | undefined {
  return spec.props[propName]?.default;
}

/**
 * Get variant descriptions
 *
 * @param spec - Component specification
 * @param propName - Prop name
 * @returns Map of variant value to description
 */
export function getVariantDescriptions(
  spec: ComponentSpec,
  propName: string,
): Record<string, string> | undefined {
  return spec.props[propName]?.descriptions;
}

/**
 * Get all semantic color tokens used by a component
 *
 * @param spec - Component specification
 * @returns Array of color token names (e.g., ["bg-kumo-brand", "text-kumo-default"])
 */
export function getComponentColors(spec: ComponentSpec): string[] {
  return spec.colors || [];
}

/**
 * Extract components by category
 *
 * @param registry - Component registry
 * @param category - Category name (e.g., "Action", "Input", "Display")
 * @returns Array of component specifications in that category
 */
export function getComponentsByCategory(
  registry: ComponentRegistry,
  category: string,
): ComponentSpec[] {
  return Object.values(registry.components).filter(
    (spec) => spec.category === category,
  );
}
