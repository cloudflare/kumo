import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useEffect } from "react";
import { Toasty, createKumoToastManager, useKumoToastManager } from "./toast";

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

  // Duplicate ids dispatched through an external manager must not
  // produce duplicate DOM nodes. (The exact merge semantics — replace vs
  // bump — are owned by `wrapManagerMethods` / base-ui and tested
  // elsewhere; this test only guards against the regression of two
  // toast roots rendering for the same id.)
  it("does not render duplicate toast roots for the same id via an external manager", async () => {
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

    // Exactly one toast title rendered — not two.
    await screen.findByText("second");
    const titles = document.querySelectorAll("[data-toast-title]");
    expect(titles).toHaveLength(1);
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
