/**
 * Tests for init command
 *
 * Note: Full integration tests with user prompts are tested manually.
 * These tests verify the core logic and file creation.
 */

import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdirSync, rmSync } from "node:fs";
import { configExists, readConfig, writeConfig } from "../utils/config";

describe("init command integration", () => {
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `kumo-init-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("module structure", () => {
    it("can import the init module without errors", async () => {
      // This ensures the module structure is correct
      const { init, prompt, confirm } = await import("./init");

      expect(typeof init).toBe("function");
      expect(typeof prompt).toBe("function");
      expect(typeof confirm).toBe("function");
    });
  });

  describe("config file creation", () => {
    it("creates kumo.json with correct structure", () => {
      // Config should not exist initially
      expect(configExists(testDir)).toBe(false);

      // Create a config file (simulating what init does)
      const config = {
        blocksDir: "src/components/kumo",
        version: "1.0.0",
      };
      writeConfig(config, testDir);

      // Config should now exist
      expect(configExists(testDir)).toBe(true);

      // Should be able to read it back
      const readBack = readConfig(testDir);
      expect(readBack).toEqual(config);
    });

    it("creates valid JSON with proper formatting", () => {
      const config = {
        blocksDir: "src/components/kumo",
        version: "1.0.0",
      };
      writeConfig(config, testDir);

      const configPath = join(testDir, "kumo.json");
      const content = readFileSync(configPath, "utf-8");

      // Should be valid JSON
      expect(() => JSON.parse(content)).not.toThrow();

      // Should be pretty-printed (with newlines)
      expect(content).toContain("\n");

      // Should match expected format
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(config);
    });

    it("supports custom blocks directory", () => {
      const customConfig = {
        blocksDir: "app/components/blocks",
        version: "1.0.0",
      };
      writeConfig(customConfig, testDir);

      const readBack = readConfig(testDir);
      expect(readBack?.blocksDir).toBe("app/components/blocks");
    });

    it("applies defaults when fields are missing", () => {
      // Write partial config
      const partialConfig = {
        blocksDir: "custom/path",
      };

      // Manually write to test default merging
      const configPath = join(testDir, "kumo.json");
      writeFileSync(configPath, JSON.stringify(partialConfig, null, 2));

      // Read should merge with defaults
      const readBack = readConfig(testDir);
      expect(readBack?.blocksDir).toBe("custom/path");
      expect(readBack?.version).toBe("1.0.0"); // Default version
    });
  });

  describe("config validation", () => {
    it("detects existing config files", () => {
      // Initially should not exist
      expect(configExists(testDir)).toBe(false);

      // Create config
      writeConfig(
        { blocksDir: "src/components/kumo", version: "1.0.0" },
        testDir,
      );

      // Should now exist
      expect(configExists(testDir)).toBe(true);
    });

    it("handles missing config directory gracefully", () => {
      const nonExistentDir = join(tmpdir(), "does-not-exist-kumo-test");

      // Should return false for non-existent directory
      expect(configExists(nonExistentDir)).toBe(false);

      // Should return null when reading
      const config = readConfig(nonExistentDir);
      expect(config).toBeNull();
    });

    it("throws error for invalid JSON", () => {
      // Write invalid JSON
      const configPath = join(testDir, "kumo.json");
      writeFileSync(configPath, "{ invalid json }");

      // Should throw error
      expect(() => readConfig(testDir)).toThrow("Failed to parse kumo.json");
    });
  });

  describe("config utilities integration", () => {
    it("supports full init workflow simulation", () => {
      // Step 1: Check config doesn't exist
      expect(configExists(testDir)).toBe(false);

      // Step 2: Create config with user input (simulated)
      const userConfig = {
        blocksDir: "src/components/kumo",
        version: "1.0.0",
      };
      writeConfig(userConfig, testDir);

      // Step 3: Verify config was created
      expect(configExists(testDir)).toBe(true);

      // Step 4: Read and verify config
      const savedConfig = readConfig(testDir);
      expect(savedConfig).toEqual(userConfig);

      // Step 5: Simulate overwrite check
      expect(configExists(testDir)).toBe(true);

      // Step 6: Overwrite with new config
      const updatedConfig = {
        blocksDir: "app/blocks",
        version: "1.0.0",
      };
      writeConfig(updatedConfig, testDir);

      // Step 7: Verify overwrite worked
      const finalConfig = readConfig(testDir);
      expect(finalConfig).toEqual(updatedConfig);
    });
  });
});
