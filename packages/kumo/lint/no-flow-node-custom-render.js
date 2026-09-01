import { defineRule } from "@oxlint/plugins";

function traverse(
  node,
  visitors,
  seen = new WeakSet(),
  parent = null,
  parentKey = null,
) {
  if (!node || typeof node !== "object" || seen.has(node)) {
    return;
  }

  seen.add(node);

  const visitor = visitors[node.type];
  if (visitor) {
    visitor(node, parent, parentKey);
  }

  for (const [key, value] of Object.entries(node)) {
    if (
      key === "parent" ||
      key === "loc" ||
      key === "range" ||
      key === "start" ||
      key === "end"
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        traverse(child, visitors, seen, node, key);
      }
    } else if (value && typeof value === "object") {
      traverse(value, visitors, seen, node, key);
    }
  }
}

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    (current.type === "TSAsExpression" ||
      current.type === "TSSatisfiesExpression" ||
      current.type === "TSNonNullExpression" ||
      current.type === "ChainExpression")
  ) {
    current = current.expression;
  }
  return current;
}

function getLiteralValue(node) {
  if (node?.type === "Literal" || node?.type === "StringLiteral") {
    return node.value;
  }
  return null;
}

function getIdentifierName(node) {
  if (node?.type === "Identifier" || node?.type === "JSXIdentifier") {
    return node.name;
  }
  return null;
}

function getPropertyName(node) {
  if (!node) return null;
  if (node.type === "Identifier" || node.type === "PrivateIdentifier") {
    return node.name;
  }
  if (node.type === "Literal" || node.type === "StringLiteral") {
    return node.value;
  }
  return null;
}

function getJSXName(node) {
  if (node?.type === "JSXIdentifier") {
    return node.name;
  }
  if (node?.type === "JSXMemberExpression") {
    const objectName = getJSXName(node.object);
    const propertyName = getJSXName(node.property);
    return objectName && propertyName ? `${objectName}.${propertyName}` : null;
  }
  return null;
}

function isComponentName(name) {
  return typeof name === "string" && /^[A-Z]/.test(name);
}

function getJSXAttributeName(attr) {
  return attr?.name?.type === "JSXIdentifier" ? attr.name.name : null;
}

function getJSXExpression(value) {
  if (value?.type === "JSXExpressionContainer") {
    return value.expression;
  }
  return value;
}

function getFlowNodeRenderComponentName(node) {
  if (getJSXName(node.name) !== "Flow.Node") {
    return null;
  }

  for (const attr of node.attributes ?? []) {
    if (
      attr.type !== "JSXAttribute" ||
      getJSXAttributeName(attr) !== "render"
    ) {
      continue;
    }

    const renderExpression = getJSXExpression(attr.value);
    if (renderExpression?.type !== "JSXElement") {
      return null;
    }

    const componentName = getJSXName(renderExpression.openingElement?.name);
    if (isComponentName(componentName)) {
      return { componentName, node: attr };
    }
  }

  return null;
}

function isForwardRefCallee(callee, forwardRefNames) {
  const unwrapped = unwrapExpression(callee);
  const identifierName = getIdentifierName(unwrapped);
  if (identifierName && forwardRefNames.has(identifierName)) {
    return true;
  }

  if (unwrapped?.type === "MemberExpression") {
    return getPropertyName(unwrapped.property) === "forwardRef";
  }

  return false;
}

function getFirstFunctionArgument(node) {
  for (const arg of node.arguments ?? []) {
    if (arg.type === "SpreadElement") continue;
    const unwrapped = unwrapExpression(arg);
    if (
      unwrapped?.type === "FunctionExpression" ||
      unwrapped?.type === "ArrowFunctionExpression"
    ) {
      return unwrapped;
    }
  }
  return null;
}

function findForwardRefRenderFunction(node, forwardRefNames) {
  const unwrapped = unwrapExpression(node);
  if (unwrapped?.type !== "CallExpression") {
    return null;
  }

  if (isForwardRefCallee(unwrapped.callee, forwardRefNames)) {
    return getFirstFunctionArgument(unwrapped);
  }

  for (const arg of unwrapped.arguments ?? []) {
    if (arg.type === "SpreadElement") continue;
    const found = findForwardRefRenderFunction(arg, forwardRefNames);
    if (found) return found;
  }

  return null;
}

function getPropsParamNames(param) {
  const names = new Set();
  const unwrapped = unwrapExpression(param);

  if (unwrapped?.type === "Identifier") {
    names.add(unwrapped.name);
  } else if (unwrapped?.type === "AssignmentPattern") {
    for (const name of getPropsParamNames(unwrapped.left)) {
      names.add(name);
    }
  } else if (unwrapped?.type === "ObjectPattern") {
    for (const prop of unwrapped.properties ?? []) {
      if (prop.type === "RestElement" && prop.argument?.type === "Identifier") {
        names.add(prop.argument.name);
      }
    }
  }

  return names;
}

