/**
 * Tests for Kumo catalog module
 */

import { describe, it, expect } from "vitest";
import {
  getByPath,
  setByPath,
  isDynamicPath,
  resolveDynamicValue,
  resolveProps,
} from "./data";
import { evaluateVisibility, createVisibilityContext } from "./visibility";

describe("data utilities", () => {
  describe("getByPath", () => {
    it("returns root for empty path", () => {
      const obj = { a: 1 };
      expect(getByPath(obj, "")).toBe(obj);
      expect(getByPath(obj, "/")).toBe(obj);
    });

    it("gets nested values", () => {
      const obj = { user: { name: "John", profile: { age: 30 } } };
      expect(getByPath(obj, "/user/name")).toBe("John");
      expect(getByPath(obj, "/user/profile/age")).toBe(30);
    });

    it("returns undefined for missing paths", () => {
      const obj = { user: { name: "John" } };
      expect(getByPath(obj, "/user/missing")).toBeUndefined();
      expect(getByPath(obj, "/missing/path")).toBeUndefined();
    });

    it("handles paths without leading slash", () => {
      const obj = { user: { name: "John" } };
      expect(getByPath(obj, "user/name")).toBe("John");
    });
  });

  describe("setByPath", () => {
    it("sets nested values", () => {
      const obj: Record<string, unknown> = {};
      setByPath(obj, "/user/name", "John");
      expect(obj).toEqual({ user: { name: "John" } });
    });

    it("overwrites existing values", () => {
      const obj: Record<string, unknown> = { user: { name: "John" } };
      setByPath(obj, "/user/name", "Jane");
      expect(obj).toEqual({ user: { name: "Jane" } });
    });
  });

  describe("isDynamicPath", () => {
    it("returns true for path objects", () => {
      expect(isDynamicPath({ path: "/user/name" })).toBe(true);
    });

    it("returns false for non-path values", () => {
      expect(isDynamicPath("hello")).toBe(false);
      expect(isDynamicPath(123)).toBe(false);
      expect(isDynamicPath(null)).toBe(false);
      expect(isDynamicPath({ other: "key" })).toBe(false);
    });
  });

  describe("resolveDynamicValue", () => {
    const data = { user: { name: "John", age: 30 } };

    it("returns literal values as-is", () => {
      expect(resolveDynamicValue("hello", data)).toBe("hello");
      expect(resolveDynamicValue(123, data)).toBe(123);
      expect(resolveDynamicValue(true, data)).toBe(true);
    });

    it("resolves path references", () => {
      expect(resolveDynamicValue({ path: "/user/name" }, data)).toBe("John");
      expect(resolveDynamicValue({ path: "/user/age" }, data)).toBe(30);
    });

    it("returns undefined for missing paths", () => {
      expect(resolveDynamicValue({ path: "/missing" }, data)).toBeUndefined();
    });
  });

  describe("resolveProps", () => {
    it("resolves all dynamic values in props", () => {
      const data = { user: { name: "John" }, config: { theme: "dark" } };
      const props = {
        title: { path: "/user/name" },
        subtitle: "Static text",
        theme: { path: "/config/theme" },
      };

      const resolved = resolveProps(props, data);
      expect(resolved).toEqual({
        title: "John",
        subtitle: "Static text",
        theme: "dark",
      });
    });
  });
});

