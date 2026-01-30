#!/usr/bin/env node
/**
 * Build script for the Kumo CLI
 * Compiles TypeScript CLI files to JavaScript in dist/command-line/
 */

import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync, readFileSync, chmodSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "../.."); // src/command-line -> packages/kumo
const distCliDir = join(packageRoot, "dist", "command-line");

// Ensure dist/command-line directory exists
mkdirSync(distCliDir, { recursive: true });
mkdirSync(join(distCliDir, "commands"), { recursive: true });
mkdirSync(join(distCliDir, "utils"), { recursive: true });

// Compile CLI files using esbuild API
const cliFiles = [
  { src: "src/command-line/cli.ts", dest: "dist/command-line/cli.js" },
  {
    src: "src/command-line/commands/ls.ts",
    dest: "dist/command-line/commands/ls.js",
  },
  {
    src: "src/command-line/commands/doc.ts",
    dest: "dist/command-line/commands/doc.js",
  },
  {
    src: "src/command-line/commands/init.ts",
    dest: "dist/command-line/commands/init.js",
  },
  {
    src: "src/command-line/commands/blocks.ts",
    dest: "dist/command-line/commands/blocks.js",
  },
  {
    src: "src/command-line/commands/add.ts",
    dest: "dist/command-line/commands/add.js",
  },
];

console.log("Building Kumo CLI...");

for (const file of cliFiles) {
  const srcPath = join(packageRoot, file.src);
  const destPath = join(packageRoot, file.dest);

  // Use esbuild API directly
  await esbuild.build({
    entryPoints: [srcPath],
    outfile: destPath,
    format: "esm",
    platform: "node",
    target: "node18",
    bundle: true,
    packages: "external",
  });

  // Read the compiled file and ensure shebang is at the top
  let content = readFileSync(destPath, "utf-8");
  if (!content.startsWith("#!/usr/bin/env node")) {
    content = "#!/usr/bin/env node\n" + content;
    writeFileSync(destPath, content);
  }

  // Make the main CLI executable
  if (file.dest === "dist/command-line/cli.js") {
    chmodSync(destPath, 0o755);
  }
}

console.log("Kumo CLI built successfully!");
