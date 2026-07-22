import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { type ReactNode } from "react";
import { Dialog } from "./dialog";
import { Button } from "../button/button";

function renderOpenDialog(dialog: ReactNode) {
  return render(<Dialog.Root defaultOpen>{dialog}</Dialog.Root>);
}

describe("Dialog", () => {
  it("opens from its trigger and closes from its close control", async () => {
    const user = userEvent.setup();

    render(
      <Dialog.Root>
        <Dialog.Trigger>Open dialog</Dialog.Trigger>
        <Dialog>
          <Dialog.Title>Opened dialog</Dialog.Title>
          <Dialog.Close>Close dialog</Dialog.Close>
        </Dialog>
      </Dialog.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(screen.getByRole("dialog").textContent).toContain("Opened dialog");

    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports Button render props on trigger and close", async () => {
    const user = userEvent.setup();

    render(
      <Dialog.Root>
        <Dialog.Trigger render={(p) => <Button {...p}>Open dialog</Button>} />
        <Dialog>
          <Dialog.Title>Rendered button dialog</Dialog.Title>
          <Dialog.Close render={(p) => <Button {...p}>Close dialog</Button>} />
        </Dialog>
      </Dialog.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(screen.getByRole("dialog").textContent).toContain(
      "Rendered button dialog",
    );

    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("preserves the bare Dialog shorthand as the default content surface", () => {
    renderOpenDialog(
      <Dialog>
        <Dialog.Title>Base dialog</Dialog.Title>
      </Dialog>,
    );

    expect(screen.getByRole("dialog").className).toContain("bg-kumo-base");
    expect(
      screen.getByRole("heading", { name: "Base dialog" }).className,
    ).not.toContain("text-xl");
  });

  it("preserves common legacy className customization on the base dialog parts", () => {
    renderOpenDialog(
      <Dialog
        className="p-0 max-w-lg overflow-hidden rounded-none bg-kumo-canvas"
        data-testid="customized-dialog"
      >
        <Dialog.Title className="!text-xl !font-semibold mb-6">
          Customized dialog
        </Dialog.Title>
        <Dialog.Description className="leading-relaxed text-kumo-muted">
          Custom description
        </Dialog.Description>
      </Dialog>,
    );

    expect(screen.getByTestId("customized-dialog").className).toContain("p-0");
    expect(screen.getByTestId("customized-dialog").className).toContain(
      "max-w-lg",
    );
    expect(screen.getByTestId("customized-dialog").className).toContain(
      "rounded-none",
    );
    expect(screen.getByTestId("customized-dialog").className).toContain(
      "bg-kumo-canvas",
    );
    expect(
      screen.getByRole("heading", { name: "Customized dialog" }).className,
    ).toContain("!text-xl");
    expect(
      screen.getByRole("heading", { name: "Customized dialog" }).className,
    ).toContain("mb-6");
    expect(screen.getByText("Custom description").className).toContain(
      "text-kumo-muted",
    );
  });

  it("supports Dialog.Content as an alias for the content surface", () => {
    renderOpenDialog(
      <Dialog.Content>
        <Dialog.Title>Content dialog</Dialog.Title>
      </Dialog.Content>,
    );

    expect(screen.getByRole("dialog").textContent).toContain("Content dialog");
    expect(screen.getByRole("dialog").className).toContain("bg-kumo-base");
  });

  it("renders the layer variant with structured sections", () => {
    renderOpenDialog(
      <Dialog.Content variant="layer" className="max-w-lg">
        <Dialog.Body className="p-8" data-testid="body">
          <Dialog.Title className="text-2xl font-bold">
            Layer dialog
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-kumo-default">
            Structured workflow
          </Dialog.Description>
          <Dialog.Separator className="my-6" data-testid="separator" />
        </Dialog.Body>
        <Dialog.Footer className="justify-between px-4" data-testid="footer">
          Actions
        </Dialog.Footer>
      </Dialog.Content>,
    );

    expect(screen.getByRole("dialog").className).toContain("max-w-lg");
    expect(
      screen.getByRole("heading", { name: "Layer dialog" }).className,
    ).toContain("text-2xl");
    expect(screen.getByText("Structured workflow").className).toContain(
      "text-kumo-default",
    );
    expect(screen.getByTestId("body").className).toContain("p-8");
    expect(screen.getByTestId("footer").className).toContain("justify-between");
    expect(screen.getByTestId("footer").className).toContain("px-4");
    expect(screen.getByTestId("separator").className).toContain("my-6");
  });
});
