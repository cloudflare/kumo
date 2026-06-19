import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Switch } from "./switch";

describe("Switch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not use a generic fallback accessible name", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Switch checked={false} onCheckedChange={() => {}} />);

    const switchControl = screen.getByRole("switch");
    expect(switchControl.getAttribute("aria-label")).not.toBe("Switch");
    expect(screen.queryByRole("switch", { name: "Switch" })).toBeNull();
  });

  it("warns when no accessible name is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<Switch checked={false} onCheckedChange={() => {}} />);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[Kumo Switch]: Switch must have an accessible name.",
      ),
    );
  });

  it("does not warn when a visible label provides the accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Switch
        label="Email notifications"
        checked={false}
        onCheckedChange={() => {}}
      />,
    );

    expect(warn).not.toHaveBeenCalled();
    expect(
      screen.getByRole("switch", { name: "Email notifications" }),
    ).toBeTruthy();
  });

  it("does not warn when aria-label provides the accessible name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Switch
        aria-label="Email notifications"
        checked={false}
        onCheckedChange={() => {}}
      />,
    );

    expect(warn).not.toHaveBeenCalled();
    expect(
      screen.getByRole("switch", { name: "Email notifications" }),
    ).toBeTruthy();
  });

  it("expands an aria-label-only switch target to at least 24px", () => {
    render(
      <Switch
        aria-label="Email notifications"
        size="sm"
        checked={false}
        onCheckedChange={() => {}}
      />,
    );

    const switchControl = screen.getByRole("switch", {
      name: "Email notifications",
    });
    expect(switchControl.className).toContain("before:min-h-6");
    expect(switchControl.className).toContain("before:min-w-6");
  });

  it("expands grouped switch item targets to at least 24px", () => {
    render(
      <Switch.Group legend="Notifications">
        <Switch.Item label="Email" size="sm" />
      </Switch.Group>,
    );

    const switchControl = screen.getByRole("switch", { name: "Email" });
    expect(switchControl.className).toContain("before:min-h-6");
    expect(switchControl.className).toContain("before:min-w-6");
  });

  it("does not warn or override rich labels associated with aria-labelledby", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <Switch
        label={
          <span id="advanced-mode-label">
            Advanced <strong>mode</strong>
          </span>
        }
        aria-labelledby="advanced-mode-label"
        checked={false}
        onCheckedChange={() => {}}
      />,
    );

    expect(warn).not.toHaveBeenCalled();
    const switchControl = screen.getByRole("switch", {
      name: "Advanced mode",
    });
    expect(switchControl.getAttribute("aria-labelledby")).toBe(
      "advanced-mode-label",
    );
    expect(switchControl.hasAttribute("aria-label")).toBe(false);
  });

  it("associates group description and error text with the group fieldset", () => {
    const { container } = render(
      <Switch.Group
        legend="Notifications"
        error="Enable at least one notification type"
        description="Choose where alerts should be sent."
      >
        <Switch.Item label="Email" />
      </Switch.Group>,
    );

    const fieldset = container.querySelector("fieldset");
    const error = screen.getByText("Enable at least one notification type");
    const description = screen.getByText("Choose where alerts should be sent.");

    expect(error.id).toBeTruthy();
    expect(description.id).toBeTruthy();
    expect(error.getAttribute("role")).toBe("alert");
    expect(fieldset?.getAttribute("aria-invalid")).toBe("true");
    expect(fieldset?.getAttribute("aria-describedby")).toBe(
      `${error.id} ${description.id}`,
    );
  });
});
