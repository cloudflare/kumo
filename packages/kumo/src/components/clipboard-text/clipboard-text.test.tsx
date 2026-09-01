import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { ClipboardText } from "./clipboard-text";

describe("ClipboardText", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const clickCopyButton = async (
    button = screen.getByRole("button", { name: "Copy to clipboard" }),
  ) => {
    fireEvent.click(button);
    await act(() => Promise.resolve());
  };

  it("should be defined", () => {
    expect(ClipboardText).toBeDefined();
  });

  it("renders the text and a copy button", () => {
    render(<ClipboardText text="sk_live_abc123" />);
    expect(screen.getByText("sk_live_abc123")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeTruthy();
  });

  it("copies text and announces copied state without tooltip", async () => {
    render(<ClipboardText text="token-value" />);

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("token-value");
    expect(screen.getByText("Copied")).toBeTruthy();
  });

  it("keeps the check state while spam-clicking and resets after the last click settles", async () => {
    vi.useFakeTimers();
    render(<ClipboardText text="token-value" />);
    const button = screen.getByRole("button", { name: "Copy to clipboard" });

    await clickCopyButton(button);
    expect(screen.getByText("Copied")).toBeTruthy();

    // Advance partway through the feedback window, then click again
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Copied")).toBeTruthy();

    await clickCopyButton(button);
    expect(screen.getByText("Copied")).toBeTruthy();

    // Previous timeout must have been cleared — still copied after 1000ms
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("Copied")).toBeTruthy();

    // Full window after the *last* click clears the feedback
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("copies textToCopy when provided instead of text", async () => {
    render(
      <ClipboardText text="visible-text" textToCopy="hidden-secret-value" />,
    );

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("hidden-secret-value");
  });

  it("shows a single anchored copied toast and bumps it on re-click", async () => {
    vi.useFakeTimers();
    const { container } = render(
      <ClipboardText
        text="npx kumo add button"
        tooltip={{ text: "Copy", copiedText: "Copied!", side: "top" }}
      />,
    );
    const button = screen.getByRole("button", { name: "Copy to clipboard" });
    const liveRegion = container.querySelector('[aria-live="polite"]');

    await clickCopyButton(button);

    // Live region + toast description both surface "Copied!"
    expect(screen.getAllByText("Copied!").length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector(".animate-clipboard-toast-bump")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    await clickCopyButton(button);

    const secondToast = document.querySelector(".animate-clipboard-toast-bump");
    expect(secondToast).toBeTruthy();
    expect(
      document.querySelectorAll(".animate-clipboard-toast-bump"),
    ).toHaveLength(1);
    expect(liveRegion?.textContent).toBe("Copied!");

    await clickCopyButton(button);

    const thirdToast = document.querySelector(".animate-clipboard-toast-bump");
    expect(thirdToast).toBeTruthy();
    expect(thirdToast).not.toBe(secondToast);
    expect(
      document.querySelectorAll(".animate-clipboard-toast-bump"),
    ).toHaveLength(1);

    await act(async () => {
      vi.advanceTimersByTime(1499);
    });
    expect(liveRegion?.textContent).toBe("Copied!");

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(liveRegion?.textContent).toBe("");
  });

  it("calls onCopy after a successful copy", async () => {
    const onCopy = vi.fn();
    render(<ClipboardText text="token-value" onCopy={onCopy} />);

    await clickCopyButton();

    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
