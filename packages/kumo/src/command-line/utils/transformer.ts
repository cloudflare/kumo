/**
 * Import path transformer for Kumo blocks
 * Transforms relative imports to package imports when installing blocks via CLI
 */

/**
 * Transforms relative imports in block source code to package imports
 *
 * Examples:
 * - `../../components/tabs` → `@cloudflare/kumo`
 * - `../../utils/cn` → `@cloudflare/kumo`
 * - Preserves type imports: `import { type Foo }` correctly
 *
 * @param content - The source code content to transform
 * @returns Transformed source code with package imports
 */
export function transformImports(content: string): string {
  // Match import statements with various patterns
  // Handles: import { X } from "path"
  //          import { type X } from "path"
  //          import type { X } from "path"
  //          import { X, type Y, Z } from "path"
  const importRegex =
    /import\s+(?:type\s+)?{([^}]+)}\s+from\s+["']([^"']+)["'];?/g;

  return content.replace(importRegex, (match, imports, path) => {
    // Only transform relative imports that point to components or utils
    if (!path.startsWith("../")) {
      return match;
    }

    // Check if this is a component or util import
    const isComponentOrUtil =
      path.includes("/components/") || path.includes("/utils/");

    if (!isComponentOrUtil) {
      return match;
    }

    // Check if this is a type-only import (import type { ... })
    const isTypeOnlyImport = match.trim().startsWith("import type ");

    // Parse the imported items
    const importItems = imports
      .split(",")
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    // Separate type imports from value imports
    const typeImports: string[] = [];
    const valueImports: string[] = [];

    for (const item of importItems) {
      if (item.startsWith("type ")) {
        // Remove 'type ' prefix for the actual name
        typeImports.push(item.slice(5).trim());
      } else {
        valueImports.push(item);
      }
    }

    // Build the transformed import statement
    if (isTypeOnlyImport) {
      // import type { X } from "path" → import type { X } from "@cloudflare/kumo"
      return `import type { ${importItems.join(", ")} } from "@cloudflare/kumo";`;
    } else if (typeImports.length > 0 && valueImports.length > 0) {
      // import { X, type Y } from "path" → import { X } from "@cloudflare/kumo"; import type { Y } from "@cloudflare/kumo";
      // For simplicity, we'll keep them together but convert inline 'type' to 'import type'
      // Actually, we should split into two imports for best practice
      const valueImport = `import { ${valueImports.join(", ")} } from "@cloudflare/kumo";`;
      const typeImport = `import type { ${typeImports.join(", ")} } from "@cloudflare/kumo";`;
      return `${valueImport}\n${typeImport}`;
    } else if (typeImports.length > 0) {
      // Only type imports (using inline 'type' syntax)
      return `import type { ${typeImports.join(", ")} } from "@cloudflare/kumo";`;
    } else {
      // Only value imports
      return `import { ${valueImports.join(", ")} } from "@cloudflare/kumo";`;
    }
  });
}
