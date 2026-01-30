/**
 * Integration tests for the add command
 * Tests file creation, import transformation, and error handling
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  vi,
} from "vitest";
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { transformImports } from "../utils/transformer";

describe("add command - integration tests", () => {
  let tempDir: string;
  let originalCwd: () => string;

  beforeAll(() => {
    originalCwd = process.cwd.bind(process);
  });

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = mkdtempSync(join(tmpdir(), "kumo-add-test-"));
  });

  afterEach(() => {
    // Clean up temporary directory
    rmSync(tempDir, { recursive: true, force: true });

    // Restore process.cwd
    process.cwd = originalCwd;

    // Restore all mocks
    vi.restoreAllMocks();
  });

  describe("error handling", () => {
    it("should export the add function", async () => {
      const { add } = await import("./add.js");
      expect(add).toBeDefined();
      expect(typeof add).toBe("function");
    });

    it("should require a block name", async () => {
      const { add } = await import("./add.js");
      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      try {
        await add(undefined);
      } catch {
        // Expected to throw when process.exit is called
      }

      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should require kumo.json to exist", async () => {
      const { add } = await import("./add.js");
      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      process.cwd = () => tempDir;

      try {
        await add("PageHeader");
      } catch {
        // Expected to throw when process.exit is called
      }

      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("should validate block exists in registry", async () => {
      const { add } = await import("./add.js");
      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      // Create kumo.json in temp directory
      const kumoConfig = {
        blocksDir: "src/components/kumo",
        version: "1.0.0",
      };
      writeFileSync(
        join(tempDir, "kumo.json"),
        JSON.stringify(kumoConfig, null, 2),
      );

      process.cwd = () => tempDir;

      try {
        await add("NonExistentBlock");
      } catch {
        // Expected to throw when process.exit is called
      }

      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("import transformation", () => {
    it("should transform component imports", () => {
      const input = 'import { Tabs } from "../../components/tabs";';
      const output = transformImports(input);
      expect(output).toBe('import { Tabs } from "@cloudflare/kumo";');
    });

    it("should transform util imports", () => {
      const input = 'import { cn } from "../../utils/cn";';
      const output = transformImports(input);
      expect(output).toBe('import { cn } from "@cloudflare/kumo";');
    });

    it("should split mixed value and type imports", () => {
      const input =
        'import { Tabs, type TabsItem } from "../../components/tabs";';
      const output = transformImports(input);
      expect(output).toContain('import { Tabs } from "@cloudflare/kumo";');
      expect(output).toContain(
        'import type { TabsItem } from "@cloudflare/kumo";',
      );
    });

    it("should preserve type-only imports", () => {
      const input = 'import type { TabsItem } from "../../components/tabs";';
      const output = transformImports(input);
      expect(output).toBe('import type { TabsItem } from "@cloudflare/kumo";');
    });

    it("should preserve non-relative imports", () => {
      const input = 'import { ReactNode } from "react";';
      const output = transformImports(input);
      expect(output).toBe('import { ReactNode } from "react";');
    });

    it("should preserve local relative imports", () => {
      const input = 'import { helper } from "./helper";';
      const output = transformImports(input);
      expect(output).toBe('import { helper } from "./helper";');
    });

    it("should handle real PageHeader imports", () => {
      const input = `import { ReactNode } from "react";
import { Tabs, type TabsItem } from "../../components/tabs";
import { cn } from "../../utils/cn";`;

      const output = transformImports(input);

      // Check each line
      expect(output).toContain('import { ReactNode } from "react";');
      expect(output).toContain('import { Tabs } from "@cloudflare/kumo";');
      expect(output).toContain(
        'import type { TabsItem } from "@cloudflare/kumo";',
      );
      expect(output).toContain('import { cn } from "@cloudflare/kumo";');

      // Ensure React import is preserved
      expect(output.split("\n")[0]).toBe('import { ReactNode } from "react";');
    });
  });

  describe("file operations", () => {
    it("should verify registry contains blocks section", () => {
      // This test verifies the registry structure is correct
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      expect(existsSync(registryPath)).toBe(true);

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      expect(registry.blocks).toBeDefined();
      expect(typeof registry.blocks).toBe("object");
    });

    it("should verify PageHeader block has required metadata", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const pageHeader = registry.blocks?.PageHeader;
      expect(pageHeader).toBeDefined();
      expect(pageHeader.name).toBe("PageHeader");
      expect(pageHeader.type).toBe("block");
      expect(pageHeader.files).toBeDefined();
      expect(Array.isArray(pageHeader.files)).toBe(true);
      expect(pageHeader.files.length).toBeGreaterThan(0);
      expect(pageHeader.dependencies).toBeDefined();
      expect(Array.isArray(pageHeader.dependencies)).toBe(true);
    });

    it("should verify block source files exist", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const pageHeader = registry.blocks?.PageHeader;
      expect(pageHeader).toBeDefined();

      // Check each file exists in src/blocks/
      for (const file of pageHeader.files) {
        const filePath = join(process.cwd(), "src", "blocks", file);
        expect(existsSync(filePath)).toBe(true);
      }
    });

    it("should verify block source files contain transformable imports", () => {
      const pageHeaderPath = join(
        process.cwd(),
        "src",
        "blocks",
        "page-header",
        "page-header.tsx",
      );

      const content = readFileSync(pageHeaderPath, "utf-8");

      // Should contain relative imports to components or utils
      expect(
        content.includes("../../components/") ||
          content.includes("../../utils/"),
      ).toBe(true);
    });
  });

  describe("transformer integration", () => {
    it("should transform real PageHeader file content correctly", () => {
      const pageHeaderPath = join(
        process.cwd(),
        "src",
        "blocks",
        "page-header",
        "page-header.tsx",
      );

      const originalContent = readFileSync(pageHeaderPath, "utf-8");
      const transformed = transformImports(originalContent);

      // Verify transformations occurred
      expect(transformed).not.toContain("../../components/");
      expect(transformed).not.toContain("../../utils/");
      expect(transformed).toContain("@cloudflare/kumo");

      // Verify React imports are preserved
      if (originalContent.includes('from "react"')) {
        expect(transformed).toContain('from "react"');
      }

      // Verify the transformed content is valid TypeScript (basic check)
      expect(transformed).toContain("import");
      expect(transformed).toContain("export");
    });

    it("should handle multiple imports in a single file", () => {
      const input = `import { ReactNode } from "react";
import { Tabs } from "../../components/tabs";
import { Button } from "../../components/button";
import { cn } from "../../utils/cn";
import { useState } from "react";`;

      const output = transformImports(input);

      // All React imports should be preserved
      expect(output).toContain('import { ReactNode } from "react"');
      expect(output).toContain('import { useState } from "react"');

      // All Kumo imports should be transformed
      expect(output).toContain('import { Tabs } from "@cloudflare/kumo"');
      expect(output).toContain('import { Button } from "@cloudflare/kumo"');
      expect(output).toContain('import { cn } from "@cloudflare/kumo"');

      // Original relative paths should be gone
      expect(output).not.toContain("../../components/");
      expect(output).not.toContain("../../utils/");
    });
  });
});
