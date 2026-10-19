import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { Loader } from "./loader";

describe("Loader", () => {
  it.each([
    [undefined, "24"],
    ["sm", "16"],
    ["base", "24"],
    ["lg", "32"],
    [45, "45"],
  ] as const)("sizes via SVG attributes for size=%s", (size, expected) => {
    render(<Loader size={size} />);
    const svg = screen.getByRole("status");
    expect(svg.getAttribute("width")).toBe(expected);
    expect(svg.getAttribute("height")).toBe(expected);
  });

  // Browsers with SVG disabled (e.g. Tor Browser "Safest") create <svg> as a
  // generic Element without `.style`, so React crashes applying inline styles.
  it("does not set an inline style", () => {
    render(<Loader size="lg" />);
    expect(screen.getByRole("status").hasAttribute("style")).toBe(false);
  });

  it("renders when the svg element has no style object", () => {
    const original = Object.getOwnPropertyDescriptor(
      SVGElement.prototype,
      "style",
    );
    Object.defineProperty(SVGElement.prototype, "style", {
      configurable: true,
      get: () => undefined,
    });
    try {
      expect(() => render(<Loader />)).not.toThrow();
    } finally {
      if (original) {
        Object.defineProperty(SVGElement.prototype, "style", original);
      } else {
        delete (SVGElement.prototype as { style?: unknown }).style;
      }
    }
  });
});
