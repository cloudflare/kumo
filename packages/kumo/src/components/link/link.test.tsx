import { describe, it, expect } from "vite-plus/test";
import { createRef, forwardRef } from "react";
import { render, screen } from "@testing-library/react";
import { Link, KUMO_LINK_VARIANTS, linkVariants } from "./link";
import { Badge } from "../badge/badge";
import {
  LinkProvider,
  type LinkProviderProps,
  type RouterLinkProps,
} from "../../utils/link-provider";
import { KumoLocaleProvider } from "../../utils/locale-provider";

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink({ href, ...props }, ref) {
    // oxlint-disable-next-line anchor-has-content
    return <a ref={ref} href={href} data-router="" {...props} />;
  },
);

function renderWithProvider(
  ui: React.ReactNode,
  props: Omit<LinkProviderProps, "children"> = {},
) {
  return render(
    <LinkProvider router={RouterLink} {...props}>
      {ui}
    </LinkProvider>,
  );
}

describe("Link variants", () => {
  it("applies inline variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain(
      "text-kumo-link",
    );
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("underline");
    expect(KUMO_LINK_VARIANTS.variant.inline.classes).toContain("link-current");
  });

  it("applies current variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain(
      "text-current",
    );
    expect(KUMO_LINK_VARIANTS.variant.current.classes).toContain("underline");
  });

  it("applies plain variant classes", () => {
    expect(KUMO_LINK_VARIANTS.variant.plain.classes).not.toContain("underline");
  });

  it("generates classes via linkVariants and defaults to inline", () => {
    expect(linkVariants({ variant: "current" })).toContain("text-current");
    expect(linkVariants()).toContain("underline");
  });

  it("merges className and keeps the Badge pill shape", () => {
    render(
      <Link href="/changelog" variant="plain" className="custom-class">
        <Badge variant="outline">View changelog</Badge>
      </Link>,
    );

    const link = screen.getByRole("link");
    expect(link.classList).toContain("custom-class");
    expect(link.classList).toContain(
      "has-[>[data-kumo-component=Badge]]:rounded-full",
    );
  });

  it("forwards refs to the anchor", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="/docs">
        Docs
      </Link>,
    );
    expect(ref.current?.tagName).toBe("A");
  });
});

describe("Link without a LinkProvider", () => {
  it("renders a plain anchor for internal and external URLs", () => {
    render(
      <>
        <Link href="/docs">Docs</Link>
        <Link href="https://example.com">Example</Link>
      </>,
    );

    expect(
      screen.getByRole("link", { name: "Docs" }).getAttribute("href"),
    ).toBe("/docs");
    const external = screen.getByRole("link", { name: "Example" });
    expect(external.getAttribute("href")).toBe("https://example.com");
    expect(external.hasAttribute("target")).toBe(false);
  });
});

describe("Link routing", () => {
  it("renders internal paths through the router with href", () => {
    renderWithProvider(<Link href="/zones?page=2#top">Zones</Link>);

    const link = screen.getByRole("link", { name: "Zones" });
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.getAttribute("href")).toBe("/zones?page=2#top");
  });

  it("renders external URLs as plain anchors in the same tab by default", () => {
    renderWithProvider(
      <Link href="https://developers.cloudflare.com">Docs</Link>,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.hasAttribute("data-router")).toBe(false);
    expect(link.hasAttribute("target")).toBe(false);
  });

  it("renders mailto:, tel:, and download links as plain anchors", () => {
    renderWithProvider(
      <>
        <Link href="mailto:a@example.com">Email</Link>
        <Link href="tel:+15555555555">Call</Link>
        <Link href="/report.csv" download>
          Report
        </Link>
      </>,
    );

    for (const name of ["Email", "Call", "Report"]) {
      expect(
        screen.getByRole("link", { name }).hasAttribute("data-router"),
      ).toBe(false);
    }
  });

  it("treats same-origin absolute URLs as internal routes when origin is set", () => {
    renderWithProvider(
      <Link href="https://dash.cloudflare.com/zones?x=1">Zones</Link>,
      { origin: "https://dash.cloudflare.com" },
    );

    const link = screen.getByRole("link", { name: "Zones" });
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.getAttribute("href")).toBe("/zones?x=1");
  });

  it("treats absolute URLs as external without origin", () => {
    renderWithProvider(
      <Link href="https://dash.cloudflare.com/zones">Zones</Link>,
    );
    expect(
      screen.getByRole("link", { name: "Zones" }).hasAttribute("data-router"),
    ).toBe(false);
  });

  it("sends paths rejected by isClientRoute to a plain anchor", () => {
    const peerApp = /^\/(?:[^/]+\/)?one(?:\/|$)/;
    renderWithProvider(
      <>
        <Link href="/abc123/one/settings">One</Link>
        <Link href="/abc123/zones">Zones</Link>
      </>,
      { isClientRoute: (url) => !peerApp.test(url.pathname) },
    );

    expect(
      screen.getByRole("link", { name: "One" }).hasAttribute("data-router"),
    ).toBe(false);
    expect(
      screen.getByRole("link", { name: "Zones" }).hasAttribute("data-router"),
    ).toBe(true);
  });

  it("does not route links with an explicit target other than _self", () => {
    renderWithProvider(
      <>
        <Link href="/zones" target="_blank">
          New
        </Link>
        <Link href="/zones" target="_self">
          Same
        </Link>
      </>,
    );

    expect(
      screen
        .getByRole("link", { name: "New (opens in a new tab)" })
        .hasAttribute("data-router"),
    ).toBe(false);
    expect(
      screen.getByRole("link", { name: "Same" }).hasAttribute("data-router"),
    ).toBe(true);
  });
});

