/**
 * Sub-component detection for compound component patterns.
 *
 * Detects sub-components from Object.assign patterns and direct property assignments
 * like Dialog.Root, Dialog.Trigger, etc.
 */

import { readFileSync } from "node:fs";
import type { SubComponentConfig, PropSchema } from "./types.js";
import { extractBalancedBraces } from "./utils.js";
import { shouldSkipProp } from "./props-filter.js";
import type { CLIFlags } from "./types.js";

// =============================================================================
// Sub-Component Detection
// =============================================================================

/**
 * Detect compound component sub-components from Object.assign patterns.
 * Parses patterns like:
 *   const Dialog = Object.assign(DialogContent, { Root: DialogBase.Root, Trigger: ... })
 *   Breadcrumb.Link = Link;
 */
export function detectSubComponents(filePath: string): SubComponentConfig[] {
  try {
    const content = readFileSync(filePath, "utf-8");
    const subComponents: SubComponentConfig[] = [];

    // Pattern 1: Object.assign with sub-components
    // Find the start of Object.assign and then extract the balanced braces
    // Supports both simple names (Component) and dotted names (SomeBase.Root)
    const objectAssignStart = /Object\.assign\s*\(\s*[\w.]+\s*,\s*\{/g;
    let startMatch: RegExpExecArray | null;

    while ((startMatch = objectAssignStart.exec(content)) !== null) {
      // Find the opening brace position
      const braceStart = startMatch.index + startMatch[0].length - 1;
      const assignBlock = extractBalancedBraces(content, braceStart);

      if (!assignBlock) continue;

      // Extract sub-component assignments: SubName: Value or SubName: SomeBase.SubName
      // Handle multi-line with comments
      const subPattern = /^\s*(\w+)\s*[,:]/gm;
      let subMatch: RegExpExecArray | null;

      while ((subMatch = subPattern.exec(assignBlock)) !== null) {
        const subName = subMatch[1];

        // Skip common non-component patterns (lowercase keywords)
        // Sub-components should be PascalCase (start with uppercase)
        if (
          [
            "classes",
            "const",
            "let",
            "var",
            "function",
            "description",
          ].includes(subName) ||
          !subName.match(/^[A-Z]/)
        ) {
          continue;
        }

        // Find the value after the colon for this sub-component
        const valuePattern = new RegExp(
          `\\b${subName}\\s*:\\s*(\\w+(?:\\.\\w+)?)`,
        );
        const valueMatch = assignBlock.match(valuePattern);
        const value = valueMatch ? valueMatch[1] : subName;

        // Determine if it's a pass-through to a base library
        const isPassThrough = value.includes(".");
        const baseComponent = isPassThrough ? value : undefined;

        // Try to find props type for this sub-component
        let propsType: string | null = null;

        // Look for function signature or interface for this sub-component
        // Pattern: function SubName({ ... }: SubNameProps) or function SubName(props: SubNameProps)
        const funcPropsPattern = new RegExp(
          `function\\s+${value}\\s*(?:<[^>]*>)?\\s*\\([^)]*:\\s*(\\w+Props)`,
        );
        const funcMatch = content.match(funcPropsPattern);
        if (funcMatch) {
          propsType = funcMatch[1];
        }

        // Also check for inline type in PropsWithChildren pattern
        const propsWithChildrenPattern = new RegExp(
          `function\\s+${value}\\s*\\([^)]*:\\s*PropsWithChildren<\\{([^}]+)\\}>`,
        );
        const pwcMatch = content.match(propsWithChildrenPattern);
        if (pwcMatch && !propsType) {
          // Has inline props, we'll extract them later
          propsType = `${value}Props`;
        }

        // Generate description
        let description = `${subName} sub-component`;
        if (isPassThrough) {
          const baseName = baseComponent?.split(".")[0] || "";
          description = `${subName} sub-component (wraps ${baseName})`;
        }

        // Skip if already added (avoid duplicates)
        if (subComponents.some((sc) => sc.name === subName)) {
          continue;
        }

        subComponents.push({
          name: subName,
          propsType,
          description,
          isPassThrough,
          baseComponent,
        });
      }
    }

    // Pattern 2: Direct property assignment at module level (e.g., Breadcrumb.Link = Link)
    // Must be at start of line (module level) and sub-component name must be PascalCase
    const directAssignPattern = /^([A-Z]\w+)\.([A-Z]\w+)\s*=\s*(\w+)\s*;/gm;
    let directMatch: RegExpExecArray | null;

    while ((directMatch = directAssignPattern.exec(content)) !== null) {
      const subName = directMatch[2];
      const value = directMatch[3];

      // Skip displayName assignments
      if (subName === "displayName") {
        continue;
      }

      // Skip if already found via Object.assign
      if (subComponents.some((sc) => sc.name === subName)) {
        continue;
      }

      // Try to find props type for this sub-component
      let propsType: string | null = null;
      const funcPropsPattern = new RegExp(
        `function\\s+${value}\\s*(?:<[^>]*>)?\\s*\\([^)]*:\\s*(\\w+Props)`,
      );
      const funcMatch = content.match(funcPropsPattern);
      if (funcMatch) {
        propsType = funcMatch[1];
      }

      subComponents.push({
        name: subName,
        propsType,
        description: `${subName} sub-component`,
        isPassThrough: false,
      });
    }

    return subComponents;
  } catch {
    return [];
  }
}

// =============================================================================
// Sub-Component Props Extraction
// =============================================================================

/**
 * Extract props for a sub-component from the source file.
 * Handles:
 * - Inline props in function signature: function Foo({ a, b }: { a: string; b: number })
 * - PropsWithChildren pattern: function Foo(props: PropsWithChildren<{ a: string }>)
 * - Named interface reference: function Foo(props: FooProps)
 */
export function extractSubComponentProps(
  filePath: string,
  subComponent: SubComponentConfig,
  cliFlags: CLIFlags,
): Record<string, PropSchema> {
  // Skip pass-through components - their props come from the base library
  if (subComponent.isPassThrough) {
    return {};
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const funcName = subComponent.name;
    const props: Record<string, PropSchema> = {};

    // Pattern 1: Inline object type in function signature
    // Matches: function Foo({ ... }: { prop: Type }) or ({ ... }: PropsWithChildren<{ prop: Type }>)
    // Also matches arrow functions: const Foo = ({ ... }: { prop: Type }) =>
    const inlinePropsPatterns = [
      // function Name({ destructured }: { inline props })
      new RegExp(
        `(?:function|const)\\s+${funcName}\\s*=?\\s*\\([^)]*:\\s*(?:PropsWithChildren<)?\\{([^}]+)\\}`,
      ),
      // function Name({ destructured }: PropsWithChildren<InterfaceName>)
      new RegExp(
        `(?:function|const)\\s+${funcName}\\s*=?\\s*\\([^)]*:\\s*PropsWithChildren<(\\w+)>`,
      ),
    ];

    for (const pattern of inlinePropsPatterns) {
      const match = content.match(pattern);
      if (match) {
        const propsBlock = match[1];

        // Check if it's an interface name (single word) or inline props
        if (propsBlock.match(/^\w+$/)) {
          // It's an interface name, try to find and parse it
          const interfaceProps = extractPropsFromInterface(
            content,
            propsBlock,
            cliFlags,
          );
          Object.assign(props, interfaceProps);
        } else {
          // Parse inline props: propName?: Type or propName: Type
          const propPattern = /(\w+)(\?)?:\s*([^;,\n}]+)/g;
          let propMatch: RegExpExecArray | null;

          while ((propMatch = propPattern.exec(propsBlock)) !== null) {
            const propName = propMatch[1];
            const isOptional = propMatch[2] === "?";
            let propType = propMatch[3].trim();

            // Clean up type
            propType = propType.replace(/[,;]$/, "").trim();

            if (shouldSkipProp(propName, cliFlags)) continue;

            props[propName] = {
              type: propType,
              ...(isOptional ? { optional: true } : { required: true }),
            };
          }
        }

        if (Object.keys(props).length > 0) {
          return props;
        }
      }
    }

    // Pattern 2: Named props type reference (from subComponent.propsType)
    if (subComponent.propsType) {
      const interfaceProps = extractPropsFromInterface(
        content,
        subComponent.propsType,
        cliFlags,
      );
      Object.assign(props, interfaceProps);
    }

    // Pattern 3: Find interface used in function parameter type
    // Matches: const Link = ({ ... }: PropsWithChildren<BreadcrumbsItemProps>) =>
    // or: function Link({ ... }: BreadcrumbsItemProps)
    if (Object.keys(props).length === 0) {
      // Use a more flexible approach: find the function definition and extract the type annotation
      // This handles multi-line destructuring patterns
      const funcDefPatterns = [
        // Arrow function: const Name = (...)
        new RegExp(`const\\s+${funcName}\\s*=\\s*\\([\\s\\S]*?\\)\\s*=>`),
        // Regular function: function Name(...)
        new RegExp(`function\\s+${funcName}\\s*\\([\\s\\S]*?\\)\\s*\\{`),
      ];

      for (const defPattern of funcDefPatterns) {
        const defMatch = content.match(defPattern);
        if (defMatch) {
          const funcDef = defMatch[0];

          // Extract PropsWithChildren<InterfaceName> or direct interface reference
          const typePatterns = [
            /PropsWithChildren<(\w+)>/,
            /:\s*(\w+Props)\s*\)/,
            /:\s*(\w+ItemProps)\s*\)/,
          ];

          for (const typePattern of typePatterns) {
            const typeMatch = funcDef.match(typePattern);
            if (typeMatch && typeMatch[1]) {
              const interfaceName = typeMatch[1];
              const interfaceProps = extractPropsFromInterface(
                content,
                interfaceName,
                cliFlags,
              );
              Object.assign(props, interfaceProps);
              if (Object.keys(props).length > 0) {
                break;
              }
            }
          }

          if (Object.keys(props).length > 0) {
            break;
          }
        }
      }
    }

    return props;
  } catch {
    return {};
  }
}

/**
 * Extract props from an interface definition in the file content.
 */
export function extractPropsFromInterface(
  content: string,
  interfaceName: string,
  cliFlags: CLIFlags,
): Record<string, PropSchema> {
  const props: Record<string, PropSchema> = {};

  // Match interface definition
  const interfacePattern = new RegExp(
    `interface\\s+${interfaceName}\\s*(?:extends[^{]*)?\\{([^}]+)\\}`,
  );
  const match = content.match(interfacePattern);

  if (match) {
    const propsBlock = match[1];
    const propPattern = /(\w+)(\?)?:\s*([^;,\n}]+)/g;
    let propMatch: RegExpExecArray | null;

    while ((propMatch = propPattern.exec(propsBlock)) !== null) {
      const propName = propMatch[1];
      const isOptional = propMatch[2] === "?";
      let propType = propMatch[3].trim();

      propType = propType.replace(/[,;]$/, "").trim();

      if (shouldSkipProp(propName, cliFlags)) continue;

      props[propName] = {
        type: propType,
        ...(isOptional ? { optional: true } : { required: true }),
      };
    }
  }

  return props;
}
