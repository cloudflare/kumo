import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { Link, KUMO_LINK_VARIANTS, linkVariants } from "./link";

describe("Link", () => {
  it("should be defined", () => {
    expect(Link).toBeDefined();
  });

  it("should render with default props", () => {
    const props = {
      href: "#",
      children: "Learn more",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should apply inline variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("text-primary");
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("underline");
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("link-current");
  });

  it("should apply current variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain(
      "text-current",
    );
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain("underline");
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain(
      "link-current",
    );
  });

  it("should apply plain variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.plain.classes).toContain("text-primary");
    expect(KUMO_LINK_VARIANTS.variant.plain.classes).not.toContain("underline");
  });

  it("should render with inline variant", () => {
    const props = {
      href: "#",
      variant: "inline" as const,
      children: "Inline link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should render with current variant", () => {
    const props = {
      href: "#",
      variant: "current" as const,
      children: "Current link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should render with plain variant", () => {
    const props = {
      href: "#",
      variant: "plain" as const,
      children: "Plain link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should accept className prop", () => {
    const props = {
      href: "#",
      className: "custom-class",
      children: "Custom link",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should generate variant classes via linkVariants helper", () => {
    expect(linkVariants({ variant: "inline" })).toContain("text-primary");
    expect(linkVariants({ variant: "current" })).toContain("text-current");
    expect(linkVariants({ variant: "plain" })).toContain("text-primary");
  });

  it("should default to inline variant", () => {
    expect(linkVariants()).toContain("text-primary");
    expect(linkVariants()).toContain("underline");
  });

  it("should have ExternalIcon subcomponent", () => {
    expect(Link.ExternalIcon).toBeDefined();
  });

  it("should render with ExternalIcon as child", () => {
    const props = {
      href: "https://cloudflare.com",
      target: "_blank",
      rel: "noopener noreferrer",
      children: [
        "Visit Cloudflare ",
        createElement(Link.ExternalIcon, { key: "icon" }),
      ],
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });

  it("should render with render prop for composition", () => {
    const customAnchor = createElement("a", { href: "/dashboard" });
    const props = {
      render: customAnchor,
      variant: "inline" as const,
      children: "Dashboard",
    };
    expect(() => createElement(Link, props)).not.toThrow();
  });
});
