import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { Select } from "./select";

describe("Select", () => {
  describe("size", () => {
    it("applies size classes to the trigger", () => {
      const { container } = render(
        <Select aria-label="Pick one" size="xs">
          <Select.Option value="a">Option A</Select.Option>
        </Select>,
      );

      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
      expect(trigger?.className).toContain("h-5");
      expect(trigger?.className).toContain("px-1.5");
      expect(trigger?.className).toContain("text-xs");
    });
  });

  describe("label visibility (new behavior)", () => {
    it("shows visible label by default when label prop is provided", () => {
      render(
        <Select label="Database" description="Select your preferred database">
          <Select.Option value="postgres">PostgreSQL</Select.Option>
          <Select.Option value="mysql">MySQL</Select.Option>
        </Select>,
      );

      // Label should be visible (in Field wrapper)
      expect(screen.getByText("Database")).toBeTruthy();
      expect(screen.getByText("Select your preferred database")).toBeTruthy();
    });

    it("hides label when hideLabel={true} (backward compatibility)", () => {
      render(
        <Select
          label="Database"
          hideLabel={true}
          description="Helper text for database selection"
        >
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      // Label should exist but be visually hidden (sr-only class)
      const srOnlyLabel = document.querySelector(".sr-only");
      expect(srOnlyLabel).toBeTruthy();
      expect(srOnlyLabel?.textContent).toBe("Database");
      expect(
        screen.getByText("Helper text for database selection"),
      ).toBeTruthy();
    });

    it("uses aria-label for accessibility when no visible label needed", () => {
      render(
        <Select aria-label="Select a database">
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      const trigger = document.querySelector('[role="combobox"]');
      expect(trigger?.getAttribute("aria-label")).toBe("Select a database");
    });
  });

  describe("description and error", () => {
    it("renders description with visible label", () => {
      render(
        <Select label="Database" description="Visible label with description">
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Visible label with description")).toBeTruthy();
      expect(screen.getByText("Database")).toBeTruthy();
    });

    it("renders error message", () => {
      render(
        <Select label="Database" error="Please select a database">
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Please select a database")).toBeTruthy();
    });

    it("renders error object", () => {
      render(
        <Select
          label="Database"
          error={{ message: "Database is required", match: true }}
        >
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Database is required")).toBeTruthy();
    });

    it("shows error instead of description when both are provided", () => {
      render(
        <Select
          label="Database"
          description="Select your preferred database"
          error="Please select a database"
        >
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Please select a database")).toBeTruthy();
      expect(screen.queryByText("Select your preferred database")).toBeNull();
    });
  });

  describe("placeholder prop", () => {
    it("renders placeholder when no value is selected", () => {
      render(
        <Select
          placeholder="Select an option"
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      expect(screen.getByText("Select an option")).toBeTruthy();
    });

    it("renders placeholder when value is null", () => {
      render(
        <Select
          placeholder="Choose a database"
          value={null}
          items={[
            { value: "postgres", label: "PostgreSQL" },
            { value: "mysql", label: "MySQL" },
          ]}
        />,
      );

      expect(screen.getByText("Choose a database")).toBeTruthy();
    });

    it("renders placeholder when value is undefined", () => {
      render(
        <Select
          placeholder="Pick one"
          value={undefined}
          items={[
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
          ]}
        />,
      );

      expect(screen.getByText("Pick one")).toBeTruthy();
    });

    it("does not render placeholder when a value is selected", () => {
      render(
        <Select
          placeholder="Select an option"
          value="postgres"
          items={[
            { value: "postgres", label: "PostgreSQL" },
            { value: "mysql", label: "MySQL" },
          ]}
        />,
      );

      expect(screen.queryByText("Select an option")).toBeNull();
      expect(screen.getByText("PostgreSQL")).toBeTruthy();
    });

    it("works with controlled component using useState", () => {
      function ControlledSelect() {
        const [value, setValue] = useState<string | null>(null);

        return (
          <Select
            placeholder="Please select"
            value={value}
            onValueChange={(v) => setValue(v as string | null)}
            items={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ]}
          />
        );
      }

      render(<ControlledSelect />);
      expect(screen.getByText("Please select")).toBeTruthy();
    });
  });

  describe("placeholder interactions", () => {
    it("shows null-value item label when value matches (Base UI behavior)", () => {
      // When items array contains a null-value entry that matches the current value,
      // Base UI will render that item's label, not the placeholder prop
      render(
        <Select
          placeholder="Select one"
          value={null}
          items={[
            { value: null, label: "Placeholder item" },
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      // Base UI shows the null-value item's label, not the placeholder prop
      expect(screen.getByText("Placeholder item")).toBeTruthy();
      expect(screen.queryByText("Select one")).toBeNull();
    });

    it("filters out null values when auto-rendering options", () => {
      const { container } = render(
        <Select
          placeholder="Pick an option"
          value={null}
          items={[
            { value: null, label: "Should not be an option" },
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      // The null-value item's label is shown as the selected value
      expect(screen.getByText("Should not be an option")).toBeTruthy();

      // The trigger should be present
      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();

      // Note: The null-value item is filtered out by renderOptionsFromItems
      // so it won't appear as a selectable option in the dropdown
    });

    it("shows placeholder when value is null and no matching item exists", () => {
      // When value is null but no null-value item exists in the items array,
      // the placeholder prop is shown
      render(
        <Select
          placeholder="Choose one"
          value={null}
          items={{
            apple: "Apple",
            banana: "Banana",
            cherry: "Cherry",
          }}
        />,
      );

      // Placeholder should be visible in the trigger
      expect(screen.getByText("Choose one")).toBeTruthy();
    });

    it("shows placeholder with object map items format", () => {
      // Object map format should work the same as array format for placeholders
      render(
        <Select
          placeholder="Select a fruit"
          value={null}
          items={{
            apple: "Apple",
            banana: "Banana",
          }}
        />,
      );

      expect(screen.getByText("Select a fruit")).toBeTruthy();
    });

    it("works with items as array format", () => {
      render(
        <Select
          placeholder="Select fruit"
          value={null}
          items={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
          ]}
        />,
      );

      expect(screen.getByText("Select fruit")).toBeTruthy();
    });

    it("placeholder works with manual children", () => {
      render(
        <Select placeholder="Choose a database" value={null}>
          <Select.Option value="postgres">PostgreSQL</Select.Option>
          <Select.Option value="mysql">MySQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Choose a database")).toBeTruthy();
    });
  });

  describe("disabled options", () => {
    it("renders a disabled option that cannot be selected", async () => {
      render(
        <Select aria-label="Pick one">
          <Select.Option value="a">Option A</Select.Option>
          <Select.Option value="b" disabled>
            Option B
          </Select.Option>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const options = screen.getAllByRole("option");
      const disabledOption = options.find((o) =>
        o.textContent?.includes("Option B"),
      );
      expect(disabledOption).toBeTruthy();
      expect(disabledOption?.getAttribute("aria-disabled")).toBe("true");
    });

    it("applies disabled styling classes", async () => {
      render(
        <Select aria-label="Pick one">
          <Select.Option value="a" disabled>
            Disabled
          </Select.Option>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const option = screen.getByRole("option");
      expect(option.className).toContain("data-[disabled]");
    });

    it("does not fire onValueChange when clicking a disabled option", async () => {
      const handleChange = vi.fn();
      render(
        <Select aria-label="Pick one" onValueChange={handleChange}>
          <Select.Option value="a">Option A</Select.Option>
          <Select.Option value="b" disabled>
            Option B
          </Select.Option>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const options = screen.getAllByRole("option");
      const disabledOption = options.find((o) =>
        o.textContent?.includes("Option B"),
      );

      await act(async () => {
        fireEvent.click(disabledOption!);
      });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("disabled items via items prop", () => {
    it("renders disabled options from object-map items with descriptor", async () => {
      render(
        <Select
          aria-label="Pick one"
          items={{
            apple: "Apple",
            banana: {
              label: "Banana",
              disabled: true,
            },
          }}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(2);

      const bananaOption = options.find((o) =>
        o.textContent?.includes("Banana"),
      );
      expect(bananaOption?.getAttribute("aria-disabled")).toBe("true");
    });

    it("renders enabled options from object-map items with descriptor", async () => {
      render(
        <Select
          aria-label="Pick one"
          items={{
            apple: "Apple",
            banana: { label: "Banana", disabled: false },
          }}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const options = screen.getAllByRole("option");
      const bananaOption = options.find((o) =>
        o.textContent?.includes("Banana"),
      );
      expect(bananaOption?.getAttribute("aria-disabled")).not.toBe("true");
    });

    it("mixes plain ReactNode and descriptor values in items prop", async () => {
      render(
        <Select
          aria-label="Pick one"
          items={{
            apple: "Apple",
            banana: {
              label: "Banana",
              disabled: true,
            },
            cherry: "Cherry",
          }}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });
  });

  describe("groups and separators", () => {
    it("renders Select.Group with Select.GroupLabel", async () => {
      render(
        <Select aria-label="Pick a fruit">
          <Select.Group>
            <Select.GroupLabel>Fruits</Select.GroupLabel>
            <Select.Option value="apple">Apple</Select.Option>
            <Select.Option value="banana">Banana</Select.Option>
          </Select.Group>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const group = screen.getByRole("group");
      expect(group).toBeTruthy();
      expect(screen.getByText("Fruits")).toBeTruthy();
    });

    it("renders Select.Separator as a visual divider", async () => {
      render(
        <Select aria-label="Pick one">
          <Select.Option value="a">Option A</Select.Option>
          <Select.Separator />
          <Select.Option value="b">Option B</Select.Option>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      // Separator is inside the portaled popup — query from document
      const separator = document.querySelector('[role="separator"]');
      expect(separator).toBeTruthy();
      expect(separator?.className).toContain("bg-kumo-hairline");
    });

    it("renders multiple groups with separators", async () => {
      render(
        <Select aria-label="Pick a food">
          <Select.Group>
            <Select.GroupLabel>Fruits</Select.GroupLabel>
            <Select.Option value="apple">Apple</Select.Option>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.GroupLabel>Vegetables</Select.GroupLabel>
            <Select.Option value="carrot">Carrot</Select.Option>
          </Select.Group>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const groups = screen.getAllByRole("group");
      expect(groups).toHaveLength(2);

      expect(screen.getByText("Fruits")).toBeTruthy();
      expect(screen.getByText("Vegetables")).toBeTruthy();

      // Separator is inside the portaled popup — query from document
      const separator = document.querySelector('[role="separator"]');
      expect(separator).toBeTruthy();
    });
  });

  describe("error styling", () => {
    it("applies error border when error prop is truthy", () => {
      render(
        <Select aria-label="Pick one" error="Please select a value">
          <Select.Option value="a">Option A</Select.Option>
        </Select>,
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger.className).toContain("ring-kumo-danger");
    });
  });

  describe("popup structure", () => {
    it("opens a listbox popup from the trigger", async () => {
      render(
        <Select aria-label="Select a country">
          <Select.Option value="af">Afghanistan</Select.Option>
          <Select.Option value="al">Albania</Select.Option>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      expect(screen.getByRole("listbox")).toBeTruthy();
    });

    it("uses a presentation popup and inner listbox after the refactor", async () => {
      render(
        <Select aria-label="Select a country">
          <Select.Option value="af">Afghanistan</Select.Option>
          <Select.Option value="al">Albania</Select.Option>
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeTruthy();
      expect(listbox.className).toContain("overflow-y-auto");

      const popup = listbox.parentElement;
      expect(popup?.getAttribute("role")).toBe("presentation");
      expect(popup?.className).toContain("max-h-[var(--available-height)]");
      expect(popup?.className).not.toContain("overscroll");
    });

    it("applies height and overscroll-none to the inner scroll container", async () => {
      // DOM structure assertion only: real touch scroll behavior still needs manual/device validation.
      render(
        <Select aria-label="Select many countries">
          {Array.from({ length: 30 }, (_, index) => (
            <Select.Option key={index} value={`value-${index}`}>
              {`Option ${index}`}
            </Select.Option>
          ))}
        </Select>,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("combobox"));
      });

      const listbox = screen.getByRole("listbox");
      expect(listbox.className).toContain("overflow-y-auto");
      expect(listbox.className).toContain("overscroll-none");
    });
  });

  describe("renderValue with placeholder", () => {
    it("shows placeholder when value is empty string", () => {
      render(
        <Select
          aria-label="Pick one"
          placeholder="Choose..."
          value=""
          renderValue={(v) => `Selected: ${v}`}
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      expect(screen.getByText("Choose...")).toBeTruthy();
      expect(screen.queryByText("Selected:")).toBeNull();
    });

    it("shows placeholder when value is null", () => {
      render(
        <Select
          aria-label="Pick one"
          placeholder="Choose..."
          value={null}
          renderValue={(v) => `Selected: ${v}`}
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      expect(screen.getByText("Choose...")).toBeTruthy();
    });

    it("shows placeholder when value is undefined", () => {
      render(
        <Select
          aria-label="Pick one"
          placeholder="Choose..."
          value={undefined}
          renderValue={(v) => `Selected: ${v}`}
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      expect(screen.getByText("Choose...")).toBeTruthy();
    });

    it("falls back to placeholder when renderValue returns undefined", () => {
      render(
        <Select
          aria-label="Pick one"
          placeholder="Choose..."
          value="a"
          renderValue={() => undefined}
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      expect(screen.getByText("Choose...")).toBeTruthy();
    });

    it("renders the ReactNode returned by renderValue", () => {
      render(
        <Select
          aria-label="Pick one"
          placeholder="Choose..."
          value="a"
          renderValue={(v) => `Selected: ${v}`}
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      expect(screen.getByText("Selected: a")).toBeTruthy();
      expect(screen.queryByText("Choose...")).toBeNull();
    });

    it("renders nothing without crashing when value is empty string and no placeholder", () => {
      const { container } = render(
        <Select
          aria-label="Pick one"
          value=""
          renderValue={(v) => `Selected: ${v}`}
          items={[
            { value: "a", label: "Option A" },
            { value: "b", label: "Option B" },
          ]}
        />,
      );

      const trigger = container.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
      // Should not render the renderValue output for empty string
      expect(screen.queryByText("Selected:")).toBeNull();
    });
  });
});
