import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { TagInput } from "./tag-input";

describe("TagInput", () => {
  it("creates comma-separated tags", () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("Tags"), {
      target: { value: "one, two" },
    });
    fireEvent.keyDown(screen.getByLabelText("Tags"), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(["one", "two"]);
  });

  it.each([
    ["Enter", "Enter"],
    ["comma", ","],
    ["Tab", "Tab"],
  ])("commits a tag on a plain %s", (_, key) => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "one" } });

    const event = createEvent.keyDown(input, { key, cancelable: true });
    fireEvent(input, event);

    expect(onValueChange).toHaveBeenLastCalledWith(["one"]);
    expect(input.value).toBe("");
  });

  it.each([
    ["isComposing", { isComposing: true }],
    // Safari fires compositionend before keydown, so only keyCode 229 is set.
    ["keyCode 229", { keyCode: 229 }],
  ])("ignores commit keys while an IME is composing (%s)", (_, init) => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "にほんご" } });

    for (const key of ["Enter", ",", "Tab"]) {
      const event = createEvent.keyDown(input, {
        key,
        cancelable: true,
        ...init,
      });
      fireEvent(input, event);
      // preventDefault() would stop the browser from confirming the IME conversion.
      expect(event.defaultPrevented).toBe(false);
    }
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input.value).toBe("にほんご");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith(["にほんご"]);
  });

  it("rejects invalid pasted values", () => {
    render(
      <TagInput
        aria-label="Emails"
        validateValue={(value) => value.includes("@")}
      />,
    );
    fireEvent.paste(screen.getByLabelText("Emails"), {
      clipboardData: { getData: () => "valid@example.com, invalid" },
    });
    expect(screen.getByText('"invalid" is not valid.')).toBeTruthy();
    expect(screen.getByText("valid@example.com")).toBeTruthy();
  });

  it("applies pasted tags to the current draft", () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "alice" } });
    input.setSelectionRange(5, 5);
    fireEvent.paste(input, {
      clipboardData: { getData: () => ", bob" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith(["alice", "bob"]);
    expect(input.value).toBe("");
  });

  it("replaces the selected part of the draft when pasting tags", () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "alXXce" } });
    input.setSelectionRange(2, 4);
    fireEvent.paste(input, {
      clipboardData: { getData: () => "i, bob, al" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith(["ali", "bob", "alce"]);
  });

  it("leaves a paste without separators to the browser", () => {
    const onValueChange = vi.fn();
    render(<TagInput aria-label="Tags" onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ali" } });
    const event = createEvent.paste(input, {
      clipboardData: { getData: () => "ce" },
    });
    fireEvent(input, event);
    expect(event.defaultPrevented).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("prevents value changes when readOnly", () => {
    const onValueChange = vi.fn();
    render(
      <TagInput
        aria-label="Tags"
        defaultValue={["one"]}
        readOnly
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    expect(input.readOnly).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Remove one" }));
    fireEvent.keyDown(input, { key: "Backspace" });
    fireEvent.paste(input, { clipboardData: { getData: () => "two, three" } });
    fireEvent.change(input, { target: { value: "four" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByText("one")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Remove one" })
        .getAttribute("disabled"),
    ).not.toBeNull();
  });

  it("submits accepted tags with the form", () => {
    const { container } = render(
      <form>
        <TagInput aria-label="Tags" name="tags" defaultValue={["one", "two"]} />
      </form>,
    );
    const form = container.querySelector("form")!;
    const input = screen.getByLabelText("Tags") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "draft" } });
    expect(new FormData(form).getAll("tags")).toEqual(["one", "two"]);
  });

  it("omits tags from the form when disabled", () => {
    const { container } = render(
      <form>
        <TagInput
          aria-label="Tags"
          name="tags"
          defaultValue={["one"]}
          disabled
        />
      </form>,
    );
    expect(
      new FormData(container.querySelector("form")!).getAll("tags"),
    ).toEqual([]);
  });

  it("satisfies required once a tag exists", () => {
    const { container, rerender } = render(
      <form>
        <TagInput aria-label="Tags" name="tags" required value={["one"]} />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(form.checkValidity()).toBe(true);

    rerender(
      <form>
        <TagInput aria-label="Tags" name="tags" required value={[]} />
      </form>,
    );
    expect(form.checkValidity()).toBe(false);
  });

  it("disables tag removal when disabled", () => {
    render(<TagInput aria-label="Tags" defaultValue={["one"]} disabled />);
    expect(
      screen
        .getByRole("button", { name: "Remove one" })
        .getAttribute("disabled"),
    ).not.toBeNull();
  });

  it("associates its label with the input", () => {
    render(<TagInput label="Tags" />);
    const input = screen.getByLabelText("Tags");
    expect(screen.getByText("Tags").closest("label")?.htmlFor).toBe(input.id);
  });

  it("does not render an empty label when only feedback is shown", () => {
    const { container } = render(
      <TagInput aria-label="Tags" validateValue={() => false} />,
    );
    fireEvent.change(screen.getByLabelText("Tags"), {
      target: { value: "bad" },
    });
    fireEvent.keyDown(screen.getByLabelText("Tags"), { key: "Enter" });
    expect(screen.getByText('"bad" is not valid.')).toBeTruthy();
    expect(container.querySelector("label")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Tags" })).toBeTruthy();
  });

  it("forwards its ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TagInput ref={ref} aria-label="Tags" />);
    expect(ref.current).toBe(screen.getByLabelText("Tags"));
  });

  it("resets the native input border", () => {
    render(<TagInput aria-label="Tags" />);
    expect(screen.getByLabelText("Tags").classList).toContain("border-0");
  });

  it("uses translated labels for generated feedback and controls", () => {
    render(
      <TagInput
        aria-label="Etiquetas"
        defaultValue={["uno"]}
        labels={{
          invalidValue: (value) => `${value} no es valido.`,
          removeValue: (value) => `Eliminar ${value}`,
        }}
        validateValue={() => false}
      />,
    );
    fireEvent.change(screen.getByLabelText("Etiquetas"), {
      target: { value: "dos" },
    });
    fireEvent.keyDown(screen.getByLabelText("Etiquetas"), { key: "Enter" });
    expect(screen.getByText("dos no es valido.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Eliminar uno" })).toBeTruthy();
  });
});
