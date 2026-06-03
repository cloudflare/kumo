import type { APIRoute } from "astro";

const SITE_URL = "https://kumo-ui.com";

interface LlmLink {
  title: string;
  path: string;
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

function componentDoc(title: string, path: string): LlmLink {
  return {
    title,
    path,
    description: `${title} component docs, usage, and examples.`,
  };
}

const components: LlmLink[] = [
  componentDoc("Autocomplete", "/components/autocomplete.md"),
  componentDoc("Badge", "/components/badge.md"),
  componentDoc("Banner", "/components/banner.md"),
  componentDoc("Breadcrumbs", "/components/breadcrumbs.md"),
  componentDoc("Button", "/components/button.md"),
  componentDoc("Checkbox", "/components/checkbox.md"),
  componentDoc("Clipboard Text", "/components/clipboard-text.md"),
  componentDoc("Cloudflare Logo", "/components/cloudflare-logo.md"),
  componentDoc("CodeHighlighted", "/components/code-highlighted.md"),
  componentDoc("Collapsible", "/components/collapsible.md"),
  componentDoc("Combobox", "/components/combobox.md"),
  componentDoc("Command Palette", "/components/command-palette.md"),
  componentDoc("Date Picker", "/components/date-picker.md"),
  componentDoc("Dialog", "/components/dialog.md"),
  componentDoc("Dropdown", "/components/dropdown.md"),
  componentDoc("Empty", "/components/empty.md"),
  componentDoc("Flow", "/components/flow.md"),
  componentDoc("Grid", "/components/grid.md"),
  componentDoc("Input", "/components/input.md"),
  componentDoc("InputArea", "/components/input-area.md"),
  componentDoc("InputGroup", "/components/input-group.md"),
  componentDoc("Label", "/components/label.md"),
  componentDoc("Layer Card", "/components/layer-card.md"),
  componentDoc("Link", "/components/link.md"),
  componentDoc("Loader", "/components/loader.md"),
  componentDoc("MenuBar", "/components/menu-bar.md"),
  componentDoc("Meter", "/components/meter.md"),
  componentDoc("Pagination", "/components/pagination.md"),
  componentDoc("Popover", "/components/popover.md"),
  componentDoc("Radio", "/components/radio.md"),
  componentDoc("Select", "/components/select.md"),
  componentDoc("Sensitive Input", "/components/sensitive-input.md"),
  componentDoc("Sidebar", "/components/sidebar.md"),
  componentDoc("Skeleton Line", "/components/skeleton-line.md"),
  componentDoc("Switch", "/components/switch.md"),
  componentDoc("Table", "/components/table.md"),
  componentDoc("Table of Contents", "/components/table-of-contents.md"),
  componentDoc("Tabs", "/components/tabs.md"),
  componentDoc("Text", "/components/text.md"),
  componentDoc("Toast", "/components/toast.md"),
  componentDoc("Tooltip", "/components/tooltip.md"),
];

const charts: LlmLink[] = [
  {
    title: "Charts",
    path: "/charts.md",
    description: "Overview of Kumo charting patterns.",
  },
  {
    title: "Chart Colors",
    path: "/charts/colors.md",
    description: "Chart color tokens and palette guidance.",
  },
  {
    title: "Timeseries",
    path: "/charts/timeseries.md",
    description: "Timeseries chart usage and examples.",
  },
  {
    title: "Sankey",
    path: "/charts/sankey.md",
    description: "Sankey chart usage and examples.",
  },
  {
    title: "Custom Chart",
    path: "/charts/custom.md",
    description: "Guidance for custom chart implementations.",
  },
];

const blocks: LlmLink[] = [
  {
    title: "Page Header",
    path: "/blocks/page-header.md",
    description: "CLI-installed page header block docs.",
  },
  {
    title: "Resource List",
    path: "/blocks/resource-list.md",
    description: "CLI-installed resource list block docs.",
  },
  {
    title: "Delete Resource",
    path: "/blocks/delete-resource.md",
    description: "CLI-installed delete resource block docs.",
  },
];

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
