import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { Empty } from "./empty";

describe("Empty", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the title as a large heading when a description is present", () => {
    render(
      <Empty
        title="No results found"
        description="Try adjusting your search."
      />,
    );

    const title = screen.getByText("No results found");
    const description = screen.getByText("Try adjusting your search.");

    expect(title.tagName).toBe("H2");
    expect(title.className).toContain("text-xl");
    expect(title.className).toContain("font-semibold");
    expect(description.className).toContain("text-base/[inherit]");
    expect(description.className).toContain("text-kumo-subtle");
    expect(description.className).toContain("text-balance");
    expect(description.className).toContain("leading-normal");
    expect(title.parentElement).toBe(description.parentElement);
    expect(title.parentElement?.className).toContain("gap-2.5");
  });

  it("renders the title as base secondary text without a description", () => {
    render(<Empty title="Nothing here" />);

    const title = screen.getByText("Nothing here");

    expect(title.tagName).toBe("H2");
    expect(title.className).toContain("text-base/[inherit]");
    expect(title.className).toContain("text-kumo-subtle");
    expect(title.className).not.toContain("font-semibold");
  });

  it("renders the command line with inset styling and without brand-colored text", () => {
    render(<Empty title="Install Kumo" commandLine="npm install kumo" />);

    const command = screen.getByText("npm install kumo");
    const commandTextGroup = command.parentElement;
    const commandContainer = commandTextGroup?.parentElement;

    expect(command.className).not.toContain("text-kumo-brand");
    expect(commandContainer?.className).toContain("bg-kumo-overlay");
    expect(commandContainer?.className.split(" ")).toContain("border");
    expect(commandContainer?.className).toContain("border-white");
    expect(commandContainer?.className.split(" ")).toContain("ring");
    expect(commandContainer?.className).toContain("ring-kumo-line");
    expect(commandContainer?.className).toContain("items-center");
    expect(commandTextGroup?.className).toContain("items-baseline");
    expect(commandContainer?.className).toContain("shadow-xs");
    expect(commandContainer?.className).not.toContain("shadow-inner");
    expect(commandContainer?.className).not.toContain("hover:");

    const prompt = screen.getByText("$");
    expect(prompt.className).toContain("text-kumo-subtle");
    expect(prompt.className).not.toContain("text-xs");

    const copyButton = screen.getByRole("button", { name: "Copy command" });
    expect(copyButton.className).toContain("text-kumo-subtle");

    const copyIcon = copyButton.querySelector("svg");
    expect(copyIcon?.getAttribute("class") ?? "").not.toContain("group-hover:");
  });

  it("resets command copy feedback after the last successful click", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<Empty title="Install Kumo" commandLine="npm install kumo" />);
    const copyButton = screen.getByRole("button", { name: "Copy command" });
    const copyIconPath = copyButton.querySelector("path")?.getAttribute("d");

    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    await act(async () => vi.advanceTimersByTime(500));
    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    await act(async () => vi.advanceTimersByTime(500));

    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    await act(async () => vi.advanceTimersByTime(500));
    expect(copyButton.querySelector("path")?.getAttribute("d")).toBe(
      copyIconPath,
    );
  });

  it("clears prior feedback when the latest clipboard write fails", async () => {
    let rejectRetry!: (reason?: unknown) => void;
    const pendingRetry = new Promise<void>((_, reject) => {
      rejectRetry = reject;
    });
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockReturnValueOnce(pendingRetry);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<Empty title="Install Kumo" commandLine="npm install kumo" />);
    const copyButton = screen.getByRole("button", { name: "Copy command" });
    const copyIconPath = copyButton.querySelector("path")?.getAttribute("d");

    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    fireEvent.click(copyButton);
    expect(copyButton.querySelector("path")?.getAttribute("d")).not.toBe(
      copyIconPath,
    );

    const copyError = new Error("Copy failed");
    await act(async () => {
      rejectRetry(copyError);
      await pendingRetry.catch(() => {});
    });

    expect(copyButton.querySelector("path")?.getAttribute("d")).toBe(
      copyIconPath,
    );
    expect(warning).toHaveBeenCalledWith("Clipboard copy failed", copyError);
  });
});
