/**
 * @cloudflare/kumo/generative — Generative UI rendering module.
 *
 * Maps UITree element types from LLM output to Kumo React components.
 * Includes stateful wrappers for controlled-only components,
 * generative wrappers with sensible styling defaults, element validation,
 * and the UITreeRenderer for rendering UITree structures.
 */

export { COMPONENT_MAP, KNOWN_TYPES } from "./component-map.js";

export {
  StatefulSelect,
  StatefulCheckbox,
  StatefulSwitch,
  StatefulTabs,
  StatefulCollapsible,
} from "./stateful-wrappers.js";

export type { OnActionCallback } from "./stateful-wrappers.js";

export {
  GenerativeSurface,
  GenerativeInput,
  GenerativeInputArea,
  GenerativeCloudflareLogo,
  GenerativeSelect,
} from "./generative-wrappers.js";

export {
  DIRECT_COMPONENTS,
  SUB_COMPONENT_ALIASES,
  TYPE_ALIASES,
  STATEFUL_WRAPPER_TARGETS,
  GENERATIVE_WRAPPER_TARGETS,
  SYNTHETIC_TYPES,
  EXCLUDED_COMPONENTS,
  REGISTRY_COMPONENT_NAMES,
} from "./component-manifest.js";

// Element validator
export { validateElement, logValidationError } from "./element-validator.js";

export type { ElementValidationResult } from "./element-validator.js";

// Structural graders
export {
  parseJsonlToTree,
  walkTree,
  gradeTree,
  A11Y_LABEL_TYPES,
  MAX_DEPTH,
  RULE_NAMES,
} from "./structural-graders.js";

export type {
  WalkVisitor,
  GradeResult,
  GradeReport,
  RuleName,
} from "./structural-graders.js";

// Custom component helper
export { defineCustomComponent } from "./define-custom-component.js";

// UITreeRenderer
export {
  UITreeRenderer,
  isRenderableTree,
  getUnknownTypes,
  normalizeSiblingFormRowGrids,
} from "./ui-tree-renderer.js";
