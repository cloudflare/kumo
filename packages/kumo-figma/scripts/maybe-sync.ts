import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, ".env");

function loadDotEnvIfPresent() {
  if (!existsSync(ENV_PATH)) return;

  const envContent = readFileSync(ENV_PATH, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.startsWith("#")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    if (!key || !value) continue;

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function shouldSkipSync() {
  const value = (process.env.KUMO_FIGMA_SKIP_SYNC || "").toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function main() {
  if (shouldSkipSync()) {
    console.log("Skipping figma:sync (KUMO_FIGMA_SKIP_SYNC=1)");
    return;
  }

  // Support the common setup of putting FIGMA_TOKEN in scripts/.env
  loadDotEnvIfPresent();

  if (!process.env.FIGMA_TOKEN) {
    console.log(
      "Skipping figma:sync (no FIGMA_TOKEN). " +
        "Create packages/kumo-figma/scripts/.env or export FIGMA_TOKEN to enable token sync.",
    );
    return;
  }

  console.log("Running figma:sync...");
  const result = spawnSync("pnpm", ["run", "figma:sync"], {
    stdio: "inherit",
    env: process.env,
  });

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

main();
