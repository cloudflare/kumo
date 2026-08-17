import { describe, expect, it, vi } from "vite-plus/test";
import { forwardRef } from "react";
import { render, screen } from "@testing-library/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  LinkProvider,
  type LinkComponentProps,
} from "../../utils/link-provider";
import { Badge, badgeVariants, KUMO_BADGE_VARIANTS } from "./badge";

describe("Badge", () => {
  it("renders children as text content", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("renders as a <span> element", () => {
    render(<Badge>Status</Badge>);
    const el = screen.getByText("Status");
    expect(el.tagName).toBe("SPAN");
  });

  it("renders as a link when href is provided", () => {
    render(<Badge href="/docs">Docs</Badge>);
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/docs");
  });

  it("uses the component configured by LinkProvider", () => {
    const RouterLink = forwardRef<HTMLAnchorElement, LinkComponentProps>(
      ({ children, ...props }, ref) => (
        <a ref={ref} data-routed="true" {...props}>
          {children}
        </a>
      ),
    );
    RouterLink.displayName = "RouterLink";

    render(
      <LinkProvider component={RouterLink}>
        <Badge href="/workers">Workers</Badge>
      </LinkProvider>,
    );

    const link = screen.getByRole("link", { name: "Workers" });
    expect(link.getAttribute("data-routed")).toBe("true");
    expect(link.getAttribute("href")).toBe("/workers");
  });

  it("renders an icon", () => {
    render(<Badge icon={ArrowRightIcon}>Next</Badge>);
    expect(screen.getByText("Next").querySelector("svg")).toBeTruthy();
  });

  describe("filled appearance (default)", () => {
    it("does not render a dot indicator", () => {
      render(<Badge variant="success">OK</Badge>);
      const el = screen.getByText("OK");
      expect(el.querySelector("[aria-hidden]")).toBeNull();
    });
  });

  describe("dot appearance", () => {
    it("renders a dot indicator for supported variants", () => {
      render(
        <Badge variant="success" appearance="dot">
          Healthy
        </Badge>,
      );
      const badge = screen.getByText("Healthy").closest("span")!;
      const dot = badge.querySelector("[aria-hidden='true']");
      expect(dot).toBeTruthy();
    });

    it("does not render a dot for unsupported variants", () => {
      // Suppress the expected dev warning from resolveVariant
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Badge variant="primary" appearance="dot">
          No dot
        </Badge>,
      );
      const badge = screen.getByText("No dot").closest("span")!;
      const dot = badge.querySelector("[aria-hidden='true']");
      expect(dot).toBeNull();

      warn.mockRestore();
    });

    it("dot element is aria-hidden", () => {
      render(
        <Badge variant="error" appearance="dot">
          Err
        </Badge>,
      );
      const badge = screen.getByText("Err").closest("span")!;
      const dot = badge.querySelector("[aria-hidden='true']");
      expect(dot).toBeTruthy();
      expect(dot!.getAttribute("aria-hidden")).toBe("true");
    });
  });
});

describe("badgeVariants", () => {
  it("survives invalid variant without throwing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const BOGUS = "nope" as any;

    expect(() => badgeVariants({ variant: BOGUS })).not.toThrow();
    expect(typeof badgeVariants({ variant: BOGUS })).toBe("string");

    expect(() =>
      badgeVariants({ variant: BOGUS, appearance: BOGUS }),
    ).not.toThrow();
    expect(typeof badgeVariants({ appearance: BOGUS })).toBe("string");

    warn.mockRestore();
  });

  it("returns default classes for invalid variant", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(badgeVariants({ variant: "nope" as any })).toBe(badgeVariants());
    warn.mockRestore();
  });
});

describe("KUMO_BADGE_VARIANTS", () => {
  it("has variant, appearance, and dotColor dimensions", () => {
    expect(KUMO_BADGE_VARIANTS.variant).toBeDefined();
    expect(KUMO_BADGE_VARIANTS.appearance).toBeDefined();
    expect(KUMO_BADGE_VARIANTS.dotColor).toBeDefined();
  });

  it("every variant entry has a description", () => {
    for (const [dim, entries] of Object.entries(KUMO_BADGE_VARIANTS)) {
      for (const [key, entry] of Object.entries(entries)) {
        expect(typeof entry.description, `${dim}.${key}.description`).toBe(
          "string",
        );
      }
    }
  });
});
