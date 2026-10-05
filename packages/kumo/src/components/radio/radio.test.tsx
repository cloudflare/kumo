import { describe, expect, it, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Radio,
  KUMO_RADIO_VARIANTS,
  KUMO_RADIO_DEFAULT_VARIANTS,
} from "./radio";

describe("Radio", () => {
  it("renders a radio group with legend and items", () => {
    const { container } = render(
      <Radio.Group legend="Choose option" defaultValue="a">
        <Radio.Item label="Option A" value="a" />
        <Radio.Item label="Option B" value="b" />
      </Radio.Group>,
    );

    expect(screen.getByText("Choose option")).toBeTruthy();
    expect(screen.getByText("Option A")).toBeTruthy();
    expect(screen.getByText("Option B")).toBeTruthy();
    expect(container.querySelector("fieldset")?.className).toContain("p-0");
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

  it("accepts ReactNode content for Radio.Item label", () => {
    render(
      <Radio.Group legend="Plans" appearance="card" defaultValue="pro">
        <Radio.Item
          label={
            <span>
              Pro <span data-testid="badge">Popular</span>
            </span>
          }
          description="For professional websites."
          value="pro"
        />
      </Radio.Group>,
    );

    expect(screen.getByText("Popular")).toBeTruthy();
    expect(screen.getByTestId("badge")).toBeTruthy();
  });

  it("supports controlPosition='start' on card appearance", () => {
    const { container } = render(
      <Radio.Group
        legend="Plan"
        appearance="card"
        controlPosition="start"
        defaultValue="free"
      >
        <Radio.Item label="Free" description="Hobby" value="free" />
      </Radio.Group>,
    );

    // The card label wrapper uses flex-row-reverse to place the control at start.
    const label = container.querySelector("label");
    expect(label?.className).toContain("flex-row-reverse");
  });

  it("joins vertical card items into one card with dividers", () => {
    const { container } = render(
      <Radio.Group legend="Plan" appearance="card" defaultValue="free">
        <Radio.Item label="Free" value="free" />
        <Radio.Item label="Pro" value="pro" />
      </Radio.Group>,
    );

    const labels = container.querySelectorAll("label");
    expect(labels[0].parentElement?.className).toContain("rounded-lg");
    expect(labels[0].parentElement?.className).toContain("ring-kumo-line");
    for (const label of labels) {
      expect(label.className).toContain("border-b");
      expect(label.className).not.toContain("rounded-lg");
    }
  });

  it("joins horizontal card items into one two-column card", () => {
    const { container } = render(
      <Radio.Group
        legend="Plan"
        appearance="card"
        orientation="horizontal"
        defaultValue="free"
      >
        <Radio.Item label="Free" value="free" />
        <Radio.Item label="Pro" value="pro" />
        <Radio.Item label="Business" value="business" />
      </Radio.Group>,
    );

    const labels = container.querySelectorAll("label");
    const grid = labels[0].parentElement?.className ?? "";
    expect(grid).toContain("grid-cols-2");
    expect(grid).toContain("rounded-lg");
    for (const label of labels) {
      expect(label.className).toContain("odd:border-r");
      expect(label.className).not.toContain("rounded-lg");
    }
  });

  it("exports KUMO_RADIO_VARIANTS with appearance axis", () => {
    expect(KUMO_RADIO_VARIANTS.appearance.default).toBeDefined();
    expect(KUMO_RADIO_VARIANTS.appearance.card).toBeDefined();
    expect(KUMO_RADIO_VARIANTS.appearance.segmented).toBeDefined();
    expect(KUMO_RADIO_DEFAULT_VARIANTS.appearance).toBe("default");
  });

  it("renders a segmented group with radio semantics and intrinsic layout", () => {
    const { container } = render(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        defaultValue="1"
      >
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
        <Radio.Item label="24h" value="24" />
      </Radio.Group>,
    );

    expect(screen.getByRole("group", { name: "Duration preset" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(3);

    const items = container.querySelector('[data-kumo-part="items"]');
    expect(items?.className).toContain("inline-flex");
    expect(items?.className).toContain("w-max");
    expect(items?.className).toContain("flex-nowrap");
    expect(items?.className).toContain("self-start");
    expect(items?.className).toContain("bg-kumo-control");
    expect(container.querySelector("fieldset")?.className).toContain("gap-2");
    expect(items?.className).not.toContain("gap-1");
    expect(items?.className).not.toContain("p-1");

    const selected = screen.getByRole("radio", { name: "1h" });
    const item = selected.closest('[data-kumo-part="item-label"]');
    expect(selected.getAttribute("aria-checked")).toBe("true");
    expect(selected.getAttribute("aria-pressed")).toBeNull();
    expect(item?.className).toContain("h-9");
    expect(item?.className).toContain("px-3.25");
    expect(item?.className).toContain("first:pl-3");
    expect(item?.className).toContain("last:pr-3");
    expect(item?.className).toContain("-ml-px");
    expect(item?.className).toContain("first:ml-0");
    expect(item?.className).not.toContain("-mr-px");
    expect(item?.className).toContain("text-sm");
    expect(item?.className).toContain("font-medium");
    expect(item?.className).toContain("border-r");
    expect(item?.className).toContain("border-kumo-line/50");
    expect(item?.className).toContain("bg-transparent");
    expect(item?.className).not.toContain("bg-kumo-control");
    expect(item?.className).toContain("first:rounded-l-lg");
    expect(item?.className).toContain("last:rounded-r-lg");
    expect(item?.className).not.toContain("tabular-nums");
    expect(item?.className).toContain("whitespace-nowrap");
    expect(item?.className).toContain("has-focus-visible:outline-kumo-brand");
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("preserves selected segmented styles on hover", () => {
    render(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        defaultValue="1"
      >
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    const item = screen
      .getByRole("radio", { name: "1h" })
      .closest('[data-kumo-part="item-label"]');

    expect(item?.className).toContain(
      "hover:not-has-data-disabled:not-has-data-checked:bg-kumo-contrast/7",
    );
    expect(item?.className).toContain("has-data-checked:bg-kumo-contrast");
    expect(item?.className).toContain("has-data-checked:ring-kumo-contrast");
  });

  it("selects segmented items and calls onValueChange once", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        defaultValue="1"
        onValueChange={onValueChange}
      >
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    await user.click(screen.getByRole("radio", { name: "12h" }));

    expect(
      screen.getByRole("radio", { name: "12h" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0]?.[0]).toBe("12");
  });

  it("supports controlled segmented groups", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        value="1"
        onValueChange={onValueChange}
      >
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    await user.click(screen.getByRole("radio", { name: "12h" }));

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("radio", { name: "1h" }).getAttribute("aria-checked"),
    ).toBe("true");

    rerender(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        value="12"
        onValueChange={onValueChange}
      >
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    expect(
      screen.getByRole("radio", { name: "12h" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("preserves arrow-key selection for segmented items", async () => {
    const user = userEvent.setup();

    render(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        defaultValue="1"
      >
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    screen.getByRole("radio", { name: "1h" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("radio", { name: "12h" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("keeps a composable legend outside the segmented items", () => {
    const { container } = render(
      <Radio.Group appearance="segmented" defaultValue="1">
        <Radio.Legend>Duration preset</Radio.Legend>
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    const legend = screen.getByText("Duration preset");
    const items = container.querySelector('[data-kumo-part="items"]');

    expect(screen.getByRole("group", { name: "Duration preset" })).toBeTruthy();
    expect(items?.contains(legend)).toBe(false);
    expect(items?.querySelectorAll('[data-kumo-part="item"]')).toHaveLength(2);
  });

  it("preserves segmented error rendering and item styling", () => {
    const { container } = render(
      <Radio.Group
        appearance="segmented"
        legend="Duration preset"
        error="Choose a duration"
      >
        <Radio.Item label="1h" value="1" variant="error" />
        <Radio.Item label="12h" value="12" variant="error" />
      </Radio.Group>,
    );

    expect(screen.getByText("Choose a duration")).toBeTruthy();
    expect(
      container.querySelector('[data-kumo-part="item-label"]')?.className,
    ).toContain("ring-kumo-danger");
  });

  it("preserves segmented group-level and item-level disabled states", () => {
    const { rerender } = render(
      <Radio.Group appearance="segmented" legend="Duration preset" disabled>
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" />
      </Radio.Group>,
    );

    expect(
      screen.getByRole("radio", { name: "1h" }).hasAttribute("data-disabled"),
    ).toBe(true);
    expect(
      screen.getByRole("radio", { name: "12h" }).hasAttribute("data-disabled"),
    ).toBe(true);

    rerender(
      <Radio.Group appearance="segmented" legend="Duration preset">
        <Radio.Item label="1h" value="1" />
        <Radio.Item label="12h" value="12" disabled />
      </Radio.Group>,
    );

    expect(
      screen.getByRole("radio", { name: "1h" }).hasAttribute("data-disabled"),
    ).toBe(false);
    expect(
      screen.getByRole("radio", { name: "12h" }).hasAttribute("data-disabled"),
    ).toBe(true);
  });
});
