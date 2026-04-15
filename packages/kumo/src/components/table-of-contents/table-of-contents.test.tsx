import { describe, it, expect } from "vitest";
import { createElement } from "react";
import {
  TableOfContents,
  KUMO_TABLE_OF_CONTENTS_VARIANTS,
  KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS,
} from "./table-of-contents";

describe("TableOfContents", () => {
  it("should be defined", () => {
    expect(TableOfContents).toBeDefined();
  });

  it("should have sub-components", () => {
    expect(TableOfContents.Title).toBeDefined();
    expect(TableOfContents.List).toBeDefined();
    expect(TableOfContents.Item).toBeDefined();
    expect(TableOfContents.Group).toBeDefined();
  });

  it("should render root without throwing", () => {
    expect(() =>
      createElement(TableOfContents, { children: "content" }),
    ).not.toThrow();
  });

  it("should render Title without throwing", () => {
    expect(() =>
      createElement(TableOfContents.Title, { children: "On this page" }),
    ).not.toThrow();
  });

  it("should render List without throwing", () => {
    expect(() =>
      createElement(TableOfContents.List, { children: "items" }),
    ).not.toThrow();
  });

  it("should render Item without throwing", () => {
    expect(() =>
      createElement(TableOfContents.Item, {
        href: "#section",
        children: "Section",
      }),
    ).not.toThrow();
  });

  it("should render active Item without throwing", () => {
    expect(() =>
      createElement(TableOfContents.Item, {
        href: "#section",
        active: true,
        children: "Section",
      }),
    ).not.toThrow();
  });

  it("should have active state variant classes", () => {
    expect(KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes).toContain(
      "text-kumo-default",
    );
    expect(KUMO_TABLE_OF_CONTENTS_VARIANTS.state.active.classes).toContain(
      "font-medium",
    );
  });

  it("should have default state variant classes", () => {
    expect(KUMO_TABLE_OF_CONTENTS_VARIANTS.state.default.classes).toContain(
      "text-kumo-subtle",
    );
  });

  it("should default to inactive state", () => {
    expect(KUMO_TABLE_OF_CONTENTS_DEFAULT_VARIANTS.state).toBe("default");
  });

  it("should render Group without throwing", () => {
    expect(() =>
      createElement(TableOfContents.Group, {
        label: "Getting Started",
        children: "items",
      }),
    ).not.toThrow();
  });

  it("should have correct displayNames", () => {
    expect(TableOfContents.displayName).toBe("TableOfContents");
    expect(TableOfContents.Title.displayName).toBe("TableOfContents.Title");
    expect(TableOfContents.List.displayName).toBe("TableOfContents.List");
    expect(TableOfContents.Item.displayName).toBe("TableOfContents.Item");
    expect(TableOfContents.Group.displayName).toBe("TableOfContents.Group");
  });
});
