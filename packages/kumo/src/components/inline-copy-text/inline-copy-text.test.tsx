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

  it("renders string children as an accessible copy button", () => {
    render(<InlineCopyText>namespace-id</InlineCopyText>);

    expect(screen.getByText("namespace-id")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy to clipboard" }),
    ).toBeTruthy();
  });

  it("copies string children and announces success", async () => {
    render(<InlineCopyText>namespace-id</InlineCopyText>);

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("namespace-id");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    expect(screen.getByText("Copied")).toBeTruthy();
  });

  it("copies value instead of string children when provided", async () => {
    render(
      <InlineCopyText value="complete-resource-id">visible-id</InlineCopyText>,
    );

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("complete-resource-id");
  });

  it("renders rich children with Text props and copies value", async () => {
    render(
      <InlineCopyText
        value="complete-resource-id"
        variant="body"
        size="lg"
        bold
        as="strong"
      >
        <span>Visible resource</span>
      </InlineCopyText>,
    );

    const text = screen.getByText("Visible resource").closest("strong");
    expect(text).toBeTruthy();
    expect(text?.classList.contains("text-lg/[inherit]")).toBe(true);
    expect(text?.classList.contains("font-medium")).toBe(true);

    await clickCopyButton();

    expect(writeText).toHaveBeenCalledWith("complete-resource-id");
  });

  it("supports localized accessible labels", async () => {
    render(
      <InlineCopyText
        labels={{ copyAction: "Copy namespace ID", copied: "ID copied" }}
      >
        namespace-id
      </InlineCopyText>,
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
      <InlineCopyText onClick={onClick} onCopy={onCopy}>
        namespace-id
      </InlineCopyText>,
    );

    await clickCopyButton();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("does not copy when the consumer prevents the click", async () => {
    render(
      <InlineCopyText onClick={(event) => event.preventDefault()}>
        namespace-id
      </InlineCopyText>,
    );

    await clickCopyButton();

    expect(writeText).not.toHaveBeenCalled();
  });

  it("keeps the copy label when writing to the clipboard fails", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    writeText.mockRejectedValue(new Error("Copy failed"));
    render(<InlineCopyText>namespace-id</InlineCopyText>);

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
    render(<InlineCopyText>namespace-id</InlineCopyText>);
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
      <InlineCopyText ref={ref} className="custom-class">
        namespace-id
      </InlineCopyText>,
    );

    expect(ref.current?.tagName).toBe("BUTTON");
    expect(ref.current?.classList.contains("custom-class")).toBe(true);
    expect(ref.current?.dataset.kumoComponent).toBe("InlineCopyText");
  });
});
