import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const sourcePath = resolve(
  projectRoot,
  process.argv[2] ?? "src/components/skill/design-tips.tsx",
);
const outputPaths = [
  resolve(projectRoot, "public/skill.md"),
  resolve(projectRoot, "../../skills/kumo-design/SKILL.md"),
];

function parseDesignTips(sourceText) {
  const sourceFile = ts.createSourceFile(
    sourcePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  function fail(node, message) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile),
    );
    throw new Error(
      `${relative(projectRoot, sourcePath)}:${line + 1}:${character + 1} ${message}`,
    );
  }

  function unwrapExpression(expression) {
    let current = expression;
    while (
      ts.isParenthesizedExpression(current) ||
      ts.isSatisfiesExpression(current) ||
      ts.isAsExpression(current)
    ) {
      current = current.expression;
    }
    return current;
  }

  function getProperty(object, name) {
    const property = object.properties.find(
      (candidate) =>
        ts.isPropertyAssignment(candidate) &&
        ((ts.isIdentifier(candidate.name) && candidate.name.text === name) ||
          (ts.isStringLiteral(candidate.name) && candidate.name.text === name)),
    );

    if (!property || !ts.isPropertyAssignment(property)) {
      fail(object, `Expected a ${name} property`);
    }
    return property.initializer;
  }

  function readString(expression, label) {
    const value = unwrapExpression(expression);
    if (
      !ts.isStringLiteral(value) &&
      !ts.isNoSubstitutionTemplateLiteral(value)
    ) {
      fail(value, `Expected ${label} to be a static string`);
    }
    return value.text;
  }

  function readCodeExample(expression) {
    const element = unwrapExpression(expression);
    const openingElement = ts.isJsxSelfClosingElement(element)
      ? element
      : ts.isJsxElement(element)
        ? element.openingElement
        : undefined;

    if (
      !openingElement ||
      openingElement.tagName.getText(sourceFile) !== "CodeExample"
    ) {
      return undefined;
    }

    const codeAttribute = openingElement.attributes.properties
      .filter(ts.isJsxAttribute)
      .find(
        (attribute) =>
          ts.isIdentifier(attribute.name) && attribute.name.text === "code",
      );
    if (!codeAttribute) {
      fail(openingElement, "Expected CodeExample to have a code prop");
    }

    const initializer = codeAttribute.initializer;
    if (!initializer) {
      fail(codeAttribute, "Expected CodeExample code prop to have a value");
    }
    if (ts.isStringLiteral(initializer)) {
      return initializer.text;
    }
    if (ts.isJsxExpression(initializer) && initializer.expression) {
      return readString(initializer.expression, "CodeExample code prop");
    }

    fail(initializer, "Expected CodeExample code prop to be a static string");
  }

  function readExample(expression) {
    const value = unwrapExpression(expression);
    if (!ts.isObjectLiteralExpression(value)) {
      fail(value, "Expected each example to be an object");
    }

    const variant = readString(
      getProperty(value, "variant"),
      "example variant",
    );
    if (variant !== "good" && variant !== "bad") {
      fail(value, 'Expected example variant to be "good" or "bad"');
    }

    const jsx = getProperty(value, "jsx");
    const exampleCodeProperty = value.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ts.isIdentifier(property.name) &&
        property.name.text === "exampleCode",
    );
    const exampleCode =
      exampleCodeProperty && ts.isPropertyAssignment(exampleCodeProperty)
        ? readString(exampleCodeProperty.initializer, "example code")
        : undefined;
    const codeExample = readCodeExample(jsx);
    if (codeExample !== undefined && exampleCode !== undefined) {
      fail(value, "CodeExample entries must not have an exampleCode property");
    }
    const jsxExpression = unwrapExpression(jsx);
    const { line } = sourceFile.getLineAndCharacterOfPosition(
      jsxExpression.getStart(sourceFile),
    );
    const lineStart = sourceFile.getPositionOfLineAndCharacter(line, 0);
    const linePrefix = sourceText.slice(
      lineStart,
      jsxExpression.getStart(sourceFile),
    );
    const sourceIndentation = linePrefix.match(/^[\t ]*/)?.[0] ?? "";
    const jsxSource = jsxExpression
      .getText(sourceFile)
      .split("\n")
      .map((sourceLine, lineIndex) =>
        lineIndex > 0 && sourceLine.startsWith(sourceIndentation)
          ? sourceLine.slice(sourceIndentation.length)
          : sourceLine,
      )
      .join("\n");

    return {
      variant,
      code: exampleCode ?? codeExample ?? jsxSource,
    };
  }

  let designTipsInitializer;
  function findDesignTips(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "designTips"
    ) {
      designTipsInitializer = node.initializer;
      return;
    }
    ts.forEachChild(node, findDesignTips);
  }
  findDesignTips(sourceFile);

  if (!designTipsInitializer) {
    throw new Error(
      `${relative(projectRoot, sourcePath)}: Could not find designTips declaration`,
    );
  }

  const tipsArray = unwrapExpression(designTipsInitializer);
  if (!ts.isArrayLiteralExpression(tipsArray)) {
    fail(tipsArray, "Expected designTips to be an array literal");
  }

  return tipsArray.elements.map((tipExpression) => {
    const tip = unwrapExpression(tipExpression);
    if (!ts.isObjectLiteralExpression(tip)) {
      fail(tip, "Expected each design tip to be an object");
    }

    const examples = unwrapExpression(getProperty(tip, "examples"));
    if (!ts.isArrayLiteralExpression(examples)) {
      fail(examples, "Expected examples to be an array literal");
    }

    const descriptionProperty = tip.properties.find(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ts.isIdentifier(property.name) &&
        property.name.text === "description",
    );

    return {
      id: readString(getProperty(tip, "id"), "tip id"),
      title: readString(getProperty(tip, "title"), "tip title"),
      description:
        descriptionProperty && ts.isPropertyAssignment(descriptionProperty)
          ? readString(descriptionProperty.initializer, "tip description")
          : undefined,
      examples: examples.elements.map(readExample),
    };
  });
}

