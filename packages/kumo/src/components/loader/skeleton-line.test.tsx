import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { SkeletonLine } from "./skeleton-line";

describe("SkeletonLine", () => {
  it("renders the default skeleton-line by default", () => {
    const { container } = render(<SkeletonLine />);
    const line = container.firstElementChild as HTMLElement;
    expect(line.classList.contains("skeleton-line")).toBe(true);
    expect(line.children).toHaveLength(0);
  });

  it("renders the sketch variant with a fill, edge strokes and an outline", () => {
    const { container } = render(
      <SkeletonLine variant="sketch" minWidth={40} maxWidth={40} />,
    );
    const line = container.firstElementChild as HTMLElement;
    expect(line.dataset.variant).toBe("sketch");
    expect(line.classList.contains("skeleton-line")).toBe(false);
    expect(line.style.getPropertyValue("--skeleton-width")).toBe("40%");
    // Fill (with shimmer), four edge strokes, outline.
    expect(line.children).toHaveLength(6);
    expect(line.querySelector(".bg-kumo-recessed")).not.toBeNull();
    expect(line.querySelector(".border-kumo-interact")).not.toBeNull();
  });

  it("lets className override the sketch line's height", () => {
    const { container } = render(
      <SkeletonLine variant="sketch" className="h-9 w-32" />,
    );
    const line = container.firstElementChild as HTMLElement;
    expect(line.classList.contains("h-9")).toBe(true);
    expect(line.classList.contains("h-2")).toBe(false);
  });

  it("wraps the sketch variant in a block when blockHeight is set", () => {
    const { container } = render(
      <SkeletonLine variant="sketch" blockHeight={28} />,
    );
    const block = container.firstElementChild as HTMLElement;
    expect(block.style.height).toBe("28px");
    expect((block.firstElementChild as HTMLElement).dataset.variant).toBe(
      "sketch",
    );
  });
});
