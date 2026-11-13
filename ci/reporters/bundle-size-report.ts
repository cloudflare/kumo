/**
 * Pure bundle-size artifact contract, validation, and Markdown rendering.
 *
 * This module intentionally has no build-tool imports. The privileged
 * workflow_run reporter uses it to validate data produced by untrusted PR code.
 */

export const BUNDLE_SIZE_SCHEMA_VERSION = 1;

/**
 * Trusted fixture allowlist. New fixture IDs must land on the default branch
 * before an untrusted PR artifact can use them.
 */
export const BUNDLE_SIZE_FIXTURES = [
  { id: "root-button", label: "Button (root)" },
  { id: "subpath-button", label: "Button (components/button)" },
  { id: "root-trio", label: "Button + Dialog + Select (root)" },
  {
    id: "subpath-trio",
    label: "Button + Dialog + Select (component subpaths)",
  },
  { id: "root-chart", label: "Chart (root)" },
  { id: "subpath-chart", label: "Chart (components/chart)" },
  { id: "subpath-badge", label: "Badge (components/badge)" },
  { id: "subpath-flow", label: "Flow (components/flow)" },
  { id: "primitive-button", label: "Button (primitives/button)" },
  { id: "primitives-barrel", label: "Primitives barrel" },
  { id: "code", label: "Code highlighting (code)" },
] as const;

export type BundleSizeFixtureId = (typeof BUNDLE_SIZE_FIXTURES)[number]["id"];

export interface FixtureResult {
  readonly id: BundleSizeFixtureId;
  readonly label: string;
  readonly raw: number;
  readonly gzip: number;
  readonly brotli: number;
  readonly warnings: readonly string[];
}

export interface TarballReport {
  readonly fileCount: number;
  readonly packedSize: number;
  readonly unpackedSize: number;
  readonly flaggedFiles: readonly string[];
}

export interface BundleSizeData {
  readonly schemaVersion: typeof BUNDLE_SIZE_SCHEMA_VERSION;
  readonly fixtures: readonly FixtureResult[];
  readonly tarball: TarballReport;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function findFixture(value: string) {
  return BUNDLE_SIZE_FIXTURES.find((fixture) => fixture.id === value);
}

function formatKB(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function escapeTableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll(/\r?\n/g, " ");
}

function escapeInlineCode(value: string): string {
  return value.replaceAll("`", "'").replaceAll(/\r?\n/g, " ");
}

/** Validate data before rendering artifacts produced by an untrusted PR run. */
export function parseBundleSizeData(value: unknown): BundleSizeData {
  if (!isRecord(value)) {
    throw new Error("Bundle size data must be an object");
  }
  if (value.schemaVersion !== BUNDLE_SIZE_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported bundle size schema version: ${String(value.schemaVersion)}`,
    );
  }
  if (!Array.isArray(value.fixtures)) {
    throw new Error("Bundle size data is missing fixtures");
  }

  if (value.fixtures.length !== BUNDLE_SIZE_FIXTURES.length) {
    throw new Error("Bundle size data does not contain every fixture");
  }

  const seenFixtures = new Set<BundleSizeFixtureId>();
  const fixtures = value.fixtures.map((fixture): FixtureResult => {
    if (
      !isRecord(fixture) ||
      typeof fixture.id !== "string" ||
      !isNonNegativeSafeInteger(fixture.raw) ||
      !isNonNegativeSafeInteger(fixture.gzip) ||
      !isNonNegativeSafeInteger(fixture.brotli) ||
      !Array.isArray(fixture.warnings) ||
      !fixture.warnings.every((warning) => typeof warning === "string")
    ) {
      throw new Error("Bundle size data contains an invalid fixture");
    }
    const definition = findFixture(fixture.id);
    if (!definition) {
      throw new Error(
        `Bundle size data contains unknown fixture: ${fixture.id}`,
      );
    }
    if (seenFixtures.has(definition.id)) {
      throw new Error(
        `Bundle size data contains duplicate fixture: ${fixture.id}`,
      );
    }
    seenFixtures.add(definition.id);

    return {
      id: definition.id,
      label: definition.label,
      raw: fixture.raw,
      gzip: fixture.gzip,
      brotli: fixture.brotli,
      warnings: fixture.warnings
        .slice(0, 5)
        .map((warning) => warning.slice(0, 200)),
    };
  });

  if (!isRecord(value.tarball)) {
    throw new Error("Bundle size data is missing its tarball report");
  }

  const { tarball } = value;
  if (
    !isNonNegativeSafeInteger(tarball.fileCount) ||
    !isNonNegativeSafeInteger(tarball.packedSize) ||
    !isNonNegativeSafeInteger(tarball.unpackedSize) ||
    !Array.isArray(tarball.flaggedFiles) ||
    !tarball.flaggedFiles.every((file) => typeof file === "string")
  ) {
    throw new Error("Bundle size data contains an invalid tarball report");
  }

  return {
    schemaVersion: BUNDLE_SIZE_SCHEMA_VERSION,
    fixtures,
    tarball: {
      fileCount: tarball.fileCount,
      packedSize: tarball.packedSize,
      unpackedSize: tarball.unpackedSize,
      flaggedFiles: tarball.flaggedFiles
        .slice(0, 30)
        .map((file) => file.slice(0, 200)),
    },
  };
}

/** Extract and validate bundle-size data from a report artifact. */
export function parseBundleSizeArtifact(value: unknown): BundleSizeData {
  if (!isRecord(value) || !("data" in value)) {
    throw new Error("Bundle size artifact is missing data");
  }
  return parseBundleSizeData(value.data);
}

export function buildBundleSizeMarkdown(data: BundleSizeData): string {
  const lines: string[] = [
    "Consumer fixtures bundled against `packages/kumo/dist` (peers external, minified ESM).",
    "",
    "| Fixture | Raw | Gzip | Brotli |",
    "| --- | ---: | ---: | ---: |",
  ];

  for (const fixture of data.fixtures) {
    const label = escapeTableCell(
      fixture.warnings.length > 0 ? `${fixture.label} ⚠️` : fixture.label,
    );
    lines.push(
      `| ${label} | ${formatKB(fixture.raw)} | ${formatKB(fixture.gzip)} | ${formatKB(fixture.brotli)} |`,
    );
  }

  const { tarball } = data;
  lines.push(
    "",
    `**npm tarball:** ${tarball.fileCount} files, ${formatKB(tarball.packedSize)} packed, ${formatKB(tarball.unpackedSize)} unpacked.`,
  );

  if (tarball.flaggedFiles.length > 0) {
    lines.push(
      "",
      `<details><summary>⚠️ ${tarball.flaggedFiles.length} flagged files in tarball (tests / raw scripts)</summary>`,
      "",
      ...tarball.flaggedFiles.map((file) => `- \`${escapeInlineCode(file)}\``),
      "",
      "</details>",
    );
  }

  const warnings = data.fixtures.filter(
    (fixture) => fixture.warnings.length > 0,
  );
  if (warnings.length > 0) {
    lines.push(
      "",
      "<details><summary>⚠️ Bundler warnings</summary>",
      "",
      ...warnings.flatMap((fixture) => [
        `**${escapeTableCell(fixture.label)}**`,
        ...fixture.warnings.map(
          (warning) => `- \`${escapeInlineCode(warning)}\``,
        ),
        "",
      ]),
      "</details>",
    );
  }

  lines.push("", "_Report-only: no size thresholds are enforced yet._");
  return lines.join("\n");
}
