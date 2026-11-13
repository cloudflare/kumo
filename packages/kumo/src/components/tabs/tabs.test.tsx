import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Tabs } from "./tabs";

const baseTabs = [
  { value: "overview", label: "Overview" },
  { value: "metrics", label: "Metrics" },
  { value: "deployments", label: "Deployments" },
  { value: "observability", label: "Observability" },
  { value: "domains", label: "Domains" },
  { value: "access", label: "Access" },
  { value: "settings", label: "Settings" },
];

const extraTabs = [
  { value: "analytics", label: "Analytics" },
  { value: "logs", label: "Logs" },
  { value: "security", label: "Security" },
];

describe("Tabs", () => {
  it("forwards nativeButton=false for link-rendered tabs", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Tabs
        variant="underline"
        selectedValue="overview"
        tabs={[
          {
            value: "overview",
            label: "Overview",
            nativeButton: false,
            render: (props) => <a {...props} href="/settings/overview" />,
          },
          {
            value: "members",
            label: "Members",
            nativeButton: false,
            render: (props) => <a {...props} href="/settings/members" />,
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("tab", { name: "Overview" }).getAttribute("href"),
    ).toBe("/settings/overview");
    expect(
      warnSpy.mock.calls.some(([message]) =>
        String(message).includes("nativeButton"),
      ),
    ).toBe(false);

    warnSpy.mockRestore();
  });

  it("hides overflow controls when removed tabs leave the remaining tabs fitting", async () => {
    const { container, rerender } = render(
      <Tabs selectedValue="settings" tabs={[...baseTabs, ...extraTabs]} />,
    );
    const list = screen.getByRole("tablist");

    setTabListSize(list, {
      clientWidth: 600,
      scrollWidth: 800,
    });
    fireEvent.scroll(list);

    const endControl = container.querySelector(
      '[data-kumo-part="overflow-control"][data-side="end"]',
    );

    await waitFor(() =>
      expect(endControl?.getAttribute("aria-hidden")).toBe("false"),
    );

    setTabListSize(list, {
      clientWidth: 588,
      scrollWidth: 588,
    });
    rerender(<Tabs selectedValue="settings" tabs={baseTabs} />);

    await waitFor(() =>
      expect(endControl?.getAttribute("aria-hidden")).toBe("true"),
    );
  });
});

function setTabListSize(
  list: HTMLElement,
  { clientWidth, scrollWidth }: { clientWidth: number; scrollWidth: number },
) {
  defineReadonlyNumber(list, "clientWidth", clientWidth);
  defineReadonlyNumber(list, "scrollWidth", scrollWidth);
}

function defineReadonlyNumber(
  element: HTMLElement,
  property: "clientWidth" | "scrollWidth",
  value: number,
) {
  Object.defineProperty(element, property, {
    configurable: true,
    value,
  });
}