describe("Link new-tab behaviour", () => {
  it("opens external links in a new tab with externalLinks='new-tab'", () => {
    renderWithProvider(
      <Link href="https://developers.cloudflare.com">Docs</Link>,
      {
        externalLinks: "new-tab",
      },
    );

    const link = screen.getByRole("link", {
      name: "Docs (opens in a new tab)",
    });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.querySelector("svg[aria-hidden='true']")).not.toBeNull();
  });

  it("keeps internal links in the same tab with externalLinks='new-tab'", () => {
    renderWithProvider(<Link href="/zones">Zones</Link>, {
      externalLinks: "new-tab",
    });

    const link = screen.getByRole("link", { name: "Zones" });
    expect(link.hasAttribute("target")).toBe(false);
  });

  it("lets target='_self' override the new-tab policy", () => {
    renderWithProvider(
      <Link href="https://developers.cloudflare.com" target="_self">
        Docs
      </Link>,
      { externalLinks: "new-tab" },
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_self");
    expect(link.hasAttribute("rel")).toBe(false);
    expect(link.querySelector("svg")).toBeNull();
  });

  it("respects an explicit rel", () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener">
        Example
      </Link>,
    );
    expect(
      screen
        .getByRole("link", { name: "Example (opens in a new tab)" })
        .getAttribute("rel"),
    ).toBe("noopener");
  });

  it("hides the icon with newTabIcon={false} but keeps the announcement", () => {
    render(
      <Link href="https://example.com" target="_blank" newTabIcon={false}>
        Example
      </Link>,
    );

    const link = screen.getByRole("link", {
      name: "Example (opens in a new tab)",
    });
    expect(link.querySelector("svg")).toBeNull();
  });

  it("appends the announcement to aria-label", () => {
    render(
      <Link
        href="https://example.com"
        target="_blank"
        aria-label="Documentation"
      >
        Docs
      </Link>,
    );

    expect(
      screen.getByRole("link", { name: "Documentation (opens in a new tab)" }),
    ).toBeDefined();
  });

  it("appends the announcement to aria-labelledby", () => {
    render(
      <>
        <h2 id="title">Billing guide</h2>
        <Link
          href="https://example.com"
          target="_blank"
          aria-labelledby="title"
        >
          Read
        </Link>
      </>,
    );

    expect(
      screen.getByRole("link", { name: "Billing guide (opens in a new tab)" }),
    ).toBeDefined();
  });

  it("translates the announcement through KumoLocaleProvider", () => {
    render(
      <KumoLocaleProvider
        translations={{
          link: { opensInNewTab: "(s'ouvre dans un nouvel onglet)" },
        }}
      >
        <Link href="https://example.com" target="_blank">
          Docs
        </Link>
      </KumoLocaleProvider>,
    );

    expect(
      screen.getByRole("link", {
        name: "Docs (s'ouvre dans un nouvel onglet)",
      }),
    ).toBeDefined();
  });
});
