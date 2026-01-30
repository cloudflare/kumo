import { defineRule } from "oxlint";

const RULE_NAME = "no-tailwind-dark-variant";

function extractStrings(node) {
  if (!node) return [];
  const out = [];

  switch (node.type) {
    case "Literal": {
      if (typeof node.value === "string") out.push(node.value);
      break;
    }
    case "TemplateLiteral": {
      for (const q of node.quasis) {
        if (typeof q.value.cooked === "string") out.push(q.value.cooked);
      }
      break;
    }
    case "BinaryExpression": {
      if (node.operator === "+") {
        out.push(...extractStrings(node.left));
        out.push(...extractStrings(node.right));
      }
      break;
    }
    case "ArrayExpression": {
      for (const el of node.elements) {
        if (el) {
          out.push(...extractStrings(el));
        }
      }
      break;
    }
    case "ObjectExpression": {
      for (const prop of node.properties) {
        if (prop.type === "Property") {
          out.push(...extractStrings(prop.key));
          out.push(...extractStrings(prop.value));
        }
      }
      break;
    }
    case "CallExpression": {
      for (const arg of node.arguments) {
        if (arg.type === "SpreadElement") continue;
        out.push(...extractStrings(arg));
      }
      break;
    }
    case "ConditionalExpression": {
      out.push(...extractStrings(node.consequent));
      out.push(...extractStrings(node.alternate));
      out.push(...extractStrings(node.test));
      break;
    }
    case "UnaryExpression": {
      out.push(...extractStrings(node.argument));
      break;
    }
    case "LogicalExpression": {
      out.push(...extractStrings(node.left));
      out.push(...extractStrings(node.right));
      break;
    }
    case "JSXText": {
      out.push(node.value);
      break;
    }
    case "JSXExpressionContainer": {
      out.push(...extractStrings(node.expression));
      break;
    }
  }

  return out;
}

function hasDarkVariant(str) {
  return str.includes("dark:");
}

function isInsideJsxAttribute(node) {
  let current = node.parent;
  while (current) {
    if (current.type === "JSXAttribute") return true;
    current = current.parent;
  }
  return false;
}

export const noTailwindDarkVariantRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Tailwind dark: variant usage in class names",
    },
    messages: {
      [RULE_NAME]:
        "Avoid using Tailwind's dark: variant. Use the design system token or component API for dark mode handling.",
    },
    schema: [],
  },
  defaultOptions: [],
  createOnce(context) {
    function reportIfDark(node, collected) {
      for (const s of collected) {
        if (hasDarkVariant(s)) {
          context.report({ node, messageId: RULE_NAME });
          return;
        }
      }
    }

    return {
      JSXAttribute(node) {
        const name =
          node.name.type === "JSXIdentifier" ? node.name.name : undefined;
        if (name !== "className" && name !== "class") return;

        if (node.value) {
          const strings = extractStrings(node.value);
          reportIfDark(node, strings);
        }
      },
      Literal(node) {
        if (
          typeof node.value !== "string" ||
          !hasDarkVariant(node.value) ||
          isInsideJsxAttribute(node)
        ) {
          return;
        }

        context.report({ node, messageId: RULE_NAME });
      },
      TemplateLiteral(node) {
        if (isInsideJsxAttribute(node)) {
          return;
        }

        const strings = extractStrings(node);
        if (strings.some(hasDarkVariant)) {
          context.report({ node, messageId: RULE_NAME });
        }
      },
    };
  },
});
