import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { KumoPortalProvider } from "../../utils/portal-provider";
import {
  KUMO_LAYER_DIALOG_DEFAULT_VARIANTS,
  KUMO_LAYER_DIALOG_VARIANTS,
  LayerDialog,
} from "./layer-dialog";

describe("LayerDialog", () => {
  it("exports its strict compound component slots", () => {
    expect(LayerDialog.Root).toBeDefined();
    expect(LayerDialog.Alert).toBeDefined();
    expect(LayerDialog.Content).toBeDefined();
    expect(LayerDialog.Title).toBeDefined();
    expect(LayerDialog.Description).toBeDefined();
    expect(LayerDialog.Body).toBeDefined();
    expect(LayerDialog.Actions).toBeDefined();
  });

  it("uses a larger constrained desktop width by default", () => {
    expect(KUMO_LAYER_DIALOG_DEFAULT_VARIANTS.size).toBe("base");
    expect(KUMO_LAYER_DIALOG_VARIANTS.size.base.classes).toBe("sm:max-w-xl");
    expect(Object.keys(KUMO_LAYER_DIALOG_VARIANTS.size)).toEqual([
      "sm",
      "base",
      "lg",
      "xl",
    ]);
  });

  it("falls back to default variants for unknown size and alignment", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getByRole } = render(
      <LayerDialog.Root open>
        <LayerDialog.Content
          size={"huge" as never}
          verticalAlign={"middle" as never}
        >
          <LayerDialog.Title>Fallback</LayerDialog.Title>
          <LayerDialog.Body>Body</LayerDialog.Body>
        </LayerDialog.Content>
      </LayerDialog.Root>,
    );

    expect(getByRole("dialog").className).toContain(
      KUMO_LAYER_DIALOG_VARIANTS.size.base.classes,
    );
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("rejects more than one description", () => {
    expect(() =>
      render(
        <LayerDialog.Root open>
          <LayerDialog.Content>
            <LayerDialog.Title>Title</LayerDialog.Title>
            <LayerDialog.Description>One</LayerDialog.Description>
            <LayerDialog.Description>Two</LayerDialog.Description>
            <LayerDialog.Body>Body</LayerDialog.Body>
          </LayerDialog.Content>
        </LayerDialog.Root>,
      ),
    ).toThrow("LayerDialog.Content requires");
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

  it("keeps the alert dismissal label set to Cancel", () => {
    const { getByRole, queryByRole } = render(
      <LayerDialog.Alert open>
        <LayerDialog.Content>
          <LayerDialog.Title>Delete resource</LayerDialog.Title>
          <LayerDialog.Body>This action cannot be undone.</LayerDialog.Body>
          <LayerDialog.Actions dismissLabel="close">
            <LayerDialog.Actions.Primary>Delete</LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );

    expect(getByRole("button", { name: "Cancel" })).toBeDefined();
    expect(queryByRole("button", { name: "Close" })).toBeNull();
  });
});

describe("LayerDialog dismissal", () => {
  it("lets an alert close programmatically after its primary action", async () => {
    const actionsRef = { current: null as null | { close: () => void } };
    const onOpenChange = vi.fn();

    const { queryByRole } = render(
      <LayerDialog.Alert
        actionsRef={actionsRef as never}
        defaultOpen
        onOpenChange={onOpenChange}
      >
        <LayerDialog.Content>
          <LayerDialog.Title>Delete resource</LayerDialog.Title>
          <LayerDialog.Body>This action cannot be undone.</LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary>Delete</LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );

    expect(queryByRole("alertdialog")).not.toBeNull();
    act(() => actionsRef.current?.close());

    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "imperative-action" }),
    );
    await waitFor(() => expect(queryByRole("alertdialog")).toBeNull());
  });

  it("blocks user dismissal but not programmatic closes while dismissDisabled", () => {
    const actionsRef = { current: null as null | { close: () => void } };
    const onOpenChange = vi.fn();

    const { getByRole } = render(
      <LayerDialog.Root
        actionsRef={actionsRef as never}
        defaultOpen
        dismissDisabled
        onOpenChange={onOpenChange}
      >
        <LayerDialog.Content>
          <LayerDialog.Title>Saving</LayerDialog.Title>
          <LayerDialog.Body>Please wait.</LayerDialog.Body>
        </LayerDialog.Content>
      </LayerDialog.Root>,
    );

    fireEvent.keyDown(getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();

    act(() => actionsRef.current?.close());
    expect(onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: "imperative-action" }),
    );
  });

  it("does not turn a nested Root into an alert", () => {
    const { getAllByRole, getByRole } = render(
      <LayerDialog.Alert open>
        <LayerDialog.Content>
          <LayerDialog.Title>Delete resource</LayerDialog.Title>
          <LayerDialog.Body>
            <LayerDialog.Root open>
              <LayerDialog.Content>
                <LayerDialog.Title>What gets deleted</LayerDialog.Title>
                <LayerDialog.Body>Everything.</LayerDialog.Body>
              </LayerDialog.Content>
            </LayerDialog.Root>
          </LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary>Delete</LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );

    expect(getAllByRole("alertdialog", { hidden: true })).toHaveLength(1);
    expect(getByRole("dialog", { hidden: true })).toBeDefined();
    expect(
      getByRole("button", { hidden: true, name: "Close dialog" }),
    ).toBeDefined();
  });

  it("describes the popup with its Description slot when present", () => {
    const { getByRole } = render(
      <LayerDialog.Root open>
        <LayerDialog.Content>
          <LayerDialog.Title>Configure hostname</LayerDialog.Title>
          <LayerDialog.Description>
            Route requests to your Worker.
          </LayerDialog.Description>
          <LayerDialog.Body>Form fields</LayerDialog.Body>
        </LayerDialog.Content>
      </LayerDialog.Root>,
    );

    const popup = getByRole("dialog");
    const describedBy = popup.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const description = document.getElementById(describedBy!);
    expect(description?.textContent).toBe("Route requests to your Worker.");
    // The description lives in the title frame, beside the title, not in the
    // scrollable body.
    const title = document.getElementById(
      popup.getAttribute("aria-labelledby")!,
    );
    expect(description?.parentElement).toBe(title?.parentElement);
  });

  it("describes the popup with its body when no Description is given", () => {
    const { getByRole } = render(
      <LayerDialog.Alert open>
        <LayerDialog.Content>
          <LayerDialog.Title>Delete resource</LayerDialog.Title>
          <LayerDialog.Body>This action cannot be undone.</LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary>Delete</LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );

    const popup = getByRole("alertdialog");
    const labelledBy = popup.getAttribute("aria-labelledby");
    const describedBy = popup.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)?.textContent).toBe(
      "Delete resource",
    );
    expect(document.getElementById(describedBy!)?.textContent).toBe(
      "This action cannot be undone.",
    );
  });
});
