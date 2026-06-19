import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tabs } from "./tabs";

function setReducedMotionPreference(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("Tabs", () => {
  const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollIntoView",
  );
  const originalMatchMediaDescriptor = Object.getOwnPropertyDescriptor(
    window,
    "matchMedia",
  );

  afterEach(() => {
    if (originalScrollIntoViewDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "scrollIntoView",
        originalScrollIntoViewDescriptor,
      );
    } else {
      delete HTMLElement.prototype.scrollIntoView;
    }
    if (originalMatchMediaDescriptor) {
      Object.defineProperty(window, "matchMedia", originalMatchMediaDescriptor);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
    vi.restoreAllMocks();
  });

  it("scrolls selected tabs smoothly by default", () => {
    setReducedMotionPreference(false);
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    render(
      <Tabs
        variant="underline"
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "settings", label: "Settings" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  });

  it("avoids smooth tab scrolling when reduced motion is preferred", () => {
    setReducedMotionPreference(true);
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    render(
      <Tabs
        variant="underline"
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "settings", label: "Settings" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
    });
  });
});
