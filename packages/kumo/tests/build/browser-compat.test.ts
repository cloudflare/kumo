import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const distDir = join(__dirname, "../../dist");
const isBuilt = existsSync(join(distDir, "index.js"));

interface BannedAPI {
  readonly name: string;
  readonly pattern: RegExp;
  readonly since: string;
}

const BANNED_APIS: readonly BannedAPI[] = [
  {
    name: "Array.prototype.toSorted()",
    pattern: /\.toSorted\(/,
    since: "ES2023",
  },
  {
    name: "Array.prototype.toReversed()",
    pattern: /\.toReversed\(/,
    since: "ES2023",
  },
  {
    name: "Array.prototype.toSpliced()",
    pattern: /\.toSpliced\(/,
    since: "ES2023",
  },
  {
    name: "Array.prototype.findLast()",
    pattern: /\.findLast\(/,
    since: "ES2023",
  },
  {
    name: "Array.prototype.findLastIndex()",
    pattern: /\.findLastIndex\(/,
    since: "ES2023",
  },
  {
    name: "Array.prototype.with()",
    pattern: /(?:[\])]|\w)\.with\(\s*\d/,
    since: "ES2023",
  },
  {
    name: "structuredClone()",
    pattern: /\bstructuredClone\(/,
    since: "HTML spec (Safari 15.4+, 2022)",
  },
  {
    name: "Array.fromAsync()",
    pattern: /\bArray\.fromAsync\(/,
    since: "ES2024",
  },
  {
    name: "Object.groupBy()",
    pattern: /\bObject\.groupBy\(/,
    since: "ES2024",
  },
  {
    name: "Map.groupBy()",
    pattern: /\bMap\.groupBy\(/,
    since: "ES2024",
  },
] as const;

const KNOWN_EXCEPTIONS: ReadonlyArray<{
  readonly file: string;
  readonly api: string;
  readonly reason: string;
}> = [];

function collectJsFiles(dir: string): string[] {
  const results: string[] = [];

  function walk(currentDir: string): void {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".js") && !entry.endsWith(".js.map")) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

interface Violation {
  file: string;
  line: number;
  api: string;
  snippet: string;
}

describe.skipIf(!isBuilt)("Browser Compatibility (Post-Build)", () => {
  it("should not contain banned ES2023+ APIs in dist JS files", () => {
    const jsFiles = collectJsFiles(distDir);

    expect(jsFiles.length).toBeGreaterThan(0);

    const violations: Violation[] = [];

    for (const filePath of jsFiles) {
      const relPath = relative(distDir, filePath);
      const content = readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      for (const [index, line] of lines.entries()) {
        for (const banned of BANNED_APIS) {
          const match = banned.pattern.exec(line);

          if (!match) {
            continue;
          }

          const isException = KNOWN_EXCEPTIONS.some(
            (exception) =>
              relPath.includes(exception.file) && exception.api === banned.name,
          );

          if (isException) {
            continue;
          }

          const matchIndex = match.index;
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(line.length, matchIndex + 50);

          violations.push({
            file: relPath,
            line: index + 1,
            api: banned.name,
            snippet: line.slice(start, end).trim(),
          });
        }
      }
    }

    if (violations.length > 0) {
      const report = violations
        .map(
          (violation) =>
            `  ${violation.api} in ${violation.file}:${violation.line}\n    ...${violation.snippet}...`,
        )
        .join("\n\n");

      console.error(
        `\n  Found ${violations.length} banned API usage(s) in dist/:\n\n${report}`,
      );
    }

    expect(violations).toEqual([]);
  });

  it("should scan a meaningful number of JS files", () => {
    const jsFiles = collectJsFiles(distDir);

    expect(jsFiles.length).toBeGreaterThan(50);
  });
});
