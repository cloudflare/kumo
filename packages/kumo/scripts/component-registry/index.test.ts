/**
 * Tests for component-registry utility functions.
 *
 * These tests cover the pure utility functions that will be extracted
 * into separate modules. Writing tests first ensures we don't break
 * functionality during the refactoring.
 */

import { describe, it, expect } from "vitest";

// =============================================================================
// Tests for string transformation utilities
// =============================================================================

describe("toPascalCase", () => {
  // Function: Convert kebab-case to PascalCase
  // "clipboard-text" → "ClipboardText"

  function toPascalCase(str: string): string {
    return str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  it("converts simple kebab-case to PascalCase", () => {
    expect(toPascalCase("button")).toBe("Button");
  });

  it("converts multi-word kebab-case to PascalCase", () => {
    expect(toPascalCase("clipboard-text")).toBe("ClipboardText");
  });

  it("converts triple-word kebab-case to PascalCase", () => {
    expect(toPascalCase("date-range-picker")).toBe("DateRangePicker");
  });

  it("handles already-capitalized segments", () => {
    expect(toPascalCase("page-header")).toBe("PageHeader");
  });
});

describe("toScreamingSnakeCase", () => {
  // Function: Convert PascalCase to SCREAMING_SNAKE_CASE
  // "ClipboardText" → "CLIPBOARD_TEXT"

  function toScreamingSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
      .toUpperCase();
  }

  it("converts simple PascalCase to SCREAMING_SNAKE_CASE", () => {
    expect(toScreamingSnakeCase("Button")).toBe("BUTTON");
  });

  it("converts multi-word PascalCase to SCREAMING_SNAKE_CASE", () => {
    expect(toScreamingSnakeCase("ClipboardText")).toBe("CLIPBOARD_TEXT");
  });

  it("converts triple-word PascalCase to SCREAMING_SNAKE_CASE", () => {
    expect(toScreamingSnakeCase("DateRangePicker")).toBe("DATE_RANGE_PICKER");
  });

  it("handles consecutive uppercase letters", () => {
    expect(toScreamingSnakeCase("HTMLParser")).toBe("HTML_PARSER");
  });
});

// =============================================================================
// Tests for variant parsing utilities
// =============================================================================

describe("extractBalancedBraces", () => {
  // Function: Extract a balanced brace block starting from a position

  function extractBalancedBraces(
    content: string,
    startIndex: number,
  ): string | null {
    let depth = 0;
    let start = -1;

    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (content[i] === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          return content.substring(start, i + 1);
        }
      }
    }
    return null;
  }

  it("extracts simple object", () => {
    const content = 'const x = { foo: "bar" };';
    expect(extractBalancedBraces(content, 10)).toBe('{ foo: "bar" }');
  });

  it("extracts nested objects", () => {
    const content = 'const x = { foo: { bar: "baz" } };';
    expect(extractBalancedBraces(content, 10)).toBe('{ foo: { bar: "baz" } }');
  });

  it("extracts deeply nested objects", () => {
    const content = "const x = { a: { b: { c: 1 } } };";
    expect(extractBalancedBraces(content, 10)).toBe("{ a: { b: { c: 1 } } }");
  });

  it("returns null for unbalanced braces", () => {
    const content = "const x = { foo:";
    expect(extractBalancedBraces(content, 10)).toBeNull();
  });

  it("starts from correct position", () => {
    const content = "a = {}; b = { inner: true };";
    // Start after first object
    expect(extractBalancedBraces(content, 12)).toBe("{ inner: true }");
  });
});

