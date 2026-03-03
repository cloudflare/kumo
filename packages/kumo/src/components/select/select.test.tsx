import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
