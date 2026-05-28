import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Banner, bannerVariants } from "./banner";

describe("Banner", () => {
  it("supports secondary variant", () => {
    const className = bannerVariants({ variant: "secondary" });

    expect(className).toContain("bg-kumo-recessed");
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

});
