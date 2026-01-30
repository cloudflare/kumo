/**
 * Runtime types for Kumo catalog module.
 *
 * These types extend the registry types with runtime capabilities
 * like visibility conditions, actions, and data binding.
 */

// Re-export registry types
export type {
  ComponentRegistry,
  ComponentSchema,
  PropSchema,
  SubComponentSchema,
} from "../registry/types";

// =============================================================================
// Dynamic Values (Data Binding)
// =============================================================================

/**
 * A value that can either be a literal or a reference to the data model.
 * When { path: string }, the value is resolved from the data model at runtime.
 *
 * @example
 * // Literal value
 * const title: DynamicValue<string> = "Hello World";
 *
 * // Dynamic reference
 * const title: DynamicValue<string> = { path: "/user/name" };
 */
export type DynamicValue<T = unknown> = T | { path: string };

export type DynamicString = DynamicValue<string>;
export type DynamicNumber = DynamicValue<number>;
export type DynamicBoolean = DynamicValue<boolean>;

// =============================================================================
// Visibility Conditions
// =============================================================================

/**
 * Logic expression for complex visibility conditions.
 * Supports boolean logic (and, or, not) and comparisons.
 */
export type LogicExpression =
  | { and: LogicExpression[] }
  | { or: LogicExpression[] }
  | { not: LogicExpression }
  | { path: string }
  | { eq: [DynamicValue, DynamicValue] }
  | { neq: [DynamicValue, DynamicValue] }
  | { gt: [DynamicValue<number>, DynamicValue<number>] }
  | { gte: [DynamicValue<number>, DynamicValue<number>] }
  | { lt: [DynamicValue<number>, DynamicValue<number>] }
  | { lte: [DynamicValue<number>, DynamicValue<number>] };

/**
 * Visibility condition for conditional rendering.
 *
 * @example
 * // Always visible
 * visible: true
 *
 * // Visible when data path is truthy
 * visible: { path: "/user/isAdmin" }
 *
 * // Visible when user is signed in
 * visible: { auth: "signedIn" }
 *
 * // Complex condition
 * visible: { and: [{ path: "/user/isAdmin" }, { auth: "signedIn" }] }
 */
export type VisibilityCondition =
  | boolean
  | { path: string }
  | { auth: "signedIn" | "signedOut" }
  | LogicExpression;

// =============================================================================
// Actions
// =============================================================================

/**
 * Confirmation dialog configuration for destructive actions.
 */
export interface ActionConfirm {
  title: string;
  message: string;
  variant?: "default" | "danger";
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Action that can be triggered by a component.
 * AI declares the intent, your handlers execute the logic.
 *
 * @example
 * {
 *   name: "delete_item",
 *   params: {
 *     itemId: { path: "/selected/id" }
 *   },
 *   confirm: {
 *     title: "Delete Item",
 *     message: "Are you sure?",
 *     variant: "danger"
 *   }
 * }
 */
export interface Action {
  /** Action name (must be registered in catalog) */
  name: string;
  /** Parameters to pass to the action handler */
  params?: Record<string, DynamicValue>;
  /** Confirmation dialog before executing */
  confirm?: ActionConfirm;
  /** Data updates on successful execution */
  onSuccess?: { set: Record<string, DynamicValue> };
  /** Data updates on error */
  onError?: { set: Record<string, DynamicValue> };
}

// =============================================================================
// UI Elements & Trees
// =============================================================================

/**
 * A single UI element in the tree.
 * Represents one component with its props and relationships.
 */
export interface UIElement<
  TType extends string = string,
  TProps = Record<string, unknown>,
> {
  /** Unique key for reconciliation */
  key: string;
  /** Component type from the catalog */
  type: TType;
  /** Component props (may include dynamic values) */
  props: TProps;
  /** Child element keys (flat structure for streaming) */
  children?: string[];
  /** Parent element key (null for root) */
  parentKey?: string | null;
  /** Visibility condition */
  visible?: VisibilityCondition;
  /** Action to trigger on interaction */
  action?: Action;
}

/**
 * Flat UI tree structure optimized for LLM generation and streaming.
 *
 * The flat structure allows:
 * - Progressive rendering as elements stream in
 * - Easy updates without deep tree traversal
 * - Simple serialization/deserialization
 *
 * @example
 * {
 *   root: "card-1",
 *   elements: {
 *     "card-1": { key: "card-1", type: "Surface", props: { variant: "card" }, children: ["text-1"] },
 *     "text-1": { key: "text-1", type: "Text", props: { children: "Hello" }, parentKey: "card-1" }
 *   }
 * }
 */
export interface UITree {
  /** Root element key */
  root: string;
  /** Flat map of elements by key */
  elements: Record<string, UIElement>;
}

// =============================================================================
// Auth State
// =============================================================================

/**
 * Authentication state for visibility evaluation.
 */
export interface AuthState {
  isSignedIn: boolean;
  user?: Record<string, unknown>;
}

// =============================================================================
// Data Model
// =============================================================================

/**
 * Data model that backs dynamic values.
 * Values are accessed via JSON Pointer paths (e.g., "/user/name").
 */
export type DataModel = Record<string, unknown>;

// =============================================================================
// Action Handlers
// =============================================================================

/**
 * Action handler function signature.
 */
export type ActionHandler = (
  params: Record<string, unknown>,
) => void | Promise<void>;

/**
 * Map of action names to their handlers.
 */
export type ActionHandlers = Record<string, ActionHandler>;

// =============================================================================
// Catalog Types
// =============================================================================

/**
 * Action definition for the catalog.
 */
export interface ActionDefinition {
  /** Description for AI generation */
  description: string;
  /** Parameter schema (optional, for validation) */
  params?: Record<string, { type: string; description?: string }>;
}

/**
 * Catalog configuration for createKumoCatalog.
 */
export interface CatalogConfig {
  /** Action definitions (optional) */
  actions?: Record<string, ActionDefinition>;
}

/**
 * Runtime catalog instance.
 */
export interface KumoCatalog {
  /** Component names in the catalog */
  readonly componentNames: readonly string[];
  /** Action names in the catalog */
  readonly actionNames: readonly string[];
  /** Check if component type exists */
  hasComponent(type: string): boolean;
  /** Check if action exists */
  hasAction(name: string): boolean;
  /** Validate a UI element */
  validateElement(element: unknown): ValidationResult;
  /** Validate a complete UI tree */
  validateTree(tree: unknown): ValidationResult<UITree>;
  /** Generate a prompt describing the catalog for AI */
  generatePrompt(): string;
}

/**
 * Validation result from schema validation.
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    path: (string | number)[];
  }[];
}
