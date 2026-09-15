import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { createRef } from "react";
import { InlineCopyText } from "./inline-copy-text";

describe("InlineCopyText", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
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

  it("renders the text as an accessible copy button", () => {
    render(<InlineCopyText text="namespace-id" />);

    expect(screen.getByText("namespace-id")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeTruthy();
  });

  it("copies the text and announces success", async () => {
    render(<InlineCopyText text="namespace-id" />);

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("namespace-id");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    expect(screen.getByText("Copied")).toBeTruthy();
  });

  it("copies textToCopy instead of the displayed text", async () => {
    render(
      <InlineCopyText text="visible-id" textToCopy="complete-resource-id" />,
    );

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("complete-resource-id");
  });

  it("supports localized accessible labels", async () => {
    render(
      <InlineCopyText
        text="namespace-id"
        labels={{ copyAction: "Copy namespace ID", copied: "ID copied" }}
      />,
    );

    await clickCopyButton(
      screen.getByRole("button", { name: "Copy namespace ID" }),
    );

    expect(screen.getByRole("button", { name: "ID copied" })).toBeTruthy();
    expect(screen.getByText("ID copied")).toBeTruthy();
  });

  it("calls consumer click and copy handlers", async () => {
    const onClick = vi.fn();
    const onCopy = vi.fn();
    render(
      <InlineCopyText text="namespace-id" onClick={onClick} onCopy={onCopy} />,
    );

    await clickCopyButton();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("does not copy when the consumer prevents the click", async () => {
    render(
      <InlineCopyText
        text="namespace-id"
        onClick={(event) => event.preventDefault()}
      />,
    );

    await clickCopyButton();

    expect(writeText).not.toHaveBeenCalled();
  });

  it("keeps the copy label when writing to the clipboard fails", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    writeText.mockRejectedValue(new Error("Copy failed"));
    render(<InlineCopyText text="namespace-id" />);

    await clickCopyButton();

    expect(
      screen.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeTruthy();
    expect(warning).toHaveBeenCalledWith(
      "Clipboard copy failed",
      expect.any(Error),
    );
  });

  it("resets copied feedback after the last click", async () => {
    vi.useFakeTimers();
    render(<InlineCopyText text="namespace-id" />);
    const button = screen.getByRole("button", { name: "Copy to clipboard" });

    await clickCopyButton(button);
    await act(async () => vi.advanceTimersByTime(1000));
    fireEvent.click(button);
    await act(() => Promise.resolve());
    await act(async () => vi.advanceTimersByTime(1000));

    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();

    await act(async () => vi.advanceTimersByTime(500));

    expect(
      screen.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeTruthy();
  });

  it("forwards its ref and merges custom classes", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <InlineCopyText ref={ref} text="namespace-id" className="custom-class" />,
    );

    expect(ref.current?.tagName).toBe("BUTTON");
    expect(ref.current?.classList.contains("custom-class")).toBe(true);
    expect(ref.current?.dataset.kumoComponent).toBe("InlineCopyText");
  });
});
