import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toasty, type KumoToastPosition, useKumoToastManager } from "./toast";

const EXPECTED_VIEWPORT_ANCHOR_CLASSES: Record<KumoToastPosition, string[]> = {
  "top-left": ["top-4", "left-4"],
  "top-center": ["top-4", "left-4", "right-4"],
  "top-right": ["top-4", "right-4"],
  "bottom-left": ["bottom-4", "left-4"],
  "bottom-center": ["bottom-4", "left-4", "right-4"],
  "bottom-right": ["bottom-4", "right-4"],
};

function TriggerToastButton({
  label,
  title,
  description,
  position,
}: {
  label: string;
  title: string;
  description: string;
  position?: KumoToastPosition;
}) {
  const toastManager = useKumoToastManager();

  return (
    <button
      type="button"
      onClick={() => toastManager.add({ title, description, position })}
    >
      {label}
    </button>
  );
}

function findViewport(position: KumoToastPosition) {
  return document.querySelector(
    `[data-kumo-toast-position="${position}"]`,
  ) as HTMLElement | null;
}

describe("Toasty position", () => {
  it("uses bottom-right by default", async () => {
    render(
      <Toasty>
        <TriggerToastButton
          label="Show toast"
          title="Toast title"
          description="Toast description"
        />
      </Toasty>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show toast" }));
    await screen.findByText("Toast title");

    const viewport = findViewport("bottom-right");
    expect(viewport).toBeTruthy();
    expect(viewport?.dataset.kumoToastViewport).toBe("true");
    expect(viewport?.className).toContain("bottom-4");
    expect(viewport?.className).toContain("right-4");
  });

  it.each(
    Object.entries(EXPECTED_VIEWPORT_ANCHOR_CLASSES) as Array<
      [KumoToastPosition, string[]]
    >,
  )("uses provider position %s", async (position, expectedClasses) => {
    render(
      <Toasty position={position}>
        <TriggerToastButton
          label="Show positioned toast"
          title={`Toast in ${position}`}
          description="Toast description"
        />
      </Toasty>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Show positioned toast" }),
    );
    await screen.findByText(`Toast in ${position}`);

    const viewport = findViewport(position);
    expect(viewport).toBeTruthy();

    for (const className of expectedClasses) {
      expect(viewport?.className).toContain(className);
    }
  });

  it("allows per-toast position override", async () => {
    render(
      <Toasty position="bottom-right">
        <TriggerToastButton
          label="Show top-left toast"
          title="Override position toast"
          description="Toast description"
          position="top-left"
        />
      </Toasty>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show top-left toast" }));
    await screen.findByText("Override position toast");

    expect(findViewport("top-left")).toBeTruthy();
    expect(findViewport("bottom-right")).toBeNull();
  });

  it("renders toasts in multiple lanes", async () => {
    render(
      <Toasty position="bottom-right">
        <TriggerToastButton
          label="Show default lane toast"
          title="Default lane toast"
          description="Toast description"
        />
        <TriggerToastButton
          label="Show top lane toast"
          title="Top lane toast"
          description="Toast description"
          position="top-left"
        />
      </Toasty>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Show default lane toast" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Show top lane toast" }));

    await screen.findByText("Default lane toast");
    await screen.findByText("Top lane toast");

    expect(findViewport("bottom-right")).toBeTruthy();
    expect(findViewport("top-left")).toBeTruthy();
  });
});
