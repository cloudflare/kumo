import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { CodeHighlighted } from "./code-highlighted";

vi.mock("./use-shiki-highlighter", () => ({
  useShikiHighlighter: () => ({
    highlight: () =>
      '<pre><code><span class="line">const x = 1;</span></code></pre>',
    isLoading: false,
    error: null,
    labels: { copy: "Copy", copied: "Copied!" },
  }),
}));

describe("CodeHighlighted", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps feedback visible while a retry is pending, then resets from its success", async () => {
    vi.useFakeTimers();
    let resolveRetry!: () => void;
    const pendingRetry = new Promise<void>((resolve) => {
      resolveRetry = resolve;
    });
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockReturnValueOnce(pendingRetry);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <CodeHighlighted code="const x = 1;" lang="javascript" showCopyButton />,
    );

    const copyButton = screen.getByRole("button", { name: "Copy" });

    fireEvent.click(copyButton);
    await act(() => Promise.resolve());
    expect(writeText).toHaveBeenCalledWith("const x = 1;");
    expect(copyButton.getAttribute("aria-label")).toBe("Copied!");

    await act(async () => vi.advanceTimersByTime(1900));
    fireEvent.click(copyButton);

    await act(async () => vi.advanceTimersByTime(200));
    expect(copyButton.getAttribute("aria-label")).toBe("Copied!");

    await act(async () => {
      resolveRetry();
      await pendingRetry;
    });
    await act(async () => vi.advanceTimersByTime(1999));
    expect(copyButton.getAttribute("aria-label")).toBe("Copied!");

    await act(async () => vi.advanceTimersByTime(1));
    expect(copyButton.getAttribute("aria-label")).toBe("Copy");
  });
});
