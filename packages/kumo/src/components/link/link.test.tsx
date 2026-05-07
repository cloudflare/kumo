import { describe, it, expect, vi, afterEach } from "vitest";
import { createElement, forwardRef } from "react";
import { render, screen } from "@testing-library/react";
import { Link, KUMO_LINK_VARIANTS, linkVariants } from "./link";
import { LinkProvider } from "../../utils/link-provider";

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
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain(
      "text-kumo-link",
    );
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
    expect(KUMO_LINK_VARIANTS.variant.plain.classes).toContain(
      "text-kumo-link",
    );
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
    expect(linkVariants({ variant: "inline" })).toContain("text-kumo-link");
    expect(linkVariants({ variant: "current" })).toContain("text-current");
    expect(linkVariants({ variant: "plain" })).toContain("text-kumo-link");
  });

  it("should default to inline variant", () => {
    expect(linkVariants()).toContain("text-kumo-link");
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

// ---------------------------------------------------------------------------
// href behavior — the standard, framework-agnostic prop
// ---------------------------------------------------------------------------
describe("Link with href (standard usage)", () => {
  it("renders an anchor with the correct href", () => {
    render(<Link href="/docs">Docs</Link>);
    const anchor = screen.getByRole("link", { name: "Docs" });
    expect(anchor.getAttribute("href")).toBe("/docs");
  });

  it("renders external URLs correctly with the default LinkProvider", () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        External
      </Link>,
    );
    const anchor = screen.getByRole("link", { name: "External" });
    expect(anchor.getAttribute("href")).toBe("https://example.com");
    expect(anchor.getAttribute("target")).toBe("_blank");
  });

  it("passes href through to a custom LinkProvider component", () => {
    const CustomLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(({ href, ...rest }, ref) => (
      // oxlint-disable-next-line anchor-has-content, control-has-associated-label
      <a ref={ref} href={href} data-testid="custom-link" {...rest} />
    ));
    CustomLink.displayName = "CustomLink";

    render(
      <LinkProvider component={CustomLink}>
        <Link href="https://example.com">External</Link>
      </LinkProvider>,
    );

    const anchor = screen.getByTestId("custom-link");
    expect(anchor.getAttribute("href")).toBe("https://example.com");
  });
});

// ---------------------------------------------------------------------------
// LinkProvider — application-layer routing integration
// ---------------------------------------------------------------------------
describe("LinkProvider", () => {
  it("uses the default <a> element when no provider is configured", () => {
    render(<Link href="/about">About</Link>);
    const el = screen.getByRole("link", { name: "About" });
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("href")).toBe("/about");
  });

  it("renders the custom component from LinkProvider", () => {
    const RouterLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(({ href, children, ...rest }, ref) => (
      <a ref={ref} href={href} data-router="true" {...rest}>
        {children}
      </a>
    ));
    RouterLink.displayName = "RouterLink";

    render(
      <LinkProvider component={RouterLink}>
        <Link href="/dashboard">Dashboard</Link>
      </LinkProvider>,
    );

    const anchor = screen.getByRole("link", { name: "Dashboard" });
    expect(anchor.getAttribute("data-router")).toBe("true");
    expect(anchor.getAttribute("href")).toBe("/dashboard");
  });

  it("the custom LinkProvider component receives href for external URLs", () => {
    /**
     * This test documents the correct integration pattern: the LinkProvider
     * component should handle href correctly for both internal and external URLs.
     * If the consumer's router mishandles external URLs via href, the fix belongs
     * in the LinkProvider wrapper — not in Kumo's Link component.
     */
    const AppLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(({ href, ...rest }, ref) => {
      // A well-written LinkProvider wrapper detects external URLs
      // and renders a plain <a> for them.
      const isExternal = href?.startsWith("http");
      if (isExternal) {
        // oxlint-disable-next-line anchor-has-content, control-has-associated-label
        return <a ref={ref} href={href} {...rest} />;
      }
      // Internal URLs get routed via the framework
      // oxlint-disable-next-line anchor-has-content, control-has-associated-label
      return <a ref={ref} href={href} data-routed="true" {...rest} />;
    });
    AppLink.displayName = "AppLink";

    render(
      <LinkProvider component={AppLink}>
        <Link href="https://example.com">External</Link>
        <Link href="/internal">Internal</Link>
      </LinkProvider>,
    );

    const external = screen.getByRole("link", { name: "External" });
    expect(external.getAttribute("href")).toBe("https://example.com");
    expect(external.getAttribute("data-routed")).toBeNull();

    const internal = screen.getByRole("link", { name: "Internal" });
    expect(internal.getAttribute("href")).toBe("/internal");
    expect(internal.getAttribute("data-routed")).toBe("true");
  });
});

