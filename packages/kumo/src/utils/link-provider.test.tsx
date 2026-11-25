import { describe, it, expect } from "vite-plus/test";
import { forwardRef } from "react";
import { render, screen } from "@testing-library/react";
import {
  LinkProvider,
  ResolvedLink,
  resolveLink,
  useLink,
  type RouterLinkProps,
} from "./link-provider";

const config = {
  externalLinks: "same-tab" as const,
  hasRouter: true,
};

describe("resolveLink", () => {
  it("routes relative URLs", () => {
    expect(resolveLink({ href: "/zones" }, config)).toMatchObject({
      useRouter: true,
      href: "/zones",
      opensInNewTab: false,
    });
    expect(resolveLink({ href: "settings" }, config).useRouter).toBe(true);
    expect(resolveLink({ href: "?page=2" }, config).useRouter).toBe(true);
  });

  it("renders fragment-only hrefs as plain anchors so the browser scrolls", () => {
    expect(resolveLink({ href: "#section" }, config)).toMatchObject({
      useRouter: false,
      href: "#section",
      opensInNewTab: false,
    });
  });

  it("does not route without a router", () => {
    expect(
      resolveLink({ href: "/zones" }, { ...config, hasRouter: false })
        .useRouter,
    ).toBe(false);
  });

  it("does not route links without href", () => {
    expect(resolveLink({}, config).useRouter).toBe(false);
  });

  it("treats protocol-relative URLs as absolute", () => {
    expect(
      resolveLink(
        { href: "//example.com/a" },
        { ...config, externalLinks: "new-tab" },
      ),
    ).toMatchObject({ useRouter: false, target: "_blank" });
  });

  it("matches same-origin URLs against the configured origin", () => {
    const withOrigin = { ...config, origin: "https://dash.cloudflare.com/" };
    expect(
      resolveLink({ href: "https://dash.cloudflare.com/a?b=1#c" }, withOrigin),
    ).toMatchObject({ useRouter: true, href: "/a?b=1#c" });
    expect(
      resolveLink({ href: "https://dash.cloudflare.com:8443/a" }, withOrigin)
        .useRouter,
    ).toBe(false);
  });

  it.each([
    "/\\example.com",
    "\\\\example.com",
    "/\t/example.com",
    " https://example.com",
  ])("treats %j as external because it resolves to another host", (href) => {
    const newTab = { ...config, externalLinks: "new-tab" as const };
    expect(resolveLink({ href }, newTab)).toMatchObject({
      useRouter: false,
      href,
      target: "_blank",
      rel: "noopener",
      opensInNewTab: true,
    });
  });

  it("never treats absolute URLs as internal without origin", () => {
    expect(
      resolveLink({ href: "https://kumo.invalid/zones" }, config).useRouter,
    ).toBe(false);
  });

  it("passes the router a normalized path for unusual same-origin hrefs", () => {
    const withOrigin = { ...config, origin: "https://dash.cloudflare.com" };
    expect(
      resolveLink({ href: "\\\\dash.cloudflare.com\\zones" }, withOrigin),
    ).toMatchObject({ useRouter: true, href: "/zones" });
    expect(
      resolveLink({ href: " https://dash.cloudflare.com/zones" }, withOrigin),
    ).toMatchObject({ useRouter: true, href: "/zones" });
  });

  it("ignores an invalid origin", () => {
    expect(
      resolveLink(
        { href: "https://dash.cloudflare.com/a" },
        { ...config, origin: "not a url" },
      ).useRouter,
    ).toBe(false);
  });

  it("does not apply the new-tab policy to non-HTTP schemes", () => {
    const newTab = { ...config, externalLinks: "new-tab" as const };
    expect(resolveLink({ href: "mailto:a@example.com" }, newTab)).toMatchObject(
      { useRouter: false, opensInNewTab: false },
    );
  });

  it("passes isClientRoute a URL resolved against the origin", () => {
    let seen: URL | undefined;
    resolveLink(
      { href: "/zones?q=1" },
      {
        ...config,
        origin: "https://dash.cloudflare.com",
        isClientRoute: (url) => {
          seen = url;
          return true;
        },
      },
    );
    expect(seen?.href).toBe("https://dash.cloudflare.com/zones?q=1");
  });

  it("treats an empty target like _self", () => {
    expect(
      resolveLink(
        { href: "https://example.com", target: "" },
        { ...config, externalLinks: "new-tab" },
      ),
    ).toMatchObject({ target: "_blank", opensInNewTab: true });
    expect(resolveLink({ href: "/a", target: "" }, config)).toMatchObject({
      useRouter: true,
      target: undefined,
      opensInNewTab: false,
    });
  });

  it("matches target keywords case-insensitively", () => {
    expect(resolveLink({ href: "/a", target: "_SELF" }, config)).toMatchObject({
      useRouter: true,
      opensInNewTab: false,
    });
    expect(
      resolveLink({ href: "/a", target: "_Blank" }, config).opensInNewTab,
    ).toBe(true);
    expect(
      resolveLink({ href: "/a", target: "_TOP" }, config).opensInNewTab,
    ).toBe(false);
  });

  it("treats named targets as new tabs but not _parent or _top", () => {
    expect(
      resolveLink({ href: "/a", target: "preview" }, config),
    ).toMatchObject({
      useRouter: false,
      opensInNewTab: true,
      rel: "noopener",
    });
    expect(
      resolveLink({ href: "/a", target: "_top" }, config).opensInNewTab,
    ).toBe(false);
  });

  it("skips the router only when the link downloads", () => {
    const routes = (download?: boolean | string | null) =>
      resolveLink({ href: "/report.csv", download }, config).useRouter;
    expect(routes(true)).toBe(false);
    expect(routes("")).toBe(false);
    expect(routes("report.csv")).toBe(false);
    expect(routes(false)).toBe(true);
    expect(routes(null)).toBe(true);
    expect(routes()).toBe(true);
  });

  it("adds noopener to a caller's rel on new-tab links", () => {
    const newTab = (rel?: string) =>
      resolveLink({ href: "/a", target: "_blank", rel }, config).rel;
    expect(newTab()).toBe("noopener");
    expect(newTab("external nofollow")).toBe("external nofollow noopener");
    expect(newTab("noreferrer")).toBe("noreferrer");
    expect(newTab("NoOpener")).toBe("NoOpener");
    expect(newTab("opener")).toBe("opener");
  });

  it("leaves rel alone on same-tab links", () => {
    expect(resolveLink({ href: "/a" }, config).rel).toBeUndefined();
    expect(resolveLink({ href: "/a", rel: "nofollow" }, config).rel).toBe(
      "nofollow",
    );
  });
});

