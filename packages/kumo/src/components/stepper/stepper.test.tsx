import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import type { ReactNode } from "react";
import { Stepper, useStepper } from "./stepper";

function Wizard({
  beforeNext,
  onComplete,
  orientation,
  children,
}: {
  beforeNext?: () => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
  orientation?: "vertical" | "horizontal";
  children?: ReactNode;
}) {
  return (
    <Stepper.Root orientation={orientation} onComplete={onComplete}>
      {["One", "Two", "Three"].map((label) => (
        <Stepper.Step key={label}>
          <Stepper.Header>{label}</Stepper.Header>
          <Stepper.Panel>
            <p>{label} body</p>
            <Stepper.Footer>
              <Stepper.Back />
              <Stepper.Next beforeNext={beforeNext}>Continue</Stepper.Next>
            </Stepper.Footer>
          </Stepper.Panel>
        </Stepper.Step>
      ))}
      {children}
    </Stepper.Root>
  );
}

function steps(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-kumo-part="step"]'),
  ).map((step) => step.dataset.status);
}

function openPanel(container: HTMLElement) {
  return container.querySelector('[data-kumo-part="panel"][data-state="open"]');
}

describe("Stepper", () => {
  it("keeps completed steps checked after jumping back", () => {
    const { container } = render(<Wizard />);
    const next = () =>
      fireEvent.click(
        openPanel(container)!.querySelector("button:last-of-type")!,
      );

    next();
    next();
    expect(steps(container)).toEqual(["complete", "complete", "active"]);

    fireEvent.click(screen.getByRole("button", { name: /One/ }));
    expect(steps(container)).toEqual(["active", "complete", "upcoming"]);
  });

  it("lets headers return to any reached step", () => {
    const { container } = render(<Wizard />);
    fireEvent.click(
      openPanel(container)!.querySelector("button:last-of-type")!,
    );
    fireEvent.click(screen.getByRole("button", { name: /One/ }));

    const two = screen.getByRole("button", { name: /Two/ });
    const three = screen.getByRole("button", { name: /Three/ });
    expect((two as HTMLButtonElement).disabled).toBe(false);
    expect((three as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(two);
    expect(steps(container)).toEqual(["complete", "active", "upcoming"]);
  });

  it("stays on the step without an unhandled rejection when beforeNext throws", async () => {
    const beforeNext = vi.fn().mockRejectedValue(new Error("invalid"));
    const { container } = render(<Wizard beforeNext={beforeNext} />);

    fireEvent.click(
      openPanel(container)!.querySelector("button:last-of-type")!,
    );

    await waitFor(() => expect(beforeNext).toHaveBeenCalled());
    // Let the rejection settle; vitest fails the run on unhandled rejections.
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(steps(container)).toEqual(["active", "upcoming", "upcoming"]);
  });

  it("calls onComplete from the last step", async () => {
    const onComplete = vi.fn();
    const { container } = render(<Wizard onComplete={onComplete} />);
    const next = () =>
      fireEvent.click(
        openPanel(container)!.querySelector("button:last-of-type")!,
      );

    next();
    next();
    next();
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  describe("horizontal", () => {
    it("renders the rail as an ordered list with the current step marked", () => {
      const { container } = render(<Wizard orientation="horizontal" />);
      const rail = container.querySelector('[data-kumo-part="rail"]')!;

      expect(rail.tagName).toBe("OL");
      expect(rail.querySelectorAll(":scope > li")).toHaveLength(3);
      expect(
        rail.querySelector('[aria-current="step"]')?.textContent,
      ).toContain("One");
    });

    it("titles the active panel and lifts its footer out of the card", () => {
      const { container } = render(<Wizard orientation="horizontal" />);
      const panel = openPanel(container)!;

      expect(panel.querySelector("h3")?.textContent).toContain("One");
      expect(panel?.textContent).toContain("Step 1 of 3");

      const footer = panel.querySelector('[data-kumo-part="footer"]')!;
      expect(footer.parentElement).toBe(panel);
    });
  });

  describe("goToStep", () => {
    function Jump() {
      const { goToStep } = useStepper();
      return (
        <div>
          <button type="button" onClick={() => goToStep(2)}>
            jump
          </button>
          <button type="button" onClick={() => goToStep(2, { force: true })}>
            force jump
          </button>
        </div>
      );
    }

    it("only jumps past the furthest reached step when forced", () => {
      const { container } = render(
        <Wizard>
          <Jump />
        </Wizard>,
      );
      fireEvent.click(screen.getByText("jump"));
      expect(steps(container)).toEqual(["active", "upcoming", "upcoming"]);

      fireEvent.click(screen.getByText("force jump"));
      // Forcing counts the skipped steps as done (e.g. resuming a saved flow).
      expect(steps(container)).toEqual(["complete", "complete", "active"]);
    });
  });

  describe("indicator", () => {
    it("renders a custom indicator in the horizontal rail", () => {
      const { container } = render(
        <Stepper.Root orientation="horizontal">
          <Stepper.Step>
            <Stepper.Header indicator={<span data-testid="custom" />}>
              Only
            </Stepper.Header>
            <Stepper.Panel />
          </Stepper.Step>
        </Stepper.Root>,
      );
      const rail = container.querySelector('[data-kumo-part="rail"]')!;
      expect(rail.querySelector('[data-testid="custom"]')).not.toBeNull();
      expect(rail.querySelector('[data-kumo-part="indicator"]')).toBeNull();
    });
  });

  describe("completion", () => {
    function Done() {
      const { reset } = useStepper();
      return (
        <Stepper.Complete>
          <p>All done</p>
          <Stepper.Footer>
            <Stepper.Back />
            <button type="button" onClick={reset}>
              Start over
            </button>
          </Stepper.Footer>
        </Stepper.Complete>
      );
    }

    function finish(container: HTMLElement) {
      for (let i = 0; i < 3; i++) {
        fireEvent.click(
          openPanel(container)!.querySelector("button:last-of-type")!,
        );
      }
    }

    it("shows Stepper.Complete once the last step is finished", async () => {
      const onComplete = vi.fn();
      const { container } = render(
        <Wizard onComplete={onComplete}>
          <Done />
        </Wizard>,
      );
      expect(screen.queryByText("All done")).toBeNull();

      finish(container);
      await screen.findByText("All done");
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(steps(container)).toEqual(["complete", "complete", "complete"]);
      expect(openPanel(container)).toBeNull();
    });

    it("returns to the last step on Back", async () => {
      const { container } = render(
        <Wizard>
          <Done />
        </Wizard>,
      );
      finish(container);
      await screen.findByText("All done");

      const complete = container.querySelector('[data-kumo-part="complete"]')!;
      fireEvent.click(within(complete as HTMLElement).getByText("Back"));
      expect(screen.queryByText("All done")).toBeNull();
      expect(steps(container)).toEqual(["complete", "complete", "active"]);
    });

    it("starts over from the first step on reset", async () => {
      const { container } = render(
        <Wizard>
          <Done />
        </Wizard>,
      );
      finish(container);
      await screen.findByText("All done");

      fireEvent.click(screen.getByText("Start over"));
      expect(screen.queryByText("All done")).toBeNull();
      expect(steps(container)).toEqual(["active", "upcoming", "upcoming"]);
    });
  });

  describe('fill="progress"', () => {
    it("fills through the furthest step reached, even after going back", () => {
      const { container } = render(
        <Stepper.Root fill="progress">
          {["One", "Two", "Three"].map((label) => (
            <Stepper.Step key={label}>
              <Stepper.Header>{label}</Stepper.Header>
              <Stepper.Panel>
                <Stepper.Footer>
                  <Stepper.Next>Continue</Stepper.Next>
                </Stepper.Footer>
              </Stepper.Panel>
            </Stepper.Step>
          ))}
        </Stepper.Root>,
      );
      const filled = () =>
        Array.from(
          container.querySelectorAll<HTMLElement>('[data-kumo-part="step"]'),
        ).map((step) => step.dataset.filled === "true");

      expect(filled()).toEqual([true, false, false]);
      fireEvent.click(openPanel(container)!.querySelector("button")!);
      expect(filled()).toEqual([true, true, false]);

      fireEvent.click(screen.getByRole("button", { name: /One/ }));
      expect(filled()).toEqual([true, true, false]);
    });
  });
});
