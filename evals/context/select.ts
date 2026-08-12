import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readWorkspaceFile(path: string) {
  return readFileSync(join(root, path), "utf-8");
}

function extractBetween(source: string, start: string, end: string) {
  const startIndex = source.indexOf(start);
  if (startIndex === -1) return "";

  const endIndex = source.indexOf(end, startIndex + start.length);
  return source
    .slice(startIndex, endIndex === -1 ? undefined : endIndex)
    .trim();
}

function extractFunction(source: string, name: string) {
  const start = source.indexOf(`export function ${name}`);
  if (start === -1) return "";

  const bodyStart = source.indexOf("{", start);
  let depth = 0;

  for (let index = bodyStart; index < source.length; index++) {
    const char = source[index];
    if (char === "{") depth++;
    if (char === "}") depth--;

    if (depth === 0) {
      return source.slice(start, index + 1).trim();
    }
  }

  return "";
}

function selectRegistryContext() {
  const registryPath = join(root, "packages/kumo/ai/component-registry.json");
  if (!existsSync(registryPath)) {
    return "Registry context unavailable. Run `pnpm --filter @cloudflare/kumo codegen:registry` to generate it.";
  }

  const registry = JSON.parse(readFileSync(registryPath, "utf-8"));
  const select = registry.components?.Select;
  if (!select) return "Select registry entry unavailable.";

  const propNames = [
    "items",
    "renderValue",
    "label",
    "placeholder",
    "value",
    "onValueChange",
    "children",
  ];

  const props = propNames
    .map((name) => {
      const prop = select.props?.[name];
      if (!prop) return null;
      return `- ${name}: ${prop.type}${prop.description ? ` — ${prop.description}` : ""}`;
    })
    .filter(Boolean)
    .join("\n");

  return [
    `Description: ${select.description}`,
    "Props:",
    props,
    "Selected examples from the generated registry:",
    ...(select.examples ?? [])
      .filter(
        (example: string) =>
          example.includes("items=") || example.includes("renderValue="),
      )
      .slice(0, 4)
      .map((example: string) => `\n\`\`\`tsx\n${example}\n\`\`\``),
  ].join("\n");
}

export function buildSelectContext(): string {
  const selectDocs = readWorkspaceFile(
    "packages/kumo-docs-astro/src/pages/components/select.mdx",
  );
  const selectDemos = readWorkspaceFile(
    "packages/kumo-docs-astro/src/components/demos/SelectDemo.tsx",
  );

  return `# Canonical Select Context

This context is the public-facing documentation and registry information available to downstream consumers of @cloudflare/kumo.

Generated code must be self-contained TSX and import Select with:

\`\`\`tsx
import { Select } from "@cloudflare/kumo";
\`\`\`

## Source Files

- \`@cloudflare/kumo/ai/component-registry.json\` (shipped in npm package)
- \`@cloudflare/kumo-docs-astro/src/pages/components/select.mdx\` (public docs)
- \`@cloudflare/kumo-docs-astro/src/components/demos/SelectDemo.tsx\` (public docs demo)

## Generated Registry Entry

${selectRegistryContext()}

## Docs Usage Section

${extractBetween(selectDocs, "## Usage", "{/* Examples */}")}

## Docs Labeled Values Section

${extractBetween(selectDocs, "### Labeled Values", "{/* Label Tooltip */}")}

## Demo: SelectBasicDemo

\`\`\`tsx
${extractFunction(selectDemos, "SelectBasicDemo")}
\`\`\`

## Demo: SelectLabeledValuesDemo

\`\`\`tsx
${extractFunction(selectDemos, "SelectLabeledValuesDemo")}
\`\`\`

## Demo: SelectComplexDemo

\`\`\`tsx
${extractFunction(selectDemos, "SelectComplexDemo")}
\`\`\`
`;
}
