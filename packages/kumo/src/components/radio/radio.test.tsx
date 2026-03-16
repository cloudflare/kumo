import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Radio,
  KUMO_RADIO_VARIANTS,
  KUMO_RADIO_DEFAULT_VARIANTS,
} from "./radio";

describe("Radio", () => {
  describe("basic rendering", () => {
    it("renders a radio group with legend and items", () => {
      render(
        <Radio.Group legend="Choose option" defaultValue="a">
          <Radio.Item label="Option A" value="a" />
          <Radio.Item label="Option B" value="b" />
        </Radio.Group>,
      );

      expect(screen.getByText("Choose option")).toBeTruthy();
      expect(screen.getByText("Option A")).toBeTruthy();
      expect(screen.getByText("Option B")).toBeTruthy();
    });

    it("renders error message when error prop is set", () => {
      render(
        <Radio.Group legend="Choose" error="Required field">
          <Radio.Item label="A" value="a" />
        </Radio.Group>,
      );

      expect(screen.getByText("Required field")).toBeTruthy();
    });

    it("renders description when description prop is set", () => {
      render(
        <Radio.Group legend="Choose" description="Pick one option">
          <Radio.Item label="A" value="a" />
        </Radio.Group>,
      );

      expect(screen.getByText("Pick one option")).toBeTruthy();
    });
  });

  describe("card appearance", () => {
    it("renders card items with description", () => {
      render(
        <Radio.Group legend="Plan" appearance="card" defaultValue="free">
          <Radio.Item
            label="Free"
            description="For personal projects."
            value="free"
          />
          <Radio.Item
            label="Pro"
            description="For professional use."
            value="pro"
          />
        </Radio.Group>,
      );

      expect(screen.getByText("Free")).toBeTruthy();
      expect(screen.getByText("For personal projects.")).toBeTruthy();
      expect(screen.getByText("Pro")).toBeTruthy();
      expect(screen.getByText("For professional use.")).toBeTruthy();
    });

    it("renders card items without description", () => {
      render(
        <Radio.Group legend="Plan" appearance="card" defaultValue="a">
          <Radio.Item label="Option A" value="a" />
          <Radio.Item label="Option B" value="b" />
        </Radio.Group>,
      );

      expect(screen.getByText("Option A")).toBeTruthy();
      expect(screen.getByText("Option B")).toBeTruthy();
    });

    it("allows item-level appearance override", () => {
      const { container } = render(
        <Radio.Group legend="Plan" defaultValue="a">
          <Radio.Item
            label="Card Item"
            description="This is a card."
            value="a"
            appearance="card"
          />
          <Radio.Item label="Default Item" value="b" />
        </Radio.Group>,
      );

      // Card item should render description
      expect(screen.getByText("This is a card.")).toBeTruthy();
      // Default item should not have description wrapper
      const labels = container.querySelectorAll("label");
      expect(labels.length).toBe(2);
    });

    it("description is not rendered in default appearance", () => {
      render(
        <Radio.Group legend="Plan" defaultValue="a">
          <Radio.Item
            label="Option A"
            description="Should not appear"
            value="a"
          />
        </Radio.Group>,
      );

      expect(screen.getByText("Option A")).toBeTruthy();
      expect(screen.queryByText("Should not appear")).toBeNull();
    });
  });

  describe("disabled state", () => {
    it("passes disabled to Fieldset.Root", () => {
      const { container } = render(
        <Radio.Group legend="Plan" disabled defaultValue="a">
          <Radio.Item label="A" value="a" />
        </Radio.Group>,
      );

      const fieldset = container.querySelector("fieldset");
      // Base UI Fieldset.Root sets data-disabled on the fieldset when disabled
      expect(
        fieldset?.hasAttribute("disabled") ||
          fieldset?.hasAttribute("data-disabled"),
      ).toBe(true);
    });

    it("applies disabled styles to individual card items", () => {
      const { container } = render(
        <Radio.Group legend="Plan" appearance="card" defaultValue="a">
          <Radio.Item label="Available" value="a" />
          <Radio.Item label="Unavailable" value="b" disabled />
        </Radio.Group>,
      );

      const labels = container.querySelectorAll("label");
      const disabledLabel = labels[1];
      expect(disabledLabel?.className).toContain("opacity-50");
      expect(disabledLabel?.className).toContain("cursor-not-allowed");
    });
  });

  describe("error state", () => {
    it("renders error variant on card items", () => {
      const { container } = render(
        <Radio.Group
          legend="Plan"
          appearance="card"
          error="Please select a plan"
        >
          <Radio.Item label="Free" value="free" variant="error" />
          <Radio.Item label="Pro" value="pro" variant="error" />
        </Radio.Group>,
      );

      expect(screen.getByText("Please select a plan")).toBeTruthy();
      // Card labels should have error border class
      const labels = container.querySelectorAll("label");
      expect(labels[0]?.className).toContain("border-kumo-danger");
      expect(labels[1]?.className).toContain("border-kumo-danger");
    });
  });

  describe("orientation", () => {
    it("renders horizontal card layout with grid", () => {
      const { container } = render(
        <Radio.Group
          legend="Plan"
          appearance="card"
          orientation="horizontal"
          defaultValue="a"
        >
          <Radio.Item label="A" value="a" />
          <Radio.Item label="B" value="b" />
        </Radio.Group>,
      );

      const itemsContainer = container.querySelector(".grid");
      expect(itemsContainer).toBeTruthy();
      expect(itemsContainer?.className).toContain("grid-cols-2");
    });

    it("renders vertical card layout with flex-col", () => {
      const { container } = render(
        <Radio.Group
          legend="Plan"
          appearance="card"
          orientation="vertical"
          defaultValue="a"
        >
          <Radio.Item label="A" value="a" />
          <Radio.Item label="B" value="b" />
        </Radio.Group>,
      );

      const itemsContainer = container.querySelector(".flex-col");
      expect(itemsContainer).toBeTruthy();
    });
  });

  describe("variants", () => {
    it("exports KUMO_RADIO_VARIANTS with appearance axis", () => {
      expect(KUMO_RADIO_VARIANTS.appearance).toBeDefined();
      expect(KUMO_RADIO_VARIANTS.appearance.default).toBeDefined();
      expect(KUMO_RADIO_VARIANTS.appearance.card).toBeDefined();
    });

    it("exports KUMO_RADIO_DEFAULT_VARIANTS with appearance default", () => {
      expect(KUMO_RADIO_DEFAULT_VARIANTS.appearance).toBe("default");
    });
  });
});
