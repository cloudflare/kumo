import type { Root } from "mdast";

/** MDX ESM node shape used by mdast-util-mdxjs-esm / remark-mdx. */
interface MdxjsEsmNode {
  type: "mdxjsEsm";
  value: string;
  data: {
    estree: {
      type: "Program";
      sourceType: "module";
      body: Record<string, unknown>[];
    };
  };
}

/**
 * Remark plugin that injects MDX component overrides for headings.
 * This makes markdown ## / ### / #### render using the Heading.astro component
 * instead of plain HTML heading elements.
 *
 * Replaces the old rehype-heading-links plugin by delegating heading rendering
 * entirely to Heading.astro via MDX component overrides, eliminating duplicated
 * heading logic (slugification, styling, link icon).
 */
export function remarkHeadingComponents() {
  return (tree: Root) => {
    // Inject import statements at the top of the MDX AST.
    // Uses underscore-prefixed names to avoid conflicts with existing imports in MDX files.
    const importNode: MdxjsEsmNode = {
      type: "mdxjsEsm",
      value: `import _H2 from '~/components/docs/mdx/H2.astro';
import _H3 from '~/components/docs/mdx/H3.astro';
import _H4 from '~/components/docs/mdx/H4.astro';`,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ImportDeclaration",
              source: {
                type: "Literal",
                value: "~/components/docs/mdx/H2.astro",
              },
              specifiers: [
                {
                  type: "ImportDefaultSpecifier",
                  local: { type: "Identifier", name: "_H2" },
                },
              ],
            },
            {
              type: "ImportDeclaration",
              source: {
                type: "Literal",
                value: "~/components/docs/mdx/H3.astro",
              },
              specifiers: [
                {
                  type: "ImportDefaultSpecifier",
                  local: { type: "Identifier", name: "_H3" },
                },
              ],
            },
            {
              type: "ImportDeclaration",
              source: {
                type: "Literal",
                value: "~/components/docs/mdx/H4.astro",
              },
              specifiers: [
                {
                  type: "ImportDefaultSpecifier",
                  local: { type: "Identifier", name: "_H4" },
                },
              ],
            },
          ],
        },
      },
    };

    // Inject: export const components = { h2: _H2, h3: _H3, h4: _H4 };
    const exportNode: MdxjsEsmNode = {
      type: "mdxjsEsm",
      value: "export const components = { h2: _H2, h3: _H3, h4: _H4 };",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              declaration: {
                type: "VariableDeclaration",
                kind: "const" as const,
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "components" },
                    init: {
                      type: "ObjectExpression",
                      properties: [
                        {
                          type: "Property",
                          key: { type: "Identifier", name: "h2" },
                          value: { type: "Identifier", name: "_H2" },
                          kind: "init" as const,
                          computed: false,
                          method: false,
                          shorthand: false,
                        },
                        {
                          type: "Property",
                          key: { type: "Identifier", name: "h3" },
                          value: { type: "Identifier", name: "_H3" },
                          kind: "init" as const,
                          computed: false,
                          method: false,
                          shorthand: false,
                        },
                        {
                          type: "Property",
                          key: { type: "Identifier", name: "h4" },
                          value: { type: "Identifier", name: "_H4" },
                          kind: "init" as const,
                          computed: false,
                          method: false,
                          shorthand: false,
                        },
                      ],
                    },
                  },
                ],
              },
              specifiers: [],
            },
          ],
        },
      },
    };

    // Prepend import and export nodes to the tree.
    // MdxjsEsmNode (from mdx-js/mdx) isn't part of mdast's RootContent union,
    // so we widen the array type to accept both standard and MDX ESM nodes.
    (tree.children as (Root["children"][number] | MdxjsEsmNode)[]).unshift(
      importNode,
      exportNode,
    );
  };
}
