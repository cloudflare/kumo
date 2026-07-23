import { describe, it, expect, vi } from "vite-plus/test";
import { noFlowNodeCustomRenderRule } from "../../lint/no-flow-node-custom-render.js";

interface Report {
  node: any;
  messageId: string;
  data?: Record<string, any>;
}

function createMockContext() {
  const reports: Report[] = [];
  return {
    report: vi.fn((report: Report) => reports.push(report)),
    getReports: () => reports,
  };
}

function id(name: string) {
  return { type: "Identifier", name };
}

function jsxId(name: string) {
  return { type: "JSXIdentifier", name };
}

function jsxMember(object: string, property: string) {
  return {
    type: "JSXMemberExpression",
    object: jsxId(object),
    property: jsxId(property),
  };
}

function member(object: string, property: string) {
  return {
    type: "MemberExpression",
    object: id(object),
    property: id(property),
    computed: false,
  };
}

function expression(value: any) {
  return { type: "JSXExpressionContainer", expression: value };
}

function attr(name: string, value: any) {
  return {
    type: "JSXAttribute",
    name: jsxId(name),
    value,
  };
}

function refAttr(name = "ref") {
  return refAttrExpression(id(name));
}

function refAttrExpression(value: any) {
  return attr("ref", expression(value));
}

function propsSpread(name = "props") {
  return {
    type: "JSXSpreadAttribute",
    argument: id(name),
  };
}

function jsxElement(name: string, attributes: any[] = []) {
  return {
    type: "JSXElement",
    openingElement: {
      type: "JSXOpeningElement",
      name: jsxId(name),
      attributes,
    },
    children: [],
  };
}

function flowNodeWithRender(componentName: string) {
  return {
    type: "JSXOpeningElement",
    name: jsxMember("Flow", "Node"),
    attributes: [attr("render", expression(jsxElement(componentName)))],
  };
}

function nodeWithRender(componentName: string) {
  return {
    type: "JSXOpeningElement",
    name: jsxMember("Other", "Node"),
    attributes: [attr("render", expression(jsxElement(componentName)))],
  };
}

function functionExpression({
  propsParam = id("props"),
  refParam = id("ref"),
  attributes = [],
}: {
  propsParam?: any;
  refParam?: any;
  attributes?: any[];
} = {}) {
  return {
    type: "ArrowFunctionExpression",
    params: [propsParam, refParam],
    body: jsxElement("li", attributes),
  };
}

function functionDeclaration(name: string, attributes: any[] = []) {
  return {
    type: "FunctionDeclaration",
    id: id(name),
    params: [id("props")],
    body: {
      type: "BlockStatement",
      body: [
        {
          type: "ReturnStatement",
          argument: jsxElement("li", attributes),
        },
      ],
    },
  };
}

function forwardRefCall(fn: any, callee: any = id("forwardRef")) {
  return {
    type: "CallExpression",
    callee,
    arguments: [fn],
  };
}

function callExpression(callee: any, args: any[]) {
  return {
    type: "CallExpression",
    callee,
    arguments: args,
  };
}

function reactForwardRefImport(localName = "forwardRef") {
  return {
    type: "ImportDeclaration",
    source: {
      type: "Literal",
      value: "react",
    },
    specifiers: [
      {
        type: "ImportSpecifier",
        imported: id("forwardRef"),
        local: id(localName),
      },
    ],
  };
}

function variableDeclarator(name: string, init: any) {
  return {
    type: "VariableDeclarator",
    id: id(name),
    init,
  };
}

function objectPatternWithRest(restName: string) {
  return {
    type: "ObjectPattern",
    properties: [
      {
        type: "Property",
        key: id("children"),
        value: id("children"),
      },
      {
        type: "RestElement",
        argument: id(restName),
      },
    ],
  };
}

function assignmentPattern(left: any) {
  return {
    type: "AssignmentPattern",
    left,
    right: {
      type: "ObjectExpression",
      properties: [],
    },
  };
}

