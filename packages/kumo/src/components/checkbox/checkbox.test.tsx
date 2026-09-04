import { describe, expect, it } from "vite-plus/test";
import { render } from "@testing-library/react";
import { Checkbox } from "./checkbox";

describe("Checkbox.Group", () => {
  it.each([
    ["vertical", "border-t"],
    ["horizontal", "border-l"],
  ] as const)(
    "renders a bordered %s group with shared dividers",
    (orientation, dividerClass) => {
      const { container } = render(
        <Checkbox.Group
          legend="Notifications"
          appearance="bordered"
          orientation={orientation}
          defaultValue={["email"]}
        >
          <Checkbox.Item label="Email" value="email" />
          <Checkbox.Item label="SMS" value="sms" />
        </Checkbox.Group>,
      );

      const group = container.querySelector('[data-kumo-part="group-items"]');
      const item = container.querySelector('[data-kumo-part="item-label"]');

      expect(group?.className).toContain("rounded-lg");
      expect(group?.className).toContain(dividerClass);
      expect(item?.className).toContain("flex-1");
      expect(item?.className).toContain("flex-row-reverse");
      expect(item?.className).toContain("bg-kumo-elevated");
      expect(
        item?.querySelector('[data-kumo-part="item-content"]')?.className,
      ).toContain("leading-5");
    },
  );

  it("preserves control-first layout when explicitly requested", () => {
    const { container } = render(
      <Checkbox.Group appearance="bordered" controlFirst>
        <Checkbox.Item label="Email" value="email" />
      </Checkbox.Group>,
    );

    expect(
      container.querySelector('[data-kumo-part="item-label"]')?.className,
    ).not.toContain("flex-row-reverse");
  });

  it("renders rich label content", () => {
    const { getByText } = render(
      <Checkbox.Group appearance="bordered">
        <Checkbox.Item
          label={
            <span>
              Security <strong>Recommended</strong>
            </span>
          }
          value="security"
        />
      </Checkbox.Group>,
    );

    expect(getByText("Recommended").tagName).toBe("STRONG");
  });

  it("dims only content for disabled bordered items", () => {
    const { container } = render(
      <Checkbox.Group appearance="bordered">
        <Checkbox.Item label="Unavailable" value="unavailable" disabled />
      </Checkbox.Group>,
    );

    const itemClassName = container.querySelector(
      '[data-kumo-part="item-label"]',
    )?.className;

    expect(itemClassName).toContain("[&>*]:opacity-50");
    expect(itemClassName?.split(" ")).not.toContain("opacity-50");
  });
});
