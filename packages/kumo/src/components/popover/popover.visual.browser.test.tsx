import { describe, expect, test } from "vite-plus/test";
import { render } from "vitest-browser-react";
import { Popover } from "./popover";

describe("Popover", () => {
  test("uses Base UI composition and scales from the positioned origin", async () => {
    const { getByRole } = await render(
      <>
        <style>{`
          .kumo-popover-popup {
            transition-duration: 10s !important;
          }
        `}</style>
        <Popover.Root>
          <Popover.Trigger>Open composed popover</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner>
              <Popover.Popup className={() => "popup-state-class"}>
                <Popover.Arrow className={() => "arrow-state-class"} />
                <Popover.Title>Composed popover</Popover.Title>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </>,
    );

    await getByRole("button", { name: "Open composed popover" }).click();

    const popup = getByRole("dialog").element();
    await expect
      .poll(() => Number.parseFloat(getComputedStyle(popup).opacity))
      .toBeGreaterThan(0);

    const arrow = popup.querySelector<HTMLElement>("[data-kumo-part='arrow']");
    expect(arrow).not.toBeNull();
    expect(arrow?.parentElement).toBe(popup);
    expect(popup).toHaveClass("popup-state-class");
    expect(arrow).toHaveClass("arrow-state-class");
    expect(getComputedStyle(popup).transformOrigin).not.toBe("50% 50%");
    expect(Number.parseFloat(getComputedStyle(popup).scale)).toBeLessThan(1);
    expect(getComputedStyle(popup).transitionProperty).toContain("scale");
  });

  test("keeps the arrow visible while popup content scrolls during the opening transition", async () => {
    const { getByRole } = await render(
      <>
        <style>{`
          .kumo-popover-popup {
            transition-duration: 10s !important;
          }

          .kumo-popover-popup[data-ending-style] {
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

    await getByRole("button", { name: "Open popover" }).click();

    const popup = getByRole("dialog").element();
    await expect
      .poll(() => Number.parseFloat(getComputedStyle(popup).opacity))
      .toBeGreaterThan(0);

    const arrow = popup.querySelector<HTMLElement>("[aria-hidden='true']");
    expect(arrow).not.toBeNull();
    expect(Number.parseFloat(getComputedStyle(popup).opacity)).toBeLessThan(1);
    expect(getComputedStyle(popup).position).toBe("static");
    expect(getComputedStyle(popup).scale).toBe("none");
    expect(getComputedStyle(popup).transitionProperty).toBe("opacity");

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
  });
});
