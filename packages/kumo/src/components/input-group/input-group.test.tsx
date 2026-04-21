import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputGroup } from "./input-group";
import { INPUT_GROUP_SIZE, detectFocusMode } from "./context";
import type { KumoInputSize } from "../input/input";

const MockIcon = (props: { size?: number }) => (
  <svg data-testid="mock-icon" data-size={props.size ?? "none"} />
);

const FakeButton = (props: {
  variant?: string;
  children?: React.ReactNode;
}) => <button>{props.children}</button>;

describe("InputGroup", () => {
  describe("rendering", () => {
    it("renders input with addon", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Paste a link..." aria-label="Link" />
        </InputGroup>,
      );
      expect(screen.getByTestId("icon")).toBeTruthy();
      expect(screen.getByPlaceholderText("Paste a link...")).toBeTruthy();
    });

    it("renders input with button", () => {
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Show password" onClick={() => {}}>
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(
        screen.getByRole("button", { name: "Show password" }),
      ).toBeTruthy();
    });

    it("renders input with suffix", () => {
      render(
        <InputGroup label="Subdomain">
          <InputGroup.Input aria-label="Subdomain" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </InputGroup>,
      );
      expect(screen.getByRole("textbox")).toBeTruthy();
      expect(screen.getByText(".workers.dev")).toBeTruthy();
    });

    it("renders all sub-components together", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>/api/</InputGroup.Addon>
          <InputGroup.Input placeholder="endpoint" aria-label="API path" />
          <InputGroup.Addon align="end">.json</InputGroup.Addon>
        </InputGroup>,
      );
      expect(screen.getByText("/api/")).toBeTruthy();
      expect(screen.getByPlaceholderText("endpoint")).toBeTruthy();
      expect(screen.getByText(".json")).toBeTruthy();
    });
  });

  describe("addon positioning", () => {
    it("places start addon before input in DOM order", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );
      const addon = screen.getByText("@");
      const input = screen.getByRole("textbox");
      // Addon should come before input in document order
      expect(
        addon.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("places end addon after input in DOM order", () => {
      render(
        <InputGroup>
          <InputGroup.Input placeholder="email" aria-label="Email" />
          <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
        </InputGroup>,
      );
      const addon = screen.getByText("@example.com");
      const input = screen.getByRole("textbox");
      // Input should come before addon
      expect(
        input.compareDocumentPosition(addon) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("user interactions", () => {
    it("allows typing in input", async () => {
      const user = userEvent.setup();
      render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await user.type(input, "hello");
      expect(input.value).toBe("hello");
    });

    it("calls onChange when typing", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input
            value=""
            placeholder="Search"
            aria-label="Search"
            onChange={handleChange}
          />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "hi");
      expect(handleChange).toHaveBeenCalled();
    });

    it("calls onClick when button is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Show password" onClick={handleClick}>
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Show password" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick on compact button inside addon", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input
            value="query"
            placeholder="Search"
            aria-label="Search"
            onChange={() => {}}
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Delete search" onClick={handleClick}>
              <svg data-testid="x-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      await user.click(screen.getByRole("button", { name: "Delete search" }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("focuses input when clicking on container", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );

      const group = container.firstElementChild as HTMLElement;
      await user.click(group);
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    it("focuses input when clicking on div container (label prop)", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InputGroup label="Subdomain">
          <InputGroup.Input placeholder="my-worker" />
          <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
        </InputGroup>,
      );

      // The invisible label overlay inside the container delegates focus
      // to the input via native htmlFor. We click it directly because
      // happy-dom doesn't simulate CSS pointer-events-none on the suffix.
      const overlay = container.querySelector(
        "label[aria-hidden='true']",
      ) as HTMLElement;
      await user.click(overlay);
      expect(document.activeElement).toBe(screen.getByRole("textbox"));
    });

    it("does not redirect focus to input when clicking a button", async () => {
      const user = userEvent.setup();
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Show password" onClick={() => {}}>
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      const button = screen.getByRole("button", { name: "Show password" });
      await user.click(button);
      expect(document.activeElement).toBe(button);
    });
  });

  describe("disabled state", () => {
    it("disables input when group is disabled", () => {
      render(
        <InputGroup label="Disabled" disabled>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup>,
      );
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it("prevents interaction when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <InputGroup label="Disabled" disabled>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." onChange={handleChange} />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      await user.type(input, "hello");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("does not allow focus via click when disabled", () => {
      const { container } = render(
        <InputGroup label="Disabled" disabled>
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Search..." />
        </InputGroup>,
      );

      const label = container.querySelector("[data-slot='input-group']");
      expect(label?.getAttribute("data-disabled")).toBe("");
      expect(label?.className).toContain("pointer-events-none");
    });
  });

  describe("error handling", () => {
    it("sets aria-invalid on input when error is present", () => {
      render(
        <InputGroup
          label="Error State"
          error={{ message: "Please enter a valid email address", match: true }}
        >
          <InputGroup.Input type="email" defaultValue="invalid-email" />
          <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      expect(input.getAttribute("aria-invalid")).toBe("true");
    });

    it("does not set aria-invalid when no error is present", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );

      const input = screen.getByRole("textbox");
      expect(input.getAttribute("aria-invalid")).toBeFalsy();
    });
  });

  describe("size variants", () => {
    it("applies size to input", () => {
      const { rerender } = render(
        <InputGroup size="sm" label="Small">
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Small input" />
        </InputGroup>,
      );

      // Just verify it renders without error at different sizes
      expect(screen.getByRole("textbox")).toBeTruthy();

      rerender(
        <InputGroup size="lg" label="Large">
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Large input" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox")).toBeTruthy();
    });

    // Regression test: addon padding tokens must be static pl-/pr- strings
    // so Tailwind JIT can detect them. Dynamic "px-N".replace() broke xs/sm.
    it.each(["xs", "sm", "base", "lg"] as const)(
      "start addon has correct padding class for size %s",
      (size: KumoInputSize) => {
        const labels: Record<KumoInputSize, string> = {
          xs: "Extra Small",
          sm: "Small",
          base: "Base (default)",
          lg: "Large",
        };
        render(
          <InputGroup size={size} label={labels[size]}>
            <InputGroup.Addon>
              <svg data-testid="icon" />
            </InputGroup.Addon>
            <InputGroup.Input placeholder={`${labels[size]} input`} />
          </InputGroup>,
        );

        const addon = screen.getByTestId("icon").closest("[data-slot]")!;
        const expectedClass = INPUT_GROUP_SIZE[size].addonOuterStart;
        expect(addon.className).toContain(expectedClass);
      },
    );

    // Ensure all addonOuter tokens are static directional classes
    // (not symmetric px- that would need runtime string replacement)
    it("all addon tokens use static pl-/pr- classes (not px-)", () => {
      for (const size of ["xs", "sm", "base", "lg"] as const) {
        const tokens = INPUT_GROUP_SIZE[size];
        expect(tokens.addonOuterStart).toMatch(/^pl-/);
        expect(tokens.addonOuterEnd).toMatch(/^pr-/);
      }
    });
  });

  describe("accessibility", () => {
    it("input has accessible name via aria-label", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox", { name: "Username" })).toBeTruthy();
    });

    it("button inside addon remains accessible", () => {
      render(
        <InputGroup>
          <InputGroup.Input
            type="password"
            defaultValue="password"
            aria-label="Password"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Show password" onClick={() => {}}>
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      expect(
        screen.getByRole("button", { name: "Show password" }),
      ).toBeTruthy();
    });

    it("container is a <label> element when no label prop is provided", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" aria-label="Username" />
        </InputGroup>,
      );
      const label = container.querySelector("label[data-slot='input-group']");
      expect(label).toBeTruthy();
    });

    it("container is a <div> element when label prop is provided", () => {
      const { container } = render(
        <InputGroup label="Username">
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="username" />
        </InputGroup>,
      );
      const div = container.querySelector("div[data-slot='input-group']");
      expect(div).toBeTruthy();
      // Should NOT be a <label>
      const label = container.querySelector("label[data-slot='input-group']");
      expect(label).toBeFalsy();
    });

    it("does not produce nested labels when label prop is provided", () => {
      const { container } = render(
        <InputGroup label="Email">
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input placeholder="you@example.com" />
        </InputGroup>,
      );
      // Field renders its own <label> for the field label text.
      // The container should be a <div>, not a <label>, so there are
      // no nested <label> elements (which is invalid HTML).
      const nestedLabels = container.querySelectorAll("label label");
      expect(nestedLabels.length).toBe(0);
    });
  });

  describe("Button", () => {
    it("derives aria-label from tooltip string", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>
            <svg data-testid="search-icon" />
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder="Search with query language..."
            aria-label="Search"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button tooltip="Query language help">
              <svg data-testid="question-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(
        screen.getByRole("button", { name: "Query language help" }),
      ).toBeTruthy();
    });

    it("prefers explicit aria-label over tooltip-derived label", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>
            <svg data-testid="search-icon" />
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder="Search with query language..."
            aria-label="Search"
          />
          <InputGroup.Addon align="end">
            <InputGroup.Button tooltip="Query language help" aria-label="Help">
              <svg data-testid="question-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(screen.getByRole("button", { name: "Help" })).toBeTruthy();
    });

    it("renders icon component with context-derived size", () => {
      render(
        <InputGroup size="base">
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button icon={MockIcon} aria-label="Help" />
          </InputGroup.Addon>
        </InputGroup>,
      );

      const icon = screen.getByTestId("mock-icon");
      expect(icon.getAttribute("data-size")).toBe(
        String(INPUT_GROUP_SIZE.base.iconSize),
      );
    });

    it.each(["xs", "sm", "base", "lg"] as const)(
      "passes correct icon size for InputGroup size %s",
      (groupSize: KumoInputSize) => {
        render(
          <InputGroup size={groupSize}>
            <InputGroup.Input aria-label="Test" />
            <InputGroup.Addon align="end">
              <InputGroup.Button icon={MockIcon} aria-label="Help" />
            </InputGroup.Addon>
          </InputGroup>,
        );

        const icon = screen.getByTestId("mock-icon");
        expect(icon.getAttribute("data-size")).toBe(
          String(INPUT_GROUP_SIZE[groupSize].iconSize),
        );
      },
    );

    it("passes icon through unchanged when already a React element", () => {
      render(
        <InputGroup size="base">
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button
              icon={<svg data-testid="element-icon" data-size={42} />}
              aria-label="Help"
            />
          </InputGroup.Addon>
        </InputGroup>,
      );

      const icon = screen.getByTestId("element-icon");
      // Element should pass through with its original size, not the context size
      expect(icon.getAttribute("data-size")).toBe("42");
    });

    it("does not inject icon size outside InputGroup context", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<InputGroup.Button icon={MockIcon} aria-label="Help" />);

      const icon = screen.getByTestId("mock-icon");
      // Outside context, icon should render without a size prop
      expect(icon.getAttribute("data-size")).toBe("none");

      warnSpy.mockRestore();
    });
  });

  describe("context misuse warnings", () => {
    it("warns in development when sub-component used outside InputGroup", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<InputGroup.Input aria-label="Orphan" />);

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "<InputGroup.Input> must be used within <InputGroup>. Falling back to default values.",
      );

      warnSpy.mockRestore();
    });
  });

  describe("dev-mode warnings for misplaced props", () => {
    it("warns when InputGroup.Input receives size directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          {/* @ts-expect-error — size is omitted from InputGroupInputProps but can be passed at runtime */}
          <InputGroup.Input size="sm" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Set `size` on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Input receives disabled directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input disabled aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Set `disabled` on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Input receives label directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          {/* @ts-expect-error — label is omitted from InputGroupInputProps but can be passed at runtime */}
          <InputGroup.Input label="Email" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Use the `label` prop on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Input receives description directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          {/* @ts-expect-error — description is omitted from InputGroupInputProps but can be passed at runtime */}
          <InputGroup.Input description="Help text" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Input: Use <InputGroup.Suffix> instead of passing `description` to <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn for misplaced props when Input is used standalone (no context)", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<InputGroup.Input disabled aria-label="Standalone" />);

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      // Should warn about being outside InputGroup, but NOT about disabled being misplaced
      expect(calls).not.toContain(
        "InputGroup.Input: Set `disabled` on <InputGroup> instead of <InputGroup.Input>.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn when no misplaced props are present", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input placeholder="Normal usage" aria-label="Test" />
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      const misplacedWarnings = calls.filter((msg: string) =>
        msg.startsWith("InputGroup.Input:"),
      );
      expect(misplacedWarnings).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it("warns when ghost InputGroup.Button is not inside Addon", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Button aria-label="Toggle">Toggle</InputGroup.Button>
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Button: Ghost buttons should be wrapped in <InputGroup.Addon> for correct spacing.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn when ghost InputGroup.Button is inside Addon", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Toggle">Toggle</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).not.toContain(
        "InputGroup.Button: Ghost buttons should be wrapped in <InputGroup.Addon> for correct spacing.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn when non-ghost InputGroup.Button is outside Addon", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Button variant="secondary" aria-label="Action">
            Action
          </InputGroup.Button>
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).not.toContain(
        "InputGroup.Button: Ghost buttons should be wrapped in <InputGroup.Addon> for correct spacing.",
      );

      warnSpy.mockRestore();
    });

    it("warns when InputGroup.Button receives size directly", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button size="sm" aria-label="Help">
              Help
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).toContain(
        "InputGroup.Button: Set `size` on <InputGroup> instead of <InputGroup.Button>.",
      );

      warnSpy.mockRestore();
    });

    it("does not warn about Button size when used outside InputGroup", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <InputGroup.Button size="sm" aria-label="Standalone">
          Standalone
        </InputGroup.Button>,
      );

      const calls = warnSpy.mock.calls.map((c) => c[0]);
      expect(calls).not.toContain(
        "InputGroup.Button: Set `size` on <InputGroup> instead of <InputGroup.Button>.",
      );

      warnSpy.mockRestore();
    });
  });

  describe("stratus backward compatibility", () => {
    it("supports legacy search bar pattern with Label", () => {
      render(
        <InputGroup className="bg-kumo-base flex-1">
          <InputGroup.Label>
            <svg data-testid="search-icon" />
          </InputGroup.Label>
          <InputGroup.Input placeholder="Search..." aria-label="Search" />
        </InputGroup>,
      );
      expect(screen.getByTestId("search-icon")).toBeTruthy();
      expect(screen.getByPlaceholderText("Search...")).toBeTruthy();
    });

    it("supports legacy Description pattern for domain suffix", () => {
      render(
        <InputGroup>
          <InputGroup.Input placeholder="subdomain" aria-label="Subdomain" />
          <InputGroup.Description>.example.com</InputGroup.Description>
        </InputGroup>,
      );
      expect(screen.getByText(".example.com")).toBeTruthy();
    });

    it("allows Button variant override", () => {
      const onClick = vi.fn();
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Value" />
          <InputGroup.Button variant="secondary" onClick={onClick}>
            Action
          </InputGroup.Button>
        </InputGroup>,
      );
      fireEvent.click(screen.getByText("Action"));
      expect(onClick).toHaveBeenCalled();
    });

    it("auto-detects individual focus mode for pagination pattern", () => {
      render(
        <InputGroup>
          <InputGroup.Button variant="secondary" aria-label="Previous">
            Prev
          </InputGroup.Button>
          <InputGroup.Input style={{ width: 50 }} aria-label="Page" />
          <InputGroup.Button variant="secondary" aria-label="Next">
            Next
          </InputGroup.Button>
        </InputGroup>,
      );
      expect(screen.getByLabelText("Previous")).toBeTruthy();
      expect(screen.getByLabelText("Page")).toBeTruthy();
      expect(screen.getByLabelText("Next")).toBeTruthy();
    });

    it("forwards ref on InputGroup.Input", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(
        <InputGroup>
          <InputGroup.Input ref={ref} aria-label="Search" />
        </InputGroup>,
      );
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it("allows explicit id on InputGroup.Input", () => {
      render(
        <InputGroup>
          <InputGroup.Input id="my-custom-id" aria-label="Custom" />
        </InputGroup>,
      );
      expect(screen.getByRole("textbox").id).toBe("my-custom-id");
    });

    it("renders Button as direct child without Addon wrapper", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(
        <InputGroup>
          <InputGroup.Input aria-label="Value" />
          <InputGroup.Button aria-label="Toggle">Toggle</InputGroup.Button>
        </InputGroup>,
      );
      expect(screen.getByLabelText("Toggle")).toBeTruthy();
      warnSpy.mockRestore();
    });
  });

  describe("Field integration", () => {
    it("renders label when label prop is provided", () => {
      render(
        <InputGroup size="sm" label="Small">
          <InputGroup.Addon>
            <svg data-testid="icon" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder="Small input" />
        </InputGroup>,
      );

      expect(screen.getByText("Small")).toBeTruthy();
      // The input should be associated with the label
      expect(screen.getByLabelText("Small")).toBeTruthy();
    });

    it("renders description when description prop is provided", () => {
      render(
        <InputGroup
          label="With Description"
          description="Must be at least 8 characters"
          labelTooltip="Your password is stored securely"
        >
          <InputGroup.Input type="password" placeholder="Enter password" />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Show password" onClick={() => {}}>
              <svg data-testid="eye-icon" />
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );

      expect(screen.getByText("Must be at least 8 characters")).toBeTruthy();
    });

    it("renders error message when error prop is provided with label", () => {
      render(
        <InputGroup
          label="Error State"
          error={{
            message: "Please enter a valid email address",
            match: true,
          }}
        >
          <InputGroup.Input type="email" defaultValue="invalid-email" />
          <InputGroup.Addon align="end">@example.com</InputGroup.Addon>
        </InputGroup>,
      );

      expect(
        screen.getByText("Please enter a valid email address"),
      ).toBeTruthy();
    });
  });

  describe("detectFocusMode", () => {
    // NOTE: detectFocusMode receives `children` as passed by React to a
    // component — multiple JSX children become an array, NOT a Fragment.
    // Tests use arrays to match this real-world behavior.

    it('returns "container" when there are no Button children', () => {
      const children = [
        <InputGroup.Addon key="a">@</InputGroup.Addon>,
        <InputGroup.Input key="b" aria-label="Test" />,
      ];
      expect(detectFocusMode(children)).toBe("container");
    });

    it('returns "container" when Button is inside an Addon (not a direct child)', () => {
      // When Button is inside Addon, Addon is the direct child, not Button.
      // detectFocusMode only sees direct children, so Addon is what it checks.
      const children = [
        <InputGroup.Input key="a" aria-label="Test" />,
        <InputGroup.Addon key="b" align="end">
          <InputGroup.Button aria-label="Help">Help</InputGroup.Button>
        </InputGroup.Addon>,
      ];
      expect(detectFocusMode(children)).toBe("container");
    });

    it('returns "container" when a direct-child Button has no variant (defaults to ghost)', () => {
      const children = [
        <InputGroup.Input key="a" aria-label="Test" />,
        <InputGroup.Button key="b" aria-label="Toggle">
          Toggle
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("container");
    });

    it('returns "container" when a direct-child Button has variant="ghost"', () => {
      const children = [
        <InputGroup.Input key="a" aria-label="Test" />,
        <InputGroup.Button key="b" variant="ghost" aria-label="Toggle">
          Toggle
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("container");
    });

    it('returns "individual" when a direct-child Button has variant="secondary"', () => {
      const children = [
        <InputGroup.Button key="a" variant="secondary" aria-label="Prev">
          Prev
        </InputGroup.Button>,
        <InputGroup.Input key="b" aria-label="Page" />,
        <InputGroup.Button key="c" variant="secondary" aria-label="Next">
          Next
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("individual");
    });

    it('returns "individual" when a direct-child Button has variant="primary"', () => {
      const children = [
        <InputGroup.Input key="a" aria-label="Search" />,
        <InputGroup.Button key="b" variant="primary" aria-label="Submit">
          Go
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("individual");
    });

    it('returns "container" when children is null', () => {
      expect(detectFocusMode(null)).toBe("container");
    });

    it('returns "container" when children is undefined', () => {
      expect(detectFocusMode(undefined)).toBe("container");
    });

    it('returns "container" when children is a string', () => {
      expect(detectFocusMode("hello")).toBe("container");
    });

    it('returns "individual" with mixed direct Button variants (one non-ghost is enough)', () => {
      const children = [
        <InputGroup.Button key="a" aria-label="Ghost">
          Ghost
        </InputGroup.Button>,
        <InputGroup.Input key="b" aria-label="Test" />,
        <InputGroup.Button key="c" variant="secondary" aria-label="Action">
          Action
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("individual");
    });

    it("ignores non-InputGroup.Button elements with variant props", () => {
      // A random element with a variant prop should not trigger individual mode
      const children = [
        <InputGroup.Input key="a" aria-label="Test" />,
        <FakeButton key="b" variant="secondary">
          Not a real InputGroup.Button
        </FakeButton>,
      ];
      expect(detectFocusMode(children)).toBe("container");
    });

    it('returns "container" for a single non-Button child', () => {
      const children = <InputGroup.Input aria-label="Test" />;
      expect(detectFocusMode(children)).toBe("container");
    });

    it('returns "hybrid" when both Addon and non-ghost Button are direct children', () => {
      const children = [
        <InputGroup.Addon key="a">@</InputGroup.Addon>,
        <InputGroup.Input key="b" aria-label="Email" />,
        <InputGroup.Button key="c" variant="secondary" aria-label="Submit">
          Go
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("hybrid");
    });

    it('returns "individual" when non-ghost Button is present but no Addon', () => {
      const children = [
        <InputGroup.Input key="a" aria-label="Search" />,
        <InputGroup.Button key="b" variant="primary" aria-label="Submit">
          Go
        </InputGroup.Button>,
      ];
      expect(detectFocusMode(children)).toBe("individual");
    });
  });

  describe("focus mode auto-detection (rendered)", () => {
    it('auto-detects "individual" when InputGroup.Button with variant="secondary" is a direct child', () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Button variant="secondary" aria-label="Action">
            Action
          </InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("individual");
    });

    it('defaults to "container" when all buttons are inside Addon', () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button aria-label="Help">Help</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("container");
    });

    it('defaults to "container" when Button has no variant (defaults to ghost)', () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { container } = render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Button aria-label="Toggle">Toggle</InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("container");
      warnSpy.mockRestore();
    });

    it('defaults to "container" when Button has variant="ghost"', () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Input aria-label="Test" />
          <InputGroup.Addon align="end">
            <InputGroup.Button variant="ghost" aria-label="Toggle">
              Toggle
            </InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("container");
    });

    it('auto-detects "individual" for variant="primary"', () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="primary" aria-label="Submit">
            Go
          </InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("individual");
    });

    it('auto-detects "individual" for variant="destructive"', () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Input aria-label="Confirm" />
          <InputGroup.Button variant="destructive" aria-label="Delete">
            Delete
          </InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("individual");
    });

    it('auto-detects "hybrid" when Addon and non-ghost Button are both direct children', () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input aria-label="Email" />
          <InputGroup.Button variant="secondary" aria-label="Submit">
            Go
          </InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector("[data-slot='input-group']");
      expect(group).toBeTruthy();
      expect(group!.getAttribute("data-focus-mode")).toBe("hybrid");
    });

    it("hybrid mode gets borderless container classes (same as individual)", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input aria-label="Email" />
          <InputGroup.Button variant="secondary" aria-label="Submit">
            Go
          </InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector(
        "[data-slot='input-group']",
      ) as HTMLElement;
      expect(group.className).toContain("overflow-visible");
      expect(group.className).toContain("ring-0");
      expect(group.className).not.toContain("overflow-hidden");
      expect(group.className).not.toContain("focus-within:ring-kumo-line");
    });

    it("container mode gets shared focus ring classes", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>@</InputGroup.Addon>
          <InputGroup.Input aria-label="Username" />
        </InputGroup>,
      );
      const group = container.querySelector(
        "[data-slot='input-group']",
      ) as HTMLElement;
      expect(group.className).toContain("overflow-hidden");
      expect(group.className).toContain("focus-within:ring-kumo-line");
      expect(group.className).not.toContain("overflow-visible");
    });

    it("individual mode gets borderless container classes", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Button variant="secondary" aria-label="Prev">
            Prev
          </InputGroup.Button>
          <InputGroup.Input aria-label="Page" />
          <InputGroup.Button variant="secondary" aria-label="Next">
            Next
          </InputGroup.Button>
        </InputGroup>,
      );
      const group = container.querySelector(
        "[data-slot='input-group']",
      ) as HTMLElement;
      expect(group.className).toContain("overflow-visible");
      expect(group.className).toContain("ring-0");
      expect(group.className).not.toContain("overflow-hidden");
      expect(group.className).not.toContain("focus-within:ring-kumo-line");
    });
  });

  describe("hybrid mode", () => {
    it("renders container zone wrapper in hybrid mode", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>icon</InputGroup.Addon>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="secondary">Search</InputGroup.Button>
        </InputGroup>,
      );
      const containerZone = container.querySelector(
        "[data-slot='input-group-container-zone']",
      );
      expect(containerZone).toBeTruthy();
    });

    it("places Addon and Input inside container zone", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>icon</InputGroup.Addon>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="secondary">Search</InputGroup.Button>
        </InputGroup>,
      );
      const containerZone = container.querySelector(
        "[data-slot='input-group-container-zone']",
      ) as HTMLElement;
      expect(within(containerZone).getByRole("textbox")).toBeTruthy();
      expect(within(containerZone).getByText("icon")).toBeTruthy();
    });

    it("places Button outside container zone", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>icon</InputGroup.Addon>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="secondary">Search</InputGroup.Button>
        </InputGroup>,
      );
      const containerZone = container.querySelector(
        "[data-slot='input-group-container-zone']",
      ) as HTMLElement;
      const button = screen.getByRole("button", { name: "Search" });
      // Button should NOT be inside the container zone — it should be a sibling
      expect(containerZone.contains(button)).toBe(false);
      // Button should still be inside the input-group root
      const group = container.querySelector(
        "[data-slot='input-group']",
      ) as HTMLElement;
      expect(group.contains(button)).toBe(true);
    });

    it("Input inside container zone uses container-mode styling", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>icon</InputGroup.Addon>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="secondary">Search</InputGroup.Button>
        </InputGroup>,
      );
      const input = screen.getByRole("textbox");
      // Container-mode inputs use ring-0! to suppress their own border,
      // delegating the border to the container zone wrapper instead.
      expect(input.className).toContain("ring-0!");
    });

    it("Button outside container zone uses individual-mode styling", () => {
      render(
        <InputGroup>
          <InputGroup.Addon>icon</InputGroup.Addon>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="secondary">Search</InputGroup.Button>
        </InputGroup>,
      );
      const button = screen.getByRole("button", { name: "Search" });
      // Individual-mode buttons should have their own border styling
      expect(button.className).toContain("border");
    });

    it("container zone has correct border and overflow styling", () => {
      const { container } = render(
        <InputGroup>
          <InputGroup.Addon>icon</InputGroup.Addon>
          <InputGroup.Input aria-label="Search" />
          <InputGroup.Button variant="secondary">Search</InputGroup.Button>
        </InputGroup>,
      );
      const containerZone = container.querySelector(
        "[data-slot='input-group-container-zone']",
      ) as HTMLElement;
      expect(containerZone.className).toContain("overflow-hidden");
      // Clean 1px CSS border (no ring or shadow stacking)
      expect(containerZone.className).toContain("border");
      expect(containerZone.className).toContain("border-kumo-line");
      expect(containerZone.className).toContain("ring-0");
      expect(containerZone.className).toContain("shadow-none");
      // Double-border prevention with adjacent individual-mode buttons
      expect(containerZone.className).toContain("not-first:border-l-0");
      // No focus-within ring — CSS outline in kumo-binding.css handles focus
      expect(containerZone.className).not.toContain(
        "focus-within:ring-kumo-line",
      );
    });
  });
});