describe("parseDefaultsObject", () => {
  // Function: Parse a defaults object string into a key-value map

  function parseDefaultsObject(objStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    const propPattern = /(\w+)\s*:\s*["']([^"']*)["']/g;
    let match: RegExpExecArray | null;

    while ((match = propPattern.exec(objStr)) !== null) {
      result[match[1]] = match[2];
    }

    return result;
  }

  it("parses simple defaults object", () => {
    const objStr = '{ variant: "primary", size: "base" }';
    expect(parseDefaultsObject(objStr)).toEqual({
      variant: "primary",
      size: "base",
    });
  });

  it("handles single-quoted values", () => {
    const objStr = "{ variant: 'secondary' }";
    expect(parseDefaultsObject(objStr)).toEqual({ variant: "secondary" });
  });

  it("handles multi-line objects", () => {
    const objStr = `{
      variant: "ghost",
      size: "lg",
      shape: "round"
    }`;
    expect(parseDefaultsObject(objStr)).toEqual({
      variant: "ghost",
      size: "lg",
      shape: "round",
    });
  });

  it("returns empty object for empty input", () => {
    expect(parseDefaultsObject("{}")).toEqual({});
  });
});

// =============================================================================
// Tests for state class extraction
// =============================================================================

describe("extractStateClasses", () => {
  // Function: Extract state-specific classes from a class string

  function extractStateClasses(classString: string): Record<string, string> {
    const states: Record<string, string> = {};
    const classes = classString.split(/\s+/);

    for (const cls of classes) {
      if (!cls) continue;

      if (cls.startsWith("hover:") || cls.match(/^\[&:hover[^\]]*\]:/)) {
        states.hover = states.hover ? `${states.hover} ${cls}` : cls;
      } else if (
        cls.match(/^(focus|focus-visible|focus-within):/) ||
        cls.match(/^\[&:focus(-visible|-within)?[^\]]*\]:/)
      ) {
        states.focus = states.focus ? `${states.focus} ${cls}` : cls;
      } else if (cls.startsWith("active:")) {
        states.active = states.active ? `${states.active} ${cls}` : cls;
      } else if (cls.startsWith("disabled:")) {
        states.disabled = states.disabled ? `${states.disabled} ${cls}` : cls;
      } else if (cls.startsWith("not-disabled:")) {
        states["not-disabled"] = states["not-disabled"]
          ? `${states["not-disabled"]} ${cls}`
          : cls;
      } else if (cls.match(/^data-\[state=[^\]]+\]:/)) {
        states["data-state"] = states["data-state"]
          ? `${states["data-state"]} ${cls}`
          : cls;
      }
    }

    return states;
  }

  it("extracts hover state", () => {
    const classes = "bg-kumo-brand hover:bg-primary-dark";
    expect(extractStateClasses(classes)).toEqual({
      hover: "hover:bg-primary-dark",
    });
  });

  it("extracts focus state", () => {
    const classes = "ring-kumo-line focus:ring-kumo-ring";
    expect(extractStateClasses(classes)).toEqual({
      focus: "focus:ring-kumo-ring",
    });
  });

  it("extracts multiple states", () => {
    const classes =
      "bg-kumo-base hover:bg-kumo-elevated focus:ring-kumo-ring disabled:opacity-50";
    expect(extractStateClasses(classes)).toEqual({
      hover: "hover:bg-kumo-elevated",
      focus: "focus:ring-kumo-ring",
      disabled: "disabled:opacity-50",
    });
  });

  it("handles focus-visible variant", () => {
    const classes = "focus-visible:ring-2";
    expect(extractStateClasses(classes)).toEqual({
      focus: "focus-visible:ring-2",
    });
  });

  it("handles complex selectors", () => {
    const classes = "[&:hover>span]:text-white";
    expect(extractStateClasses(classes)).toEqual({
      hover: "[&:hover>span]:text-white",
    });
  });

  it("returns empty object for no state classes", () => {
    const classes = "bg-kumo-base text-kumo-default rounded-lg";
    expect(extractStateClasses(classes)).toEqual({});
  });

  it("combines multiple classes of same state", () => {
    const classes = "hover:bg-kumo-brand hover:text-white";
    expect(extractStateClasses(classes)).toEqual({
      hover: "hover:bg-kumo-brand hover:text-white",
    });
  });
});

// =============================================================================
// Tests for example cleanup utilities
// =============================================================================

