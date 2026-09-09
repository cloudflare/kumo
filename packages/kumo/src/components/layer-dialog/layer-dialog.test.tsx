import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
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

  it("uses the portal container from KumoPortalProvider", () => {
    const portalContainer = document.createElement("div");
    document.body.append(portalContainer);

    const { unmount } = render(
      <KumoPortalProvider container={portalContainer}>
        <LayerDialog.Root open>
          <LayerDialog.Content>
            <LayerDialog.Title>Portal title</LayerDialog.Title>
            <LayerDialog.Body>Portal body</LayerDialog.Body>
          </LayerDialog.Content>
        </LayerDialog.Root>
      </KumoPortalProvider>,
    );

    expect(within(portalContainer).getByText("Portal title")).toBeDefined();

    unmount();
    portalContainer.remove();
  });

  it("keeps alert dialogs modal when modal is false", () => {
    const outsideButton = document.createElement("button");
    document.body.append(outsideButton);

    const { unmount } = render(
      <LayerDialog.Alert open modal={false}>
        <LayerDialog.Content>
          <LayerDialog.Title>Delete resource</LayerDialog.Title>
          <LayerDialog.Body>This action cannot be undone.</LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary>Delete</LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );

    expect(outsideButton.getAttribute("data-base-ui-inert")).toBe("");
    expect(outsideButton.getAttribute("aria-hidden")).toBe("true");

    unmount();
    outsideButton.remove();
  });
});
