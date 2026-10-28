import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { createElement, createRef, forwardRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Link, KUMO_LINK_VARIANTS, linkVariants } from "./link";
import { Badge } from "../badge/badge";
import { LinkProvider } from "../../utils/link-provider";
import { KumoLocaleProvider } from "../../utils/locale-provider";

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

  it("matches the pill shape of a direct Badge child", () => {
    render(
      <Link href="/changelog" variant="plain">
        <Badge variant="outline">View changelog</Badge>
      </Link>,
    );

    expect(screen.getByRole("link").classList).toContain(
      "has-[>[data-kumo-component=Badge]]:rounded-full",
    );
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
  it("keeps ordinary same-tab links unchanged", () => {
    render(<Link href="/docs">Docs</Link>);
    const anchor = screen.getByRole("link", { name: "Docs" });
    expect(anchor.getAttribute("href")).toBe("/docs");
    expect(anchor.getAttribute("aria-describedby")).toBeNull();
  });

  it("renders external URLs correctly with the default LinkProvider", () => {
    render(
      <Link
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        External
      </Link>,
    );
    const anchor = screen.getByRole("link", {
      name: "External",
      description: "Opens in a new tab",
    });
    expect(anchor.getAttribute("href")).toBe("https://example.com");
    expect(anchor.getAttribute("target")).toBe("_blank");
  });

  it("describes a direct blank-target link without changing its name", () => {
    render(
      <Link href="https://example.com" target="_blank">
        Documentation
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: "Documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("uses the localized new-tab announcement", () => {
    render(
      <KumoLocaleProvider
        translations={{
          link: { opensInNewTab: "Se abre en una pestaña nueva" },
        }}
      >
        <Link href="https://example.com" target="_blank">
          Documentación
        </Link>
      </KumoLocaleProvider>,
    );

    expect(
      screen.getByRole("link", {
        name: "Documentación",
        description: "Se abre en una pestaña nueva",
      }),
    ).toBeTruthy();
  });

  it("preserves a consumer description when automatic warning is disabled", () => {
    render(
      <>
        <span id="custom-description">Opens in another browsing context</span>
        <Link
          href="https://example.com"
          target="_blank"
          announceNewTab={false}
          aria-describedby="custom-description"
        >
          Documentation
        </Link>
      </>,
    );

    expect(
      screen.getByRole("link", {
        name: "Documentation",
        description: "Opens in another browsing context",
      }),
    ).toBeTruthy();
  });

  it("describes a new tab selected by a composed router", () => {
    render(
      <Link render={<a href="https://example.com" target="_blank" />}>
        Documentation
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: "Documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("announces the composed target when it overrides the Link target", () => {
    render(
      <Link
        render={<a href="https://example.com" target="_blank" />}
        target="_self"
      >
        Documentation
      </Link>,
    );

    const link = screen.getByRole("link", {
      name: "Documentation",
      description: "Opens in a new tab",
    });
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("does not describe a Link target overridden by a composed same-tab target", () => {
    render(
      <Link
        render={<a href="https://example.com" target="_self" />}
        target="_blank"
      >
        Documentation
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Documentation" });
    expect(link.getAttribute("target")).toBe("_self");
    expect(link.getAttribute("aria-describedby")).toBeNull();
  });

  it("preserves names, descriptions, and children supplied by a composed link", () => {
    render(
      <>
        <span id="composed-label">Composed documentation</span>
        <span id="composed-description">Router-provided context</span>
        <Link
          target="_self"
          aria-label="Link-provided label"
          aria-describedby="link-description"
          render={
            <a
              href="https://example.com"
              target="_blank"
              aria-labelledby="composed-label"
              aria-describedby="composed-description"
            >
              Composed child
            </a>
          }
        >
          Link child
        </Link>
      </>,
    );

    const link = screen.getByRole("link", {
      name: "Composed documentation",
      description: "Router-provided context Opens in a new tab",
    });
    expect(link.textContent).toContain("Composed child");
    expect(link.getAttribute("aria-label")).toBe("Link-provided label");
    expect(link.getAttribute("aria-labelledby")).toBe("composed-label");
    expect(link.getAttribute("aria-describedby")?.split(" ")[0]).toBe(
      "composed-description",
    );
  });

  it("can announce a target selected by a render callback", () => {
    render(
      <Link
        announceNewTab
        render={(renderProps) => (
          <a {...renderProps} href="https://example.com" target="_blank" />
        )}
      >
        Callback documentation
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: "Callback documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("preserves an authored aria-label while adding the description", () => {
    render(
      <Link
        href="https://example.com"
        target="_blank"
        aria-label="Open documentation"
      >
        Docs
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: "Open documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("preserves an authored aria-labelledby name while adding the description", () => {
    render(
      <>
        <span id="documentation-label">Open documentation</span>
        <Link
          href="https://example.com"
          target="_blank"
          aria-labelledby="documentation-label"
        >
          Docs
        </Link>
      </>,
    );

    expect(
      screen.getByRole("link", {
        name: "Open documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("preserves aria-labelledby precedence when both naming attributes exist", () => {
    render(
      <>
        <span id="documentation-label">Open labelled documentation</span>
        <Link
          href="https://example.com"
          target="_blank"
          aria-label="Ignored label"
          aria-labelledby="documentation-label"
        >
          Docs
        </Link>
      </>,
    );

    expect(
      screen.getByRole("link", {
        name: "Open labelled documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("recognizes browsing-context keywords case-insensitively", () => {
    render(
      <Link href="https://example.com" target="_BLANK">
        Documentation
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: "Documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("preserves a native title fallback name for an icon-only link", () => {
    render(
      <Link
        href="https://example.com/docs"
        target="_blank"
        title="Documentation"
      >
        <svg aria-hidden="true" />
      </Link>,
    );

    expect(
      screen.getByRole("link", {
        name: "Documentation",
        description: "Opens in a new tab",
      }),
    ).toBeTruthy();
  });

  it("preserves existing aria-describedby references before the warning", () => {
    render(
      <>
        <span id="documentation-context">Requires authentication</span>
        <Link
          href="https://example.com"
          target="_blank"
          aria-describedby="documentation-context"
        >
          Documentation
        </Link>
      </>,
    );

    const link = screen.getByRole("link", {
      name: "Documentation",
      description: "Requires authentication Opens in a new tab",
    });
    expect(link.getAttribute("aria-describedby")?.split(" ")[0]).toBe(
      "documentation-context",
    );
  });

  it("preserves aria-description when adding the warning", () => {
    render(
      <Link
        href="https://example.com"
        target="_blank"
        aria-description="Requires authentication"
      >
        Documentation
      </Link>,
    );

    const link = screen.getByRole("link", {
      name: "Documentation",
      description: "Requires authentication Opens in a new tab",
    });
    expect(link.getAttribute("aria-description")).toBe(
      "Requires authentication",
    );
  });

  it("preserves composed refs and event handlers", () => {
    const linkRef = createRef<HTMLAnchorElement>();
    const linkClick = vi.fn();
    const renderClick = vi.fn();

    render(
      <Link
        ref={linkRef}
        target="_blank"
        onClick={linkClick}
        render={
          <a href="https://example.com" onClick={renderClick}>
            Documentation
          </a>
        }
      />,
    );

    const link = screen.getByRole("link", {
      name: "Documentation",
      description: "Opens in a new tab",
    });
    fireEvent.click(link);
    expect(linkRef.current).toBe(link);
    expect(linkClick).toHaveBeenCalledOnce();
    expect(renderClick).toHaveBeenCalledOnce();
  });

  it("forwards the new-tab description through a custom LinkProvider", () => {
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
        <Link href="https://example.com" target="_blank">
          External
        </Link>
      </LinkProvider>,
    );

    const anchor = screen.getByRole("link", {
      name: "External",
      description: "Opens in a new tab",
    });
    expect(anchor.getAttribute("href")).toBe("https://example.com");
    expect(anchor.getAttribute("data-testid")).toBe("custom-link");
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