describe("cleanupExample", () => {
  // Function: Clean up extracted examples to fix common issues

  function cleanupExample(example: string): string {
    let cleaned = example;

    // Fix stringified functions: prop="() => {}" -> prop={() => {}}
    cleaned = cleaned.replace(/(\w+)="(\(\)\s*=>\s*\{[^}]*\})"/g, "$1={$2}");

    // Fix stringified arrays: prop={`[...]`} -> prop={[...]}
    cleaned = cleaned.replace(/(\w+)=\{`(\[[\s\S]*?\])`\}/g, "$1={$2}");

    // Fix escaped template literals: \` -> `
    cleaned = cleaned.replace(/\\`/g, "`");

    // Fix double backticks
    cleaned = cleaned.replace(/\{``/g, "{`");
    cleaned = cleaned.replace(/``\}/g, "`}");

    // Fix unquoted identifiers that should be strings
    const identifierAsStringProps = ["label"];
    for (const prop of identifierAsStringProps) {
      const pattern = new RegExp(
        `(${prop})=\\{([A-Z][a-z]+)\\}(?![\\w.])`,
        "g",
      );
      cleaned = cleaned.replace(pattern, '$1="$2"');
    }

    return cleaned;
  }

  it("fixes stringified function props", () => {
    const example = '<Button onClick="() => {}">Click</Button>';
    expect(cleanupExample(example)).toBe(
      "<Button onClick={() => {}}>Click</Button>",
    );
  });

  it("fixes stringified array props", () => {
    const example = '<Tabs tabs={`["one", "two"]`} />';
    expect(cleanupExample(example)).toBe('<Tabs tabs={["one", "two"]} />');
  });

  it("fixes escaped template literals", () => {
    const example = "<Code code={\\`const x = 1;\\`} />";
    expect(cleanupExample(example)).toBe("<Code code={`const x = 1;`} />");
  });

  it("fixes unquoted label identifiers", () => {
    const example = "<Checkbox label={Checked} />";
    expect(cleanupExample(example)).toBe('<Checkbox label="Checked" />');
  });

  it("preserves already correct examples", () => {
    const example = '<Button variant="primary">Submit</Button>';
    expect(cleanupExample(example)).toBe(
      '<Button variant="primary">Submit</Button>',
    );
  });
});

describe("shouldIncludeExample", () => {
  // Function: Filter out problematic examples

  function shouldIncludeExample(
    example: string,
    componentName: string,
  ): boolean {
    const undefinedComponents = [
      "RefreshButton",
      "LinkButton",
      "DefaultMenuBar",
      "ToastTriggerButton",
    ];
    for (const comp of undefinedComponents) {
      if (example.includes(`<${comp}`)) {
        return false;
      }
    }

    if (example.trim().length < 10) {
      return false;
    }

    const emptyPattern = new RegExp(`^<${componentName}\\s*/>$`);
    if (emptyPattern.test(example.trim())) {
      return false;
    }

    const undefinedVars = [
      "args.placeholder",
      "args.inputSide",
      "botList",
      "INITIAL_BOT_LIST",
    ];
    for (const varName of undefinedVars) {
      if (example.includes(varName)) {
        return false;
      }
    }

    return true;
  }

  it("rejects examples with undefined components", () => {
    expect(shouldIncludeExample("<RefreshButton />", "Button")).toBe(false);
    expect(shouldIncludeExample("<DefaultMenuBar />", "MenuBar")).toBe(false);
  });

  it("rejects empty examples", () => {
    expect(shouldIncludeExample("<Button />", "Button")).toBe(false);
    expect(shouldIncludeExample("", "Button")).toBe(false);
  });

  it("rejects examples with undefined variables", () => {
    expect(
      shouldIncludeExample("<Input placeholder={args.placeholder} />", "Input"),
    ).toBe(false);
  });

  it("accepts valid examples", () => {
    expect(
      shouldIncludeExample(
        '<Button variant="primary">Submit</Button>',
        "Button",
      ),
    ).toBe(true);
  });
});

describe("getExampleSignature", () => {
  // Function: Generate a signature for an example to detect near-duplicates

  function getExampleSignature(example: string): string {
    const propPattern = /(\w+)=["'{]/g;
    const props: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = propPattern.exec(example)) !== null) {
      props.push(match[1]);
    }
    return props.sort().join(",");
  }

  it("extracts prop names as signature", () => {
    expect(getExampleSignature('<Button variant="primary" size="lg" />')).toBe(
      "size,variant",
    );
  });

  it("handles single prop", () => {
    expect(getExampleSignature('<Button variant="primary" />')).toBe("variant");
  });

  it("handles JSX expression props", () => {
    expect(getExampleSignature("<Button onClick={() => {}} />")).toBe(
      "onClick",
    );
  });

  it("returns empty string for no props", () => {
    expect(getExampleSignature("<Button>Click</Button>")).toBe("");
  });
});

