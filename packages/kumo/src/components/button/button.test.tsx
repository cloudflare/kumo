import React from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { act, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import {
  hydrateRoot,
  type HydrationOptions,
  type Root,
} from "react-dom/client";
import { Plus, type Icon } from "@phosphor-icons/react";
import { Button, RefreshButton, LinkButton, buttonVariants } from "./button";

// The tooltip code loads when the first titled button mounts.
const waitForTooltipTrigger = () =>
  waitFor(() => {
    expect(
      document.querySelector("[data-base-ui-tooltip-trigger]"),
    ).not.toBeNull();
  });

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

  it("prevents text selection", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button");
    expect(button.classList.contains("select-none")).toBe(true);
    expect(button.classList.contains("select-text")).toBe(false);
  });

  it("forwards ref to the <button> DOM node", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBe(screen.getByRole("button"));
  });

  it("forwards ref to the button that becomes the tooltip trigger", async () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} title="Save changes">
        Save
      </Button>,
    );
    await waitForTooltipTrigger();
    expect(ref.current).toBe(screen.getByRole("button", { name: "Save" }));
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

    it("trims leading padding when an icon precedes text", () => {
      render(<Button icon={Plus}>Add</Button>);
      const button = screen.getByRole("button", { name: "Add" });
      expect(button.className).toContain("pl-2.5");
    });

    it.each(["square", "circle"] as const)(
      "keeps %s icon-only buttons untouched",
      (shape) => {
        render(<Button shape={shape} icon={Plus} aria-label="Add" />);
        const button = screen.getByRole("button", { name: "Add" });
        expect(button.className).not.toContain("pl-");
        expect(button.className).not.toContain("pb-");
      },
    );

    it("keeps symmetric padding without an icon", () => {
      render(<Button>Add</Button>);
      const button = screen.getByRole("button", { name: "Add" });
      expect(button.className).toContain("px-3");
      expect(button.className).not.toContain("pl-2.5");
    });

    it.each(["xs", "sm", "base", "lg"] as const)(
      "does not shift %s text off the line box center",
      (size) => {
        render(
          <Button size={size} icon={Plus}>
            Add
          </Button>,
        );
        const button = screen.getByRole("button", { name: "Add" });
        expect(button.className).not.toContain("pb-");
        expect(button.className).not.toContain("translate-y");
      },
    );

    it.each(["base", "lg"] as const)(
      "uses a 20px line box at %s so the label gap is a whole pixel",
      (size) => {
        render(<Button size={size}>Add</Button>);
        const button = screen.getByRole("button", { name: "Add" });
        expect(button.className).toContain("text-base");
        expect(button.className).toContain("leading-5");
      },
    );

    it.each([false, "", [null, false]])(
      "keeps symmetric padding when children render nothing (%j)",
      (children) => {
        render(
          <Button icon={Plus} aria-label="Add">
            {children}
          </Button>,
        );
        const button = screen.getByRole("button", { name: "Add" });
        expect(button.className).not.toContain("pl-2.5");
      },
    );

    it("accepts a React element via icon prop", () => {
      render(<Button icon={<Plus data-testid="plus-icon" />}>Add</Button>);
      const button = screen.getByRole("button", { name: "Add" });
      const svg = button.querySelector("svg");
      expect(svg).toBeTruthy();
    });

    // React Flight (RSC) can deliver an element prop as a lazy reference whose
    // resolved value is an element, not a component (#891).
    it.skipIf(React.version.startsWith("18."))(
      "accepts an element delivered as an RSC lazy reference",
      () => {
        const lazyElement = {
          $$typeof: Symbol.for("react.lazy"),
          _payload: <Plus data-testid="plus-icon" />,
          _init: (payload: React.ReactElement) => payload,
        } as unknown as React.ReactNode;

        render(<Button icon={lazyElement}>Add</Button>);
        const button = screen.getByRole("button", { name: "Add" });
        expect(button.querySelector("svg")).toBeTruthy();
      },
    );

    it("accepts a React.lazy icon component", async () => {
      const LazyPlus = React.lazy(() => Promise.resolve({ default: Plus }));

      render(
        <React.Suspense fallback={null}>
          <Button icon={LazyPlus as unknown as Icon}>Add</Button>
        </React.Suspense>,
      );
      const button = await screen.findByRole("button", { name: "Add" });
      expect(button.querySelector("svg")).toBeTruthy();
    });
  });

  it("title prop wraps in Tooltip and removes native title attribute", () => {
    render(<Button title="Save changes">Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    // title is intercepted by Tooltip wrapper, not set as native attribute
    expect(button.getAttribute("title")).toBeNull();
  });

  it("uses title as the accessible name when there are no children", () => {
    render(<Button shape="square" icon={Plus} title="Remove" />);

    const button = screen.getByRole("button", { name: "Remove" });
    expect(button.getAttribute("aria-label")).toBe("Remove");
    expect(button.getAttribute("title")).toBeNull();
  });

  it("does not override explicit accessible names with title", () => {
    render(
      <>
        <Button aria-label="Delete" shape="square" icon={Plus} title="Remove" />
        <span id="archive-label">Archive</span>
        <Button
          aria-labelledby="archive-label"
          shape="square"
          icon={Plus}
          title="Move"
        />
      </>,
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Archive" })).toBeTruthy();
  });

  it("uses an enabled tooltip trigger around a disabled button", async () => {
    render(
      <Button title="Saving is unavailable" disabled>
        Save
      </Button>,
    );
    await waitForTooltipTrigger();

    const button = screen.getByRole("button", { name: "Save" });
    const trigger = button.parentElement;

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(trigger?.tagName).toBe("SPAN");
    expect(trigger?.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
    expect(trigger?.hasAttribute("disabled")).toBe(false);
  });

  it("uses an enabled tooltip trigger around a loading button", async () => {
    render(
      <Button title="Saving changes" loading>
        Save
      </Button>,
    );
    await waitForTooltipTrigger();

    const button = screen.getByRole("button");
    const trigger = button.parentElement;

    expect(button.hasAttribute("disabled")).toBe(true);
    expect(trigger?.tagName).toBe("SPAN");
    expect(trigger?.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
    expect(trigger?.hasAttribute("disabled")).toBe(false);
  });

  it("sets displayName on Button and LinkButton", () => {
    expect(Button.displayName).toBe("Button");
    expect(LinkButton.displayName).toBe("LinkButton");
  });

  describe("title tooltip loading", () => {
    const titled = <Button title="Save changes">Save</Button>;

    // A server renders with its own module state, where the tooltip code has
    // never loaded. The client below already has it, like a page that hydrates
    // after another titled button mounted.
    async function renderServerMarkup() {
      vi.resetModules();
      const { Button: ServerButton } = await import("./button");
      const container = document.createElement("div");
      container.innerHTML = renderToString(
        <ServerButton title="Save changes">Save</ServerButton>,
      );
      document.body.append(container);
      const serverButton = container.querySelector("button");
      if (!serverButton) throw new Error("server markup has no button");
      return { container, serverButton };
    }

    // The hydration render matches the server markup even when the tooltip
    // code has already loaded, so every hydrated titled button swaps once.
    function hydrate(container: HTMLElement, options?: HydrationOptions) {
      let root: Root | undefined;
      act(() => {
        root = hydrateRoot(container, titled, options);
      });
      return () => {
        act(() => root?.unmount());
        container.remove();
      };
    }

    it("renders the button alone on the server, even after the tooltip code loaded", async () => {
      render(titled);
      await waitForTooltipTrigger();

      const html = renderToString(titled);

      expect(html).toContain("<button");
      expect(html).not.toContain("data-base-ui-tooltip-trigger");
      expect(html).not.toContain("title=");
    });

    it("hydrates the server markup without a mismatch, then adds the tooltip", async () => {
      const { container } = await renderServerMarkup();
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const recoverableErrors: unknown[] = [];
      const cleanup = hydrate(container, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });

      try {
        // React keeps the server attributes on a mismatch, so a mismatched
        // trigger would never get its tooltip.
        const hydrationErrors = errorSpy.mock.calls.filter((args) =>
          /hydrat|did not match/i.test(args.map(String).join(" ")),
        );
        expect(hydrationErrors).toEqual([]);
        expect(recoverableErrors).toEqual([]);
        await waitForTooltipTrigger();
      } finally {
        errorSpy.mockRestore();
        cleanup();
      }
    });

    it("keeps focus on the button when the tooltip trigger replaces it", async () => {
      const { container, serverButton } = await renderServerMarkup();
      serverButton.focus();
      expect(document.activeElement).toBe(serverButton);
      const cleanup = hydrate(container);

      try {
        await waitForTooltipTrigger();
        const button = screen.getByRole("button", { name: "Save" });
        expect(button).not.toBe(serverButton);
        expect(document.activeElement).toBe(button);
      } finally {
        cleanup();
      }
    });
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

  it("allows text selection", () => {
    render(<LinkButton href="/home">Home</LinkButton>);
    const link = screen.getByRole("link");
    expect(link.classList.contains("select-text")).toBe(true);
    expect(link.classList.contains("select-none")).toBe(false);
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

  it("title prop wraps the anchor in a Tooltip and removes the native title attribute", async () => {
    render(
      <LinkButton href="/home" title="Go to the home page">
        Home
      </LinkButton>,
    );
    await waitForTooltipTrigger();
    const link = screen.getByRole("link", { name: "Home" });
    // title is intercepted by the Kumo Tooltip wrapper, not set as a native attribute
    expect(link.getAttribute("title")).toBeNull();
    expect(link.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
  });

  describe("disabled", () => {
    it("renders a disabled <button> instead of an <a>", () => {
      render(
        <LinkButton href="/home" disabled>
          Home
        </LinkButton>,
      );
      const button = screen.getByRole("button", { name: "Home" });
      expect(button.tagName).toBe("BUTTON");
      expect(button.hasAttribute("disabled")).toBe(true);
      expect(button.getAttribute("type")).toBe("button");
      expect(screen.queryByRole("link")).toBeNull();
    });

    it("strips anchor-only attributes from the rendered button", () => {
      render(
        <LinkButton
          href="/home"
          target="_blank"
          rel="noopener"
          download=""
          disabled
        >
          Home
        </LinkButton>,
      );
      const button = screen.getByRole("button", { name: "Home" });
      expect(button.hasAttribute("href")).toBe(false);
      expect(button.hasAttribute("target")).toBe(false);
      expect(button.hasAttribute("rel")).toBe(false);
      expect(button.hasAttribute("download")).toBe(false);
    });

    it("preserves the LinkButton data attribute", () => {
      render(
        <LinkButton href="/home" disabled>
          Home
        </LinkButton>,
      );
      const button = screen.getByRole("button", { name: "Home" });
      expect(button.getAttribute("data-kumo-component")).toBe("LinkButton");
    });

    it("allows text selection", () => {
      render(
        <LinkButton href="/home" disabled>
          Home
        </LinkButton>,
      );
      const button = screen.getByRole("button", { name: "Home" });
      expect(button.classList.contains("select-text")).toBe(true);
      expect(button.classList.contains("select-none")).toBe(false);
    });

    it("wraps a title in an enabled tooltip trigger around the disabled button", async () => {
      render(
        <LinkButton href="/home" disabled title="You need edit access">
          Home
        </LinkButton>,
      );
      await waitForTooltipTrigger();
      const button = screen.getByRole("button", { name: "Home" });
      const trigger = button.parentElement;

      expect(button.hasAttribute("disabled")).toBe(true);
      expect(button.getAttribute("title")).toBeNull();
      expect(trigger?.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
      expect(trigger?.hasAttribute("disabled")).toBe(false);
    });
  });
});
