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
