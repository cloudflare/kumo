import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Combobox,
  KUMO_COMBOBOX_VARIANTS,
  KUMO_COMBOBOX_DEFAULT_VARIANTS,
} from "./combobox";

const fruits = ["Apple", "Banana", "Cherry"];

/** Helper that renders a minimal Combobox with TriggerInput. */
function renderComboboxWithInput(
  props: Partial<React.ComponentProps<typeof Combobox>> = {},
) {
  return render(
    <Combobox items={fruits} {...props}>
      <Combobox.TriggerInput placeholder="Pick a fruit…" />
      <Combobox.Content>
        <Combobox.List>
          {(item: string) => (
            <Combobox.Item key={item} value={item}>
              {item}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>,
  );
}

describe("Combobox", () => {
  // Rendering

  it("renders without crashing", () => {
    renderComboboxWithInput();
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("renders a combobox input with placeholder text", () => {
    renderComboboxWithInput();
    expect(screen.getByPlaceholderText("Pick a fruit…")).toBeTruthy();
  });

  // Variants export

  it("exports KUMO_COMBOBOX_VARIANTS with size and inputSide axes", () => {
    expect(KUMO_COMBOBOX_VARIANTS.size.xs).toBeDefined();
    expect(KUMO_COMBOBOX_VARIANTS.size.base).toBeDefined();
    expect(KUMO_COMBOBOX_VARIANTS.inputSide.right).toBeDefined();
    expect(KUMO_COMBOBOX_VARIANTS.inputSide.top).toBeDefined();
  });

  it("exports KUMO_COMBOBOX_DEFAULT_VARIANTS with correct defaults", () => {
    expect(KUMO_COMBOBOX_DEFAULT_VARIANTS.size).toBe("base");
    expect(KUMO_COMBOBOX_DEFAULT_VARIANTS.inputSide).toBe("right");
  });

  // displayName

  it("sets displayName on sub-components", () => {
    expect(Combobox.displayName).toBe("Combobox.Root");
    expect(Combobox.Content.displayName).toBe("Combobox.Content");
    expect(Combobox.TriggerInput.displayName).toBe("Combobox.TriggerInput");
    expect(Combobox.TriggerValue.displayName).toBe("Combobox.TriggerValue");
    expect(Combobox.Item.displayName).toBe("Combobox.Item");
    expect(Combobox.Chip.displayName).toBe("Combobox.Chip");
  });

  // Field wrapper integration

  describe("label and Field wrapper", () => {
    it("renders with Field wrapper when label is provided", () => {
      renderComboboxWithInput({ label: "Fruit" });
      expect(screen.getByText("Fruit")).toBeTruthy();
    });

    it("renders description text when description prop is set", () => {
      renderComboboxWithInput({
        label: "Fruit",
        description: "Choose your favorite fruit",
      });
      expect(screen.getByText("Choose your favorite fruit")).toBeTruthy();
    });
  });

  // Error states

  describe("error styling", () => {
    it("applies error border to TriggerInput when error prop is truthy", () => {
      renderComboboxWithInput({ error: "Selection required" });

      const input = screen.getByRole("combobox");
      expect(input.className).toContain("ring-kumo-danger");
    });

    it("applies error border to TriggerValue when error prop is truthy", () => {
      render(
        <Combobox
          items={fruits}
          error="Selection required"
          defaultValue="Apple"
        >
          <Combobox.TriggerValue placeholder="Select a fruit" />
          <Combobox.Content>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain("ring-kumo-danger");
    });

    it("renders error message string with label", () => {
      renderComboboxWithInput({
        label: "Fruit",
        error: "Please select a fruit",
      });
      expect(screen.getByText("Please select a fruit")).toBeTruthy();
    });

    it("renders error object with label", () => {
      renderComboboxWithInput({
        label: "Fruit",
        error: { message: "Fruit is required", match: true },
      });
      expect(screen.getByText("Fruit is required")).toBeTruthy();
    });
  });

  // Trigger structure

  describe("trigger", () => {
    it("has aria-haspopup listbox on the combobox input", () => {
      renderComboboxWithInput();

      const input = screen.getByRole("combobox");
      expect(input.getAttribute("aria-haspopup")).toBe("listbox");
    });

    it("renders a show-options trigger button for TriggerInput", () => {
      renderComboboxWithInput();

      const trigger = screen.getByRole("button", { name: "Show options" });
      expect(trigger).toBeTruthy();
    });
  });
});
