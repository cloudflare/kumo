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
});
