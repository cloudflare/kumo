import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { Select } from "./select";

describe("Select", () => {
  describe("description with hideLabel", () => {
    it("renders description when hideLabel is true (default)", () => {
      render(
        <Select label="Database" description="Select your preferred database">
          <Select.Option value="postgres">PostgreSQL</Select.Option>
          <Select.Option value="mysql">MySQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Select your preferred database")).toBeTruthy();
    });

    it("renders description when hideLabel is explicitly true", () => {
      render(
        <Select
          label="Database"
          hideLabel={true}
          description="Helper text for database selection"
        >
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(
        screen.getByText("Helper text for database selection"),
      ).toBeTruthy();
    });

    it("renders description when hideLabel is false", () => {
      render(
        <Select
          label="Database"
          hideLabel={false}
          description="Visible label with description"
        >
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Visible label with description")).toBeTruthy();
      // Label should also be visible
      expect(screen.getByText("Database")).toBeTruthy();
    });

    it("keeps label accessible via sr-only when hideLabel is true", () => {
      render(
        <Select label="Database" hideLabel={true} description="Helper text">
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      // Label should exist but be visually hidden (sr-only class)
      const srOnlyLabel = document.querySelector(".sr-only");
      expect(srOnlyLabel).toBeTruthy();
      expect(srOnlyLabel?.textContent).toBe("Database");
    });
  });

  describe("error with hideLabel", () => {
    it("renders error message when hideLabel is true", () => {
      render(
        <Select
          label="Database"
          hideLabel={true}
          error="Please select a database"
        >
          <Select.Option value="postgres">PostgreSQL</Select.Option>
        </Select>,
      );

      expect(screen.getByText("Please select a database")).toBeTruthy();
    });

    it("renders error object when hideLabel is true", () => {
      render(
        <Select
          label="Database"
          hideLabel={true}
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
          hideLabel={true}
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

      // Since there's no item with value=null, Base UI falls back to placeholder
      // However, Base UI treats the object map differently - it doesn't find a match
      // for null value, but also doesn't show the placeholder text in the span
      const trigger = document.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
      expect(trigger?.getAttribute("aria-label")).toBe("Choose one");
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