// ---------------------------------------------------------------------------
// render prop — bypasses LinkProvider entirely
// ---------------------------------------------------------------------------
describe("Link with render prop", () => {
  it("bypasses LinkProvider when render is provided", () => {
    const SpyLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >((props, ref) => (
      // oxlint-disable-next-line anchor-has-content, control-has-associated-label
      <a ref={ref} data-spy="true" {...props} />
    ));
    SpyLink.displayName = "SpyLink";

    render(
      <LinkProvider component={SpyLink}>
        {/* oxlint-disable anchor-has-content, control-has-associated-label */}
        <Link render={<a href="/direct" />}>Direct</Link>
        {/* oxlint-enable anchor-has-content, control-has-associated-label */}
      </LinkProvider>,
    );

    const anchor = screen.getByRole("link", { name: "Direct" });
    // render prop element is used instead of LinkProvider's component
    expect(anchor.getAttribute("data-spy")).toBeNull();
    expect(anchor.getAttribute("href")).toBe("/direct");
  });
});

// ---------------------------------------------------------------------------
// `to` prop deprecation
// ---------------------------------------------------------------------------
describe("Link `to` prop deprecation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still renders when `to` is used (backwards compatibility)", () => {
    // Suppress the expected deprecation warning
    vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Link to="/legacy">Legacy</Link>);
    const anchor = screen.getByRole("link", { name: "Legacy" });
    // DefaultLinkComponent resolves href ?? to, so `to` still works
    expect(anchor.getAttribute("href")).toBe("/legacy");
  });

  it("emits a deprecation warning in development when `to` is used", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Link to="/old-style">Old</Link>);

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("The `to` prop is deprecated"),
    );
  });

  it("does not emit a deprecation warning when only `href` is used", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Link href="/new-style">New</Link>);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Documents the recommended LinkProvider integration pattern
// ---------------------------------------------------------------------------
describe("LinkProvider integration patterns", () => {
  it("a well-written wrapper maps href to the router's navigation prop", () => {
    /**
     * The correct pattern: the LinkProvider wrapper receives `href` (the
     * web-standard prop) and maps it to whatever the router expects.
     * This keeps Kumo framework-agnostic — routing logic stays in the app.
     */
    const AppRouterLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(({ href, to, children, ...rest }, ref) => (
      <a ref={ref} href={href ?? to} data-routed="true" {...rest}>
        {children}
      </a>
    ));
    AppRouterLink.displayName = "AppRouterLink";

    render(
      <LinkProvider component={AppRouterLink}>
        <Link href="https://example.com">External</Link>
        <Link href="/internal">Internal</Link>
      </LinkProvider>,
    );

    const external = screen.getByRole("link", { name: "External" });
    expect(external.getAttribute("href")).toBe("https://example.com");

    const internal = screen.getByRole("link", { name: "Internal" });
    expect(internal.getAttribute("href")).toBe("/internal");
    expect(internal.getAttribute("data-routed")).toBe("true");
  });

  it("a wrapper that only reads `to` will not receive the destination from href", () => {
    /**
     * This test documents the footgun: if a LinkProvider component only
     * destructures `to` and ignores `href`, then <Link href="..."> will
     * not navigate correctly. Router components (e.g. React Router's <Link>)
     * typically read `to` for navigation and ignore `href`.
     *
     * The solution is NOT to add `to` to Kumo's Link API. Instead, the
     * LinkProvider wrapper must map `href` → `to` at the application layer.
     */
    const ToOnlyLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
    >(({ to, children, ...rest }, ref) => (
      // Simulates a router component that only reads `to` for navigation.
      // `href` falls through via ...rest here, but a real router component
      // would not pass unknown props to the DOM — it would be silently lost.
      <a ref={ref} data-navigated-to={to ?? "none"} {...rest}>
        {children}
      </a>
    ));
    ToOnlyLink.displayName = "ToOnlyLink";

    render(
      <LinkProvider component={ToOnlyLink}>
        <Link href="https://example.com">Test Link</Link>
      </LinkProvider>,
    );

    const anchor = screen.getByText("Test Link");
    // The wrapper never saw the URL via `to` — it was passed as `href`
    // which the wrapper ignores for navigation purposes.
    expect(anchor.getAttribute("data-navigated-to")).toBe("none");
  });
});
