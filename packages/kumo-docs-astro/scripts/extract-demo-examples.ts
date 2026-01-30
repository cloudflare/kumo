#!/usr/bin/env npx tsx
/**
 * Extract Demo Examples for AI/Agent Consumption
 *
 * This script parses *Demo.tsx files and extracts usable code examples
 * for the component registry. Unlike Storybook stories, demo files contain
 * clean, production-ready examples suitable for AI consumption.
 *
 * Run: pnpm codegen:demos
 * Output: dist/demo-metadata.json (consumed by @cloudflare/kumo registry generator)
 *
 * Demo file naming convention:
 *   {Component}Demo.tsx -> exports functions like {Component}{Variant}Demo
 *   e.g., ButtonDemo.tsx -> ButtonBasicDemo, ButtonPrimaryDemo, etc.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const demosDir = join(__dirname, "../src/components/demos");
const outputDir = join(__dirname, "../dist");

// =============================================================================
// Types
// =============================================================================

interface ExtractedDemo {
  /** Function name (e.g., "ButtonPrimaryDemo") */
  name: string;
  /** The JSX code extracted from the return statement */
  code: string;
  /** Description extracted from JSDoc if present */
  description?: string;
}

interface ComponentDemos {
  /** Component name (e.g., "Button") */
  componentName: string;
  /** Source file path relative to demos directory */
  sourceFile: string;
  /** Extracted demo examples */
  demos: ExtractedDemo[];
}

export interface DemoMetadata {
  /** ISO timestamp of generation */
  generatedAt: string;
  /** Version for cache invalidation */
  version: string;
  /** Map of component name to its demos */
  components: Record<string, ComponentDemos>;
}

// =============================================================================
// AST Helpers
// =============================================================================

function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getText(sourceFile);
}

/**
 * Extract JSDoc description from a function declaration
 */
function extractJSDocDescription(
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
): string | undefined {
  const fullText = sourceFile.getFullText();
  const nodeStart = node.getFullStart();

  // Look for JSDoc comment before the function
  const textBefore = fullText.slice(0, nodeStart);
  const jsdocMatch = textBefore.match(/\/\*\*\s*\n([^]*?)\*\/\s*$/);

  if (jsdocMatch) {
    const jsdocContent = jsdocMatch[1];
    const lines = jsdocContent
      .split("\n")
      .map((line) => line.replace(/^\s*\*\s?/, "").trim())
      .filter((line) => line.length > 0 && !line.startsWith("@"));

    if (lines.length > 0) {
      return lines.join(" ");
    }
  }

  return undefined;
}

/**
 * Clean up extracted JSX code for readability
 */
function cleanupJSX(jsx: string): string {
  jsx = jsx.trim();

  // Remove wrapping parentheses (common in return statements)
  if (jsx.startsWith("(") && jsx.endsWith(")")) {
    jsx = jsx.slice(1, -1).trim();
  }

  return jsx;
}

/**
 * Extract the return JSX from a function body
 */
function extractReturnJSX(
  body: ts.Block,
  sourceFile: ts.SourceFile,
): string | null {
  let returnJSX: string | null = null;

  ts.forEachChild(body, (child) => {
    if (ts.isReturnStatement(child) && child.expression) {
      returnJSX = cleanupJSX(getNodeText(child.expression, sourceFile));
    }
  });

  return returnJSX;
}

/**
 * Extract the return JSX from an arrow function
 */
function extractArrowFunctionJSX(
  node: ts.ArrowFunction,
  sourceFile: ts.SourceFile,
): string | null {
  // Block body: () => { return <JSX /> }
  if (ts.isBlock(node.body)) {
    return extractReturnJSX(node.body, sourceFile);
  }

  // Expression body: () => <JSX />
  return cleanupJSX(getNodeText(node.body, sourceFile));
}

// =============================================================================
// Demo File Parser
// =============================================================================

/**
 * Parse a demo file and extract all exported demo functions
 */
function parseDemoFile(filePath: string): ComponentDemos | null {
  const content = readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  // Extract component name from file path (e.g., ButtonDemo.tsx -> Button)
  const fileName = basename(filePath, ".tsx");
  const componentMatch = fileName.match(/^(.+)Demo$/);
  if (!componentMatch) {
    console.warn(`Skipping ${fileName}: doesn't match *Demo.tsx pattern`);
    return null;
  }

  const componentName = componentMatch[1];
  const demos: ExtractedDemo[] = [];

  // Find all exported function declarations
  ts.forEachChild(sourceFile, (node) => {
    // Handle: export function FooDemo() { ... }
    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      node.name &&
      node.body
    ) {
      const funcName = node.name.text;

      // Only include functions that end with "Demo"
      if (!funcName.endsWith("Demo")) {
        return;
      }

      const jsx = extractReturnJSX(node.body, sourceFile);
      if (jsx) {
        demos.push({
          name: funcName,
          code: jsx,
          description: extractJSDocDescription(node, sourceFile),
        });
      }
    }

    // Handle: export const FooDemo = () => { ... }
    if (
      ts.isVariableStatement(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.initializer &&
          ts.isArrowFunction(decl.initializer)
        ) {
          const funcName = decl.name.text;

          // Only include functions that end with "Demo"
          if (!funcName.endsWith("Demo")) {
            continue;
          }

          const jsx = extractArrowFunctionJSX(decl.initializer, sourceFile);
          if (jsx) {
            demos.push({
              name: funcName,
              code: jsx,
            });
          }
        }
      }
    }
  });

  if (demos.length === 0) {
    console.warn(`No demos found in ${fileName}`);
    return null;
  }

  return {
    componentName,
    sourceFile: basename(filePath),
    demos,
  };
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log("Extracting demo examples from kumo-docs-astro...\n");

  // Find all demo files
  const files = readdirSync(demosDir).filter(
    (f) => f.endsWith("Demo.tsx") && !f.startsWith("_"),
  );

  console.log(`Found ${files.length} demo files\n`);

  const metadata: DemoMetadata = {
    generatedAt: new Date().toISOString(),
    version: "1.0.0",
    components: {},
  };

  let totalDemos = 0;

  for (const file of files) {
    const filePath = join(demosDir, file);
    const result = parseDemoFile(filePath);

    if (result) {
      metadata.components[result.componentName] = result;
      totalDemos += result.demos.length;
      console.log(
        `  ${result.componentName}: ${result.demos.length} demos extracted`,
      );
    }
  }

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  // Write metadata file
  const outputPath = join(outputDir, "demo-metadata.json");
  writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

  console.log(`\n✓ Extracted ${totalDemos} demos from ${files.length} files`);
  console.log(`✓ Wrote ${outputPath}`);
}

main();
