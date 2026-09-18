import { describe, expect, test } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";
import { Popover } from "./popover";

describe("Popover", () => {
  test("keeps the arrow outside scrollable content during the opening scale transition", async () => {
    const { getByRole } = await render(
      <>
        <style>{`
          .kumo-popover-popup {
            transition-duration: 50ms !important;
          }

          *:has(> .kumo-popover-popup:not([data-ending-style]):not([data-instant])) {
            transition-duration: 10s !important;
          }

          *:has(> .kumo-popover-popup[data-ending-style]) {
            transition-duration: 0s !important;
          }
        `}</style>
        <Popover>
          <Popover.Trigger>Open popover</Popover.Trigger>
          <Popover.Content className="h-24 w-56 overflow-auto">
            <div className="h-96 shrink-0">Scrollable content</div>
          </Popover.Content>
        </Popover>
      </>,
    );

    const trigger = getByRole("button", { name: "Open popover" });
    await trigger.click();

    const popup = getByRole("dialog").element();
    await expect.poll(() => getComputedStyle(popup).opacity).toBe("1");

    const motionWrapper = popup.parentElement;
    const arrow = popup.querySelector<HTMLElement>("[aria-hidden='true']");

    expect(motionWrapper).not.toBeNull();
    expect(arrow).not.toBeNull();
    expect(getComputedStyle(popup).scale).toBe("none");
    expect(getComputedStyle(popup).transitionProperty).toBe("opacity");

    const wrapperScale = Number.parseFloat(
      getComputedStyle(motionWrapper!).scale,
    );
    expect(wrapperScale).toBeGreaterThanOrEqual(0.9);
    expect(wrapperScale).toBeLessThan(1);

    expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
    const arrowTopBeforeScroll = arrow!.getBoundingClientRect().top;

    popup.scrollTop = 64;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    expect(popup.scrollTop).toBe(64);
    expect(
      Math.abs(arrow!.getBoundingClientRect().top - arrowTopBeforeScroll),
    ).toBeLessThan(1);

    const arrowRect = arrow!.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const hitTarget = document.elementFromPoint(
      arrowRect.left + arrowRect.width / 2,
      arrowRect.top + arrowRect.height / 4,
    );

    expect(arrowRect.top).toBeLessThan(popupRect.top);
    expect(hitTarget === arrow || arrow!.contains(hitTarget)).toBe(true);

    await trigger.click();
    await expect.poll(() => popup.hasAttribute("data-ending-style")).toBe(true);
    expect(document.body.contains(popup)).toBe(true);
    expect(getComputedStyle(motionWrapper!).scale).toBe("0.9");
    await expect.element(getByRole("dialog")).not.toBeInTheDocument();

    trigger.element().focus();
    await userEvent.keyboard("{Enter}");
    await expect.element(getByRole("dialog")).toBeInTheDocument();

    const instantPopup = getByRole("dialog").element();
    await expect
      .poll(() => instantPopup.hasAttribute("data-instant"))
      .toBe(true);
    expect(
      getComputedStyle(instantPopup.parentElement!).transitionDuration,
    ).toBe("0s");
  });
});
