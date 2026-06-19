import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Banner, bannerVariants } from "./banner";

describe("Banner", () => {
  it("supports secondary variant", () => {
    const className = bannerVariants({ variant: "secondary" });

    expect(className).toContain("bg-kumo-contrast/5");
    expect(className).toContain("text-kumo-subtle");
  });

  it("forwards root div props", () => {
    render(
      <Banner
        role="status"
        data-testid="banner"
        aria-live="polite"
        title="System status"
      />,
    );

    const banner = screen.getByTestId("banner");
    expect(banner.getAttribute("role")).toBe("status");
    expect(banner.getAttribute("aria-live")).toBe("polite");
    expect(banner.textContent).toBe("System status");
  });

  it("forces structured banner icons to be decorative", () => {
    render(
      <Banner
        title="System status"
        icon={
          <svg data-testid="banner-icon" aria-label="Info" focusable="true" />
        }
      />,
    );

    const icon = screen.getByTestId("banner-icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("focusable")).toBe("false");
  });

  it("forces legacy banner icons to be decorative", () => {
    render(
      <Banner icon={<svg data-testid="legacy-banner-icon" />}>
        Legacy status
      </Banner>,
    );

    const icon = screen.getByTestId("legacy-banner-icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(icon.getAttribute("focusable")).toBe("false");
  });
});
