import ts from "typescript";

/**
 * Extracts a named export function from a demo source file,
 * prepended with only the import statements that the function actually uses.
 *
 * Uses the TypeScript compiler API for robust parsing.
 */
export function extractDemoSnippet(
  source: string,
  functionName: string,
): string {
  const sourceFile = ts.createSourceFile(
    "demo.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  // Collect all import declarations with their imported names
  const imports: Array<{
    text: string;
    names: string[];
  }> = [];

  let targetFunction: string | null = null;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const names: string[] = [];
      const importClause = statement.importClause;
      if (importClause) {
        // Default import: import Foo from "..."
        if (importClause.name) {
          names.push(importClause.name.text);
        }
        // Named imports: import { Foo, Bar } from "..."
        if (
          importClause.namedBindings &&
          ts.isNamedImports(importClause.namedBindings)
        ) {
          for (const el of importClause.namedBindings.elements) {
            names.push(el.name.text);
          }
        }
        // Namespace import: import * as Foo from "..."
        if (
          importClause.namedBindings &&
          ts.isNamespaceImport(importClause.namedBindings)
        ) {
          names.push(importClause.namedBindings.name.text);
        }
      }
      imports.push({
        text: source.slice(statement.pos, statement.end).trim(),
        names,
      });
    }

    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === functionName
    ) {
      targetFunction = source.slice(statement.pos, statement.end).trim();
    }
  }

  if (!targetFunction) {
    return `// Could not find function "${functionName}"`;
  }

  // Only include imports whose names appear in the function body
  // Use word boundary regex to avoid false positives (e.g., "Input" matching "InputBasicDemo")
  const usedImports = imports
    .filter((imp) =>
      imp.names.some((name) =>
        new RegExp(`\\b${name}\\b`).test(targetFunction!),
      ),
    )
    .map((imp) => imp.text);

  const importBlock = usedImports.join("\n");

  return importBlock ? `${importBlock}\n\n${targetFunction}` : targetFunction;
}
