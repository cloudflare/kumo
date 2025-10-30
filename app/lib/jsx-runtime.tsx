/**
 * JSX Runtime Compiler
 * 
 * Safely compiles and executes JSX code strings at runtime using Babel standalone.
 * Includes comprehensive error handling and validation.
 */

import * as Babel from "@babel/standalone";
import React from "react";

export interface CompilationResult {
  success: boolean;
  component?: React.ComponentType;
  error?: {
    type: "compilation" | "runtime" | "validation";
    message: string;
    details?: string;
  };
}

/**
 * Validates JSX code before compilation
 */
function validateJSX(code: string): { valid: boolean; error?: string } {
  // Check for dangerous patterns
  const dangerousPatterns = [
    { pattern: /eval\s*\(/g, message: "eval() is not allowed" },
    { pattern: /Function\s*\(/g, message: "Function constructor is not allowed" },
    { pattern: /import\s+/g, message: "Dynamic imports are not allowed in preview code" },
    { pattern: /__proto__/g, message: "Prototype manipulation is not allowed" },
    { pattern: /constructor\s*\[/g, message: "Constructor access is not allowed" },
  ];

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(code)) {
      return { valid: false, error: message };
    }
  }

  // Check for balanced JSX tags (basic validation)
  const openTags = code.match(/<[A-Z][a-zA-Z0-9]*[\s>]/g) || [];
  const closeTags = code.match(/<\/[A-Z][a-zA-Z0-9]*>/g) || [];
  const selfClosing = code.match(/<[A-Z][a-zA-Z0-9]*[^>]*\/>/g) || [];
  
  // Basic sanity check (not perfect but catches obvious issues)
  if (openTags.length > 0 && closeTags.length === 0 && selfClosing.length === 0) {
    return { valid: false, error: "JSX tags appear to be unclosed" };
  }

  return { valid: true };
}

/**
 * Compiles JSX code string to executable JavaScript
 */
function compileJSX(code: string): { success: boolean; compiled?: string; error?: string } {
  try {
    const result = Babel.transform(code, {
      presets: ["react", "typescript"],
      filename: "preview.tsx",
    });

    if (!result.code) {
      return { success: false, error: "Babel compilation produced no output" };
    }

    return { success: true, compiled: result.code };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Compilation error: ${message}` };
  }
}

/**
 * Creates a safe execution context with provided components
 */
function createExecutionContext(componentScope: Record<string, any>) {
  return {
    React,
    ...componentScope,
    // Provide common hooks
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
    useRef: React.useRef,
  };
}

/**
 * Executes compiled code in a controlled context
 */
function executeCode(
  compiledCode: string,
  componentScope: Record<string, any>
): { success: boolean; component?: React.ComponentType; error?: string } {
  try {
    const context = createExecutionContext(componentScope);
    
    // Wrap the code to return the result
    // The code should either be an IIFE that returns JSX, or just JSX
    const wrappedCode = `
      (function(${Object.keys(context).join(", ")}) {
        "use strict";
        return ${compiledCode};
      })
    `;

    // Execute the code
    const func = eval(wrappedCode);
    const result = func(...Object.values(context));

    // If result is a valid React element, wrap it in a component
    if (React.isValidElement(result)) {
      const Component = () => result;
      return { success: true, component: Component };
    }

    // If result is a function, it might be a component
    if (typeof result === "function") {
      // Try calling it to see if it returns a React element
      try {
        const testResult = result();
        if (React.isValidElement(testResult)) {
          return { success: true, component: result };
        }
      } catch {
        // If it fails, just return it as-is
        return { success: true, component: result };
      }
    }

    return { success: false, error: "Code did not return a valid React component or element" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Runtime error: ${message}` };
  }
}

/**
 * Main function to compile and execute JSX code
 * 
 * @param code - JSX code string to compile
 * @param componentScope - Object containing all available components and utilities
 * @returns CompilationResult with component or error
 */
export function compileAndExecuteJSX(
  code: string,
  componentScope: Record<string, any>
): CompilationResult {
  // Step 1: Validate
  const validation = validateJSX(code);
  if (!validation.valid) {
    return {
      success: false,
      error: {
        type: "validation",
        message: validation.error || "Validation failed",
      },
    };
  }

  // Step 2: Compile
  const compilation = compileJSX(code);
  if (!compilation.success) {
    return {
      success: false,
      error: {
        type: "compilation",
        message: "Failed to compile JSX",
        details: compilation.error,
      },
    };
  }

  // Step 3: Execute
  const execution = executeCode(compilation.compiled!, componentScope);
  if (!execution.success) {
    return {
      success: false,
      error: {
        type: "runtime",
        message: "Failed to execute code",
        details: execution.error,
      },
    };
  }

  return {
    success: true,
    component: execution.component,
  };
}

/**
 * Wraps code in a function component if it's not already
 * Now expects code to be either JSX or an IIFE that returns JSX
 */
export function wrapInComponent(code: string): string {
  const trimmed = code.trim();
  
  // If it's already an IIFE or starts with JSX, use as-is
  if (trimmed.startsWith("(() =>") || trimmed.startsWith("<")) {
    return trimmed;
  }

  // If it's a function declaration, wrap it differently
  if (trimmed.startsWith("function")) {
    return trimmed;
  }

  // Default: assume it's JSX and wrap it
  return trimmed;
}

/**
 * Extracts the component body from a function component string
 */
export function extractComponentBody(code: string): string {
  const trimmed = code.trim();
  
  // If it's already just JSX, return as-is
  if (trimmed.startsWith("<")) {
    return trimmed;
  }

  // Try to extract return statement
  const returnMatch = trimmed.match(/return\s*\(?\s*([\s\S]*?)\s*\)?;?\s*\}?\s*$/);
  if (returnMatch) {
    return returnMatch[1].trim();
  }

  return trimmed;
}
