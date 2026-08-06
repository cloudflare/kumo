import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import { Tabs } from "./tabs";

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
});
