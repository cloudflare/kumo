import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { Breadcrumb } from "./breadcrumbs";

describe("Breadcrumbs.Clipboard", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("resets copied feedback after the last successful click", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    const Clipboard = Breadcrumb.Clipboard;
    render(<Clipboard text="https://example.com/resource" />);
    const copyButton = screen.getByRole("button", { name: "Copy" });
    const copyIconPath = copyButton.querySelector("path")?.getAttribute("d");

    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    await act(async () => vi.advanceTimersByTime(1000));
    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    await act(async () => vi.advanceTimersByTime(1000));

    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    await act(async () => vi.advanceTimersByTime(1000));
    expect(copyButton.querySelector("path")?.getAttribute("d")).toBe(
      copyIconPath,
    );
  });

  it("ignores a pending clipboard completion after unmount", async () => {
    vi.useFakeTimers();
    let resolveCopy!: () => void;
    const pendingCopy = new Promise<void>((resolve) => {
      resolveCopy = resolve;
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockReturnValue(pendingCopy) },
    });
    const Clipboard = Breadcrumb.Clipboard;
    const { unmount } = render(
      <Clipboard text="https://example.com/resource" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    unmount();
    await act(async () => {
      resolveCopy();
      await pendingCopy;
    });

    expect(vi.getTimerCount()).toBe(0);
  });
});
