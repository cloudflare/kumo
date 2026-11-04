/**
 * Data model utilities for dynamic value resolution.
 *
 * Provides JSON Pointer path resolution for data binding.
 */

import type { DataModel, DynamicValue } from "./types";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Split a JSON Pointer into segments, decoding `~1` to `/` and `~0` to `~`
 * (RFC 6901). A leading slash is optional.
 */
function parsePath(path: string): string[] {
  const raw = path.startsWith("/") ? path.slice(1) : path;
  return raw
    .split("/")
    .map((segment) => segment.replace(/~1/g, "/").replace(/~0/g, "~"));
}

/**
 * Get a value from an object by JSON Pointer path.
 *
 * @example
 * const data = { user: { name: "John", profile: { age: 30 } } };
 * getByPath(data, "/user/name") // "John"
 * getByPath(data, "/user/profile/age") // 30
 * getByPath(data, "/missing") // undefined
 */
export function getByPath(obj: unknown, path: string): unknown {
  if (!path || path === "/") {
    return obj;
  }

  const segments = parsePath(path);

  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Set a value in an object by JSON Pointer path.
 * Creates intermediate objects as needed.
 *
 * @example
 * const data = {};
 * setByPath(data, "/user/name", "John");
 * // data is now { user: { name: "John" } }
 */
export function setByPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const segments = parsePath(path);

  if (segments.some((segment) => FORBIDDEN_KEYS.has(segment))) return;

  let current: Record<string, unknown> = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]!;
    const next = Object.hasOwn(current, segment) ? current[segment] : undefined;
    if (typeof next !== "object" || next === null) {
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }

  const lastSegment = segments[segments.length - 1]!;
  current[lastSegment] = value;
}

/**
 * Check if a value is a dynamic path reference.
 */
export function isDynamicPath(value: unknown): value is { path: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "path" in value &&
    typeof (value as { path: unknown }).path === "string"
  );
}

/**
 * Resolve a dynamic value against a data model.
 * If the value is a path reference, look it up in the data model.
 * Otherwise, return the literal value.
 *
 * @example
 * const data = { user: { name: "John" } };
 * resolveDynamicValue("Hello", data) // "Hello"
 * resolveDynamicValue({ path: "/user/name" }, data) // "John"
 */
export function resolveDynamicValue<T>(
  value: DynamicValue<T>,
  dataModel: DataModel,
): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (isDynamicPath(value)) {
    return getByPath(dataModel, value.path) as T | undefined;
  }

  return value as T;
}

function resolveValue(value: unknown, dataModel: DataModel): unknown {
  if (isDynamicPath(value)) {
    return getByPath(dataModel, value.path);
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, dataModel));
  }
  if (typeof value === "object" && value !== null) {
    return resolveProps(value as Record<string, unknown>, dataModel);
  }
  return value;
}

/**
 * Resolve all dynamic values in an object.
 * Recursively resolves any { path: string } references, including
 * those nested inside arrays.
 */
export function resolveProps(
  props: Record<string, unknown>,
  dataModel: DataModel,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolveValue(value, dataModel);
  }

  return resolved;
}
