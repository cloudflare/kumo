import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Dialog } from "./dialog";

/**
 * Helpers
 * -------
 * Render an open dialog with a `<Dialog.Close>` button so we can exercise
 * each dismissal path (Escape, outside click, close-button click) against
 * the `busy` prop.
 */
function ControlledDialog({
  initialOpen = true,
  busy,
  onOpenChange,
  role = "dialog",
}: {
  initialOpen?: boolean;
  busy?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: "dialog" | "alertdialog";
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <Dialog.Root
      role={role}
      open={open}
      busy={busy}
      onOpenChange={(next, details) => {
        setOpen(next);
        onOpenChange?.(next);
        // Surface the reason on a data attribute for assertions.
        if (details?.reason) {
          document.body.setAttribute(
            "data-last-reason",
            String(details.reason),
          );
        }
      }}
    >
      <Dialog>
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Body</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog>
    </Dialog.Root>
  );
}

describe("Dialog — baseline", () => {
  it("renders open with title, description, and close button", () => {
    render(<ControlledDialog />);
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Body")).toBeTruthy();
    expect(screen.getByText("Close")).toBeTruthy();
  });
});

describe("Dialog — busy prop", () => {
  it("when busy=true, swallows close-button presses", () => {
    const onOpenChange = vi.fn();
    render(<ControlledDialog busy onOpenChange={onOpenChange} />);

    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    // Dialog is still in the document (still open).
    expect(screen.queryByText("Title")).toBeTruthy();
  });

  it("when busy=true, swallows Escape", () => {
    const onOpenChange = vi.fn();
    render(<ControlledDialog busy onOpenChange={onOpenChange} />);

    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText("Title")).toBeTruthy();
  });

  it("when busy=false, close-button presses fire onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    render(<ControlledDialog onOpenChange={onOpenChange} />);

    act(() => {
      fireEvent.click(screen.getByText("Close"));
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("when busy=true on an alertdialog, swallows Escape", () => {
    const onOpenChange = vi.fn();
    render(
      <ControlledDialog role="alertdialog" busy onOpenChange={onOpenChange} />,
    );

    act(() => {
      fireEvent.keyDown(document.body, { key: "Escape" });
    });

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("programmatic close still works while busy=true", () => {
    // Render a wrapper that flips `open` from the parent: this simulates
    // a Save handler resolving after busy is cleared. The dialog should
    // close even though busy was true earlier, because programmatic
    // `open={false}` does not go through the dismissal-reason path.
    function Programmatic() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(false)} data-testid="external-close">
            external close
          </button>
          <Dialog.Root open={open} busy onOpenChange={setOpen}>
            <Dialog>
              <Dialog.Title>Programmatic</Dialog.Title>
            </Dialog>
          </Dialog.Root>
        </>
      );
    }
    render(<Programmatic />);
    expect(screen.queryByText("Programmatic")).toBeTruthy();

    act(() => {
      fireEvent.click(screen.getByTestId("external-close"));
    });

    expect(screen.queryByText("Programmatic")).toBeNull();
  });
});

describe("Dialog — size variants", () => {
  it('size="2xl" applies the 64rem min-width class', () => {
    render(
      <Dialog.Root open>
        <Dialog size="2xl">
          <Dialog.Title>Wide</Dialog.Title>
        </Dialog>
      </Dialog.Root>,
    );

    const panel =
      screen.getByText("Wide").closest("[data-kumo-component]") ??
      screen.getByText("Wide").parentElement;
    // Walk up to find the popup element carrying the size class.
    let el: HTMLElement | null = panel as HTMLElement | null;
    while (el && !el.className.includes("min-w-")) {
      el = el.parentElement;
    }
    expect(el).not.toBeNull();
    expect(el!.className).toContain("min-w-[64rem]");
  });
});

describe("Dialog — verticalAlign + topOffset", () => {
  it('default verticalAlign="center" applies top-1/2 and -translate-y-1/2', () => {
    render(
      <Dialog.Root open>
        <Dialog>
          <Dialog.Title>Centered</Dialog.Title>
        </Dialog>
      </Dialog.Root>,
    );

    let el: HTMLElement | null = screen.getByText("Centered").parentElement;
    while (el && !el.className.includes("top-1/2")) {
      el = el.parentElement;
    }
    expect(el).not.toBeNull();
    expect(el!.className).toContain("-translate-y-1/2");
    // No inline `top` because verticalAlign="center" leaves it to the class.
    expect(el!.style.top).toBe("");
  });

  it('verticalAlign="top" with topOffset={49} applies inline top:49px and drops the centering classes', () => {
    render(
      <Dialog.Root open>
        <Dialog verticalAlign="top" topOffset={49}>
          <Dialog.Title>Top-anchored</Dialog.Title>
        </Dialog>
      </Dialog.Root>,
    );

    let el: HTMLElement | null = screen.getByText("Top-anchored").parentElement;
    while (el && el.style && el.style.top !== "49px") {
      el = el.parentElement;
    }
    expect(el).not.toBeNull();
    expect(el!.style.top).toBe("49px");
    expect(el!.className).not.toContain("top-1/2");
    expect(el!.className).not.toContain("-translate-y-1/2");
  });

  it('verticalAlign="top" without topOffset defaults to top:0px', () => {
    render(
      <Dialog.Root open>
        <Dialog verticalAlign="top">
          <Dialog.Title>Top-no-offset</Dialog.Title>
        </Dialog>
      </Dialog.Root>,
    );

    let el: HTMLElement | null =
      screen.getByText("Top-no-offset").parentElement;
    while (el && el.style && el.style.top !== "0px") {
      el = el.parentElement;
    }
    expect(el).not.toBeNull();
    expect(el!.style.top).toBe("0px");
  });
});
