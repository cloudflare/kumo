import { DirectionProvider } from "@base-ui/react/direction-provider";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import {
  Toasty,
  createKumoToastManager,
  type KumoToastPosition,
} from "./toast";

const positions: Array<KumoToastPosition> = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const initialDirection = document.documentElement.dir;

afterEach(() => {
  document.documentElement.dir = initialDirection;
});

function renderPosition(
  position?: KumoToastPosition,
  direction: "ltr" | "rtl" = "ltr",
) {
  document.documentElement.dir = direction;
  const manager = createKumoToastManager();
  return render(
    <DirectionProvider direction={direction}>
      <Toasty position={position} toastManager={manager}>
        <button
          onClick={() =>
            manager.add({ title: "Positioned notification", timeout: 0 })
          }
        >
          Show notification
        </button>
        <button
          onClick={() => {
            manager.add({
              title: "Tall notification",
              content: <div style={{ height: 140 }}>Tall notification</div>,
              timeout: 0,
            });
            manager.add({ title: "Short notification", timeout: 0 });
          }}
        >
          Show stack
        </button>
      </Toasty>
    </DirectionProvider>,
  );
}

function rootOf(element: Element) {
  return element.closest<HTMLElement>("[role='dialog']")!;
}

describe("Toasty positioning", () => {
  test.each(positions)(
    "anchors %s to the selected screen edges",
    async (position) => {
      await page.viewport(1024, 768);
      const view = await renderPosition(position);
      await view.getByRole("button", { name: "Show notification" }).click();

      const root = rootOf(view.getByText("Positioned notification").element());
      const isTop = position.startsWith("top");

      await expect
        .poll(() => {
          const rect = root.getBoundingClientRect();
          return isTop ? rect.top : window.innerHeight - rect.bottom;
        })
        .toBeCloseTo(32, 0);

      const rect = root.getBoundingClientRect();
      expect(rect.width).toBeCloseTo(340, 0);
      if (position.endsWith("left")) {
        expect(rect.left).toBeCloseTo(32, 0);
      } else if (position.endsWith("right")) {
        expect(window.innerWidth - rect.right).toBeCloseTo(32, 0);
      } else {
        expect(rect.left + rect.width / 2).toBeCloseTo(
          window.innerWidth / 2,
          0,
        );
      }
    },
  );

  test("keeps centered toasts within mobile screen gutters", async () => {
    await page.viewport(375, 667);
    const view = await renderPosition("top-center");
    await view.getByRole("button", { name: "Show notification" }).click();

    const root = rootOf(view.getByText("Positioned notification").element());
    await expect
      .poll(() => root.getBoundingClientRect().top)
      .toBeCloseTo(16, 0);
    const rect = root.getBoundingClientRect();
    expect(rect.left).toBeCloseTo(16, 0);
    expect(window.innerWidth - rect.right).toBeCloseTo(16, 0);
    expect(rect.width).toBeCloseTo(343, 0);
  });

  test.each([
    [undefined, "left"],
    ["top-right", "right"],
  ] as const)(
    "preserves physical edges in RTL (position: %s)",
    async (position, edge) => {
      await page.viewport(1024, 768);
      const view = await renderPosition(position, "rtl");
      await view.getByRole("button", { name: "Show notification" }).click();

      const root = rootOf(view.getByText("Positioned notification").element());
      await expect
        .poll(() => {
          const rect = root.getBoundingClientRect();
          return edge === "left" ? rect.left : window.innerWidth - rect.right;
        })
        .toBeCloseTo(32, 0);
    },
  );

  test.each(["top-center", "bottom-center"] as const)(
    "stacks and dismisses different-height toasts at %s",
    async (position) => {
      await page.viewport(1024, 768);
      const view = await renderPosition(position);
      await view.getByRole("button", { name: "Show stack" }).click();

      const tall = rootOf(
        view.getByText("Tall notification", { exact: true }).element(),
      );
      const short = rootOf(
        view.getByText("Short notification", { exact: true }).element(),
      );
      const isTop = position.startsWith("top");
      await expect
        .poll(() => {
          const tallRect = tall.getBoundingClientRect();
          const shortRect = short.getBoundingClientRect();
          return isTop
            ? tallRect.top - shortRect.top
            : shortRect.bottom - tallRect.bottom;
        })
        .toBeGreaterThan(1);
      await view.getByText("Short notification", { exact: true }).hover();

      await expect
        .poll(() => {
          const tallRect = tall.getBoundingClientRect();
          const shortRect = short.getBoundingClientRect();
          return isTop
            ? tallRect.top - shortRect.bottom
            : shortRect.top - tallRect.bottom;
        })
        .toBeCloseTo(12, 0);

      expect(tall.getBoundingClientRect().height).toBeGreaterThan(
        short.getBoundingClientRect().height,
      );
      expect(
        getComputedStyle(tall.querySelector("[data-kumo-part='content']")!)
          .opacity,
      ).toBe("1");

      // Slow only the exit so its direction can be observed before unmount.
      short.style.transitionDuration = "10s";
      const before = short.getBoundingClientRect().top;
      short
        .querySelector<HTMLButtonElement>("[data-kumo-part='close']")!
        .click();
      await expect
        .poll(() => short.hasAttribute("data-ending-style"))
        .toBe(true);
      if (isTop) {
        await expect
          .poll(() => short.getBoundingClientRect().top)
          .toBeLessThan(before);
      } else {
        await expect
          .poll(() => short.getBoundingClientRect().top)
          .toBeGreaterThan(before);
      }
    },
  );
});
