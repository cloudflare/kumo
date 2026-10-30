import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { useEffect } from "react";
import { Toasty, createKumoToastManager, useKumoToastManager } from "./toast";

const surfaceOf = (text: string) =>
  screen
    .getByText(text)
    .closest('[role="dialog"]')
    ?.querySelector('[data-kumo-part="surface"]');

const isBumping = (text: string) =>
  /animate-toast-bump/.test(surfaceOf(text)?.className ?? "");

describe("Toasty", () => {
  // Regression guard: existing callers that don't pass `toastManager`
  // must continue to work via the in-tree `useKumoToastManager` hook.
  it("renders without a toastManager prop and accepts in-tree dispatch", async () => {
    function TriggerOnMount() {
      const toasts = useKumoToastManager();
      useEffect(() => {
        toasts.add({ title: "from inside" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return null;
    }

    render(
      <Toasty>
        <TriggerOnMount />
      </Toasty>,
    );

    expect(await screen.findByText("from inside")).toBeTruthy();
  });

  // Headline feature: an external manager passed via the prop allows
  // dispatch from outside the React tree.
  it("dispatches toasts via an external manager passed as a prop", async () => {
    const mgr = createKumoToastManager();

    render(
      <Toasty toastManager={mgr}>
        <div />
      </Toasty>,
    );

    act(() => {
      mgr.add({ title: "from outside" });
    });

    expect(await screen.findByText("from outside")).toBeTruthy();
  });

  it("updates toasts from their current state", async () => {
    const mgr = createKumoToastManager();

    render(
      <Toasty toastManager={mgr}>
        <div />
      </Toasty>,
    );

    act(() => {
      const id = mgr.add({ title: "Saving" });
      mgr.update(id, (toast) => {
        expect(toast.title).toBe("Saving");
        return { title: "Saving complete" };
      });
    });

    await screen.findByText("Saving complete");
    expect(isBumping("Saving complete")).toBe(false);
  });

  // Duplicate ids dispatched through an external manager must not
  // produce duplicate DOM nodes, and should bump the existing toast.
  it("bumps a single toast root for duplicate ids via an external manager", async () => {
    const mgr = createKumoToastManager();

    render(
      <Toasty toastManager={mgr}>
        <div />
      </Toasty>,
    );

    act(() => {
      mgr.add({ id: "dupe", title: "first" });
      mgr.add({ id: "dupe", title: "second" });
    });

    await screen.findByText("second");
    expect(document.querySelectorAll("[data-toast-title]")).toHaveLength(1);
    expect(isBumping("second")).toBe(true);
  });

  // Regression: the bump must run on the inner surface, so it never cancels
  // the root's slide-in, and repeated bumps must replay.
  it("bumps the surface, not the sliding root, on repeated in-tree adds", async () => {
    function DuplicateToastTrigger() {
      const toasts = useKumoToastManager();
      return (
        <button
          onClick={() =>
            toasts.add({ id: "rapid-dupe", title: "Repeated toast" })
          }
        >
          Show repeated toast
        </button>
      );
    }

    render(
      <Toasty>
        <DuplicateToastTrigger />
      </Toasty>,
    );

    const button = screen.getByRole("button", { name: "Show repeated toast" });
    fireEvent.click(button);
    const root = (await screen.findByText("Repeated toast")).closest(
      '[role="dialog"]',
    );

    fireEvent.click(button);
    const firstBump = surfaceOf("Repeated toast")?.className;
    fireEvent.click(button);

    expect(screen.getAllByText("Repeated toast")).toHaveLength(1);
    expect(screen.getByText("Repeated toast").closest('[role="dialog"]')).toBe(
      root,
    );
    expect(root?.className).not.toMatch(/animate-toast-bump/);
    expect(isBumping("Repeated toast")).toBe(true);
    expect(surfaceOf("Repeated toast")?.className).not.toBe(firstBump);
  });

  // `useKumoToastManager()` inside a tree wrapped with an external manager
  // must return that same manager — so in-tree and out-of-tree dispatch
  // converge on a single instance.
  it("exposes the same manager instance to useKumoToastManager inside the tree", async () => {
    const mgr = createKumoToastManager();
    let inTreeAdd: ((opts: { title: string }) => string) | undefined;

    function CaptureManager() {
      const toasts = useKumoToastManager();
      inTreeAdd = toasts.add;
      return null;
    }

    render(
      <Toasty toastManager={mgr}>
        <CaptureManager />
      </Toasty>,
    );

    // External dispatch.
    act(() => {
      mgr.add({ title: "external" });
    });
    expect(await screen.findByText("external")).toBeTruthy();

    // In-tree dispatch via the hook.
    act(() => {
      inTreeAdd?.({ title: "in-tree" });
    });
    expect(await screen.findByText("in-tree")).toBeTruthy();
  });
});
