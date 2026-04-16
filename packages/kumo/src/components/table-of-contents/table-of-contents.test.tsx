import { render, screen } from "@testing-library/react";
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
      createElement(TableOfContents.List, { children: null }),
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
        children: null,
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

  it("should render List as a <ul> element", () => {
    render(
      <TableOfContents>
        <TableOfContents.List data-testid="toc-list">
          <TableOfContents.Item href="#intro">
            Introduction
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const list = screen.getByTestId("toc-list");
    expect(list.tagName).toBe("UL");
    expect(list.className).toContain("border-l-2");
    expect(list.className).toContain("border-kumo-hairline");
  });

  it("should render Item wrapped in <li> with -ml-0.5", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Item href="#intro">
            Introduction
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const link = screen.getByText("Introduction").closest("a");
    expect(link).toBeTruthy();
    const li = link!.parentElement;
    expect(li?.tagName).toBe("LI");
    expect(li?.className).toContain("-ml-0.5");
  });

  it("should render active Item with correct aria-current and classes", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Item href="#intro" active>
            Introduction
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const link = screen.getByText("Introduction").closest("a");
    expect(link).toBeTruthy();
    expect(link!.getAttribute("aria-current")).toBe("true");
    expect(link!.className).toContain("border-kumo-brand");
    expect(link!.className).toContain("font-medium");
  });

  it("should render Group as <li> with nested <ul>", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Group
            label="Getting Started"
            data-testid="toc-group"
          >
            <TableOfContents.Item href="#install">
              Installation
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const group = screen.getByTestId("toc-group");
    expect(group.tagName).toBe("LI");

    const nestedList = group.querySelector("ul");
    expect(nestedList).toBeTruthy();
    expect(nestedList!.className).toContain("flex");
    expect(nestedList!.className).toContain("flex-col");
    expect(nestedList!.className).toContain("gap-2");
    expect(nestedList!.className).toContain("border-l-2");
    expect(nestedList!.className).toContain("border-kumo-hairline");
    expect(nestedList!.className).not.toContain("pl-3");
  });

  it("should render Group without href with label as <p>", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Group
            label="Getting Started"
            data-testid="toc-group-no-href"
          >
            <TableOfContents.Item href="#install">
              Installation
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const label = screen.getByText("Getting Started");
    expect(label.tagName).toBe("P");
    expect(label.className).toContain("text-kumo-subtle");

    const group = screen.getByTestId("toc-group-no-href");
    expect(group.className).toContain("-ml-0.5");
    expect(group.className).not.toContain("mt-3");
  });

  it("should render Group with href as a clickable <a> with item styling", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Group
            label="API"
            href="/api"
            data-testid="toc-group-link"
          >
            <TableOfContents.Item href="#methods">Methods</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const groupLabel = screen.getByText("API").closest("a");
    expect(groupLabel).toBeTruthy();
    expect(groupLabel!.tagName).toBe("A");
    expect(groupLabel!.getAttribute("href")).toBe("/api");
    expect(groupLabel!.className).toContain("border-l-2");
    expect(groupLabel!.className).toContain("pl-4");
    expect(groupLabel!.className).toContain("text-sm");

    const group = screen.getByTestId("toc-group-link");
    expect(group.className).toContain("-ml-0.5");
    expect(group.className).not.toContain("mt-3");
  });

  it("should render Group with href and active with active classes and aria-current", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Group
            label="Examples"
            href="#examples"
            active
            data-testid="toc-group-active"
          >
            <TableOfContents.Item href="#basic">
              Basic example
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const link = screen.getByText("Examples").closest("a");
    expect(link).toBeTruthy();
    expect(link!.getAttribute("aria-current")).toBe("true");
    expect(link!.className).toContain("border-kumo-brand");
    expect(link!.className).toContain("font-medium");
    expect(link!.className).toContain("text-kumo-default");
  });

  it("should apply pl-7 override to Group nested items", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Group
            label="Getting Started"
            data-testid="toc-group-nested"
          >
            <TableOfContents.Item href="#install">
              Installation
            </TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const group = screen.getByTestId("toc-group-nested");
    const nestedList = group.querySelector("ul");
    expect(nestedList).toBeTruthy();
    expect(nestedList!.className).toContain("[&>li>a]:pl-7");
    expect(nestedList!.className).toContain("[&>li>button]:pl-7");
  });

  it("should render Item with custom render prop wrapped in <li>", () => {
    render(
      <TableOfContents>
        <TableOfContents.List>
          <TableOfContents.Item render={<button type="button" />} active>
            Custom
          </TableOfContents.Item>
        </TableOfContents.List>
      </TableOfContents>,
    );

    const button = screen.getByText("Custom").closest("button");
    expect(button).toBeTruthy();
    const li = button!.parentElement;
    expect(li?.tagName).toBe("LI");
    expect(li?.className).toContain("-ml-0.5");
  });
});
