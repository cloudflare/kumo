import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./components/checkbox";
import { Radio } from "./components/radio";
import { Switch } from "./components/switch";

describe("React compatibility", () => {
  it("renders Kumo-owned context providers with React 18-compatible syntax", () => {
    render(
      <>
        <Checkbox.Group legend="Notification channels">
          <Checkbox.Item label="Email" value="email" />
        </Checkbox.Group>
        <Radio.Group legend="Plan" defaultValue="free">
          <Radio.Item label="Free" value="free" />
        </Radio.Group>
        <Switch.Group legend="Features">
          <Switch.Item label="Beta features" />
        </Switch.Group>
      </>,
    );

    expect(screen.getByText("Notification channels")).toBeTruthy();
    expect(screen.getByText("Plan")).toBeTruthy();
    expect(screen.getByText("Features")).toBeTruthy();
  });
});
