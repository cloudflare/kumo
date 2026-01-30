/**
 * Type definitions for the Component Registry.
 *
 * Shared types are re-exported from src/registry/types.ts.
 * This file adds internal types for CLI, cache, and processing.
 */

// Re-export shared registry types (the output schema)
export type {
  ComponentRegistry,
  ComponentSchema,
  ComponentStyling,
  ComponentType,
  PropSchema,
  SubComponentSchema,
} from "../../src/registry/types";

// =============================================================================
// CLI Flags
// =============================================================================

export interface CLIFlags {
  includeInheritedProps: boolean;
  noCache: boolean;
  verbose: boolean;
}

// =============================================================================
// Cache Types
// =============================================================================

import type { ComponentSchema } from "../../src/registry/types";

export interface CacheEntry {
  componentName: string;
  sourceHash: string;
  storyHash: string;
  cacheVersion: number;
  generatedAt: number;
  metadata: ComponentSchema;
}

export interface CacheFile {
  version: number;
  entries: Record<string, CacheEntry>;
}

// =============================================================================
// Component Configuration (Discovery Phase)
// =============================================================================

import type { ComponentStyling, ComponentType } from "../../src/registry/types";

export interface SubComponentConfig {
  /** Sub-component name (e.g., "Root", "Trigger", "Content") */
  name: string;
  /** Props type name if available */
  propsType: string | null;
  /** Description extracted from JSDoc or generated */
  description: string;
  /** Whether this is a pass-through to a base library component */
  isPassThrough: boolean;
  /** Base library component reference (e.g., "DialogBase.Root") */
  baseComponent?: string;
}

export interface ComponentConfig {
  name: string;
  /** Override props type name. Defaults to `${name}Props` */
  propsType?: string;
  /** Source file path relative to source dir */
  sourceFile: string;
  /** Directory name (kebab-case) */
  dirName: string;
  /** Base source directory (components, blocks, layouts, or pages) */
  sourceDir: string;
  /** Component type based on source directory */
  type: ComponentType;
  description: string;
  category: string;
  /**
   * Manually curated examples. If not provided, examples are auto-extracted
   * from the component's .stories.tsx file (excluding propTester stories).
   * Set to empty array [] to explicitly have no examples.
   */
  examples?: readonly string[];
  // biome-ignore lint/suspicious/noExplicitAny: Variants have varying shapes
  variants: Record<string, Record<string, any>>;
  defaults: Record<string, string>;
  /**
   * Base Tailwind classes applied to all variants.
   * Extracted from KUMO_*_BASE_STYLES constant if present.
   */
  baseStyles?: string;
  /**
   * Component-specific styling metadata.
   * Extracted from KUMO_*_STYLING constant if present.
   */
  styling?: ComponentStyling;
  /** Sub-components for compound component patterns (e.g., Dialog.Root, Dialog.Trigger) */
  subComponents?: SubComponentConfig[];
}

export interface ComponentOverride {
  /** Override description */
  description?: string;
  /** Override category */
  category?: string;
}

export interface DetectedExports {
  /** Main component name (first PascalCase export) */
  componentName: string | null;
  /** Props type name if exported */
  propsType: string | null;
}

// =============================================================================
// Processing Types
// =============================================================================

import type { ComponentRegistry } from "../../src/registry/types";

export interface ProcessComponentInput {
  config: ComponentConfig;
  variantConstants: Map<string, string[]>;
  storyExamples: Map<string, { aiExamples: string[] }>;
  cache: CacheFile;
}

export interface ProcessComponentResult {
  name: string;
  category: string;
  schema: ComponentSchema;
  colors: string[];
  cached: boolean;
  cacheEntry: CacheEntry;
}

export interface GenerateRegistryResult {
  registry: ComponentRegistry;
  componentColors: Map<string, string[]>;
}

// =============================================================================
// Pass-through Documentation Types
// =============================================================================

import type { PropSchema } from "../../src/registry/types";

export interface PassthroughDoc {
  description: string;
  renderElement?: string;
  props: Record<string, PropSchema>;
  usageExamples?: string[];
}