function renderCodeFence(code) {
  const longestBacktickRun = Math.max(
    0,
    ...(code.match(/`+/g) ?? []).map((run) => run.length),
  );
  const fence = "`".repeat(Math.max(3, longestBacktickRun + 1));
  return `${fence}tsx\n${code}${code.endsWith("\n") ? "" : "\n"}${fence}`;
}

function renderDesignSkill(tips) {
  const sections = tips.map((tip) => {
    const examples = [
      ["good", "Good"],
      ["bad", "Avoid"],
    ]
      .map(([variant, label]) => {
        const codeBlocks = tip.examples
          .filter((example) => example.variant === variant)
          .map((example) => renderCodeFence(example.code))
          .join("\n\n");
        return codeBlocks ? `**${label}**\n\n${codeBlocks}` : undefined;
      })
      .filter(Boolean)
      .join("\n\n");

    return [`### \`${tip.id}\` ${tip.title}`, tip.description, examples]
      .filter(Boolean)
      .join("\n\n");
  });

  return `---
name: kumo-design
description: Cloudflare product design guidance. Use when designing, implementing, or reviewing Cloudflare dashboard interfaces, Kumo UI, responsive styling, dialogs, or frontend tests.
---

# Cloudflare Design

Apply these rules when designing, implementing, or reviewing Cloudflare product interfaces. Follow recommended examples and avoid patterns marked as examples to avoid.

## Rules

${sections.join("\n\n")}\n`;
}

const sourceText = await readFile(sourcePath, "utf8");
const tips = parseDesignTips(sourceText);
const skill = renderDesignSkill(tips);
await Promise.all(
  outputPaths.map(async (outputPath) => {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, skill);
  }),
);
console.log(
  `Generated ${outputPaths.map((outputPath) => relative(projectRoot, outputPath)).join(" and ")} from ${tips.length} design tips.`,
);
