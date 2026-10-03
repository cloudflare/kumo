import { expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Tabs } from "./tabs";

const tabs = [
  { value: "first", label: "First" },
  { value: "middle", label: "A longer middle tab" },
  { value: "last", label: "Last" },
];

for (const variant of ["segmented", "underline"] as const) {
  for (const selectedValue of ["first", "last"]) {
    test(`${variant} indicator fades in centered on the ${selectedValue} tab`, async () => {
      const screen = await render(
        <Tabs
          tabs={tabs}
          variant={variant}
          selectedValue={selectedValue}
          indicatorClassName="duration-[10s]"
        />,
      );
      const indicator = screen.container.querySelector<HTMLElement>(
        '[role="presentation"]',
      )!;
      await expect.poll(() => indicator.hidden).toBe(false);
      const animations = indicator.getAnimations();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        expect(animations).toHaveLength(0);
        expect(Number(getComputedStyle(indicator).opacity)).toBe(1);
        return;
      }
      const opacity = animations.find(
        (animation) =>
          animation instanceof CSSTransition &&
          animation.transitionProperty === "opacity",
      );
      expect(opacity).toBeDefined();
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = 0;
      }
      expect(Number(getComputedStyle(indicator).opacity)).toBe(0);
      const activeTab = screen.container.querySelector(
        '[aria-selected="true"]',
      )!;
      const tabRect = activeTab.getBoundingClientRect();
      const indicatorRect = indicator.getBoundingClientRect();
      expect(
        Math.abs(
          indicatorRect.x +
            indicatorRect.width / 2 -
            (tabRect.x + tabRect.width / 2),
        ),
      ).toBeLessThan(1);
      for (const animation of animations) animation.finish();
      await expect
        .poll(() => Number(getComputedStyle(indicator).opacity))
        .toBe(1);
    });
  }
}
