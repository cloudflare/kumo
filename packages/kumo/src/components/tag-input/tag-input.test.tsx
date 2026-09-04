import { fireEvent, render, screen } from "@testing-library/react";
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
