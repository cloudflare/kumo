import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { useEffect } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import {
  Toasty,
  createKumoToastManager,
  useKumoToastManager,
  type KumoToastPosition,
} from "./toast";
import { KumoPortalProvider } from "../../utils/portal-provider";

const surfaceOf = (text: string) =>
  screen
    .getByText(text)
    .closest('[role="dialog"]')
    ?.querySelector('[data-kumo-part="surface"]');

const isBumping = (text: string) =>
  /animate-toast-bump/.test(surfaceOf(text)?.className ?? "");

const rootOf = (text: string) =>
  screen.getByText(text).closest('[role="dialog"]') as HTMLElement;

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

  it("uses logical positioning and reserves space for the close button", async () => {
    const mgr = createKumoToastManager();

    render(
      <Toasty toastManager={mgr}>
        <div />
      </Toasty>,
    );

    act(() => {
      mgr.add({
        title: "Plugin changes were not applied to your site",
        variant: "error",
      });
    });

    await screen.findByText("Plugin changes were not applied to your site");
    const root = rootOf("Plugin changes were not applied to your site");
    const viewport = root.parentElement;
    const content = root.querySelector('[data-kumo-part="content"]');
    const close = root.querySelector('[data-kumo-part="close"]');

    expect(viewport?.className).toContain("end-4");
    expect(viewport?.className).toContain("sm:end-8");
    expect(root.className).toContain("end-0");
    expect(root.className).toContain("start-auto");
    expect(root.className).toContain("after:start-0");
    expect(content?.className).toContain("pe-6");
    expect(close?.className).toContain("end-2");
  });

  it("configures swipe toward the inline end in RTL", async () => {
    const mgr = createKumoToastManager();

    render(
      <DirectionProvider direction="rtl">
        <Toasty toastManager={mgr}>
          <div />
        </Toasty>
      </DirectionProvider>,
    );

    act(() => {
      mgr.add({ title: "لم تُطبَّق تغييرات الإضافة" });
    });

    await screen.findByText("لم تُطبَّق تغييرات الإضافة");
    const root = rootOf("لم تُطبَّق تغييرات الإضافة");

    expect(root.getAttribute("data-kumo-swipe-direction")).toBe("down left");
  });

  it("preserves toast identity and updates swipe directions when position changes", async () => {
    const mgr = createKumoToastManager();
    const positions: Array<[KumoToastPosition, string]> = [
      ["top-left", "up left"],
      ["top-center", "up"],
      ["top-right", "up right"],
      ["bottom-left", "down left"],
      ["bottom-center", "down"],
      ["bottom-right", "down right"],
    ];
    const view = render(
      <Toasty position="top-left" toastManager={mgr}>
        <div />
      </Toasty>,
    );

    act(() => {
      mgr.add({ title: "Positioned toast" });
    });

    await screen.findByText("Positioned toast");
    const root = rootOf("Positioned toast");

    for (const [position, swipeDirections] of positions) {
      view.rerender(
        <Toasty position={position} toastManager={mgr}>
          <div />
        </Toasty>,
      );

      expect(rootOf("Positioned toast")).toBe(root);
      expect(root.getAttribute("data-kumo-swipe-direction")).toBe(
        swipeDirections,
      );
    }
  });

  it.each([false, true])(
    "preserves portal containers while positioned (explicit override: %s)",
    async (useExplicitContainer) => {
      const contextContainer = document.createElement("div");
      const explicitContainer = document.createElement("div");
      document.body.append(contextContainer, explicitContainer);
      const mgr = createKumoToastManager();
      const view = render(
        <KumoPortalProvider container={contextContainer}>
          <Toasty
            position="top-center"
            container={useExplicitContainer ? explicitContainer : undefined}
            toastManager={mgr}
          >
            <div />
          </Toasty>
        </KumoPortalProvider>,
      );

      try {
        act(() => {
          mgr.add({ title: "Toast in custom container" });
        });

        const target = useExplicitContainer
          ? explicitContainer
          : contextContainer;
        const other = useExplicitContainer
          ? contextContainer
          : explicitContainer;
        expect(
          await within(target).findByText("Toast in custom container"),
        ).toBeTruthy();
        expect(
          within(other).queryByText("Toast in custom container"),
        ).toBeNull();
      } finally {
        view.unmount();
        contextContainer.remove();
        explicitContainer.remove();
      }
    },
  );
});