function runRule(nodes: any[]): Report[] {
  const context = createMockContext();
  const rule = (noFlowNodeCustomRenderRule as any).createOnce(context);

  for (const node of nodes) {
    if (node.type === "ImportDeclaration") {
      rule.ImportDeclaration(node);
    } else if (node.type === "FunctionDeclaration") {
      rule.FunctionDeclaration(node);
    } else if (node.type === "VariableDeclarator") {
      rule.VariableDeclarator(node);
    } else if (node.type === "JSXOpeningElement") {
      rule.JSXOpeningElement(node);
    }
  }

  rule["Program:exit"]();

  return context.getReports();
}

describe("no-flow-node-custom-render", () => {
  it("allows custom components that forward refs and spread props", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(
        functionExpression({ attributes: [refAttr(), propsSpread()] }),
      ),
    );

    expect(runRule([component, flowNodeWithRender("CustomNode")])).toHaveLength(
      0,
    );
  });

  it("allows React.forwardRef with destructured props rest", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(
        functionExpression({
          propsParam: objectPatternWithRest("restProps"),
          refParam: id("forwardedRef"),
          attributes: [refAttr("forwardedRef"), propsSpread("restProps")],
        }),
        member("React", "forwardRef"),
      ),
    );

    expect(runRule([component, flowNodeWithRender("CustomNode")])).toHaveLength(
      0,
    );
  });

  it("allows default destructured props rest", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(
        functionExpression({
          propsParam: assignmentPattern(objectPatternWithRest("restProps")),
          attributes: [refAttr(), propsSpread("restProps")],
        }),
      ),
    );

    expect(runRule([component, flowNodeWithRender("CustomNode")])).toHaveLength(
      0,
    );
  });

  it("allows HOC-wrapped forwardRef components", () => {
    const component = variableDeclarator(
      "CustomNode",
      callExpression(id("memo"), [
        forwardRefCall(
          functionExpression({ attributes: [refAttr(), propsSpread()] }),
        ),
      ]),
    );

    expect(runRule([component, flowNodeWithRender("CustomNode")])).toHaveLength(
      0,
    );
  });

  it("allows aliased forwardRef imports", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(
        functionExpression({ attributes: [refAttr(), propsSpread()] }),
        id("fr"),
      ),
    );

    expect(
      runRule([
        reactForwardRefImport("fr"),
        component,
        flowNodeWithRender("CustomNode"),
      ]),
    ).toHaveLength(0);
  });

  it("ignores intrinsic render elements", () => {
    const reports = runRule([
      {
        type: "JSXOpeningElement",
        name: jsxMember("Flow", "Node"),
        attributes: [attr("render", expression(jsxElement("li")))],
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("ignores custom components defined outside the current file", () => {
    expect(runRule([flowNodeWithRender("ImportedNode")])).toHaveLength(0);
  });

  it("reports custom components that neither forward refs nor spread props", () => {
    const component = functionDeclaration("CustomNode");
    const reports = runRule([component, flowNodeWithRender("CustomNode")]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe("missingRefAndProps");
    expect(reports[0].data).toEqual({ component: "CustomNode" });
  });

  it("reports custom components that spread props without forwarding refs", () => {
    const component = variableDeclarator(
      "CustomNode",
      functionExpression({ refParam: undefined, attributes: [propsSpread()] }),
    );
    const reports = runRule([component, flowNodeWithRender("CustomNode")]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe("missingRef");
  });

  it("reports forwardRef components that do not spread props", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(functionExpression({ attributes: [refAttr()] })),
    );
    const reports = runRule([component, flowNodeWithRender("CustomNode")]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe("missingProps");
  });

  it("does not count member property names as forwarded refs", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(
        functionExpression({
          attributes: [
            refAttrExpression(member("callbacks", "ref")),
            propsSpread(),
          ],
        }),
      ),
    );
    const reports = runRule([component, flowNodeWithRender("CustomNode")]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe("missingRef");
  });

  it("checks components declared after Flow.Node usage", () => {
    const component = variableDeclarator(
      "CustomNode",
      forwardRefCall(functionExpression({ attributes: [refAttr()] })),
    );
    const reports = runRule([flowNodeWithRender("CustomNode"), component]);

    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe("missingProps");
  });

  it("ignores render props on other components", () => {
    const component = functionDeclaration("CustomNode");

    expect(runRule([component, nodeWithRender("CustomNode")])).toHaveLength(0);
  });
});
