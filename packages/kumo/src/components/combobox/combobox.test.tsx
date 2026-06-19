import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
      <Combobox.TriggerInput
        aria-label="Pick a fruit"
        placeholder="Pick a fruit…"
      />
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
          label="Fruit"
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

    it("associates error with an aria-label-only TriggerInput", () => {
      const { container } = render(
        <Combobox items={fruits} error="Please select a fruit">
          <Combobox.TriggerInput
            aria-label="Pick a fruit"
            placeholder="Pick a fruit…"
          />
        </Combobox>,
      );

      const input = screen.getByRole("combobox", { name: "Pick a fruit" });
      const error = screen.getByText("Please select a fruit");

      expect(error.id).toBeTruthy();
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.getAttribute("aria-describedby")).toBe(error.id);
      expect(container.querySelector("label")).toBeNull();
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

    it("uses non-layout 24px hit targets for TriggerInput controls", () => {
      render(
        <Combobox items={fruits} defaultValue="Apple">
          <Combobox.TriggerInput
            aria-label="Pick a fruit"
            placeholder="Pick a fruit…"
          />
        </Combobox>,
      );

      const clear = screen.getByRole("button", { name: "Clear selection" });
      const trigger = screen.getByRole("button", { name: "Show options" });

      expect(clear.className).toContain("before:min-h-6");
      expect(clear.className).toContain("before:min-w-6");
      expect(clear.className).not.toContain("size-6");
      expect(clear.className).toContain("right-6");
      expect(trigger.className).toContain("before:min-h-6");
      expect(trigger.className).toContain("before:min-w-6");
      expect(trigger.className).not.toContain("size-6");
      expect(trigger.className).toContain("right-0");
    });

    it("uses a non-layout 24px hit target for chip remove controls", () => {
      render(
        <Combobox items={fruits} multiple>
          <Combobox.TriggerMultipleWithInput
            aria-label="Select fruits"
            value={["Apple"]}
            renderItem={(item: string) => (
              <Combobox.Chip key={item}>{item}</Combobox.Chip>
            )}
          />
        </Combobox>,
      );

      const remove = screen.getByRole("button", { name: "Remove" });
      expect(remove.className).toContain("before:min-h-6");
      expect(remove.className).toContain("before:min-w-6");
      expect(remove.className).not.toContain("size-6");
    });

    it("passes aria-label through to TriggerInput", () => {
      render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput
            aria-label="Pick a fruit"
            placeholder="Pick a fruit…"
          />
        </Combobox>,
      );

      const input = screen.getByRole("combobox", { name: "Pick a fruit" });
      expect(input.getAttribute("aria-label")).toBe("Pick a fruit");
    });

    it("associates description with an aria-label-only TriggerInput", () => {
      const { container } = render(
        <Combobox
          items={fruits}
          description="Choose one fruit for the deployment"
        >
          <Combobox.TriggerInput
            aria-label="Pick a fruit"
            placeholder="Pick a fruit…"
          />
        </Combobox>,
      );

      const input = screen.getByRole("combobox", { name: "Pick a fruit" });
      const description = screen.getByText(
        "Choose one fruit for the deployment",
      );

      expect(description.id).toBeTruthy();
      expect(input.getAttribute("aria-describedby")).toBe(description.id);
      expect(container.querySelector("label")).toBeNull();
    });

    it("passes aria-labelledby through to TriggerInput", () => {
      render(
        <>
          <span id="fruit-combobox-label">Fruit picker</span>
          <Combobox items={fruits}>
            <Combobox.TriggerInput
              aria-labelledby="fruit-combobox-label"
              placeholder="Pick a fruit…"
            />
          </Combobox>
        </>,
      );

      const input = screen.getByRole("combobox", { name: "Fruit picker" });
      expect(input.getAttribute("aria-labelledby")).toBe(
        "fruit-combobox-label",
      );
    });

    it("passes aria-label through to TriggerValue", () => {
      render(
        <Combobox items={fruits} defaultValue="Apple">
          <Combobox.TriggerValue aria-label="Selected fruit" />
        </Combobox>,
      );

      const trigger = screen.getByRole("combobox", { name: "Selected fruit" });
      expect(trigger.getAttribute("aria-label")).toBe("Selected fruit");
    });

    it("passes aria-label through to TriggerMultipleWithInput", () => {
      render(
        <Combobox items={fruits} multiple>
          <Combobox.TriggerMultipleWithInput
            aria-label="Select fruits"
            renderItem={(item: string) => (
              <Combobox.Chip key={item}>{item}</Combobox.Chip>
            )}
          />
        </Combobox>,
      );

      const input = screen.getByRole("combobox", { name: "Select fruits" });
      expect(input.getAttribute("aria-label")).toBe("Select fruits");
    });
  });

  describe("accessible name warnings", () => {
    it("warns when TriggerInput only has a placeholder", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput placeholder="Pick a fruit…" />
        </Combobox>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        "[Kumo Combobox]: Combobox.TriggerInput must have an accessible name. Provide either:\n" +
          "  - label prop: <Combobox label='Fruit' ... />\n" +
          "  - aria-label: <Combobox.TriggerInput aria-label='Select fruit' />\n" +
          "  - aria-labelledby for custom label association",
      );
    });

    it("warns when TriggerValue lacks a label or aria name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Combobox items={fruits} defaultValue="Apple">
          <Combobox.TriggerValue />
        </Combobox>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        "[Kumo Combobox]: Combobox.TriggerValue must have an accessible name. Provide either:\n" +
          "  - label prop: <Combobox label='Fruit' ... />\n" +
          "  - aria-label: <Combobox.TriggerValue aria-label='Select fruit' />\n" +
          "  - aria-labelledby for custom label association",
      );
    });

    it("warns when TriggerMultipleWithInput lacks a label or aria name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Combobox items={fruits} multiple>
          <Combobox.TriggerMultipleWithInput
            renderItem={(item: string) => (
              <Combobox.Chip key={item}>{item}</Combobox.Chip>
            )}
          />
        </Combobox>,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        "[Kumo Combobox]: Combobox.TriggerMultipleWithInput must have an accessible name. Provide either:\n" +
          "  - label prop: <Combobox label='Fruit' ... />\n" +
          "  - aria-label: <Combobox.TriggerMultipleWithInput aria-label='Select tags' ... />\n" +
          "  - aria-labelledby for custom label association",
      );
    });

    it("does not warn when the root label provides the accessible name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Combobox items={fruits} label="Fruit">
          <Combobox.TriggerInput placeholder="Pick a fruit…" />
        </Combobox>,
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("does not warn when aria-label provides the accessible name", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(
        <Combobox items={fruits}>
          <Combobox.TriggerInput
            aria-label="Pick a fruit"
            placeholder="Pick a fruit…"
          />
        </Combobox>,
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