// =============================================================================
// Tests for props filtering utilities
// =============================================================================

describe("shouldSkipProp", () => {
  // Constants used by the filter
  const ALWAYS_SKIP_PROPS = new Set([
    "key",
    "ref",
    "style",
    "dangerouslySetInnerHTML",
  ]);

  const SKIP_PROP_PREFIXES = ["aria-", "data-", "on"];

  const KEEP_PROPS = new Set([
    "children",
    "className",
    "id",
    "disabled",
    "name",
    "value",
    "checked",
    "required",
    "placeholder",
    "readOnly",
    "type",
    "size",
    "title",
    "label",
    "href",
    "lang",
    "onClick",
    "onChange",
    "onSubmit",
  ]);

  const MINIMAL_SKIP_PROPS = new Set([
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
  ]);

  function shouldSkipProp(propName: string): boolean {
    if (KEEP_PROPS.has(propName)) {
      return false;
    }
    if (ALWAYS_SKIP_PROPS.has(propName)) {
      return true;
    }
    for (const prefix of SKIP_PROP_PREFIXES) {
      if (propName.startsWith(prefix)) {
        return true;
      }
    }
    if (MINIMAL_SKIP_PROPS.has(propName)) {
      return true;
    }
    return false;
  }

  it("keeps important props like children and className", () => {
    expect(shouldSkipProp("children")).toBe(false);
    expect(shouldSkipProp("className")).toBe(false);
    expect(shouldSkipProp("disabled")).toBe(false);
  });

  it("keeps common event handlers", () => {
    expect(shouldSkipProp("onClick")).toBe(false);
    expect(shouldSkipProp("onChange")).toBe(false);
    expect(shouldSkipProp("onSubmit")).toBe(false);
  });

  it("skips React internal props", () => {
    expect(shouldSkipProp("key")).toBe(true);
    expect(shouldSkipProp("ref")).toBe(true);
    expect(shouldSkipProp("style")).toBe(true);
  });

  it("skips aria attributes", () => {
    expect(shouldSkipProp("aria-label")).toBe(true);
    expect(shouldSkipProp("aria-hidden")).toBe(true);
  });

  it("skips data attributes", () => {
    expect(shouldSkipProp("data-testid")).toBe(true);
    expect(shouldSkipProp("data-state")).toBe(true);
  });

  it("skips most event handlers except kept ones", () => {
    expect(shouldSkipProp("onMouseDown")).toBe(true);
    expect(shouldSkipProp("onKeyUp")).toBe(true);
  });

  it("skips common HTML attributes", () => {
    expect(shouldSkipProp("accessKey")).toBe(true);
    expect(shouldSkipProp("tabIndex")).toBe(true);
    expect(shouldSkipProp("spellCheck")).toBe(true);
  });
});

// =============================================================================
// Tests for path detection utilities
// =============================================================================

