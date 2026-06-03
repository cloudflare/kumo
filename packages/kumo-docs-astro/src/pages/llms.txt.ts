import type { APIRoute } from "astro";
import componentRegistry from "@cloudflare/kumo/ai/component-registry.json";

export const prerender = true;

const SITE_URL = "https://kumo-ui.com";

const componentDocPages = import.meta.glob("./components/*.{astro,mdx}");
const blockDocPages = import.meta.glob("./blocks/*.{astro,mdx}");
const chartDocPages = import.meta.glob("./charts/*.{astro,mdx}");

// Add an override when the registry component name does not match its docs page slug.
const registryRouteOverrides: Record<string, string> = {
  Code: "code-highlighted",
  DropdownMenu: "dropdown",
  ResourceListPage: "resource-list",
  Toasty: "toast",
};

// Add an override when the docs page slug needs custom capitalization or spacing.
const titleOverrides: Record<string, string> = {
  "code-highlighted": "CodeHighlighted",
  "input-area": "InputArea",
  "input-group": "InputGroup",
  "menu-bar": "MenuBar",
  "resource-list": "Resource List",
  "table-of-contents": "Table of Contents",
};

const chartTitleOverrides: Record<string, string> = {
  colors: "Chart Colors",
  custom: "Custom Chart",
  index: "Charts",
};

const chartDescriptions: Record<string, string> = {
  colors: "Chart color tokens and palette guidance.",
  custom: "Guidance for custom chart implementations.",
  index: "Overview of Kumo charting patterns.",
  sankey: "Sankey chart usage and examples.",
  timeseries: "Timeseries chart usage and examples.",
};

interface LlmLink {
  title: string;
  path: string;
  description: string;
}

interface RegistryItem {
  name: string;
  description: string;
}

const coreDocs: LlmLink[] = [
  {
    title: "Installation",
    path: "/installation.md",
    description: "Install Kumo and configure styles in an application.",
  },
  {
    title: "Components vs Blocks",
    path: "/components-vs-blocks.md",
    description:
      "Understand reusable package components versus CLI-installed blocks.",
  },
  {
    title: "CLI",
    path: "/cli.md",
    description:
      "Use the Kumo command-line tools for project setup and blocks.",
  },
  {
    title: "Contributing",
    path: "/contributing.md",
    description: "Contribution workflow and development guidelines.",
  },
  {
    title: "Accessibility",
    path: "/accessibility.md",
    description: "Accessibility guidance for building with Kumo components.",
  },
  {
    title: "Colors",
    path: "/colors.md",
    description: "Semantic color tokens and theme behavior.",
  },
  {
    title: "Figma Resources",
    path: "/figma.md",
    description: "Design resources and Figma integration notes.",
  },
  {
    title: "Streaming",
    path: "/streaming.md",
    description: "Streaming interface patterns and examples.",
  },
  {
    title: "Registry",
    path: "/registry.md",
    description: "Component registry reference and metadata.",
  },
  {
    title: "Changelog",
    path: "/changelog.md",
    description: "Release notes for Kumo.",
  },
];

function slugFromPagePath(pagePath: string) {
  return pagePath
    .replace(/^\.\/(components|blocks|charts)\//, "")
    .replace(/\.(astro|mdx)$/, "");
}

function slugFromRegistryName(name: string) {
  return (
    registryRouteOverrides[name] ??
    name
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .toLowerCase()
  );
}

function titleFromSlug(slug: string) {
  return (
    titleOverrides[slug] ??
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

function descriptionSummary(description: string) {
  const normalized = plainAscii(description).replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  const [firstSentence] = normalized.split(/\.\s+(?=[A-Z])/);
  const summary =
    firstSentence.length > 180
      ? `${firstSentence.slice(0, 177)}...`
      : firstSentence;
  return summary.endsWith(".") ? summary : `${summary}.`;
}

function plainAscii(value: string) {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x20-\x7E\n]/g, "");
}

function registryDocs(
  pagePaths: Record<string, unknown>,
  registryItems: RegistryItem[],
  routePrefix: "blocks" | "components",
) {
  const documentedSlugs = new Set(Object.keys(pagePaths).map(slugFromPagePath));
  const registryLinks = registryItems
    .map((item) => ({ item, slug: slugFromRegistryName(item.name) }))
    .filter(({ slug }) => documentedSlugs.has(slug));
  const registrySlugs = new Set(registryLinks.map(({ slug }) => slug));
  const fallbackLinks = [...documentedSlugs]
    .filter((slug) => !registrySlugs.has(slug))
    .map((slug) => ({
      title: titleFromSlug(slug),
      path: `/${routePrefix}/${slug}.md`,
      description: `${titleFromSlug(slug)} docs, usage, and examples.`,
    }));
  const links = registryLinks.map(({ item, slug }) => ({
    title: titleFromSlug(slug),
    path: `/${routePrefix}/${slug}.md`,
    description: descriptionSummary(item.description),
  }));

  return [...links, ...fallbackLinks].toSorted((a, b) =>
    a.title.localeCompare(b.title),
  );
}

function pageDocs(
  pagePaths: Record<string, unknown>,
  routePrefix: "charts",
  descriptions: Record<string, string>,
  titles: Record<string, string>,
) {
  return Object.keys(pagePaths)
    .map(slugFromPagePath)
    .map((slug) => ({
      title: titles[slug] ?? titleFromSlug(slug),
      path:
        slug === "index" ? `/${routePrefix}.md` : `/${routePrefix}/${slug}.md`,
      description:
        descriptions[slug] ??
        `${titles[slug] ?? titleFromSlug(slug)} docs, usage, and examples.`,
    }))
    .toSorted((a, b) => {
      if (a.path === `/${routePrefix}.md`) return -1;
      if (b.path === `/${routePrefix}.md`) return 1;
      return a.title.localeCompare(b.title);
    });
}

const components = registryDocs(
  componentDocPages,
  Object.values(componentRegistry.components),
  "components",
);

const charts = pageDocs(
  chartDocPages,
  "charts",
  chartDescriptions,
  chartTitleOverrides,
);

const blocks = registryDocs(
  blockDocPages,
  Object.values(componentRegistry.blocks),
  "blocks",
);

function formatSection(title: string, links: LlmLink[]) {
  return [
    `## ${title}`,
    "",
    ...links.map(
      (link) =>
        `- [${link.title}](${SITE_URL}${link.path}): ${link.description}`,
    ),
  ].join("\n");
}

const content = [
  "# Kumo",
  "",
  "> Cloudflare's React component library for building product interfaces.",
  "",
  "This file is a curated index for LLMs. It links to markdown versions of Kumo docs pages instead of embedding the full documentation inline.",
  "",
  formatSection("Core Docs", coreDocs),
  "",
  formatSection("Components", components),
  "",
  formatSection("Charts", charts),
  "",
  formatSection("Blocks", blocks),
  "",
].join("\n");

export const GET: APIRoute = () => {
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
