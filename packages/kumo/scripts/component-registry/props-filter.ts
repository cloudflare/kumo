/**
 * Props filtering for component registry generation.
 *
 * Filters out inherited DOM/React props to keep documentation focused
 * on component-specific props.
 */

import * as ts from "typescript";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CLIFlags } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

// =============================================================================
// Props Filter Constants
// =============================================================================

/**
 * Props to always skip - these are internal React props or rarely useful for LLMs
 */
export const ALWAYS_SKIP_PROPS = new Set([
  "key",
  "ref",
  "style",
  "dangerouslySetInnerHTML",
]);

/**
 * Prefixes for props that should be skipped (DOM event handlers, ARIA, data attributes)
 */
export const SKIP_PROP_PREFIXES = [
  "aria-",
  "data-",
  "on", // Event handlers: onClick, onMouseDown, onKeyUp, etc.
];

/**
 * Props that should be kept even if they appear in inherited HTML types.
 * These are commonly used and meaningful for component APIs.
 */
export const KEEP_PROPS = new Set([
  "children",
  "className",
  "disabled",
  "name",
  "value",
  "checked",
  "required",
  "placeholder",
  "readOnly",
  "type",
  "label", // Common form field prop
  "href", // Common link prop for navigation components
  "lang", // Code component uses lang for syntax highlighting
]);

/**
 * React interface names that define inherited HTML props.
 * Props from these interfaces are filtered out to keep docs focused on component-specific props.
 */
export const REACT_HTML_INTERFACES = [
  "HTMLAttributes",
  "InputHTMLAttributes",
  "ButtonHTMLAttributes",
  "AnchorHTMLAttributes",
  "FormHTMLAttributes",
  "TextareaHTMLAttributes",
  "SelectHTMLAttributes",
];

/**
 * Minimal static list of common HTML props to skip (when --inherited-props is not set).
 * This replaces the expensive deriveInheritedHtmlProps() by default.
 */
export const MINIMAL_SKIP_PROPS = new Set([
  // Common HTML attributes we don't want to document
  "accessKey",
  "autoCapitalize",
  "autoFocus",
  "contentEditable",
  "dir",
  "draggable",
  "hidden",
  "spellCheck",
  "tabIndex",
  "translate",
  // Form-specific attributes
  "autocomplete",
  "autofocus",
  "form",
  "formAction",
  "formEncType",
  "formMethod",
  "formNoValidate",
  "formTarget",
  "max",
  "maxLength",
  "min",
  "minLength",
  "multiple",
  "pattern",
  "step",
  // Media attributes
  "accept",
  "capture",
  "crossOrigin",
  "loop",
  "muted",
  "preload",
  "poster",
  "src",
  "srcSet",
  // React internal props
  "suppressContentEditableWarning",
  "suppressHydrationWarning",
  "defaultChecked",
  "defaultValue",
  // RDFa attributes (semantic web metadata - not useful for component docs)
  "about",
  "content",
  "datatype",
  "inlist",
  "prefix",
  "property",
  "rel",
  "resource",
  "rev",
  "typeof",
  "vocab",
  // Microdata attributes (HTML5 semantic markup - not useful for component docs)
  "itemID",
  "itemProp",
  "itemRef",
  "itemScope",
  "itemType",
  // Deprecated/obscure HTML attributes
  "autoCorrect",
  "autoSave",
  "color",
  "results",
  "security",
  "unselectable",
  // Popover API attributes (rarely used directly)
  "popover",
  "popoverTarget",
  "popoverTargetAction",
  // Web Components attributes
  "is",
  "slot",
  "part",
  "exportparts",
  // Other rarely-used HTML attributes
  "contextMenu",
  "enterKeyHint",
  "inputMode",
  "inert",
  "nonce",
  "radioGroup",
  "role",
]);

// =============================================================================
// Inherited Props Derivation (expensive, only used with --inherited-props)
// =============================================================================

// Lazily computed inherited HTML props (derived from React types at runtime)
let _inheritedHtmlProps: Set<string> | null = null;

/**
 * OPTIMIZATION: Derive inherited HTML props from React's type definitions.
 * This is EXPENSIVE (~15s / 47% of total time) and NOT NEEDED for most use cases.
 * Only enabled with --inherited-props CLI flag.
 *
 * Extracts property names from HTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes, etc.
 * These are filtered out to keep component docs focused on component-specific props.
 */
export function deriveInheritedHtmlProps(): Set<string> {
  const inheritedProps = new Set<string>();

  try {
    // Read tsconfig to get compiler options
    const configPath = join(rootDir, "tsconfig.json");
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      rootDir,
    );

    // Create a program to access React's type definitions
    const program = ts.createProgram({
      rootNames: parsedConfig.fileNames,
      options: parsedConfig.options,
    });

    // Find React's type definition file
    const reactDts = program
      .getSourceFiles()
      .find((sf) =>
        sf.fileName.includes("node_modules/@types/react/index.d.ts"),
      );

    if (!reactDts) {
      throw new Error("Could not find React type definitions");
    }

    // Walk the AST to find the HTML attribute interfaces
    ts.forEachChild(reactDts, function visit(node) {
      if (ts.isInterfaceDeclaration(node)) {
        const name = node.name.text;
        if (REACT_HTML_INTERFACES.includes(name)) {
          // Extract property names from this interface
          for (const member of node.members) {
            if (ts.isPropertySignature(member) && member.name) {
              const propName = member.name.getText(reactDts);
              inheritedProps.add(propName);
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    });

    console.log(
      `Derived ${inheritedProps.size} inherited HTML props from React types`,
    );
  } catch (error) {
    console.warn(
      "Warning: Could not derive HTML props from React types, using fallback list",
    );
    console.warn(error instanceof Error ? error.message : error);

    // Fallback to a minimal set if derivation fails
    const fallbackProps = [
      "accessKey",
      "autoCapitalize",
      "autoFocus",
      "contentEditable",
      "dir",
      "draggable",
      "hidden",
      "lang",
      "spellCheck",
      "tabIndex",
      "title",
      "translate",
      "className",
      "id",
      "style",
      "children",
    ];
    for (const prop of fallbackProps) {
      inheritedProps.add(prop);
    }
  }

  return inheritedProps;
}

/**
 * Get the set of inherited HTML props to skip.
 * Uses minimal static list by default, or derives from React types with --inherited-props flag.
 */
export function getInheritedHtmlProps(cliFlags: CLIFlags): Set<string> {
  if (!cliFlags.includeInheritedProps) {
    // Use minimal static list instead of expensive derivation
    return MINIMAL_SKIP_PROPS;
  }

  if (!_inheritedHtmlProps) {
    _inheritedHtmlProps = deriveInheritedHtmlProps();
  }
  return _inheritedHtmlProps;
}

// =============================================================================
// Main Filter Function
// =============================================================================

/**
 * Determine if a prop should be skipped from the generated documentation.
 * Filters out inherited DOM props, event handlers, and internal React props.
 */
export function shouldSkipProp(propName: string, cliFlags: CLIFlags): boolean {
  // Never skip props in the keep list
  if (KEEP_PROPS.has(propName)) {
    return false;
  }

  // Always skip certain props
  if (ALWAYS_SKIP_PROPS.has(propName)) {
    return true;
  }

  // Skip props with certain prefixes
  for (const prefix of SKIP_PROP_PREFIXES) {
    if (propName.startsWith(prefix)) {
      return true;
    }
  }

  // Skip inherited HTML attributes (derived from React types)
  if (getInheritedHtmlProps(cliFlags).has(propName)) {
    return true;
  }

  return false;
}
