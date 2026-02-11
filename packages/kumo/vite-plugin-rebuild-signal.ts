import { mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Signals when a build completes by writing a timestamp file
 * that dependent packages can watch
 */
export function rebuildSignalPlugin(): Plugin {
  // Write into dist/ so we don't create repo-root litter.
  // dist/ is already gitignored, and the file is only used as a build-complete signal.
  const signalFile = resolve(__dirname, "dist", ".build-complete");

  return {
    name: "rebuild-signal",
    closeBundle() {
      mkdirSync(dirname(signalFile), { recursive: true });
      // Write current timestamp when build completes
      writeFileSync(signalFile, Date.now().toString());
      console.log("📦 Build complete, signaling dependent packages...");
    },
  };
}
