/**
 * Hash-based caching for component registry generation.
 *
 * The cache stores pre-computed component metadata indexed by content hashes.
 * This allows incremental builds - only components that changed are regenerated.
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import type {
  CacheFile,
  CacheEntry,
  ComponentSchema,
  CLIFlags,
} from "./types.js";

// =============================================================================
// Cache version - INCREMENT THIS when you change:
// - ADDITIONAL_COMPONENT_PROPS (manual prop overrides)
// - COMPONENT_STYLING_METADATA (Figma styling data)
// - Parser logic, filtering rules, or output format
//
// The cache only hashes individual component files (button.tsx, button.stories.tsx).
// Changes to shared code in THIS file won't invalidate cache without a version bump.
// Or use: pnpm codegen:registry --no-cache
// =============================================================================
export const CACHE_VERSION = 4;

/**
 * Compute SHA-256 hash of file content.
 */
export function hashFileContent(filePath: string): string {
  try {
    const content = readFileSync(filePath, "utf-8");
    return createHash("sha256").update(content).digest("hex");
  } catch {
    return "";
  }
}

/**
 * Load the cache file from disk.
 * Returns an empty cache if the file doesn't exist or version mismatches.
 */
export function loadCache(cachePath: string): CacheFile {
  try {
    if (!existsSync(cachePath)) {
      return { version: CACHE_VERSION, entries: {} };
    }
    const cacheData = JSON.parse(readFileSync(cachePath, "utf-8"));
    // Invalidate cache if version mismatch
    if (cacheData.version !== CACHE_VERSION) {
      console.log("Cache version mismatch, invalidating...");
      return { version: CACHE_VERSION, entries: {} };
    }
    return cacheData;
  } catch {
    return { version: CACHE_VERSION, entries: {} };
  }
}

/**
 * Save the cache file to disk.
 */
export function saveCache(
  cache: CacheFile,
  cachePath: string,
  cacheDir: string,
): void {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

/**
 * Check if a component can be loaded from cache.
 * Returns the cached metadata if valid, null otherwise.
 */
export function getCachedComponent(
  componentName: string,
  sourceHash: string,
  storyHash: string,
  cache: CacheFile,
  cliFlags: CLIFlags,
): ComponentSchema | null {
  if (cliFlags.noCache) {
    return null;
  }

  const entry = cache.entries[componentName];
  if (!entry) {
    return null;
  }

  // Check if hashes match
  if (
    entry.sourceHash === sourceHash &&
    entry.storyHash === storyHash &&
    entry.cacheVersion === CACHE_VERSION
  ) {
    return entry.metadata;
  }

  return null;
}

/**
 * Create a cache entry for a component.
 */
export function createCacheEntry(
  componentName: string,
  sourceHash: string,
  storyHash: string,
  metadata: ComponentSchema,
): CacheEntry {
  return {
    componentName,
    sourceHash,
    storyHash,
    cacheVersion: CACHE_VERSION,
    generatedAt: Date.now(),
    metadata,
  };
}
