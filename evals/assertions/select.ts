import { parse, type ParserOptions } from "@babel/parser";
import type {
  Expression,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  Node,
  ObjectExpression,
} from "@babel/types";

export interface SelectEvalAssertion {
  pass: boolean;
  reason: string;
}

function extractCode(output: string): string {
  const generated = String(output ?? "");
  const blocks = [
    ...generated.matchAll(/```(?:tsx|typescript|jsx|ts)?\n([\s\S]*?)```/gi),
  ];
  if (blocks.length > 0) return blocks[blocks.length - 1]?.[1] ?? "";

  const importIndex = generated.lastIndexOf("import ");
  return importIndex >= 0 ? generated.slice(importIndex) : generated;
}

function jsxName(
  node: JSXIdentifier | JSXMemberExpression | JSXNamespacedName | null,
): string {
  if (!node) return "";
  if (node.type === "JSXIdentifier") return node.name;
  if (node.type === "JSXMemberExpression") {
    return `${jsxName(node.object)}.${jsxName(node.property)}`;
  }
  if (node.type === "JSXNamespacedName") {
    return `${jsxName(node.namespace)}:${jsxName(node.name)}`;
  }
  return "";
}

function attrName(attr: JSXAttribute): string {
  return attr.type === "JSXAttribute" ? jsxName(attr.name) : "";
}

function attrValueExpression(attr: JSXAttribute): Expression | undefined {
  if (!attr || attr.type !== "JSXAttribute") return undefined;
  if (!attr.value) return undefined;
  if (attr.value.type === "StringLiteral") return attr.value;
  if (
    attr.value.type === "JSXExpressionContainer" &&
    attr.value.expression.type !== "JSXEmptyExpression"
  ) {
    return attr.value.expression;
  }
  return undefined;
}

function stringValue(node: Node | null | undefined): string | undefined {
  if (!node) return undefined;
  if (node.type === "StringLiteral") return node.value;
  if (
    node.type === "TemplateLiteral" &&
    node.expressions.length === 0 &&
    node.quasis[0]
  ) {
    return node.quasis[0].value.cooked ?? undefined;
  }
  if (node.type === "JSXText") return node.value.trim();
  if (node.type === "JSXExpressionContainer")
    return stringValue(node.expression);
  return undefined;
}

function objectKeyName(key: Node): string | undefined {
  if (!key) return undefined;
  if (key.type === "Identifier") return key.name;
  if (key.type === "StringLiteral" || key.type === "NumericLiteral") {
    return String(key.value);
  }
  return undefined;
}

function objectProperty(
  object: ObjectExpression | null | undefined,
  name: string,
): Expression | undefined {
  if (!object || object.type !== "ObjectExpression") return undefined;
  for (const property of object.properties) {
    if (property.type !== "ObjectProperty") continue;
    if (objectKeyName(property.key) === name) {
      return property.value as Expression;
    }
  }
  return undefined;
}

function readItems(
  node: Expression | null | undefined,
  constants: Map<string, Expression | null | undefined>,
): Map<string, string> {
  if (!node) return new Map();
  if (node.type === "Identifier")
    return readItems(constants.get(node.name), constants);

  const items = new Map<string, string>();
  if (node.type === "ObjectExpression") {
    for (const property of node.properties) {
      if (property.type !== "ObjectProperty") continue;
      const value = objectKeyName(property.key);
      if (!value) continue;

      const label =
        stringValue(property.value as Expression) ??
        stringValue(
          objectProperty(property.value as ObjectExpression, "label"),
        );
      if (label) items.set(value, label);
    }
  }

  if (node.type === "ArrayExpression") {
    for (const element of node.elements) {
      if (!element || element.type !== "ObjectExpression") continue;
      const value = stringValue(objectProperty(element, "value"));
      const label = stringValue(objectProperty(element, "label"));
      if (value && label) items.set(value, label);
    }
  }

  return items;
}

function isEmptyInitializer(node: Expression | null | undefined): boolean {
  if (!node) return true;
  if (node.type === "NullLiteral") return true;
  if (node.type === "Identifier" && node.name === "undefined") return true;
  return node.type === "StringLiteral" && node.value === "";
}