describe("useLink", () => {
  const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
    function RouterLink(props, ref) {
      // oxlint-disable-next-line anchor-has-content
      return <a ref={ref} data-router="" {...props} />;
    },
  );

  function ZoneCard({ href, name }: { href: string; name: string }) {
    const { Component, linkProps, newTabCue } = useLink({ href });
    return (
      <Component {...linkProps} className="card">
        {name}
        {newTabCue}
      </Component>
    );
  }

  it("returns the router component for internal routes", () => {
    render(
      <LinkProvider router={RouterLink}>
        <ZoneCard href="/zones/1" name="example.com" />
      </LinkProvider>,
    );

    const link = screen.getByRole("link", { name: "example.com" });
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.className).toBe("card");
  });

  it("returns an anchor and a new-tab cue for external links", () => {
    render(
      <LinkProvider router={RouterLink} externalLinks="new-tab">
        <ZoneCard href="https://example.com" name="example.com" />
      </LinkProvider>,
    );

    const link = screen.getByRole("link", {
      name: "example.com (opens in a new tab)",
    });
    expect(link.hasAttribute("data-router")).toBe(false);
    expect(link.getAttribute("target")).toBe("_blank");
  });
});

describe("ResolvedLink", () => {
  const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
    function RouterLink(props, ref) {
      // oxlint-disable-next-line anchor-has-content
      return <a ref={ref} data-router="" {...props} />;
    },
  );

  it("renders internal routes through the router without Kumo styles", () => {
    render(
      <LinkProvider router={RouterLink}>
        <ResolvedLink href="/zones/1" className="card">
          example.com
        </ResolvedLink>
      </LinkProvider>,
    );

    const link = screen.getByRole("link", { name: "example.com" });
    expect(link.hasAttribute("data-router")).toBe(true);
    expect(link.className).toBe("card");
  });

  it("includes the new-tab announcement", () => {
    render(
      <LinkProvider router={RouterLink} externalLinks="new-tab">
        <ResolvedLink href="https://example.com">example.com</ResolvedLink>
      </LinkProvider>,
    );

    const link = screen.getByRole("link", {
      name: "example.com (opens in a new tab)",
    });
    expect(link.hasAttribute("data-router")).toBe(false);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("forwards its ref to the anchor", () => {
    const ref = { current: null as HTMLAnchorElement | null };
    render(
      <ResolvedLink ref={ref} href="https://example.com">
        Docs
      </ResolvedLink>,
    );
    expect(ref.current?.tagName).toBe("A");
  });
});

describe("nested LinkProvider", () => {
  it("starts from the defaults instead of inheriting the outer settings", () => {
    render(
      <LinkProvider externalLinks="new-tab">
        <ResolvedLink href="https://example.com/outer">Outer</ResolvedLink>
        <LinkProvider>
          <ResolvedLink href="https://example.com/inner">Inner</ResolvedLink>
        </LinkProvider>
      </LinkProvider>,
    );

    expect(
      screen
        .getByRole("link", { name: "Outer (opens in a new tab)" })
        .getAttribute("target"),
    ).toBe("_blank");
    expect(
      screen.getByRole("link", { name: "Inner" }).hasAttribute("target"),
    ).toBe(false);
  });
});
