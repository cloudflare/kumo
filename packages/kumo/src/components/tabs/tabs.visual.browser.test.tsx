import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Tabs } from "./tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "analytics", label: "Analytics" },
  { value: "reports", label: "Reports" },
  { value: "notifications", label: "Notifications" },
  { value: "settings", label: "Settings" },
];

async function renderOverflowingTabs(dir: "ltr" | "rtl") {
  const screen = await render(
    <div dir={dir} style={{ width: 320 }}>
      <Tabs tabs={tabs} selectedValue="overview" />
    </div>,
  );
  const list = screen.getByRole("tablist").element() as HTMLElement;
  const root = list.parentElement!;
  const control = (side: "start" | "end") => {
    const button = root.querySelector<HTMLButtonElement>(
      `[data-kumo-part="overflow-control"][data-side="${side}"]`,
    );
    if (!button) {
      throw new Error(`Tabs test overflow control not found: ${side}`);
    }
    return button;
  };
  const isShown = (side: "start" | "end") =>
    control(side).getAttribute("aria-hidden") === "false";
  const tab = (name: string) =>
    screen.getByRole("tab", { name }).element() as HTMLElement;

  await expect.poll(() => isShown("end")).toBe(true);

  return { list, root, control, isShown, tab };
}

function overlaps(a: DOMRect, b: DOMRect) {
  return a.left < b.right && b.left < a.right;
}

function pointsLeft(control: HTMLElement) {
  const path = control.querySelector("path")!;
  const toScreen = path.getScreenCTM()!;
  const length = path.getTotalLength();
  const tip = path.getPointAtLength(length / 2).matrixTransform(toScreen);
  const tail = path.getPointAtLength(0).matrixTransform(toScreen);
  return tip.x < tail.x;
}

/** Width of the faded strip on each physical edge, read from the computed scroll-fade mask. */
function fadedEdges(list: HTMLElement) {
  const mask = getComputedStyle(list).maskImage;
  const stops = mask.match(
    / ([\d.]+)px, rgb\(255, 255, 255\) (?:calc\(100% - ([\d.]+)px\)|100%)/,
  );
  if (!stops) {
    throw new Error(`Tabs test mask not recognized: ${mask}`);
  }
  const near = Number(stops[1]);
  const far = Number(stops[2] ?? 0);
  return mask.startsWith("linear-gradient(to right")
    ? { left: near, right: far }
    : { left: far, right: near };
}

describe("Tabs overflow direction", () => {
  test("shows the end arrow on the right in LTR and scrolls toward later tabs", async () => {
    const { list, root, control, isShown } = await renderOverflowingTabs("ltr");

    await expect.poll(() => fadedEdges(list)).toEqual({ left: 0, right: 48 });
    expect(isShown("start")).toBe(false);
    expect(control("end").getBoundingClientRect().right).toBe(
      root.getBoundingClientRect().right,
    );
    expect(pointsLeft(control("end"))).toBe(false);
    expect(control("end").getAttribute("aria-label")).toBe("Scroll tabs right");

    await userEvent.click(control("end"));

    await expect.poll(() => list.scrollLeft).toBeGreaterThan(0);
    await expect.poll(() => isShown("start")).toBe(true);
    expect(control("start").getBoundingClientRect().left).toBe(
      root.getBoundingClientRect().left,
    );
    expect(pointsLeft(control("start"))).toBe(true);
  });

  test("shows the end arrow on the left in RTL and scrolls toward later tabs", async () => {
    const { list, root, control, isShown, tab } =
      await renderOverflowingTabs("rtl");

    await expect.poll(() => fadedEdges(list)).toEqual({ left: 48, right: 0 });
    expect(isShown("start")).toBe(false);
    expect(control("end").getBoundingClientRect().left).toBe(
      root.getBoundingClientRect().left,
    );
    expect(
      overlaps(
        control("end").getBoundingClientRect(),
        tab("Overview").getBoundingClientRect(),
      ),
    ).toBe(false);
    expect(pointsLeft(control("end"))).toBe(true);
    expect(control("end").getAttribute("aria-label")).toBe("Scroll tabs left");

    await userEvent.click(control("end"));

    await expect.poll(() => list.scrollLeft).toBeLessThan(0);
    await expect.poll(() => isShown("start")).toBe(true);
    expect(control("start").getBoundingClientRect().right).toBe(
      root.getBoundingClientRect().right,
    );
    expect(pointsLeft(control("start"))).toBe(false);
    expect(control("start").getAttribute("aria-label")).toBe(
      "Scroll tabs right",
    );
  });

  test("keeps an LTR tab list inside an RTL page left-to-right", async () => {
    const screen = await render(
      <div dir="rtl">
        <div dir="ltr" style={{ width: 320 }}>
          <Tabs tabs={tabs} selectedValue="overview" />
        </div>
      </div>,
    );
    const list = screen.getByRole("tablist").element() as HTMLElement;
    const root = list.parentElement!;
    const end = root.querySelector<HTMLElement>(
      '[data-kumo-part="overflow-control"][data-side="end"]',
    )!;

    await expect.poll(() => end.getAttribute("aria-hidden")).toBe("false");
    await expect.poll(() => fadedEdges(list)).toEqual({ left: 0, right: 48 });
    expect(end.getBoundingClientRect().right).toBe(
      root.getBoundingClientRect().right,
    );
    expect(pointsLeft(end)).toBe(false);
  });
});
