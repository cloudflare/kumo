import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { Tabs } from "./tabs";

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "metrics", label: "Metrics" },
  { value: "settings", label: "Settings" },
];

let resizeObserverCallbacks: ResizeObserverCallback[] = [];
let OriginalResizeObserver: typeof ResizeObserver;
let originalGetAnimationsDescriptor: PropertyDescriptor | undefined;

function setHorizontalScrollMetrics(
  el: HTMLElement,
  {
    clientWidth,
    scrollLeft = 0,
    scrollWidth,
  }: { clientWidth: number; scrollLeft?: number; scrollWidth: number },
) {
  Object.defineProperties(el, {
    clientWidth: { configurable: true, value: clientWidth },
    scrollWidth: { configurable: true, value: scrollWidth },
  });
  el.scrollLeft = scrollLeft;
}

async function renderTabs(ui: ReactElement) {
  const result = render(ui);
  await act(async () => {
    await Promise.resolve();
  });
  return result;
}

function triggerResize() {
  act(() => {
    for (const callback of resizeObserverCallbacks) {
      callback([], {} as ResizeObserver);
    }
  });
}

function setElementOffsetMetrics(
  el: HTMLElement,
  { offsetLeft, offsetWidth }: { offsetLeft: number; offsetWidth: number },
) {
  Object.defineProperties(el, {
    offsetLeft: { configurable: true, value: offsetLeft },
    offsetWidth: { configurable: true, value: offsetWidth },
  });
}

function mockElementScrollTo(el: HTMLElement) {
  const scrollToMock = vi.fn();
  Object.defineProperty(el, "scrollTo", {
    configurable: true,
    value: scrollToMock,
  });
  return scrollToMock;
}

describe("Tabs", () => {
  beforeEach(() => {
    OriginalResizeObserver = globalThis.ResizeObserver;
    originalGetAnimationsDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "getAnimations",
    );
    Object.defineProperty(HTMLElement.prototype, "getAnimations", {
      configurable: true,
      value: vi.fn(() => []),
    });
    resizeObserverCallbacks = [];
    globalThis.ResizeObserver = class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallbacks.push(callback);
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    globalThis.ResizeObserver = OriginalResizeObserver;
    if (originalGetAnimationsDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "getAnimations",
        originalGetAnimationsDescriptor,
      );
    } else {
      delete (HTMLElement.prototype as { getAnimations?: unknown }).getAnimations;
    }
    resizeObserverCallbacks = [];
    vi.restoreAllMocks();
  });

  it("renders segmented tabs as a Base UI ScrollArea viewport with the fade hook", async () => {
    await renderTabs(<Tabs tabs={tabs} />);
    const list = screen.getByRole("tablist");

    expect(list.getAttribute("data-kumo-scroll-fade")).toBe("");
    expect(list.className).toContain("base-ui-disable-scrollbar");
    expect(list.className).toContain("overflow-y-hidden!");
  });

  it("keeps underline tabs out of a ScrollArea viewport so focus rings are not clipped", async () => {
    await renderTabs(<Tabs tabs={tabs} variant="underline" />);
    const list = screen.getByRole("tablist");

    expect(list.hasAttribute("data-kumo-scroll-fade")).toBe(false);
    expect(list.className).not.toContain("base-ui-disable-scrollbar");
    expect(list.className).toContain("border-b");
  });

  it("does not autoscroll underline tabs", async () => {
    await renderTabs(<Tabs tabs={tabs} variant="underline" value="settings" />);
    const list = screen.getByRole("tablist");
    const scrollToMock = mockElementScrollTo(list);

    setHorizontalScrollMetrics(list, { clientWidth: 200, scrollWidth: 500 });
    triggerResize();

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("does not autoscroll when segmented tabs do not overflow", async () => {
    await renderTabs(<Tabs tabs={tabs} value="settings" />);
    const list = screen.getByRole("tablist");
    const scrollToMock = mockElementScrollTo(list);

    setHorizontalScrollMetrics(list, { clientWidth: 300, scrollWidth: 300 });
    triggerResize();

    expect(scrollToMock).not.toHaveBeenCalled();
  });

  it("positions the selected segmented tab after overflow is measured", async () => {
    await renderTabs(<Tabs tabs={tabs} value="settings" />);
    const list = screen.getByRole("tablist");
    const selectedTab = screen.getByRole("tab", { selected: true });
    const scrollToMock = mockElementScrollTo(list);

    setHorizontalScrollMetrics(list, { clientWidth: 200, scrollWidth: 500 });
    setElementOffsetMetrics(selectedTab, { offsetLeft: 260, offsetWidth: 80 });
    triggerResize();

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({ left: 188, behavior: "auto" });
    });
  });

  it("smoothly scrolls when the controlled selected segmented tab changes", async () => {
    const { rerender } = await renderTabs(<Tabs tabs={tabs} value="metrics" />);
    const list = screen.getByRole("tablist");
    const scrollToMock = mockElementScrollTo(list);
    const settingsTab = screen.getByRole("tab", { name: "Settings" });
    setElementOffsetMetrics(screen.getByRole("tab", { selected: true }), {
      offsetLeft: 60,
      offsetWidth: 80,
    });

    setHorizontalScrollMetrics(list, { clientWidth: 200, scrollWidth: 500 });
    triggerResize();
    scrollToMock.mockClear();

    setElementOffsetMetrics(settingsTab, {
      offsetLeft: 260,
      offsetWidth: 80,
    });
    await act(async () => {
      rerender(<Tabs tabs={tabs} value="settings" />);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({ left: 188, behavior: "smooth" });
    });
  });

  it("only scrolls the tablist horizontally when positioning the active tab", async () => {
    const windowScrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    await renderTabs(<Tabs tabs={tabs} value="settings" />);
    const list = screen.getByRole("tablist");
    const selectedTab = screen.getByRole("tab", { selected: true });
    const scrollToMock = mockElementScrollTo(list);

    setHorizontalScrollMetrics(list, { clientWidth: 200, scrollWidth: 500 });
    setElementOffsetMetrics(selectedTab, { offsetLeft: 260, offsetWidth: 80 });
    triggerResize();

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({ left: 188, behavior: "auto" });
    });
    expect(windowScrollTo).not.toHaveBeenCalled();
  });

  it("uses scroll padding on the tab list so native scrolling keeps tabs out of fade zones", async () => {
    await renderTabs(<Tabs tabs={tabs} />);
    const list = screen.getByRole("tablist");

    expect(list.className).toContain(
      "[scroll-padding-inline:var(--scroll-fade-width,3rem)]",
    );
  });
});
