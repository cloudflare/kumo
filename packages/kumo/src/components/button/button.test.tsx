import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Plus } from "@phosphor-icons/react";
import { Button, RefreshButton, LinkButton, buttonVariants } from "./button";

describe("Button", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("adds a 24px non-layout hit area to xs buttons", () => {
    const classes = buttonVariants({ size: "xs" });

    expect(classes).toContain("before:min-h-6");
    expect(classes).toContain("before:min-w-6");
  });

  it("preserves xs icon button visual size while expanding hit area", () => {
    const classes = buttonVariants({ size: "xs", shape: "square" });

    expect(classes).toContain("size-3.5");
    expect(classes).toContain("before:min-h-6");
    expect(classes).toContain("before:min-w-6");
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
      expect(svg!.getAttribute("aria-hidden")).toBe("true");
      expect(svg!.getAttribute("focusable")).toBe("false");
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
      expect(svg!.getAttribute("aria-hidden")).toBe("true");
      expect(svg!.getAttribute("focusable")).toBe("false");
    });
  });

  describe("accessible name safeguards", () => {
    it("warns for an icon-only button without an accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<Button icon={Plus} />);

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "[Kumo Button]: Button must have an accessible name",
        ),
      );
      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-label")).toBeNull();
      expect(screen.queryByRole("button", { name: "Button" })).toBeNull();
    });

    it("does not warn when aria-label names a base-shape icon-only button", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<Button icon={Plus} aria-label="Add item" />);

      expect(warn).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Add item" })).toBeTruthy();
    });

    it("does not warn when aria-labelledby provides the accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <>
          <span id="refresh-label">Refresh data</span>
          <Button icon={Plus} aria-labelledby="refresh-label" />
        </>,
      );

      expect(warn).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Refresh data" })).toBeTruthy();
    });

    it("does not warn when visible text provides the accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<Button icon={Plus}>Add item</Button>);

      expect(warn).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Add item" })).toBeTruthy();
    });
  });

  it("title prop wraps in Tooltip and removes native title attribute", () => {
    render(<Button title="Save changes">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    // title is intercepted by Tooltip wrapper, not set as native attribute
    expect(button.getAttribute("title")).toBeNull();
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

  it("renders its refresh icon as decorative", () => {
    render(<RefreshButton />);
    const button = screen.getByRole("button", { name: "Refresh" });
    const svg = button.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
    expect(svg!.getAttribute("focusable")).toBe("false");
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

  it("renders icon prop as decorative", () => {
    render(
      <LinkButton href="/new" icon={Plus}>
        New item
      </LinkButton>,
    );
    const link = screen.getByRole("link", { name: "New item" });
    const svg = link.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute("aria-hidden")).toBe("true");
    expect(svg!.getAttribute("focusable")).toBe("false");
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
