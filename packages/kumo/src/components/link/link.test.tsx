import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { createElement, createRef, forwardRef } from "react";
import { render, screen } from "@testing-library/react";
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
  it("renders an anchor with the correct href", () => {
    render(<Link href="/docs">Docs</Link>);
    const anchor = screen.getByRole("link", { name: "Docs" });
    expect(anchor.getAttribute("href")).toBe("/docs");
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

describe("Link.ExternalIcon new-tab announcement", () => {
  it("adds screen-reader text to the link's accessible name", () => {
    render(
      <Link href="https://example.com" target="_blank">
        Docs <Link.ExternalIcon />
      </Link>,
    );
    expect(
      screen.getByRole("link", { name: "Docs (opens in a new tab)" }),
    ).toBeTruthy();
  });

  it("does not change links without the icon", () => {
    render(
      <Link href="https://example.com" target="_blank">
        Docs
      </Link>,
    );
    expect(screen.getByRole("link", { name: "Docs" })).toBeTruthy();
  });

  it("uses the localized announcement", () => {
    render(
      <KumoLocaleProvider
        translations={{
          link: { opensInNewTab: "(se abre en una pestaña nueva)" },
        }}
      >
        <Link href="https://example.com" target="_blank">
          Documentación <Link.ExternalIcon />
        </Link>
      </KumoLocaleProvider>,
    );
    expect(
      screen.getByRole("link", {
        name: "Documentación (se abre en una pestaña nueva)",
      }),
    ).toBeTruthy();
  });

  it("accepts a label override", () => {
    render(
      <Link href="https://example.com" target="_blank">
        Docs <Link.ExternalIcon label="(external site)" />
      </Link>,
    );
    expect(
      screen.getByRole("link", { name: "Docs (external site)" }),
    ).toBeTruthy();
  });
});

describe("Link external", () => {
  it("opens in a new tab and adds one localized warning and decorative indicator", () => {
    render(
      <Link href="https://example.com" external>
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: "Docs (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(1);
    expect(link.querySelectorAll(".sr-only")).toHaveLength(1);
    expect(link.hasAttribute("external")).toBe(false);
  });

  it("keeps defaults when optional target and rel props are undefined", () => {
    render(
      <Link
        href="https://example.com"
        external
        target={undefined}
        rel={undefined}
      >
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: "Docs (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("supports localized warning copy through KumoLocaleProvider", () => {
    render(
      <KumoLocaleProvider
        translations={{
          link: { opensInNewTab: "(se abre en una pestaña nueva)" },
        }}
      >
        <Link href="https://example.com" external>
          Documentación
        </Link>
      </KumoLocaleProvider>,
    );
    expect(
      screen.getByRole("link", {
        name: "Documentación (se abre en una pestaña nueva)",
      }),
    ).toBeTruthy();
  });

  it("does not warn or add an indicator when the target is explicitly the current tab", () => {
    render(
      <Link href="https://example.com" external target="_self" rel="nofollow">
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_self");
    expect(link.getAttribute("rel")).toBe("nofollow");
    expect(link.querySelector("svg")).toBeNull();
    expect(link.querySelector(".sr-only")).toBeNull();
  });

  it("recognizes _blank case-insensitively and respects an explicit rel", () => {
    render(
      <Link
        href="https://example.com"
        external
        target="_BLANK"
        rel="noopener nofollow"
      >
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: "Docs (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_BLANK");
    expect(link.getAttribute("rel")).toBe("noopener nofollow");
  });

  it("removes external behavior when a boolean external prop becomes false", () => {
    const { rerender } = render(
      <Link href="/docs" external>
        Docs
      </Link>,
    );
    expect(
      screen.getByRole("link", { name: "Docs (opens in a new tab)" }),
    ).toBeTruthy();
    rerender(
      <Link href="/docs" external={false}>
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.hasAttribute("target")).toBe(false);
    expect(link.hasAttribute("rel")).toBe(false);
    expect(link.querySelector(".sr-only")).toBeNull();
  });

  it("does not infer external behavior from a raw target prop", () => {
    render(
      <Link href="https://example.com" target="_blank">
        Docs
      </Link>,
    );
    expect(
      screen.getByRole("link", { name: "Docs" }).querySelector(".sr-only"),
    ).toBeNull();
  });

  it("preserves explicit accessible names and consumer descriptions", () => {
    render(
      <>
        <span id="format" hidden>
          PDF document.
        </span>
        <Link
          href="/docs"
          external
          aria-label="Documentation"
          aria-describedby="format"
          aria-description="Additional context"
        >
          Docs
        </Link>
      </>,
    );
    const link = screen.getByRole("link", {
      name: "Documentation",
      description: "PDF document.",
    });
    expect(link.getAttribute("aria-label")).toBe("Documentation");
    expect(link.getAttribute("aria-describedby")).toBe("format");
    expect(link.getAttribute("aria-description")).toBe("Additional context");
  });

  it("retains the meaningful name of a title-bearing icon link with an explicit label", () => {
    render(
      <Link
        href="/docs"
        external
        title="Documentation"
        aria-label="Documentation (opens in a new tab)"
      >
        <svg aria-hidden="true" />
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: "Documentation (opens in a new tab)",
    });
    expect(link.getAttribute("title")).toBe("Documentation");
    expect(link.getAttribute("aria-label")).toBe(
      "Documentation (opens in a new tab)",
    );
  });

  it("retains an icon link's aria-labelledby association and naming precedence", () => {
    render(
      <>
        <span id="documentation-name" className="sr-only">
          Documentation (opens in a new tab)
        </span>
        <Link
          href="/docs"
          external
          title="Documentation"
          aria-label="Other name"
          aria-labelledby="documentation-name"
        >
          <svg aria-hidden="true" />
        </Link>
      </>,
    );
    const link = screen.getByRole("link", {
      name: "Documentation (opens in a new tab)",
    });
    expect(link.getAttribute("aria-labelledby")).toBe("documentation-name");
    expect(link.getAttribute("aria-label")).toBe("Other name");
  });

  it("does not replace meaningful visible text with an explanatory title", () => {
    render(
      <Link href="/docs" external title="PDF document">
        Download documentation
      </Link>,
    );
    expect(
      screen.getByRole("link", {
        name: "Download documentation (opens in a new tab)",
        description: "PDF document",
      }),
    ).toBeTruthy();
  });

  it("retains the pill shape around an external Badge link", () => {
    render(
      <Link href="/changelog" external variant="plain">
        <Badge variant="outline">View changelog</Badge>
      </Link>,
    );
    expect(screen.getByRole("link").classList).toContain(
      "has-[>span>[data-kumo-component=Badge]]:rounded-full",
    );
  });

  it("passes external behavior through a forwarding LinkProvider", () => {
    const RouterLink = forwardRef<
      HTMLAnchorElement,
      React.AnchorHTMLAttributes<HTMLAnchorElement>
    >(({ children, ...props }, ref) => (
      <a {...props} ref={ref} data-router="true">
        {children}
      </a>
    ));
    RouterLink.displayName = "ExternalRouterLink";
    render(
      <LinkProvider component={RouterLink}>
        <Link href="/docs" external>
          Docs
        </Link>
      </LinkProvider>,
    );
    expect(
      screen
        .getByRole("link", { name: "Docs (opens in a new tab)" })
        .getAttribute("data-router"),
    ).toBe("true");
  });

  it("preserves Base UI render-element composition and ref forwarding", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="/docs" external render={<a data-rendered="true" />}>
        Docs
      </Link>,
    );
    const link = screen.getByRole("link", {
      name: "Docs (opens in a new tab)",
    });
    expect(link.getAttribute("data-rendered")).toBe("true");
    expect(ref.current).toBe(link);
  });

  it("preserves Base UI render-callback composition", () => {
    render(
      <Link
        href="/docs"
        external
        render={(props) => <a {...props} data-rendered="true" />}
      >
        Docs
      </Link>,
    );
    expect(
      screen
        .getByRole("link", { name: "Docs (opens in a new tab)" })
        .getAttribute("data-rendered"),
    ).toBe("true");
  });
});

describe("Link with provider navigation defaults", () => {
  // Stratus's AppLink applies external-navigation defaults before spreading
  // incoming anchor props, so absent props must stay absent to preserve them.
  const DefaultingLink = forwardRef<
    HTMLAnchorElement,
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  >((props, ref) => (
    // oxlint-disable-next-line anchor-has-content, control-has-associated-label
    <a target="_blank" rel="noreferrer" {...props} ref={ref} />
  ));
  DefaultingLink.displayName = "DefaultingLink";

  it.each([
    { name: "omitted", props: {} },
    { name: "undefined", props: { target: undefined, rel: undefined } },
    { name: "external false", props: { external: false } },
  ])(
    "preserves provider navigation defaults when props are $name",
    ({ props }) => {
      render(
        <LinkProvider component={DefaultingLink}>
          <Link href="https://example.com" {...props}>
            Docs
          </Link>
        </LinkProvider>,
      );
      const link = screen.getByRole("link", { name: "Docs" });
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noreferrer");
      expect(link.querySelector(".sr-only")).toBeNull();
      expect(link.querySelector(".link-external-icon")).toBeNull();
    },
  );

  it("honors an explicit target without erasing the provider's rel default", () => {
    render(
      <LinkProvider component={DefaultingLink}>
        <Link href="https://example.com" target="_self">
          Docs
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_self");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("honors an explicit rel without erasing the provider's target default", () => {
    render(
      <LinkProvider component={DefaultingLink}>
        <Link href="https://example.com" rel="noopener nofollow">
          Docs
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener nofollow");
  });

  it("passes explicit external behavior and its warning through the provider", () => {
    render(
      <LinkProvider component={DefaultingLink}>
        <Link href="https://example.com" external>
          Docs
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", {
      name: "Docs (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelectorAll(".sr-only")).toHaveLength(1);
    expect(link.querySelectorAll(".link-external-icon")).toHaveLength(1);
  });
});

describe("Link.ExternalIcon icon-only naming", () => {
  it("keeps a title-bearing icon link identifiable through an explicit aria-label", () => {
    render(
      <Link
        href="/docs"
        target="_blank"
        title="Documentation"
        aria-label="Documentation (opens in a new tab)"
      >
        <svg aria-hidden="true" />
        <Link.ExternalIcon />
      </Link>,
    );
    expect(
      screen.getByRole("link", { name: "Documentation (opens in a new tab)" }),
    ).toBeTruthy();
  });

  it("keeps a title-bearing icon link identifiable through aria-labelledby", () => {
    render(
      <>
        <span id="manual-icon-name" className="sr-only">
          Documentation (opens in a new tab)
        </span>
        <Link
          href="/docs"
          target="_blank"
          title="Documentation"
          aria-labelledby="manual-icon-name"
        >
          <svg aria-hidden="true" />
          <Link.ExternalIcon />
        </Link>
      </>,
    );
    expect(
      screen.getByRole("link", { name: "Documentation (opens in a new tab)" }),
    ).toBeTruthy();
  });
});
