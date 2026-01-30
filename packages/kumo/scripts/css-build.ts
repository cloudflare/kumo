import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, "../src/styles");
const distDir = join(__dirname, "../dist/styles");

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
