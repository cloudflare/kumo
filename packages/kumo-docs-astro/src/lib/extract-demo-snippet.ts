import ts from "typescript";

/**
 * Collects all identifier references within an AST node.
 * Only collects identifiers that are actual references (not declarations or property names).
 */
function collectIdentifierReferences(node: ts.Node): Set<string> {
  const identifiers = new Set<string>();

  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const parent = node.parent;

      // Skip if this is a property name in a property access (e.g., `obj.foo` - skip `foo`)
      if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
        return;
      }

      // Skip if this is a property name in an object literal (e.g., `{ foo: 1 }` - skip `foo`)
      if (ts.isPropertyAssignment(parent) && parent.name === node) {
        return;
      }

      // Skip if this is a shorthand property (e.g., `{ foo }` - we want to include `foo` as a reference)
      // Actually, shorthand properties ARE references, so don't skip them

      // Skip if this is a declaration name (function name, variable name, parameter name)
      if (ts.isFunctionDeclaration(parent) && parent.name === node) {
        return;
      }
      if (ts.isVariableDeclaration(parent) && parent.name === node) {
        return;
      }
      if (ts.isParameter(parent) && parent.name === node) {
        return;
      }
      if (ts.isBindingElement(parent) && parent.name === node) {
        return;
      }

      // Skip JSX attribute names (e.g., `<Foo bar={...}>` - skip `bar`)
      if (ts.isJsxAttribute(parent) && parent.name === node) {
        return;
      }

      identifiers.add(node.text);
    }

    ts.forEachChild(node, visit);
  }

  visit(node);
  return identifiers;
}

/**
 * Extracts a named export function from a demo source file,
 * prepended with only the import statements that the function actually uses.
 *
 * Uses the TypeScript compiler API for robust AST-based analysis.
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

  // Collect all import declarations with their structure
  const imports: Array<{
    moduleSpecifier: string;
    defaultImport: string | null;
    namedImports: string[];
    namespaceImport: string | null;
  }> = [];

  let targetFunctionNode: ts.FunctionDeclaration | null = null;
  let targetFunctionText: string | null = null;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const moduleSpecifier = (statement.moduleSpecifier as ts.StringLiteral)
        .text;
      let defaultImport: string | null = null;
      const namedImports: string[] = [];
      let namespaceImport: string | null = null;

      const importClause = statement.importClause;
      if (importClause) {
        // Default import: import Foo from "..."
        if (importClause.name) {
          defaultImport = importClause.name.text;
        }
        // Named imports: import { Foo, Bar } from "..."
        if (
          importClause.namedBindings &&
          ts.isNamedImports(importClause.namedBindings)
        ) {
          for (const el of importClause.namedBindings.elements) {
            namedImports.push(el.name.text);
          }
        }
        // Namespace import: import * as Foo from "..."
        if (
          importClause.namedBindings &&
          ts.isNamespaceImport(importClause.namedBindings)
        ) {
          namespaceImport = importClause.namedBindings.name.text;
        }
      }
      imports.push({
        moduleSpecifier,
        defaultImport,
        namedImports,
        namespaceImport,
      });
    }

    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === functionName
    ) {
      targetFunctionNode = statement;
      targetFunctionText = source.slice(statement.pos, statement.end).trim();
    }
  }

  if (!targetFunctionNode || !targetFunctionText) {
    return `// Could not find function "${functionName}"`;
  }

  // Use AST to find all identifier references in the function
  const usedIdentifiers = collectIdentifierReferences(targetFunctionNode);

  // Rebuild imports with only the used specifiers
  const usedImports: string[] = [];

  for (const imp of imports) {
    const usedDefault =
      imp.defaultImport && usedIdentifiers.has(imp.defaultImport);
    const usedNamed = imp.namedImports.filter((name) =>
      usedIdentifiers.has(name),
    );
    const usedNamespace =
      imp.namespaceImport && usedIdentifiers.has(imp.namespaceImport);

    if (!usedDefault && usedNamed.length === 0 && !usedNamespace) {
      continue; // Skip this import entirely
    }

    // Reconstruct the import statement
    const parts: string[] = [];

    if (usedDefault) {
      parts.push(imp.defaultImport!);
    }

    if (usedNamed.length > 0) {
      parts.push(`{ ${usedNamed.join(", ")} }`);
    }

    if (usedNamespace) {
      parts.push(`* as ${imp.namespaceImport}`);
    }

    usedImports.push(
      `import ${parts.join(", ")} from "${imp.moduleSpecifier}";`,
    );
  }

  const importBlock = usedImports.join("\n");

  return importBlock
    ? `${importBlock}\n\n${targetFunctionText}`
    : targetFunctionText;
}
