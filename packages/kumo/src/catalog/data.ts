/**
 * Data model utilities for dynamic value resolution.
 *
 * Provides JSON Pointer path resolution for data binding.
 */

import type { DataModel, DynamicValue } from "./types";

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

  const segments = path.startsWith("/")
    ? path.slice(1).split("/")
    : path.split("/");

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
  const segments = path.startsWith("/")
    ? path.slice(1).split("/")
    : path.split("/");

  if (segments.length === 0) return;

  let current: Record<string, unknown> = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]!;
    if (!(segment in current) || typeof current[segment] !== "object") {
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

/**
 * Resolve all dynamic values in an object.
 * Recursively resolves any { path: string } references.
 */
export function resolveProps(
  props: Record<string, unknown>,
  dataModel: DataModel,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (isDynamicPath(value)) {
      resolved[key] = getByPath(dataModel, value.path);
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Recursively resolve nested objects
      resolved[key] = resolveProps(value as Record<string, unknown>, dataModel);
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}
