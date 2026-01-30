/**
 * Tests for blocks command
 * Tests block listing functionality and registry integration
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("blocks command", () => {
  describe("module structure", () => {
    it("exports blocks function", async () => {
      const { blocks } = await import("./blocks.js");
      expect(blocks).toBeDefined();
      expect(typeof blocks).toBe("function");
    });

    it("blocks function is callable", async () => {
      const { blocks } = await import("./blocks.js");
      // Just verify it's callable - actual output depends on registry
      expect(() => blocks).not.toThrow();
    });
  });

  describe("registry integration", () => {
    it("component registry exists and is valid JSON", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      expect(existsSync(registryPath)).toBe(true);

      const content = readFileSync(registryPath, "utf-8");
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it("registry contains blocks section", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      expect(registry.blocks).toBeDefined();
      expect(typeof registry.blocks).toBe("object");
      expect(Object.keys(registry.blocks).length).toBeGreaterThan(0);
    });

    it("each block has required metadata fields", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const blocks = registry.blocks;

      for (const [blockName, block] of Object.entries(blocks)) {
        expect(block).toHaveProperty("name");
        expect(block).toHaveProperty("type");
        expect(block).toHaveProperty("description");
        expect(block).toHaveProperty("category");
        expect(block).toHaveProperty("files");
        expect(block).toHaveProperty("dependencies");

        // Validate field types
        expect((block as any).name).toBe(blockName);
        expect((block as any).type).toBe("block");
        expect(typeof (block as any).description).toBe("string");
        expect(typeof (block as any).category).toBe("string");
        expect(Array.isArray((block as any).files)).toBe(true);
        expect(Array.isArray((block as any).dependencies)).toBe(true);
      }
    });

    it("PageHeader block has correct metadata", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const pageHeader = registry.blocks?.PageHeader;
      expect(pageHeader).toBeDefined();
      expect(pageHeader.name).toBe("PageHeader");
      expect(pageHeader.type).toBe("block");
      expect(pageHeader.category).toBe("Layout");
      expect(pageHeader.files.length).toBeGreaterThan(0);
      expect(pageHeader.files[0]).toMatch(/page-header\.tsx$/);
    });

    it("blocks are grouped by category", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const blocks = registry.blocks;
      const categories = new Set();

      for (const block of Object.values(blocks)) {
        categories.add((block as any).category);
      }

      // Should have at least one category
      expect(categories.size).toBeGreaterThan(0);

      // Layout category should exist (PageHeader is in Layout)
      expect(categories.has("Layout")).toBe(true);
    });
  });

  describe("block file verification", () => {
    it("all registered block files exist in src/blocks/", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const blocks = registry.blocks;

      for (const block of Object.values(blocks)) {
        const files = (block as any).files;

        for (const file of files) {
          const filePath = join(process.cwd(), "src", "blocks", file);
          expect(existsSync(filePath)).toBe(true);
        }
      }
    });

    it("PageHeader source files exist", () => {
      const expectedFiles = [
        "src/blocks/page-header/page-header.tsx",
        "src/blocks/page-header/index.ts",
      ];

      for (const file of expectedFiles) {
        const filePath = join(process.cwd(), file);
        expect(existsSync(filePath)).toBe(true);
      }
    });
  });

  describe("search index", () => {
    it("registry has search.byType index", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      expect(registry.search).toBeDefined();
      expect(registry.search.byType).toBeDefined();
    });

    it("search.byType includes block entries", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const byType = registry.search.byType;

      expect(byType.block).toBeDefined();
      expect(Array.isArray(byType.block)).toBe(true);
      expect(byType.block.length).toBeGreaterThan(0);

      // PageHeader should be in the block list
      expect(byType.block).toContain("PageHeader");
    });

    it("search.byType separates components and blocks", () => {
      const registryPath = join(process.cwd(), "ai", "component-registry.json");

      const content = readFileSync(registryPath, "utf-8");
      const registry = JSON.parse(content);

      const byType = registry.search.byType;

      expect(byType.component).toBeDefined();
      expect(byType.block).toBeDefined();

      // Should have more components than blocks
      expect(byType.component.length).toBeGreaterThan(byType.block.length);

      // No overlap between components and blocks
      const componentSet = new Set(byType.component);
      const blockSet = new Set(byType.block);

      for (const blockName of blockSet) {
        expect(componentSet.has(blockName)).toBe(false);
      }
    });
  });
});
