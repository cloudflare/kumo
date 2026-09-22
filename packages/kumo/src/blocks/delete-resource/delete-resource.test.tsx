import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { DeleteResource } from "./delete-resource";

describe("DeleteResource", () => {
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
    render(
      <DeleteResource
        open
        onOpenChange={() => {}}
        resourceType="Worker"
        resourceName="my-worker"
        onDelete={() => {}}
      />,
    );
    const copyButton = screen.getByRole("button", {
      name: "Copy my-worker to clipboard",
    });
    const copyIconPath = copyButton.querySelector("path")?.getAttribute("d");

    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    await act(async () => vi.advanceTimersByTime(750));
    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    await act(async () => vi.advanceTimersByTime(750));

    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    await act(async () => vi.advanceTimersByTime(750));
    expect(copyButton.querySelector("path")?.getAttribute("d")).toBe(
      copyIconPath,
    );
  });

  it("invalidates a pending copy when the dialog closes", async () => {
    let resolveCopy!: () => void;
    const pendingCopy = new Promise<void>((resolve) => {
      resolveCopy = resolve;
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockReturnValue(pendingCopy) },
    });
    const props = {
      onOpenChange: () => {},
      resourceType: "Worker",
      resourceName: "my-worker",
      onDelete: () => {},
    };
    const { rerender } = render(<DeleteResource {...props} open />);
    const copyButton = screen.getByRole("button", {
      name: "Copy my-worker to clipboard",
    });
    const copyIconPath = copyButton.querySelector("path")?.getAttribute("d");

    fireEvent.click(copyButton);
    rerender(<DeleteResource {...props} open={false} />);
    await act(async () => {
      resolveCopy();
      await pendingCopy;
    });
    rerender(<DeleteResource {...props} open />);

    const reopenedCopyButton = screen.getByRole("button", {
      name: "Copy my-worker to clipboard",
    });
    expect(reopenedCopyButton.querySelector("path")?.getAttribute("d")).toBe(
      copyIconPath,
    );
  });
});
