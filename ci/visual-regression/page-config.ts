/**
 * Visual Regression Configuration
 *
 * Components are auto-discovered from the docs site sidebar.
 * Only special actions (click/hover to open overlays) need explicit config.
 */

export interface ComponentAction {
  type: "click" | "hover";
  selector: string;
  waitAfter?: number;
}

export interface DiscoveredComponent {
  id: string;
  name: string;
  url: string;
}

/**
 * Special actions for components that need interactions to show all states.
 * Key is the component slug (e.g., "dialog", "dropdown").
 * These components get TWO screenshots: default state + opened state.
 */
export const COMPONENT_ACTIONS: Record<string, ComponentAction> = {
  dialog: { type: "click", selector: "main button", waitAfter: 400 },
  dropdown: { type: "click", selector: "main button", waitAfter: 300 },
  popover: { type: "click", selector: "main button", waitAfter: 300 },
  tooltip: { type: "hover", selector: "main button", waitAfter: 500 },
  select: { type: "click", selector: "main button", waitAfter: 300 },
  combobox: { type: "click", selector: "main input", waitAfter: 300 },
  toast: { type: "click", selector: "main button", waitAfter: 500 },
  collapsible: { type: "click", selector: "main button", waitAfter: 300 },
  "command-palette": { type: "click", selector: "main button", waitAfter: 300 },
  "date-range-picker": {
    type: "click",
    selector: "main button",
    waitAfter: 300,
  },
};

/**
 * Discover all component pages from the docs site sidebar.
 */
export async function discoverComponents(
  baseUrl: string,
): Promise<DiscoveredComponent[]> {
  const response = await fetch(baseUrl);
  const html = await response.text();

  const componentLinks: DiscoveredComponent[] = [];
  const seen = new Set<string>();

  const linkRegex = /href="(\/components\/([^"]+))"/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const slug = match[2];

    if (seen.has(slug)) continue;
    seen.add(slug);

    const name = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    componentLinks.push({ id: slug, name, url });
  }

  return componentLinks;
}

/**
 * Extract component slug from a changed file path.
 * Returns null if the file doesn't map to a component.
 *
 * Examples:
 *   packages/kumo/src/components/button/button.tsx -> "button"
 *   packages/kumo-docs-astro/.../ButtonDemo.tsx -> "button"
 */
export function getComponentFromFile(filePath: string): string | null {
  // Match component source files: packages/kumo/src/components/{name}/{name}.tsx
  const componentMatch = filePath.match(
    /packages\/kumo\/src\/components\/([^/]+)\/\1\.tsx$/,
  );
  if (componentMatch) {
    return componentMatch[1];
  }

  // Match demo files: *Demo.tsx -> extract component name
  const demoMatch = filePath.match(/([A-Z][a-zA-Z]+)Demo\.tsx$/);
  if (demoMatch) {
    // Convert PascalCase to kebab-case: DateRangePicker -> date-range-picker
    const pascalName = demoMatch[1];
    return pascalName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  return null;
}

/**
 * Get the components that should be screenshotted based on changed files.
 */
export function getAffectedComponents(
  changedFiles: string[],
  allComponents: DiscoveredComponent[],
): DiscoveredComponent[] {
  const affectedSlugs = new Set<string>();

  for (const file of changedFiles) {
    const slug = getComponentFromFile(file);
    if (slug) {
      affectedSlugs.add(slug);
    }
  }

  return allComponents.filter((c) => affectedSlugs.has(c.id));
}
