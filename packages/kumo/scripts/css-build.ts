import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, "../src/styles");
const distDir = join(__dirname, "../dist/styles");
const blocksSrcDir = join(__dirname, "../src/blocks");
const blocksDistDir = join(__dirname, "../dist/src/blocks");

// Create dist/styles directory if it doesn't exist
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy CSS files for Tailwind users (raw CSS with Tailwind directives)
const cssFiles: string[] = [
  "kumo.css",
  "kumo-binding.css",
  "theme-kumo.css",
  "theme-fedramp.css",
];

cssFiles.forEach((file) => {
  const srcPath = join(srcDir, file);
  const distPath = join(distDir, file);

  if (existsSync(srcPath)) {
    copyFileSync(srcPath, distPath);
    console.log(`✓ Copied ${file} to dist/styles/ (Tailwind version)`);
  } else {
    console.warn(`⚠ Warning: ${file} not found in src/styles/`);
  }
});

// Compile standalone CSS for non-Tailwind users
console.log("📦 Compiling standalone CSS...");
try {
  const standaloneInput = join(srcDir, "kumo-standalone.css");
  const standaloneOutput = join(distDir, "kumo-standalone.css");

  // Use Tailwind CLI to compile the CSS
  execSync(
    `npx tailwindcss -i ${standaloneInput} -o ${standaloneOutput} --minify`,
    { stdio: "inherit" },
  );

  console.log("✓ Compiled kumo-standalone.css");
} catch (error) {
  console.error("❌ Failed to compile standalone CSS:", error);
  process.exit(1);
}

console.log("✅ CSS build complete");

// Copy block source files to dist for CLI `kumo add` command
console.log("📦 Copying block source files...");

function copyBlockFiles(srcDir: string, destDir: string): void {
  if (!existsSync(srcDir)) {
    console.warn(`⚠ Warning: blocks source directory not found at ${srcDir}`);
    return;
  }

  const blockDirs = readdirSync(srcDir).filter((item) => {
    const itemPath = join(srcDir, item);
    return statSync(itemPath).isDirectory();
  });

  for (const blockDir of blockDirs) {
    const blockSrcPath = join(srcDir, blockDir);
    const blockDestPath = join(destDir, blockDir);

    // Create destination directory
    if (!existsSync(blockDestPath)) {
      mkdirSync(blockDestPath, { recursive: true });
    }

    // Copy all .tsx files (source files needed by CLI)
    const files = readdirSync(blockSrcPath);
    for (const file of files) {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        const srcFile = join(blockSrcPath, file);
        const destFile = join(blockDestPath, file);
        // Only copy if it's a file (not directory)
        if (statSync(srcFile).isFile()) {
          copyFileSync(srcFile, destFile);
          console.log(`  ✓ Copied ${blockDir}/${file}`);
        }
      }
    }
  }
}

copyBlockFiles(blocksSrcDir, blocksDistDir);
console.log("✅ Block source files copied");