describe("getComponentNameFromPath", () => {
  // Function: Extract component name from file path

  function getComponentNameFromPath(filename: string): string | null {
    const match = filename.match(/src\/components\/([^/]+)\/\1\.tsx$/);
    if (!match) return null;
    return match[1].toUpperCase().replace(/-/g, "_");
  }

  it("extracts component name from standard path", () => {
    expect(getComponentNameFromPath("src/components/button/button.tsx")).toBe(
      "BUTTON",
    );
  });

  it("handles kebab-case component names", () => {
    expect(
      getComponentNameFromPath(
        "src/components/clipboard-text/clipboard-text.tsx",
      ),
    ).toBe("CLIPBOARD_TEXT");
  });

  it("returns null for non-component files", () => {
    expect(getComponentNameFromPath("src/utils/cn.ts")).toBeNull();
  });

  it("returns null for mismatched directory/file names", () => {
    expect(
      getComponentNameFromPath("src/components/button/types.tsx"),
    ).toBeNull();
  });

  it("returns null for test files", () => {
    expect(
      getComponentNameFromPath("src/components/button/button.test.tsx"),
    ).toBeNull();
  });
});

// =============================================================================
// Tests for JSON Schema type conversion
// =============================================================================

describe("jsonSchemaTypeToString", () => {
  // Function: Convert JSON Schema type to string representation

  interface Definition {
    $ref?: string;
    enum?: unknown[];
    type?: string | string[];
    items?: Definition;
    anyOf?: Definition[];
    oneOf?: Definition[];
  }

  function jsonSchemaTypeToString(def: Definition): string {
    if (def.$ref) {
      const refName = decodeURIComponent(
        def.$ref.split("/").pop() || "unknown",
      );
      if (refName.includes("ReactNode") || refName.includes("ReactElement")) {
        return "ReactNode";
      }
      return refName;
    }
    if (def.enum) {
      return "enum";
    }
    if (def.type === "array") {
      const itemType = def.items
        ? jsonSchemaTypeToString(def.items)
        : "unknown";
      return `${itemType}[]`;
    }
    if (def.anyOf || def.oneOf) {
      const types = (def.anyOf || def.oneOf) as Definition[];
      const typeStrings = types
        .map((t) => jsonSchemaTypeToString(t))
        .filter((t) => t !== "undefined" && t !== "null");
      if (typeStrings.some((t) => t.includes("React"))) {
        return "ReactNode";
      }
      return typeStrings.join(" | ");
    }
    if (def.type) {
      return Array.isArray(def.type) ? def.type.join(" | ") : def.type;
    }
    return "unknown";
  }

  it("converts basic types", () => {
    expect(jsonSchemaTypeToString({ type: "string" })).toBe("string");
    expect(jsonSchemaTypeToString({ type: "number" })).toBe("number");
    expect(jsonSchemaTypeToString({ type: "boolean" })).toBe("boolean");
  });

  it("converts array types", () => {
    expect(
      jsonSchemaTypeToString({ type: "array", items: { type: "string" } }),
    ).toBe("string[]");
  });

  it("converts $ref to type name", () => {
    expect(
      jsonSchemaTypeToString({ $ref: "#/definitions/ButtonVariant" }),
    ).toBe("ButtonVariant");
  });

  it("simplifies ReactNode references", () => {
    expect(jsonSchemaTypeToString({ $ref: "#/definitions/ReactNode" })).toBe(
      "ReactNode",
    );
    expect(jsonSchemaTypeToString({ $ref: "#/definitions/ReactElement" })).toBe(
      "ReactNode",
    );
  });

  it("converts enums", () => {
    expect(jsonSchemaTypeToString({ enum: ["primary", "secondary"] })).toBe(
      "enum",
    );
  });

  it("converts union types", () => {
    expect(
      jsonSchemaTypeToString({
        anyOf: [{ type: "string" }, { type: "number" }],
      }),
    ).toBe("string | number");
  });

  it("handles multiple types", () => {
    expect(jsonSchemaTypeToString({ type: ["string", "null"] })).toBe(
      "string | null",
    );
  });
});
