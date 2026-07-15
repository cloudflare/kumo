import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Plus } from "@phosphor-icons/react";
import { Button, RefreshButton, LinkButton, buttonVariants } from "./button";

describe("Button", () => {
  describe("children wrapper", () => {
    it("wraps children in a span with className='contents'", () => {
      render(<Button>Save</Button>);
      const button = screen.getByRole("button", { name: "Save" });
      const span = button.querySelector("span.contents");
      expect(span).toBeTruthy();
      expect(span!.textContent).toBe("Save");
    });

    it("does not render empty span for icon-only button", () => {
      render(<Button shape="square" icon={Plus} aria-label="Add" />);
      const button = screen.getByRole("button", { name: "Add" });
      const span = button.querySelector("span.contents");
      expect(span).toBeNull();
    });
  });

  describe("loading state transitions", () => {
    it("transitions from non-loading to loading and back", () => {
      const { rerender } = render(<Button loading={false}>Submit</Button>);

      // Non-loading: children visible, no spinner
      expect(screen.getByText("Submit")).toBeTruthy();
      expect(screen.queryByRole("status")).toBeNull();

      // Loading: spinner present
      rerender(<Button loading={true}>Submit</Button>);
      expect(screen.getByRole("status")).toBeTruthy();

      // Back to non-loading: spinner gone, children still visible
      rerender(<Button loading={false}>Submit</Button>);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.getByText("Submit")).toBeTruthy();
    });
  });

  it("type defaults to 'button'", () => {
    render(<Button>Click</Button>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("loading={true} sets disabled on the <button>", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("disabled prop sets disabled attribute", () => {
    render(<Button disabled>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
  });

  it("forwards ref to the <button> DOM node", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBe(screen.getByRole("button"));
  });

  describe("icon rendering", () => {
    it("renders icon in non-loading state", () => {
      render(
        <Button icon={Plus} loading={false}>
          Add item
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Add item" });
      // Plus icon renders an SVG element
      const svg = button.querySelector("svg");
      expect(svg).toBeTruthy();
      // Should not be the loader (no role="status")
      expect(svg!.getAttribute("role")).not.toBe("status");
    });

    it("renders loader instead of icon in loading state", () => {
      render(
        <Button icon={Plus} loading={true}>
          Add item
        </Button>,
      );
      // When loading, the Loader's aria-label contributes to the button's accessible name
      const button = screen.getByRole("button");
      // Loader should be present
      const loader = screen.getByRole("status");
      expect(loader).toBeTruthy();
      expect(loader.getAttribute("aria-label")).toBe("Loading");
      // The Plus icon should NOT be rendered — only the loader SVG with role="status"
      const svgs = button.querySelectorAll("svg");
      expect(svgs).toHaveLength(1);
      expect(svgs[0].getAttribute("role")).toBe("status");
    });

    it("accepts a React element via icon prop", () => {
      render(<Button icon={<Plus data-testid="plus-icon" />}>Add</Button>);
      const button = screen.getByRole("button", { name: "Add" });
      const svg = button.querySelector("svg");
      expect(svg).toBeTruthy();
    });
  });

  it("title prop wraps in Tooltip and removes native title attribute", () => {
    render(<Button title="Save changes">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    // title is intercepted by Tooltip wrapper, not set as native attribute
    expect(button.getAttribute("title")).toBeNull();
  });

  it("uses an enabled tooltip trigger around a disabled button", () => {
    render(
      <Button title="Saving is unavailable" disabled>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    const trigger = button.parentElement;

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(trigger?.tagName).toBe("SPAN");
    expect(trigger?.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
    expect(trigger?.hasAttribute("disabled")).toBe(false);
  });

  it("uses an enabled tooltip trigger around a loading button", () => {
    render(
      <Button title="Saving changes" loading>
        Save
      </Button>,
    );

    const button = screen.getByRole("button");
    const trigger = button.parentElement;

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(trigger?.tagName).toBe("SPAN");
    expect(trigger?.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
    expect(trigger?.hasAttribute("disabled")).toBe(false);
  });

  it("keeps emphasized variant rings color-matched when pressed or focused", () => {
    for (const variant of ["primary", "destructive"] as const) {
      const className = buttonVariants({ variant });

      expect(className).toContain("ring-(--kumo-button-emphasis-ring)");
      expect(className).toContain("focus:ring-(--kumo-button-emphasis-ring)");
      expect(className).toContain(
        "focus-visible:ring-(--kumo-button-emphasis-ring)",
      );
      expect(className).toContain("active:ring-(--kumo-button-emphasis-ring)");
      expect(className).not.toContain("focus:ring-kumo-focus/50");
      expect(className).not.toContain("focus-visible:ring-kumo-brand");
    }
  });
});

describe("RefreshButton", () => {
  it("renders with default aria-label='Refresh'", () => {
    render(<RefreshButton />);
    expect(screen.getByRole("button", { name: "Refresh" })).toBeTruthy();
  });

  it("allows overriding aria-label", () => {
    render(<RefreshButton aria-label="Reload workers" />);
    expect(screen.getByRole("button", { name: "Reload workers" })).toBeTruthy();
  });
});

describe("LinkButton", () => {
  it("renders as an <a> element", () => {
    render(<LinkButton href="/home">Home</LinkButton>);
    const link = screen.getByRole("link");
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/home");
  });

  it("external sets target='_blank' and rel='noopener noreferrer'", () => {
    render(
      <LinkButton href="https://example.com" external>
        Docs
      </LinkButton>,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("forwards ref to the <a> DOM node", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <LinkButton ref={ref} href="/home">
        Home
      </LinkButton>,
    );
    expect(ref.current).toBe(screen.getByRole("link"));
  });
});
