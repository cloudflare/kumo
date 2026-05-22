import { describe, expect, it } from "vitest";
import { normalizeLanguage } from "./provider";

describe("normalizeLanguage", () => {
  it("returns canonical names unchanged", () => {
    expect(normalizeLanguage("javascript")).toBe("javascript");
    expect(normalizeLanguage("typescript")).toBe("typescript");
    expect(normalizeLanguage("bash")).toBe("bash");
    expect(normalizeLanguage("markdown")).toBe("markdown");
    expect(normalizeLanguage("yaml")).toBe("yaml");
    expect(normalizeLanguage("python")).toBe("python");
    expect(normalizeLanguage("graphql")).toBe("graphql");
    expect(normalizeLanguage("sql")).toBe("sql");
    expect(normalizeLanguage("json")).toBe("json");
    expect(normalizeLanguage("html")).toBe("html");
    expect(normalizeLanguage("css")).toBe("css");
    expect(normalizeLanguage("jsx")).toBe("jsx");
    expect(normalizeLanguage("tsx")).toBe("tsx");
    expect(normalizeLanguage("jsonc")).toBe("jsonc");
    expect(normalizeLanguage("shell")).toBe("shell");
    expect(normalizeLanguage("diff")).toBe("diff");
    expect(normalizeLanguage("hcl")).toBe("hcl");
    expect(normalizeLanguage("toml")).toBe("toml");
  });

  it("normalizes common aliases to canonical names", () => {
    // JavaScript variants
    expect(normalizeLanguage("js")).toBe("javascript");
    expect(normalizeLanguage("cjs")).toBe("javascript");
    expect(normalizeLanguage("mjs")).toBe("javascript");

    // TypeScript variants
    expect(normalizeLanguage("ts")).toBe("typescript");
    expect(normalizeLanguage("cts")).toBe("typescript");
    expect(normalizeLanguage("mts")).toBe("typescript");

    // Shell variants
    expect(normalizeLanguage("sh")).toBe("bash");
    expect(normalizeLanguage("zsh")).toBe("bash");

    // Other aliases
    expect(normalizeLanguage("yml")).toBe("yaml");
    expect(normalizeLanguage("py")).toBe("python");
    expect(normalizeLanguage("md")).toBe("markdown");
    expect(normalizeLanguage("gql")).toBe("graphql");
  });

  it("returns null for unsupported or unknown languages", () => {
    expect(normalizeLanguage("rust")).toBeNull();
    expect(normalizeLanguage("go")).toBeNull();
    expect(normalizeLanguage("java")).toBeNull();
    expect(normalizeLanguage("cpp")).toBeNull();
    expect(normalizeLanguage("")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(normalizeLanguage("")).toBeNull();
  });
});
