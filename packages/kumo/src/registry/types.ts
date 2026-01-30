/**
 * Type definitions for the Kumo component registry.
 * These types describe the structure of component-registry.json
 */

/**
 * Component type:
 * - "component": Base UI primitives (Button, Input, Dialog, etc.)
 * - "block": Composite components installed via CLI (PageHeader, ResourceListPage, etc.)
 */
export type ComponentType = "component" | "block";

/**
 * Schema for a single component prop
 */
export interface PropSchema {
  type: string;
  required?: boolean;
  optional?: boolean;
  default?: string;
  description?: string;
  values?: readonly string[];
  descriptions?: Record<string, string>;
  /** Tailwind classes for each variant value (for Figma plugin) */
  classes?: Record<string, string>;
  /** State-specific classes extracted from variant classes */
  stateClasses?: Record<string, Record<string, string>>;
}

/**
 * Schema for a sub-component (e.g., Dialog.Root, Dialog.Trigger)
 */
export interface SubComponentSchema {
  name: string;
  description: string;
  props: Record<string, PropSchema>;
  /** Whether this is a pass-through to a base library component */
  isPassThrough?: boolean;
  /** Base library component reference for documentation */
  baseComponent?: string;
  /** Usage examples for this sub-component */
  usageExamples?: string[];
  /** Render element info (e.g., "Renders a <button> element") */
  renderElement?: string;
}

/**
 * Schema for a complete component
 */
export interface ComponentSchema {
  name: string;
  /** Component type: "component" (base UI primitive) or "block" (composite component) */
  type: ComponentType;
  description: string;
  importPath: string;
  category: string;
  props: Record<string, PropSchema>;
  examples: readonly string[];
  colors: string[];
  /**
   * Base Tailwind classes applied to all variants.
   * Useful for Figma plugin to parse layout, spacing, typography.
   */
  baseStyles?: string;
  /** Sub-components for compound component patterns */
  subComponents?: Record<string, SubComponentSchema>;
  /** Component-specific styling metadata (dimensions, states, icons, etc.) */
  styling?: ComponentStyling;
}

/**
 * Block-specific metadata for CLI installation
 */
export interface BlockSchema extends ComponentSchema {
  type: "block";
  /** Files that make up this block (relative to src/blocks/) */
  files: string[];
  /** Component dependencies that must be installed from @cloudflare/kumo */
  dependencies: string[];
}

/**
 * Dimension configuration for component parts
 */
export interface DimensionConfig {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  paddingX?: number;
  paddingY?: number;
  paddingRight?: number;
  padding?: number;
  gap?: number;
  borderRadius?: number;
  fontSize?: number;
  fontWeight?: number;
  iconSize?: number;
  textSize?: number;
  inputWidth?: number;
  buttonSize?: number;
  verticalMargin?: number;
  calendarWidth?: number;
  cellHeight?: number;
  cellWidth?: number;
}

/**
 * Size variant configuration with dimensions
 */
export interface SizeVariantConfig {
  /** Container height in pixels */
  height?: number;
  /** Minimum height */
  minHeight?: number;
  /** Width */
  width?: number;
  /** Tailwind classes for this size */
  classes?: string;
  /** Button size mapping (for compound components) */
  buttonSize?: string;
  /** Parsed dimensions */
  dimensions?: DimensionConfig;
}

/**
 * Component part styling (for complex components)
 */
export interface PartStyling extends DimensionConfig {
  background?: string;
  ring?: string;
  shadow?: string;
  activeColor?: string;
  inactiveColor?: string;
}

/**
 * Component-specific styling metadata
 */
export interface ComponentStyling {
  /** Fixed dimensions (e.g., "h-4 w-4" for checkbox) */
  dimensions?: string;
  /** Border radius classes */
  borderRadius?: string;
  /** Base state styling tokens */
  baseTokens?: string[];
  /** State-specific styling (checked, hover, disabled, etc.) */
  states?: Record<string, string[]>;
  /** Icon information */
  icons?: {
    name: string;
    state?: string;
    size?: string | number;
  }[];
  /** Size-specific metadata for components with complex size mappings */
  sizeVariants?: Record<string, SizeVariantConfig>;
  /** Input variant styling (for components that use inputVariants) */
  inputStyles?: {
    base?: string;
    sizes?: Record<string, string>;
  };
  /** Container styling (for compound components like Tabs, LayerCard, MenuBar) */
  container?: PartStyling;
  /** Layout configuration (for Pagination, etc.) */
  layout?: DimensionConfig;
  /** Trigger styling (for Select, Combobox, etc.) */
  trigger?: PartStyling;
  /** Popup styling (for Select, Combobox, etc.) */
  popup?: PartStyling;
  /** Option styling (for Select, Combobox, etc.) */
  option?: PartStyling;
  /** Tab item styling */
  tab?: PartStyling;
  /** Active indicator styling */
  indicator?: PartStyling;
  /** Secondary part styling (for LayerCard) */
  secondary?: PartStyling;
  /** Primary part styling (for LayerCard) */
  primary?: PartStyling;
  /** Button styling (for MenuBar) */
  button?: PartStyling;
  /** Allow additional part-specific styling */
  [key: string]: unknown;
}

/**
 * The complete component registry structure
 */
export interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentSchema>;
  /** Blocks metadata for CLI installation */
  blocks?: Record<string, BlockSchema>;
  /** MCP-friendly search helpers */
  search: {
    byCategory: Record<string, string[]>;
    byName: string[];
    byType: Record<ComponentType, string[]>;
  };
}
