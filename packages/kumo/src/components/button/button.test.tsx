import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "./button";

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
  });
});