function getRefParamNames(param) {
  const names = new Set();
  const unwrapped = unwrapExpression(param);

  if (unwrapped?.type === "Identifier") {
    names.add(unwrapped.name);
  } else if (unwrapped?.type === "AssignmentPattern") {
    for (const name of getRefParamNames(unwrapped.left)) {
      names.add(name);
    }
  }

  return names;
}

function isNonComputedMemberProperty(identifier, parent, parentKey) {
  return (
    parent?.type === "MemberExpression" &&
    parentKey === "property" &&
    parent.property === identifier &&
    !parent.computed
  );
}

function expressionContainsIdentifier(node, names) {
  let found = false;
  traverse(node, {
    Identifier(identifier, parent, parentKey) {
      if (
        names.has(identifier.name) &&
        !isNonComputedMemberProperty(identifier, parent, parentKey)
      ) {
        found = true;
      }
    },
  });
  return found;
}

function analyzeRenderFunction(fn, usesForwardRef) {
  const propsNames = getPropsParamNames(fn.params?.[0]);
  const refNames = usesForwardRef
    ? getRefParamNames(fn.params?.[1])
    : new Set();
  let spreadsProps = false;
  let forwardsRef = false;

  traverse(fn.body, {
    JSXSpreadAttribute(node) {
      const argumentName = getIdentifierName(unwrapExpression(node.argument));
      if (argumentName && propsNames.has(argumentName)) {
        spreadsProps = true;
      }
    },
    JSXAttribute(node) {
      if (getJSXAttributeName(node) !== "ref") {
        return;
      }

      const expression = getJSXExpression(node.value);
      if (expressionContainsIdentifier(expression, refNames)) {
        forwardsRef = true;
      }
    },
  });

  return {
    forwardsRef: usesForwardRef && forwardsRef,
    spreadsProps,
  };
}

function getComponentInfoFromVariable(node, forwardRefNames) {
  const componentName = getIdentifierName(node.id);
  if (!isComponentName(componentName)) {
    return null;
  }

  const forwardRefRenderFunction = findForwardRefRenderFunction(
    node.init,
    forwardRefNames,
  );
  if (forwardRefRenderFunction) {
    return {
      componentName,
      info: analyzeRenderFunction(forwardRefRenderFunction, true),
    };
  }

  const init = unwrapExpression(node.init);
  if (
    init?.type === "FunctionExpression" ||
    init?.type === "ArrowFunctionExpression"
  ) {
    return {
      componentName,
      info: analyzeRenderFunction(init, false),
    };
  }

  return null;
}

export const noFlowNodeCustomRenderRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure custom components used in Flow.Node render forward refs and spread props.",
    },
    messages: {
      missingRef:
        "<{{component}}> used in Flow.Node render must forward the ref it receives.",
      missingProps:
        "<{{component}}> used in Flow.Node render must spread received props onto its root element.",
      missingRefAndProps:
        "<{{component}}> used in Flow.Node render must forward its ref and spread received props onto its root element.",
    },
    schema: [],
  },
  defaultOptions: [],
  createOnce(context) {
    const forwardRefNames = new Set(["forwardRef"]);
    const components = new Map();
    const usages = [];

    return {
      ImportDeclaration(node) {
        if (getLiteralValue(node.source) !== "react") {
          return;
        }

        for (const specifier of node.specifiers ?? []) {
          if (
            specifier.type === "ImportSpecifier" &&
            getIdentifierName(specifier.imported) === "forwardRef"
          ) {
            forwardRefNames.add(
              getIdentifierName(specifier.local) ?? "forwardRef",
            );
          }
        }
      },
      FunctionDeclaration(node) {
        const componentName = getIdentifierName(node.id);
        if (isComponentName(componentName)) {
          components.set(componentName, analyzeRenderFunction(node, false));
        }
      },
      VariableDeclarator(node) {
        const result = getComponentInfoFromVariable(node, forwardRefNames);
        if (result) {
          components.set(result.componentName, result.info);
        }
      },
      JSXOpeningElement(node) {
        const usage = getFlowNodeRenderComponentName(node);
        if (usage) {
          usages.push(usage);
        }
      },
      "Program:exit"() {
        for (const usage of usages) {
          const info = components.get(usage.componentName);
          if (!info) {
            continue;
          }

          const missingRef = !info.forwardsRef;
          const missingProps = !info.spreadsProps;

          if (!missingRef && !missingProps) {
            continue;
          }

          context.report({
            node: usage.node,
            messageId:
              missingRef && missingProps
                ? "missingRefAndProps"
                : missingRef
                  ? "missingRef"
                  : "missingProps",
            data: {
              component: usage.componentName,
            },
          });
        }
      },
    };
  },
});
