/**
 * Bundle Size Reporter
 *
 * Bundles representative consumer fixtures against the built package and
 * reports raw/gzip/brotli sizes, bundler warnings, and the npm tarball
 * inventory. Report-only: no thresholds are enforced yet.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";
import { build, type Rolldown } from "vite";
import type { CIContext, ReportItem, Reporter } from "./types";
import {
  BUNDLE_SIZE_FIXTURES,
  BUNDLE_SIZE_SCHEMA_VERSION,
  buildBundleSizeMarkdown,
  type BundleSizeData,
  type BundleSizeFixtureId,
  type FixtureResult,
  type TarballReport,
} from "./bundle-size-report";

const REPO_ROOT = resolve(import.meta.dirname, "../..");
const KUMO_DIR = join(REPO_ROOT, "packages/kumo");

interface Fixture {
  readonly id: BundleSizeFixtureId;
  readonly label: string;
  readonly entry: string;
}

/**
 * Each entry is bundled as a consumer would bundle it. The record type keeps
 * entries in sync with the fixture IDs used by the artifact contract.
 */
const FIXTURE_ENTRIES = {
  "root-button": `export { Button } from "@cloudflare/kumo";`,
  "subpath-button": `export { Button } from "@cloudflare/kumo/components/button";`,
  "root-trio": `export { Button, Dialog, Select } from "@cloudflare/kumo";`,
  "subpath-trio": `
      export { Button } from "@cloudflare/kumo/components/button";
      export { Dialog } from "@cloudflare/kumo/components/dialog";
      export { Select } from "@cloudflare/kumo/components/select";
    `,
  "root-chart": `export { Chart } from "@cloudflare/kumo";`,
  "subpath-chart": `export { Chart } from "@cloudflare/kumo/components/chart";`,
  "subpath-badge": `export { Badge } from "@cloudflare/kumo/components/badge";`,
  "subpath-flow": `export { Flow } from "@cloudflare/kumo/components/flow";`,
  "primitive-button": `export * from "@cloudflare/kumo/primitives/button";`,
  "primitives-barrel": `export * from "@cloudflare/kumo/primitives";`,
  code: `export { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";`,
} satisfies Record<BundleSizeFixtureId, string>;

/** Peer dependencies stay external — consumers always provide these. */
const EXTERNALS = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^@phosphor-icons\/react($|\/)/,
  /^echarts($|\/)/,
  /^zod($|\/)/,
];

/** Published files that should not ship (item 34 of the improvement audit). */
const FLAGGED_TARBALL_PATTERNS = [/\.test\./, /\.stories\./, /^scripts\//];

function isBuildOutput(
  result: Rolldown.RolldownOutput | Rolldown.RolldownWatcher,
): result is Rolldown.RolldownOutput {
  return "output" in result;
}

async function measureFixture(fixture: Fixture): Promise<FixtureResult> {
  // A virtual entry addressed inside packages/kumo, so the package.json
  // self-reference resolves Kumo's public export map
  const entryPath = join(KUMO_DIR, `__bundle-fixture-${fixture.id}__.ts`);
  const warnings: string[] = [];

  const result = await build({
    configFile: false,
    envFile: false,
    root: KUMO_DIR,
    logLevel: "silent",
    plugins: [
      {
        name: "fixture-entry",
        resolveId(id: string) {
          return id === entryPath ? id : null;
        },
        load(id: string) {
          return id === entryPath ? fixture.entry : null;
        },
      },
    ],
    build: {
      write: false,
      minify: true,
      lib: { entry: entryPath, formats: ["es"], fileName: fixture.id },
      rollupOptions: {
        external: EXTERNALS,
        onwarn(warning: { message: string }) {
          warnings.push(warning.message);
        },
      },
    },
  });

  const buildResults = Array.isArray(result) ? result : [result];
  const chunks = buildResults.flatMap((buildResult) => {
    if (!isBuildOutput(buildResult)) {
      throw new Error("Vite unexpectedly returned a watch result");
    }
    return buildResult.output.map(
      (output: Rolldown.OutputChunk | Rolldown.OutputAsset) =>
        Buffer.from(output.type === "chunk" ? output.code : output.source),
    );
  });

  // Each emitted file is transferred with its own content encoding. Summing
  // per-file compressed sizes avoids undercounting code-split fixtures by
  // compressing unrelated output files as one artificial stream.
  const raw = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const gzip = chunks.reduce(
    (sum, chunk) => sum + gzipSync(chunk, { level: 9 }).length,
    0,
  );
  const brotli = chunks.reduce(
    (sum, chunk) =>
      sum +
      brotliCompressSync(chunk, {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      }).length,
    0,
  );

  return {
    id: fixture.id,
    label: fixture.label,
    raw,
    gzip,
    brotli,
    warnings: [...new Set(warnings)],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Parse and validate the machine-readable output from `npm pack`. */
export function parseTarballReport(output: string): TarballReport {
  const parsed: unknown = JSON.parse(output);
  const pack = Array.isArray(parsed) ? parsed[0] : undefined;

  if (
    !isRecord(pack) ||
    !Array.isArray(pack.files) ||
    !isNonNegativeSafeInteger(pack.size) ||
    !isNonNegativeSafeInteger(pack.unpackedSize)
  ) {
    throw new Error("npm pack returned an invalid JSON report");
  }

  const paths = pack.files.map((file) => {
    if (!isRecord(file) || typeof file.path !== "string") {
      throw new Error("npm pack returned an invalid file entry");
    }
    return file.path;
  });

  const flaggedFiles = paths
    .filter((path) => FLAGGED_TARBALL_PATTERNS.some((p) => p.test(path)))
    .sort();

  return {
    fileCount: paths.length,
    packedSize: pack.size,
    unpackedSize: pack.unpackedSize,
    flaggedFiles,
  };
}

function collectTarballReport(): TarballReport {
  // pnpm pack supports JSON output but not dry-run or ignore-scripts, so use npm
  // here to inspect the package without creating a tarball or running hooks.
  const output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { cwd: KUMO_DIR, encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 },
  );
  return parseTarballReport(output);
}

export async function collectBundleSizeData(): Promise<BundleSizeData> {
  if (!existsSync(join(KUMO_DIR, "dist"))) {
    throw new Error(
      "packages/kumo/dist not found — run `vp run build:kumo` first",
    );
  }

  const fixtures: FixtureResult[] = [];
  for (const fixture of BUNDLE_SIZE_FIXTURES) {
    fixtures.push(
      await measureFixture({
        ...fixture,
        entry: FIXTURE_ENTRIES[fixture.id],
      }),
    );
  }

  return {
    schemaVersion: BUNDLE_SIZE_SCHEMA_VERSION,
    fixtures,
    tarball: collectTarballReport(),
  };
}

export const bundleSizeReporter: Reporter = {
  id: "bundle-size",
  name: "Bundle Size",

  async collect(_context: CIContext): Promise<ReportItem | null> {
    const data = await collectBundleSizeData();

    return {
      id: "bundle-size",
      title: "📐 Bundle Size",
      priority: 40,
      content: buildBundleSizeMarkdown(data),
      success: true,
      data,
    };
  },
};