function walk(node: Node | null | undefined, visit: (node: Node) => void) {
  if (!node || typeof node !== "object") return;
  visit(node);

  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visit);
    } else if (
      value &&
      typeof value === "object" &&
      "type" in value &&
      typeof value.type === "string"
    ) {
      walk(value as Node, visit);
    }
  }
}

export function assertSelectOutput(
  output: string,
  expectedValues: string[],
  expectedLabels: string[],
): SelectEvalAssertion {
  const code = extractCode(output);

  const parseOptions: ParserOptions = {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
    errorRecovery: true,
  };

  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(code, parseOptions);
  } catch (error) {
    return {
      pass: false,
      reason: `could not parse generated TSX: ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const selectNames = new Set<string>();
  const constants = new Map<string, Expression | null | undefined>();
  const emptyStateVariables = new Set<string>();
  const jsxElements: JSXElement[] = [];

  walk(ast, (node) => {
    if (
      node.type === "ImportDeclaration" &&
      node.source.value === "@cloudflare/kumo"
    ) {
      for (const specifier of node.specifiers) {
        if (
          specifier.type === "ImportSpecifier" &&
          specifier.imported.type === "Identifier" &&
          specifier.imported.name === "Select"
        ) {
          selectNames.add(specifier.local.name);
        }
      }
    }

    if (node.type === "VariableDeclarator" && node.id.type === "Identifier") {
      constants.set(node.id.name, node.init);
    }

    if (
      node.type === "VariableDeclarator" &&
      node.id.type === "ArrayPattern" &&
      node.id.elements[0]?.type === "Identifier" &&
      node.init?.type === "CallExpression" &&
      node.init.callee.type === "Identifier" &&
      node.init.callee.name === "useState" &&
      isEmptyInitializer(node.init.arguments[0] as Expression)
    ) {
      emptyStateVariables.add(node.id.elements[0].name);
    }

    if (node.type === "JSXElement") jsxElements.push(node);
  });

  const failures: string[] = [];
  const disallowedNames = new Set([
    "SelectTrigger",
    "SelectValue",
    "SelectContent",
    "SelectItem",
    "Select.Trigger",
    "Select.Value",
    "Select.Content",
    "Select.Item",
    "Select.Option",
  ]);

  for (const element of jsxElements) {
    const name = jsxName(element.openingElement.name);
    if (name === "select")
      failures.push("uses native <select> instead of Kumo Select");
    if (disallowedNames.has(name))
      failures.push(`uses unsupported ${name} API`);
  }

  const selectElement = jsxElements.find((element) =>
    selectNames.has(jsxName(element.openingElement.name)),
  );

  if (!selectElement) failures.push("missing imported Kumo <Select>");

  if (selectElement) {
    const attrs = new Map(
      selectElement.openingElement.attributes.map((attr) => [
        attrName(attr as JSXAttribute),
        attr as JSXAttribute,
      ]),
    );
    const valueExpression = attrValueExpression(attrs.get("value")!);
    const itemsExpression = attrValueExpression(attrs.get("items")!);
    const items = readItems(itemsExpression, constants);

    if (
      !attrs.has("label") &&
      !attrs.has("aria-label") &&
      !attrs.has("aria-labelledby")
    ) {
      failures.push("missing label/aria-label/aria-labelledby");
    }
    if (!attrs.has("placeholder")) failures.push("missing placeholder");
    if (!attrs.has("items")) failures.push("missing items prop");
    if (!attrs.has("value")) failures.push("missing controlled value prop");
    if (!attrs.has("onValueChange"))
      failures.push("missing onValueChange prop");
    if (attrs.has("defaultValue"))
      failures.push("uses defaultValue instead of controlled empty state");

    if (
      valueExpression?.type === "Identifier" &&
      !emptyStateVariables.has(valueExpression.name)
    ) {
      failures.push("initial state should be empty so placeholder is visible");
    }

    for (const value of expectedValues) {
      if (!items.has(value)) failures.push(`items is missing value ${value}`);
    }
    for (const label of expectedLabels) {
      if (![...items.values()].includes(label))
        failures.push(`items is missing label ${label}`);
    }
  }

  const uniqueFailures = [...new Set(failures)];
  return {
    pass: uniqueFailures.length === 0,
    reason:
      uniqueFailures.length === 0
        ? "Assertion passed"
        : uniqueFailures.join(", "),
  };
}
