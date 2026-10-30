import React from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus, type Icon } from "@phosphor-icons/react";
import {
  Button,
  KUMO_BUTTON_VARIANTS,
  LinkButton,
  RefreshButton,
  buttonVariants,
  type KumoButtonVariant,
} from "./button";

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

  it("does not paint a resting background for ghost buttons", () => {
    const className = buttonVariants({ variant: "ghost" });

    expect(className).toContain("hover:bg-kumo-tint");
    expect(className).not.toContain("bg-inherit");
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

  describe("title while disabled or loading", () => {
    const reason = "You need edit access to save";

    it.each([
      ["disabled", { disabled: true }],
      ["loading", { loading: true }],
    ] as const)(
      "keeps a %s button focusable and describes it with the title",
      async (_state, stateProps) => {
        render(
          <>
            <button type="button">Before</button>
            <Button title={reason} {...stateProps}>
              Save
            </Button>
          </>,
        );
        const button = screen.getByRole("button", { description: reason });
        expect(button.getAttribute("aria-disabled")).toBe("true");
        expect(button.hasAttribute("disabled")).toBe(false);
        expect(button.getAttribute("aria-busy")).toBe(
          "loading" in stateProps ? "true" : null,
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Before" }));
        await user.tab();
        expect(document.activeElement).toBe(button);
        // The tooltip popup, next to the hidden description.
        await waitFor(() =>
          expect(
            screen.getAllByText(reason).filter((el) => !el.hidden),
          ).toHaveLength(1),
        );
      },
    );

    it("keeps the same focused trigger when loading starts and ends", () => {
      const { rerender } = render(<Button title={reason}>Save</Button>);
      const button = screen.getByRole("button");
      button.focus();

      rerender(
        <Button title={reason} loading>
          Save
        </Button>,
      );
      expect(screen.getByRole("button")).toBe(button);
      expect(document.activeElement).toBe(button);

      rerender(<Button title={reason}>Save</Button>);
      expect(screen.getByRole("button")).toBe(button);
    });

    it("ignores clicks, key presses, and form submission", async () => {
      const handlers = {
        onClick: vi.fn<() => void>(),
        onMouseDown: vi.fn<() => void>(),
        onPointerDown: vi.fn<() => void>(),
        onKeyDown: vi.fn<() => void>(),
        onKeyUp: vi.fn<() => void>(),
      };
      const onSubmit = vi.fn<(event: React.FormEvent) => void>((event) =>
        event.preventDefault(),
      );
      render(
        <form onSubmit={onSubmit}>
          <input aria-label="Name" />
          <Button type="submit" title={reason} disabled {...handlers}>
            Save
          </Button>
        </form>,
      );
      const user = userEvent.setup();

      await user.click(screen.getByRole("button"));
      await user.keyboard("{Enter} ");
      // Implicit submission from a text field.
      await user.type(screen.getByRole("textbox"), "x{Enter}");

      for (const handler of Object.values(handlers)) {
        expect(handler).not.toHaveBeenCalled();
      }
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("keeps an existing description", () => {
      render(
        <>
          <span id="save-hint">Saves every project</span>
          <Button aria-describedby="save-hint" disabled title={reason}>
            Save
          </Button>
        </>,
      );

      expect(
        screen.getByRole("button", {
          description: `Saves every project ${reason}`,
        }),
      ).toBeTruthy();
    });

    it("does not describe an icon-only button already named by its title", () => {
      render(<Button shape="square" icon={Plus} title="Add" disabled />);

      const button = screen.getByRole("button", { name: "Add" });
      expect(button.hasAttribute("aria-describedby")).toBe(false);
    });

    it("does not describe an enabled button with its title", () => {
      render(<Button title="Saves every project">Save</Button>);

      const button = screen.getByRole("button", { name: "Save" });
      expect(button.hasAttribute("aria-describedby")).toBe(false);
      expect(button.textContent).toBe("Save");
    });

    it.each(Object.keys(KUMO_BUTTON_VARIANTS.variant) as KumoButtonVariant[])(
      "gives a loading %s button its disabled styles and no hover styles",
      (variant) => {
        render(
          <Button variant={variant} title={reason} loading>
            Save
          </Button>,
        );
        const classes = screen.getByRole("button").className.split(" ");
        const variantClasses = buttonVariants({ variant }).split(" ");

        for (const cls of variantClasses) {
          if (cls.startsWith("disabled:")) {
            expect(classes).toContain(cls.replace("disabled:", ""));
          }
          if (cls.startsWith("not-disabled:hover:")) {
            expect(classes).not.toContain(cls);
          }
        }
      },
    );
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

  it("title prop wraps the anchor in a Tooltip and removes the native title attribute", () => {
    render(
      <LinkButton href="/home" title="Go to the home page">
        Home
      </LinkButton>,
    );
    const link = screen.getByRole("link", { name: "Home" });
    // title is intercepted by the Kumo Tooltip wrapper, not set as a native attribute
    expect(link.getAttribute("title")).toBeNull();
    expect(link.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
    expect(link.hasAttribute("aria-describedby")).toBe(false);
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

    it("renders a titled disabled link as an aria-disabled button", () => {
      const reason = "You need edit access to continue";
      render(
        <LinkButton href="/settings" disabled title={reason}>
          Settings
        </LinkButton>,
      );

      expect(screen.queryByRole("link")).toBeNull();
      const button = screen.getByRole("button", { description: reason });
      expect(button.getAttribute("aria-disabled")).toBe("true");
      expect(button.hasAttribute("href")).toBe(false);
    });
  });
});
