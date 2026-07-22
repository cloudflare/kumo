// Imports every JS export entry of the package the way a plain-Node consumer
// would. Invoked as a child process by node-esm-import.test.ts; exits
// non-zero with a list of failing entries.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const pkgDir = process.argv[2];
const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));

const failures = [];
for (const [name, entry] of Object.entries(pkg.exports)) {
  if (name.includes("*") || typeof entry !== "object" || !entry.import)
    continue;
  if (entry.import.endsWith(".json")) continue;
  try {
    await import(pathToFileURL(join(pkgDir, entry.import)).href);
  } catch (error) {
    failures.push(`${name}: ${String(error?.message).split("\n")[0]}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
