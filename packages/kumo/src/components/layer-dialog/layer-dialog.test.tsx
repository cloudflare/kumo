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

  it("derives the desktop height cap from viewport padding, not a hardcoded calc", () => {
    // Every alignment must reserve vertical padding on the viewport, and the
    // popup must fill that padded box. A hardcoded `calc(100dvh - Nrem)` on
    // the popup can drift from the alignment padding and overflow the screen.
    for (const config of Object.values(
      KUMO_LAYER_DIALOG_VARIANTS.verticalAlign,
    )) {
      expect(config.classes).toMatch(/sm:(py|pb)-\d/);
    }

    const { getByRole, unmount } = render(
      <LayerDialog.Root open>
        <LayerDialog.Content verticalAlign="top">
          <LayerDialog.Title>Tall</LayerDialog.Title>
          <LayerDialog.Body>Body</LayerDialog.Body>
        </LayerDialog.Content>
      </LayerDialog.Root>,
    );

    const popup = getByRole("dialog");
    const viewport = popup.parentElement!;
    expect(viewport.className).toContain("sm:pt-16");
    expect(viewport.className).toContain("sm:pb-6");
    expect(popup.className).toContain("sm:max-h-full");
    expect(popup.className).not.toMatch(/sm:max-h-\[calc/);
    expect(popup.firstElementChild?.className).toContain("sm:max-h-full");
    unmount();
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

  it("defaults the alert dismissal label to Cancel", () => {
    const { getByRole, queryByRole } = render(
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
    expect(title?.parentElement?.contains(description)).toBe(true);
  });

  it("condenses the description on scroll only when enough overflow survives", () => {
    const { getByRole } = render(
      <LayerDialog.Root open>
        <LayerDialog.Content>
          <LayerDialog.Title>Audit log</LayerDialog.Title>
          <LayerDialog.Description>Long list below.</LayerDialog.Description>
          <LayerDialog.Body>Entries</LayerDialog.Body>
        </LayerDialog.Content>
      </LayerDialog.Root>,
    );

    const popup = getByRole("dialog");
    const description = document.getElementById(
      popup.getAttribute("aria-describedby")!,
    )!;
    const collapsible = description.closest("[class*='grid-rows-']")!;
    const clip = collapsible.firstElementChild as HTMLElement;
    const viewport = popup.querySelector<HTMLElement>(
      "[role='presentation'][style*='overflow']",
    )!;

    // jsdom has no layout, so stub the geometry the scroll handler reads.
    const setGeometry = (
      scrollTop: number,
      scrollHeight: number,
      clientHeight: number,
    ) => {
      Object.defineProperty(viewport, "scrollTop", {
        configurable: true,
        value: scrollTop,
      });
      Object.defineProperty(viewport, "scrollHeight", {
        configurable: true,
        value: scrollHeight,
      });
      Object.defineProperty(viewport, "clientHeight", {
        configurable: true,
        value: clientHeight,
      });
    };
    Object.defineProperty(clip, "offsetHeight", {
      configurable: true,
      value: 24,
    });

    // Barely overflowing: collapsing a 24px description would leave only
    // 6px of scroll range, which clamps scrollTop under the threshold and
    // would re-expand the description in a loop. Stay expanded.
    setGeometry(40, 330, 300);
    fireEvent.scroll(viewport);
    expect(collapsible.className).toContain("grid-rows-[1fr]");
    expect(collapsible.hasAttribute("data-condensed")).toBe(false);

    // Plenty of overflow: condense, and keep the description in the DOM so
    // aria-describedby still resolves.
    setGeometry(40, 900, 300);
    fireEvent.scroll(viewport);
    expect(collapsible.className).toContain("grid-rows-[0fr]");
    expect(collapsible.getAttribute("data-condensed")).toBe("true");
    expect(popup.getAttribute("aria-describedby")).toBe(description.id);

    // Once condensed, any scroll past the threshold keeps it condensed even
    // if the measured clip height is now 0 mid-transition.
    Object.defineProperty(clip, "offsetHeight", {
      configurable: true,
      value: 0,
    });
    setGeometry(20, 900, 324);
    fireEvent.scroll(viewport);
    expect(collapsible.className).toContain("grid-rows-[0fr]");

    // Scrolling back to the top expands again.
    setGeometry(0, 900, 324);
    fireEvent.scroll(viewport);
    expect(collapsible.className).toContain("grid-rows-[1fr]");
  });

  it("keeps the primary action neutral unless destructive is requested", () => {
    // Button variants share classes and differ by the inline emphasis token.
    const emphasisToken = (button: HTMLElement) =>
      button.style.getPropertyValue("--kumo-button-emphasis-gradient-end");

    const { getByRole, rerender } = render(
      <LayerDialog.Alert open>
        <LayerDialog.Content>
          <LayerDialog.Title>Deploy to production</LayerDialog.Title>
          <LayerDialog.Body>Traffic switches immediately.</LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary>Deploy</LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );
    expect(emphasisToken(getByRole("button", { name: "Deploy" }))).toBe(
      "var(--color-kumo-brand)",
    );

    rerender(
      <LayerDialog.Alert open>
        <LayerDialog.Content>
          <LayerDialog.Title>Delete resource</LayerDialog.Title>
          <LayerDialog.Body>This cannot be undone.</LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary variant="destructive">
              Delete
            </LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );
    expect(emphasisToken(getByRole("button", { name: "Delete" }))).toBe(
      "var(--color-kumo-danger)",
    );
  });

  it("takes translated text for the two strings it renders itself", () => {
    const { getByRole, rerender } = render(
      <LayerDialog.Root open>
        <LayerDialog.Content closeLabel="Dialog schließen">
          <LayerDialog.Title>Einstellungen</LayerDialog.Title>
          <LayerDialog.Body>Inhalt</LayerDialog.Body>
        </LayerDialog.Content>
      </LayerDialog.Root>,
    );
    expect(getByRole("button", { name: "Dialog schließen" })).toBeDefined();

    rerender(
      <LayerDialog.Alert open>
        <LayerDialog.Content>
          <LayerDialog.Title>Löschen</LayerDialog.Title>
          <LayerDialog.Body>Unwiderruflich.</LayerDialog.Body>
          <LayerDialog.Actions dismissLabel="Abbrechen">
            <LayerDialog.Actions.Primary variant="destructive">
              Löschen
            </LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Alert>,
    );
    expect(getByRole("button", { name: "Abbrechen" })).toBeDefined();
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
