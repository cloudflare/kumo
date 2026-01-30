import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ComponentInfo {
  name: string;
  path: string;
  exports: string[];
}

/**
 * Discover all component directories in src/components
 * Excludes internal-only components that should not be exported
 */
export function discoverComponents(): string[] {
  const componentsDir = join(__dirname, "../../src/components");
  const entries = readdirSync(componentsDir);

  // Internal-only components that should not have package.json exports
  const internalComponents: string[] = [];

  return entries.filter((entry: string) => {
    const fullPath = join(componentsDir, entry);
    return (
      statSync(fullPath).isDirectory() && !internalComponents.includes(entry)
    );
  });
}

/**
 * Get the list of components that have exports configured in package.json
 * Dynamically reads from package.json exports field
 */
export function getComponentsWithExports(): string[] {
  const packageJsonPath = join(__dirname, "../../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

  const componentExports: string[] = [];

  if (packageJson.exports) {
    for (const exportPath of Object.keys(packageJson.exports)) {
      // Match patterns like "./components/button"
      const match = exportPath.match(/^\.\/components\/(.+)$/);
      if (match) {
        componentExports.push(match[1]);
      }
    }
  }

  return componentExports.sort();
}

/**
 * Get all exports from the main entry point
 * Dynamically imports and extracts all named exports
 */
export async function getMainEntryExports(): Promise<string[]> {
  const module = await import("../../src/index.ts");

  // Get all exports except 'default'
  return Object.keys(module)
    .filter((key) => key !== "default")
    .sort();
}
