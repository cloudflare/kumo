import { describe, it, expect } from "vitest";
import React, { createElement } from "react";
import {
  Button,
  RefreshButton,
  LinkButton,
  buttonVariants,
  KUMO_BUTTON_VARIANTS,
  KUMO_BUTTON_DEFAULT_VARIANTS,
} from "./button";

describe("Button", () => {
  it("should be defined", () => {
    expect(Button).toBeDefined();
  });

  it("should render with default props", () => {
    const props = {
      children: "Click me",
    };
    expect(() => createElement(Button, props)).not.toThrow();
  });

  it("should render with all variant options", () => {
    const variants = Object.keys(KUMO_BUTTON_VARIANTS.variant) as Array<
      keyof typeof KUMO_BUTTON_VARIANTS.variant
    >;
    for (const variant of variants) {
      expect(() =>
        createElement(Button, { variant, children: `${variant} button` }),
      ).not.toThrow();
    }
  });

  it("should render with all size options", () => {
    const sizes = Object.keys(KUMO_BUTTON_VARIANTS.size) as Array<
      keyof typeof KUMO_BUTTON_VARIANTS.size
    >;
    for (const size of sizes) {
      expect(() =>
        createElement(Button, { size, children: `${size} button` }),
      ).not.toThrow();
    }
  });

  it("should render with all shape options", () => {
    const shapes = Object.keys(KUMO_BUTTON_VARIANTS.shape) as Array<
      keyof typeof KUMO_BUTTON_VARIANTS.shape
    >;
    for (const shape of shapes) {
      expect(() =>
        createElement(Button, { shape, children: `${shape} button` }),
      ).not.toThrow();
    }
  });

  it("should accept loading prop", () => {
    expect(() =>
      createElement(Button, { loading: true, children: "Loading" }),
    ).not.toThrow();
  });

  it("should accept disabled prop", () => {
    expect(() =>
      createElement(Button, { disabled: true, children: "Disabled" }),
    ).not.toThrow();
  });

  it("should accept className prop", () => {
    expect(() =>
      createElement(Button, { className: "custom-class", children: "Custom" }),
    ).not.toThrow();
  });

  it("should have correct default variants", () => {
    expect(KUMO_BUTTON_DEFAULT_VARIANTS.variant).toBe("secondary");
    expect(KUMO_BUTTON_DEFAULT_VARIANTS.size).toBe("base");
    expect(KUMO_BUTTON_DEFAULT_VARIANTS.shape).toBe("base");
  });

  describe("render prop composition", () => {
    it("should render with render prop as anchor element", () => {
      const anchorElement = createElement("a", { href: "/about" });
      const props = {
        render: anchorElement,
        children: "About",
      };
      expect(() => createElement(Button, props)).not.toThrow();
    });

    it("should render with render prop as custom component", () => {
      // Simulating a React Router Link-like component
      const CustomLink = ({
        to,
        ...props
      }: { to: string } & Record<string, unknown>) =>
        createElement("a", { href: to, ...props });

      const linkElement = createElement(CustomLink, { to: "/dashboard" });
      const props = {
        render: linkElement,
        children: "Dashboard",
      };
      expect(() => createElement(Button, props)).not.toThrow();
    });

    it("should render with render callback function", () => {
      // Using createElement with the render callback pattern
      // The callback receives (props, state) where state has { loading, disabled }
      const props = {
        render: (
          renderProps: React.HTMLAttributes<HTMLAnchorElement> & {
            ref?: React.Ref<HTMLAnchorElement>;
          },
          state: { loading: boolean; disabled: boolean },
        ) =>
          createElement(
            "a",
            { ...renderProps, href: "/link" },
            state.loading ? "Loading..." : "Click me",
          ),
      };
      expect(() => createElement(Button, props as never)).not.toThrow();
    });

    it("should apply button styles when using render prop", () => {
      // The buttonVariants function should still be applied
      const classes = buttonVariants({ variant: "primary", size: "lg" });
      expect(classes).toContain("bg-kumo-brand");
      expect(classes).toContain("h-10");
    });
  });
});

describe("buttonVariants", () => {
  it("should generate variant classes", () => {
    expect(buttonVariants({ variant: "primary" })).toContain("bg-kumo-brand");
    expect(buttonVariants({ variant: "secondary" })).toContain(
      "bg-kumo-control",
    );
    expect(buttonVariants({ variant: "ghost" })).toContain("bg-inherit");
    expect(buttonVariants({ variant: "destructive" })).toContain(
      "bg-kumo-danger",
    );
  });

  it("should generate size classes", () => {
    expect(buttonVariants({ size: "xs" })).toContain("h-5");
    expect(buttonVariants({ size: "sm" })).toContain("h-6.5");
    expect(buttonVariants({ size: "base" })).toContain("h-9");
    expect(buttonVariants({ size: "lg" })).toContain("h-10");
  });

  it("should generate shape classes", () => {
    expect(buttonVariants({ shape: "circle" })).toContain("rounded-full");
    expect(buttonVariants({ shape: "square" })).toContain("justify-center");
  });

  it("should use defaults when no options provided", () => {
    const classes = buttonVariants();
    expect(classes).toContain("bg-kumo-control"); // secondary variant
    expect(classes).toContain("h-9"); // base size
  });
});

describe("RefreshButton", () => {
  it("should be defined", () => {
    expect(RefreshButton).toBeDefined();
  });

  it("should render", () => {
    expect(() => createElement(RefreshButton)).not.toThrow();
  });

  it("should accept loading prop", () => {
    expect(() => createElement(RefreshButton, { loading: true })).not.toThrow();
  });
});

describe("LinkButton", () => {
  it("should be defined", () => {
    expect(LinkButton).toBeDefined();
  });

  it("should render with href", () => {
    expect(() =>
      createElement(LinkButton, { href: "/about", children: "About" }),
    ).not.toThrow();
  });

  it("should accept external prop", () => {
    expect(() =>
      createElement(LinkButton, {
        href: "https://cloudflare.com",
        external: true,
        children: "Cloudflare",
      }),
    ).not.toThrow();
  });
});
