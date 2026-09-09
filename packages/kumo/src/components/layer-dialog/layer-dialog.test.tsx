import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { LayerDialog } from "./layer-dialog";

describe("LayerDialog", () => {
  it("exports its strict compound component slots", () => {
    expect(LayerDialog.Root).toBeDefined();
    expect(LayerDialog.Alert).toBeDefined();
    expect(LayerDialog.Content).toBeDefined();
    expect(LayerDialog.Title).toBeDefined();
    expect(LayerDialog.Body).toBeDefined();
    expect(LayerDialog.Actions).toBeDefined();
  });

  it("requires explicit actions for alert dialogs", () => {
    expect(() =>
      render(
        <LayerDialog.Alert open>
          <LayerDialog.Content>
            <LayerDialog.Title>Delete resource</LayerDialog.Title>
            <LayerDialog.Body>This action cannot be undone.</LayerDialog.Body>
          </LayerDialog.Content>
        </LayerDialog.Alert>,
      ),
    ).toThrow("LayerDialog.Alert requires");
  });
});