describe("visibility evaluation", () => {
  const createCtx = (data: Record<string, unknown> = {}, isSignedIn = false) =>
    createVisibilityContext(data, { isSignedIn });

  describe("boolean conditions", () => {
    it("returns true for true", () => {
      expect(evaluateVisibility(true, createCtx())).toBe(true);
    });

    it("returns false for false", () => {
      expect(evaluateVisibility(false, createCtx())).toBe(false);
    });

    it("returns true for undefined", () => {
      expect(evaluateVisibility(undefined, createCtx())).toBe(true);
    });
  });

  describe("path conditions", () => {
    it("returns true for truthy path values", () => {
      const ctx = createCtx({ user: { isAdmin: true } });
      expect(evaluateVisibility({ path: "/user/isAdmin" }, ctx)).toBe(true);
    });

    it("returns false for falsy path values", () => {
      const ctx = createCtx({ user: { isAdmin: false } });
      expect(evaluateVisibility({ path: "/user/isAdmin" }, ctx)).toBe(false);
    });

    it("returns false for missing paths", () => {
      const ctx = createCtx({});
      expect(evaluateVisibility({ path: "/user/isAdmin" }, ctx)).toBe(false);
    });

    it("handles various truthy/falsy values", () => {
      expect(
        evaluateVisibility({ path: "/val" }, createCtx({ val: "text" })),
      ).toBe(true);
      expect(evaluateVisibility({ path: "/val" }, createCtx({ val: "" }))).toBe(
        false,
      );
      expect(evaluateVisibility({ path: "/val" }, createCtx({ val: 1 }))).toBe(
        true,
      );
      expect(evaluateVisibility({ path: "/val" }, createCtx({ val: 0 }))).toBe(
        false,
      );
      expect(evaluateVisibility({ path: "/val" }, createCtx({ val: [] }))).toBe(
        false,
      );
      expect(
        evaluateVisibility({ path: "/val" }, createCtx({ val: [1] })),
      ).toBe(true);
    });
  });

  describe("auth conditions", () => {
    it("signedIn returns true when signed in", () => {
      const ctx = createCtx({}, true);
      expect(evaluateVisibility({ auth: "signedIn" }, ctx)).toBe(true);
    });

    it("signedIn returns false when signed out", () => {
      const ctx = createCtx({}, false);
      expect(evaluateVisibility({ auth: "signedIn" }, ctx)).toBe(false);
    });

    it("signedOut returns true when signed out", () => {
      const ctx = createCtx({}, false);
      expect(evaluateVisibility({ auth: "signedOut" }, ctx)).toBe(true);
    });

    it("signedOut returns false when signed in", () => {
      const ctx = createCtx({}, true);
      expect(evaluateVisibility({ auth: "signedOut" }, ctx)).toBe(false);
    });
  });

  describe("logic expressions", () => {
    it("AND requires all conditions to be true", () => {
      const ctx = createCtx({ a: true, b: true, c: false });
      expect(
        evaluateVisibility({ and: [{ path: "/a" }, { path: "/b" }] }, ctx),
      ).toBe(true);
      expect(
        evaluateVisibility({ and: [{ path: "/a" }, { path: "/c" }] }, ctx),
      ).toBe(false);
    });

    it("OR requires at least one condition to be true", () => {
      const ctx = createCtx({ a: true, b: false, c: false });
      expect(
        evaluateVisibility({ or: [{ path: "/a" }, { path: "/b" }] }, ctx),
      ).toBe(true);
      expect(
        evaluateVisibility({ or: [{ path: "/b" }, { path: "/c" }] }, ctx),
      ).toBe(false);
    });

    it("NOT negates conditions", () => {
      const ctx = createCtx({ a: true, b: false });
      expect(evaluateVisibility({ not: { path: "/a" } }, ctx)).toBe(false);
      expect(evaluateVisibility({ not: { path: "/b" } }, ctx)).toBe(true);
    });

    it("EQ checks equality", () => {
      const ctx = createCtx({ status: "active", expected: "active" });
      expect(
        evaluateVisibility({ eq: [{ path: "/status" }, "active"] }, ctx),
      ).toBe(true);
      expect(
        evaluateVisibility({ eq: [{ path: "/status" }, "inactive"] }, ctx),
      ).toBe(false);
      expect(
        evaluateVisibility(
          { eq: [{ path: "/status" }, { path: "/expected" }] },
          ctx,
        ),
      ).toBe(true);
    });

    it("GT checks greater than", () => {
      const ctx = createCtx({ count: 10 });
      expect(evaluateVisibility({ gt: [{ path: "/count" }, 5] }, ctx)).toBe(
        true,
      );
      expect(evaluateVisibility({ gt: [{ path: "/count" }, 10] }, ctx)).toBe(
        false,
      );
      expect(evaluateVisibility({ gt: [{ path: "/count" }, 15] }, ctx)).toBe(
        false,
      );
    });

    it("handles nested logic expressions", () => {
      const ctx = createCtx({ isAdmin: true, isEnabled: true, count: 5 }, true);
      // Test nested AND + OR
      const condition = {
        and: [
          { path: "/isAdmin" },
          {
            or: [
              { path: "/isEnabled" },
              { gt: [{ path: "/count" }, 10] as [{ path: string }, number] },
            ],
          },
        ],
      };
      expect(evaluateVisibility(condition, ctx)).toBe(true);
    });
  });
});
