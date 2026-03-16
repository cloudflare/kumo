import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Radio,
  KUMO_RADIO_VARIANTS,
  KUMO_RADIO_DEFAULT_VARIANTS,
} from "./radio";

describe("Radio", () => {
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
  });

  it("does not render description in default appearance", () => {
    render(
      <Radio.Group legend="Plan" defaultValue="a">
        <Radio.Item label="Option A" description="Hidden" value="a" />
      </Radio.Group>,
    );

    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("renders error and description on the group", () => {
    render(
      <Radio.Group legend="Choose" error="Required" description="Pick one">
        <Radio.Item label="A" value="a" />
      </Radio.Group>,
    );

    expect(screen.getByText("Required")).toBeTruthy();
    expect(screen.getByText("Pick one")).toBeTruthy();
  });

  it("exports KUMO_RADIO_VARIANTS with appearance axis", () => {
    expect(KUMO_RADIO_VARIANTS.appearance.default).toBeDefined();
    expect(KUMO_RADIO_VARIANTS.appearance.card).toBeDefined();
    expect(KUMO_RADIO_DEFAULT_VARIANTS.appearance).toBe("default");
  });
});
