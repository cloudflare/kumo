import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { Select } from "./select";

describe("Select", () => {
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
});
