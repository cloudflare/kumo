import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MetricCardGroup,
  KUMO_METRIC_CARD_GROUP_VARIANTS,
} from "./metric-card-group";

describe("MetricCardGroup", () => {
  // Rendering

  it("renders children", () => {
    render(
      <MetricCardGroup>
        <div>Card One</div>
        <div>Card Two</div>
      </MetricCardGroup>,
    );
    expect(screen.getByText("Card One")).toBeTruthy();
    expect(screen.getByText("Card Two")).toBeTruthy();
  });

  it("renders title when provided", () => {
    render(
      <MetricCardGroup title="Performance Metrics">
        <div>Card</div>
      </MetricCardGroup>,
    );
    expect(screen.getByText("Performance Metrics")).toBeTruthy();
  });

  it("renders JSX content as title", () => {
    render(
      <MetricCardGroup
        title={
          <div>
            <span>Custom Title</span>
            <button type="button">Action</button>
          </div>
        }
      >
        <div>Card</div>
      </MetricCardGroup>,
    );
    expect(screen.getByText("Custom Title")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Action" })).toBeTruthy();
  });

  it("does not render title section when title is omitted", () => {
    render(
      <MetricCardGroup>
        <div>Card</div>
      </MetricCardGroup>,
    );
    // LayerCard.Secondary is not rendered, so "Performance Metrics" won't exist
    expect(screen.queryByText("Performance Metrics")).toBeNull();
  });

  // Orientation

  it("applies horizontal layout classes by default", () => {
    const { container } = render(
      <MetricCardGroup>
        <div>Card</div>
      </MetricCardGroup>,
    );
    const innerDiv = container.querySelector(".grid");
    expect(innerDiv).toBeTruthy();
    expect(innerDiv?.className).toContain("grid-cols-1");
    expect(innerDiv?.className).toContain("overflow-hidden");
    expect(innerDiv?.className).not.toContain("gap-px");
    expect(innerDiv?.className).not.toContain("bg-kumo-line");
    // Each card gets a 0.5px ring to create dividers between adjacent cards
    expect(innerDiv?.className).toContain("[&>*]:ring-[0.5px]");
    expect(innerDiv?.className).toContain("[&>*]:ring-kumo-line");
    // Container query context is on a parent wrapper so breakpoints can query it
    const containerDiv = innerDiv?.parentElement;
    expect(containerDiv?.className).toContain("@container/metrics");
  });

  it("applies vertical layout classes when orientation is vertical", () => {
    const { container } = render(
      <MetricCardGroup orientation="vertical">
        <div>Card</div>
      </MetricCardGroup>,
    );
    const innerDiv = container.querySelector(".divide-y");
    expect(innerDiv).toBeTruthy();
    expect(innerDiv?.className).toContain("flex-col");
  });

  // Container query responsive grid

  it("does not add container query classes for vertical orientation", () => {
    const { container } = render(
      <MetricCardGroup orientation="vertical">
        <div>Card One</div>
        <div>Card Two</div>
        <div>Card Three</div>
      </MetricCardGroup>,
    );
    const innerDiv = container.querySelector(".divide-y");
    expect(innerDiv).toBeTruthy();
    expect(innerDiv?.className).not.toContain("@container/metrics");
    expect(innerDiv?.className).not.toContain("grid-cols");
  });

  it("adds responsive breakpoint classes based on child count", () => {
    const { container } = render(
      <MetricCardGroup>
        <div>Card One</div>
        <div>Card Two</div>
        <div>Card Three</div>
      </MetricCardGroup>,
    );
    const innerDiv = container.querySelector(".grid");
    expect(innerDiv).toBeTruthy();
    // 3 children → 2 breakpoints (cols-2 and cols-3)
    expect(innerDiv?.className).toContain(
      "@[340px]/metrics:grid-cols-2",
    );
    expect(innerDiv?.className).toContain(
      "@[510px]/metrics:grid-cols-3",
    );
    // Should NOT include cols-4 or higher
    expect(innerDiv?.className).not.toContain(
      "@[680px]/metrics:grid-cols-4",
    );
  });

  it("does not add breakpoint classes for a single child", () => {
    const { container } = render(
      <MetricCardGroup>
        <div>Only Card</div>
      </MetricCardGroup>,
    );
    const innerDiv = container.querySelector(".grid");
    expect(innerDiv).toBeTruthy();
    expect(innerDiv?.className).toContain("grid-cols-1");
    // 1 child → 0 breakpoints
    expect(innerDiv?.className).not.toContain(
      "@[340px]/metrics:grid-cols-2",
    );
  });

  it("caps responsive breakpoints at 6 columns for many children", () => {
    const { container } = render(
      <MetricCardGroup>
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
        <div>Card 4</div>
        <div>Card 5</div>
        <div>Card 6</div>
        <div>Card 7</div>
        <div>Card 8</div>
      </MetricCardGroup>,
    );
    const innerDiv = container.querySelector(".grid");
    expect(innerDiv).toBeTruthy();
    // 8 children → all 5 breakpoints (max 6 cols)
    expect(innerDiv?.className).toContain(
      "@[340px]/metrics:grid-cols-2",
    );
    expect(innerDiv?.className).toContain(
      "@[510px]/metrics:grid-cols-3",
    );
    expect(innerDiv?.className).toContain(
      "@[680px]/metrics:grid-cols-4",
    );
    expect(innerDiv?.className).toContain(
      "@[850px]/metrics:grid-cols-5",
    );
    expect(innerDiv?.className).toContain(
      "@[1020px]/metrics:grid-cols-6",
    );
  });

  // Variant definitions

  it("has grid-based horizontal variant classes", () => {
    const horizontal =
      KUMO_METRIC_CARD_GROUP_VARIANTS.orientation.horizontal;
    expect(horizontal.classes).toContain("grid");
    expect(horizontal.classes).toContain("grid-cols-1");
    expect(horizontal.classes).not.toContain("flex-wrap");
    expect(horizontal.classes).not.toContain("[&>*]:min-w-[170px]");
    expect(horizontal.classes).not.toContain("[&>*]:min-h-[115px]");
  });

  it("keeps vertical variant unchanged", () => {
    const vertical =
      KUMO_METRIC_CARD_GROUP_VARIANTS.orientation.vertical;
    expect(vertical.classes).toBe("flex flex-col divide-y divide-kumo-line");
  });

  // Props and ref forwarding

  it("forwards className and rest props to the root element", () => {
    const { container } = render(
      <MetricCardGroup className="my-class" data-testid="metric-group">
        <div>Card</div>
      </MetricCardGroup>,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("my-class");
    expect(root?.getAttribute("data-testid")).toBe("metric-group");
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <MetricCardGroup ref={ref}>
        <div>Card</div>
      </MetricCardGroup>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
