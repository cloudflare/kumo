import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Badge,
  badgeVariants,
  KUMO_BADGE_VARIANTS,
} from "./badge";

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

  it("merges custom className", () => {
    render(<Badge className="my-custom">Tag</Badge>);
    const el = screen.getByText("Tag");
    expect(el.className).toContain("my-custom");
  });

  describe("filled appearance (default)", () => {
    it("applies variant classes for filled badges", () => {
      render(<Badge variant="error">Error</Badge>);
      const el = screen.getByText("Error");
      expect(el.className).toContain("bg-kumo-danger-tint/60");
    });

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
      expect(dot!.className).toContain("bg-kumo-badge-green");
    });

    it("applies dot appearance classes instead of variant classes", () => {
      render(
        <Badge variant="error" appearance="dot">
          Down
        </Badge>,
      );
      const badge = screen.getByText("Down").closest("span")!;
      // Dot appearance overrides variant bg/text
      expect(badge.className).toContain("bg-transparent");
      expect(badge.className).toContain("text-kumo-default");
      // Should NOT contain the filled error classes
      expect(badge.className).not.toContain("bg-kumo-danger-tint/60");
    });

    it("renders correct dot color per variant", () => {
      const cases = [
        { variant: "success" as const, expected: "bg-kumo-badge-green" },
        { variant: "warning" as const, expected: "bg-kumo-badge-orange" },
        { variant: "error" as const, expected: "bg-kumo-badge-red" },
        { variant: "neutral" as const, expected: "bg-kumo-badge-neutral" },
      ];

      for (const { variant, expected } of cases) {
        const { unmount } = render(
          <Badge variant={variant} appearance="dot">
            {variant}
          </Badge>,
        );
        const badge = screen.getByText(variant).closest("span")!;
        const dot = badge.querySelector("[aria-hidden='true']");
        expect(dot, `dot should exist for variant="${variant}"`).toBeTruthy();
        expect(
          dot!.className,
          `dot class for variant="${variant}"`,
        ).toContain(expected);
        unmount();
      }
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
  it("returns base styles with no arguments", () => {
    const result = badgeVariants();
    expect(result).toContain("inline-flex");
    expect(result).toContain("rounded-full");
  });

  it("includes variant classes for filled appearance", () => {
    const result = badgeVariants({ variant: "success" });
    expect(result).toContain("bg-kumo-success-tint/70");
  });

  it("omits variant classes for dot appearance", () => {
    const result = badgeVariants({ variant: "success", appearance: "dot" });
    expect(result).not.toContain("bg-kumo-success-tint/70");
    expect(result).toContain("bg-transparent");
  });

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

  it("every variant entry has classes and description", () => {
    for (const [dim, entries] of Object.entries(KUMO_BADGE_VARIANTS)) {
      for (const [key, entry] of Object.entries(
        entries as Record<string, { classes: string; description: string }>,
      )) {
        expect(entry.classes, `${dim}.${key}.classes`).toBeDefined();
        expect(
          typeof entry.description,
          `${dim}.${key}.description`,
        ).toBe("string");
      }
    }
  });
});
