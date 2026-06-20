import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  act,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Wizard, useWizard, useWizardGrid } from ".";
import { WizardFullscreenContext } from "./wizard-fullscreen";
import { KumoPortalProvider } from "../../utils/portal-provider";

// WizardFullscreenMock — provides WizardFullscreenContext without
// portal/scroll-lock. Use for tests that need the Wizard context to
// exist but don't test the real overlay behavior.
const mockCloseRef = {
  current: null,
} as React.RefObject<HTMLButtonElement | null>;
function WizardFullscreenMock({ children }: { children: React.ReactNode }) {
  return (
    <WizardFullscreenContext.Provider
      value={{
        closeButtonRef: mockCloseRef,
        headerContentRef: null,
        closeLabel: "Close",
      }}
    >
      {children}
    </WizardFullscreenContext.Provider>
  );
}

function TestWizard({
  step = 0,
  onStepChange = vi.fn(),
  showSidebar = false,
  ...props
}: Partial<React.ComponentProps<typeof Wizard>> & {
  step?: number | string;
  onStepChange?: (step: number, key: string) => void;
  showSidebar?: boolean;
}) {
  return (
    <WizardFullscreenMock>
      <Wizard step={step} onStepChange={onStepChange} {...props}>
        {showSidebar && <Wizard.Sidebar />}
        <Wizard.Steps>
          <Wizard.Step stepKey="first" label="First Step">
            <Wizard.Page title="Step 1">First content</Wizard.Page>
          </Wizard.Step>
          <Wizard.Step stepKey="second" label="Second Step">
            <Wizard.Page title="Step 2">Second content</Wizard.Page>
          </Wizard.Step>
          <Wizard.Step stepKey="third" label="Third Step">
            <Wizard.Page title="Step 3">Third content</Wizard.Page>
          </Wizard.Step>
        </Wizard.Steps>
      </Wizard>
    </WizardFullscreenMock>
  );
}

describe("Wizard core behavior", () => {
  it("should render current step content", () => {
    render(<TestWizard step={0} />);
    expect(screen.getByText("First content")).toBeTruthy();
  });

  it("should render all step contents in the DOM", () => {
    render(<TestWizard step={0} />);
    expect(screen.getByText("First content")).toBeTruthy();
    expect(screen.getByText("Second content")).toBeTruthy();
    expect(screen.getByText("Third content")).toBeTruthy();
  });

  it("should mark non-active/non-previous steps as aria-hidden", () => {
    render(<TestWizard step={1} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps[0].getAttribute("aria-hidden")).toBe("false");
    expect(steps[1].getAttribute("aria-hidden")).toBe("false");
    expect(steps[2].getAttribute("aria-hidden")).toBe("true");
  });

  it("should fire onStepChange when clicking a previous step", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={1} onStepChange={onStepChange} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.click(steps[0]);
    expect(onStepChange).toHaveBeenCalledWith(0, "first");
  });

  it("should not fire onStepChange when clicking a future step", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={0} onStepChange={onStepChange} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.click(steps[1]);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("should not fire onStepChange when clicking the current step", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={0} onStepChange={onStepChange} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.click(steps[0]);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("should prevent implicit previous-card navigation when previousStepNavigation is disabled", () => {
    const onStepChange = vi.fn();
    render(
      <TestWizard
        step={1}
        onStepChange={onStepChange}
        previousStepNavigation="disabled"
      />,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.click(steps[0]);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("should allow keyboard navigation on previous step via Enter", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={1} onStepChange={onStepChange} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.keyDown(steps[0], { key: "Enter" });
    expect(onStepChange).toHaveBeenCalledWith(0, "first");
  });

  it("should allow keyboard navigation on previous step via Space", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={1} onStepChange={onStepChange} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.keyDown(steps[0], { key: " " });
    expect(onStepChange).toHaveBeenCalledWith(0, "first");
  });

  it("should block keyboard previous-card navigation when previousStepNavigation is disabled", () => {
    const onStepChange = vi.fn();
    render(
      <TestWizard
        step={1}
        onStepChange={onStepChange}
        previousStepNavigation="disabled"
      />,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    fireEvent.keyDown(steps[0], { key: "Enter" });
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('should give previous step role="button" and aria-label', () => {
    render(<TestWizard step={1} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps[0].getAttribute("role")).toBe("button");
    expect(steps[0].getAttribute("aria-label")).toBe("Go back to First Step");
  });

  it("should set data-step-active on the current step", () => {
    render(<TestWizard step={1} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps[0].hasAttribute("data-step-active")).toBe(false);
    expect(steps[1].hasAttribute("data-step-active")).toBe(true);
    expect(steps[2].hasAttribute("data-step-active")).toBe(false);
  });
});

describe("Previous step interactivity", () => {
  it("should set inert and pointer-events-none on non-active step inner content", () => {
    render(
      <WizardFullscreenMock>
        <Wizard step={1} onStepChange={vi.fn()}>
          <Wizard.Steps>
            <Wizard.Step stepKey="first" label="First">
              <Wizard.Page title="Step 1">First</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="second" label="Second">
              <Wizard.Page title="Step 2">Second</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="third" label="Third">
              <Wizard.Page title="Step 3">Third</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');

    // Previous step (index 0): inner wrapper has inert + pointer-events-none
    const prevInner = steps[0].querySelector("[inert]") as HTMLElement;
    expect(prevInner).toBeTruthy();
    expect(prevInner.className).toContain("pointer-events-none");

    // Active step (index 1): no inert, no pointer-events-none on inner wrapper
    const activeInner = steps[1].querySelector("[inert]");
    expect(activeInner).toBeNull();

    // Future step (index 2): inner wrapper has inert + pointer-events-none
    const futureInner = steps[2].querySelector("[inert]") as HTMLElement;
    expect(futureInner).toBeTruthy();
    expect(futureInner.className).toContain("pointer-events-none");
  });

  it("should keep active step inner controls interactive", () => {
    const innerClick = vi.fn();

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Steps>
            <Wizard.Step stepKey="first" label="First">
              <Wizard.Page title="Step 1">
                <button data-testid="active-btn" onClick={innerClick}>
                  Click me
                </button>
              </Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="second" label="Second">
              <Wizard.Page title="Step 2">Other</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    fireEvent.click(screen.getByTestId("active-btn"));
    expect(innerClick).toHaveBeenCalledOnce();
  });

  it("should not set inert or pointer-events-none on active step content", () => {
    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Steps>
            <Wizard.Step stepKey="first" label="First">
              <Wizard.Page title="Step 1">
                <button>Active button</button>
              </Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    const step = document.querySelector(
      '[data-kumo-part="step"]',
    ) as HTMLElement;
    expect(step.querySelector("[inert]")).toBeNull();
    // The inner wrapper div should not have pointer-events-none
    const innerWrapper = step.firstElementChild
      ?.firstElementChild as HTMLElement;
    expect(innerWrapper?.className).not.toContain("pointer-events-none");
  });
});

describe("Wizard.Sidebar", () => {
  it("should not render the sidebar unless composed", () => {
    render(<TestWizard step={0} />);
    const sidebar = document.querySelector('[data-kumo-part="sidebar"]');
    expect(sidebar).toBeNull();
  });

  it("should render the sidebar when composed", () => {
    render(<TestWizard step={0} showSidebar />);
    const sidebar = document.querySelector('[data-kumo-part="sidebar"]');
    expect(sidebar).toBeTruthy();
  });

  it("should render step labels", () => {
    render(<TestWizard step={0} showSidebar />);
    expect(screen.getByText("First Step")).toBeTruthy();
    expect(screen.getByText("Second Step")).toBeTruthy();
    expect(screen.getByText("Third Step")).toBeTruthy();
  });

  it("should make completed steps clickable", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={2} onStepChange={onStepChange} showSidebar />);

    const firstStepSidebar = screen.getByText("First Step").closest("button");
    expect(firstStepSidebar).toBeTruthy();

    fireEvent.click(firstStepSidebar!);
    expect(onStepChange).toHaveBeenCalledWith(0, "first");
  });

  it("should not make future steps clickable", () => {
    const onStepChange = vi.fn();
    render(<TestWizard step={0} onStepChange={onStepChange} showSidebar />);

    const thirdStepSidebar = screen.getByText("Third Step").parentElement!;
    expect(thirdStepSidebar.getAttribute("role")).toBeNull();
    fireEvent.click(thirdStepSidebar);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('should respect previousStepNavigation="disabled" — completed steps not clickable', () => {
    const onStepChange = vi.fn();
    render(
      <TestWizard
        step={2}
        onStepChange={onStepChange}
        previousStepNavigation="disabled"
        showSidebar
      />,
    );

    const firstStepSidebar = screen.getByText("First Step").parentElement!;
    expect(firstStepSidebar.getAttribute("role")).toBeNull();
    fireEvent.click(firstStepSidebar);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("should respect hideFromSidebar", () => {
    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="Visible">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="Hidden" hideFromSidebar>
              <Wizard.Page title="T2">C2</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    const sidebar = document.querySelector('[data-kumo-part="sidebar"]')!;
    expect(within(sidebar as HTMLElement).getByText("Visible")).toBeTruthy();
    expect(within(sidebar as HTMLElement).queryByText("Hidden")).toBeNull();
  });

  it("should render completed steps as <button> for native keyboard support", () => {
    render(<TestWizard step={2} showSidebar />);

    const firstStepSidebar = screen.getByText("First Step").closest("button");
    expect(firstStepSidebar).toBeTruthy();
    expect(firstStepSidebar!.tagName).toBe("BUTTON");
    expect(firstStepSidebar!.getAttribute("type")).toBe("button");
  });
});

describe("Wizard.Fullscreen", () => {
  it("should render portal to document.body", () => {
    render(
      <Wizard.Fullscreen open>
        <div data-testid="fullscreen-content">Content</div>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(screen.getByTestId("fullscreen-content")).toBeTruthy();
  });

  it("should not render when open=false", () => {
    render(
      <Wizard.Fullscreen open={false}>
        <div data-testid="fullscreen-content">Content</div>
      </Wizard.Fullscreen>,
    );

    expect(screen.queryByTestId("fullscreen-content")).toBeNull();
  });

  it("should have correct ARIA attributes", () => {
    render(<Wizard.Fullscreen open>Content</Wizard.Fullscreen>);

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog!.getAttribute("aria-modal")).toBe("true");
    expect(dialog!.getAttribute("aria-label")).toBe("Fullscreen container");
  });

  it("should call onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <Wizard.Fullscreen open onClose={onClose}>
        Content
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]')!;
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should call onClose on close button click", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Wizard.Fullscreen open onClose={onClose}>
        Content
      </Wizard.Fullscreen>,
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should add scroll lock class when open", () => {
    render(<Wizard.Fullscreen open>Content</Wizard.Fullscreen>);

    expect(document.body.classList.contains("overflow-hidden")).toBe(true);
  });

  it("should remove scroll lock class on unmount", () => {
    const { unmount } = render(
      <Wizard.Fullscreen open>Content</Wizard.Fullscreen>,
    );

    expect(document.body.classList.contains("overflow-hidden")).toBe(true);
    unmount();
    expect(document.body.classList.contains("overflow-hidden")).toBe(false);
  });
});

describe("Wizard.Grid", () => {
  it("should render title", () => {
    render(
      <Wizard.Grid title="Setup" activeCardHeight={400} isTransitioning={false}>
        <div>Content</div>
      </Wizard.Grid>,
    );

    expect(screen.getByText("Setup")).toBeTruthy();
  });
});

describe("Wizard.Fullscreen width prop", () => {
  it("should set --wizard-card-max-width to 38rem by default", () => {
    render(
      <Wizard.Fullscreen open>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.style.getPropertyValue("--wizard-card-max-width")).toBe(
      "38rem",
    );
  });

  it("should set --wizard-card-max-width to 48rem for wide (without Grid)", () => {
    render(
      <Wizard.Fullscreen open width="wide">
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.style.getPropertyValue("--wizard-card-max-width")).toBe(
      "48rem",
    );

    // Wizard root does not set its own inline width variable
    const wizardRoot = document.querySelector(
      '[data-kumo-component="Wizard"]',
    ) as HTMLElement;
    expect(wizardRoot.style.getPropertyValue("--wizard-card-max-width")).toBe(
      "",
    );
  });

  it("should set --wizard-card-max-width to 48rem for wide (with Grid)", () => {
    render(
      <Wizard.Fullscreen open width="wide">
        <Wizard.Grid activeCardHeight={400} isTransitioning={false}>
          <Wizard step={0} onStepChange={vi.fn()}>
            <Wizard.Steps>
              <Wizard.Step stepKey="a">
                <Wizard.Page title="T">C</Wizard.Page>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </Wizard.Grid>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.style.getPropertyValue("--wizard-card-max-width")).toBe(
      "48rem",
    );

    // Grid root does not override the variable
    const gridRoot = dialog.querySelector(".bg-kumo-canvas") as HTMLElement;
    expect(gridRoot).toBeTruthy();
    expect(gridRoot.style.getPropertyValue("--wizard-card-max-width")).toBe("");
  });
});

describe("sidebar without Wizard.Grid", () => {
  it("should render the sidebar and have a @container/wizard ancestor", () => {
    render(
      <Wizard.Fullscreen open>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="Step A">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    const sidebar = document.querySelector('[data-kumo-part="sidebar"]');
    expect(sidebar).toBeTruthy();

    // The Fullscreen inner wrapper provides @container/wizard
    const container = document.querySelector(
      ".\\@container\\/wizard",
    ) as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.contains(sidebar)).toBe(true);
  });
});

describe("Wizard.Fullscreen header prop", () => {
  it("should render floating close button when no header", () => {
    render(
      <Wizard.Fullscreen open>
        <div>Content</div>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.querySelector("header")).toBeNull();

    // Floating close button wrapper
    const closeWrapper = dialog.querySelector(".absolute.end-4.top-4.z-10");
    expect(closeWrapper).toBeTruthy();
    expect(closeWrapper!.querySelector('[aria-label="Close"]')).toBeTruthy();

    // --wizard-header-height defaults to 0px
    expect(dialog.style.getPropertyValue("--wizard-header-height")).toBe("0px");
  });

  it("should not inject close button when header is provided", () => {
    render(
      <Wizard.Fullscreen open header={<div data-testid="hdr">My Header</div>}>
        <div>Content</div>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    const headerEl = dialog.querySelector("header");
    expect(headerEl).toBeTruthy();
    expect(screen.getByTestId("hdr")).toBeTruthy();

    // No auto-injected close — header author controls placement
    expect(dialog.querySelector(".absolute.end-4.top-4.z-10")).toBeNull();
  });

  it("should render Wizard.CloseButton inside header when consumer includes it", () => {
    const onClose = vi.fn();
    render(
      <Wizard.Fullscreen
        open
        onClose={onClose}
        header={
          <div data-testid="custom-hdr">
            <span>Title</span>
            <Wizard.CloseButton />
          </div>
        }
      >
        <div>Content</div>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    const headerEl = dialog.querySelector("header");
    expect(headerEl).toBeTruthy();

    const closeBtn = headerEl!.querySelector(
      '[aria-label="Close"]',
    ) as HTMLElement;
    expect(closeBtn).toBeTruthy();

    // Clicking close calls onClose
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("should throw a clear error when Wizard.CloseButton is outside Wizard.Fullscreen", () => {
    expect(() => render(<Wizard.CloseButton />)).toThrow(
      "Wizard.CloseButton must be rendered inside <Wizard.Fullscreen>.",
    );
  });
});

describe("useWizard", () => {
  it("should throw when used outside Wizard context", () => {
    function Bad() {
      useWizard();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      "useWizard must be used within a <Wizard> component",
    );
  });

  it("should call onClose when close() is invoked from useWizard", () => {
    const onClose = vi.fn();

    function CloseButton() {
      const { close } = useWizard();
      return (
        <button type="button" onClick={close}>
          Done
        </button>
      );
    }

    render(
      <Wizard.Fullscreen open onClose={onClose}>
        <Wizard>
          <Wizard.Steps>
            <Wizard.Step stepKey="only" label="Only">
              <Wizard.Page title="Page">
                <CloseButton />
              </Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    fireEvent.click(screen.getByText("Done"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should allow explicit back() when previousStepNavigation is disabled", () => {
    const onStepChange = vi.fn();

    function BackButton() {
      const { back } = useWizard();
      return (
        <button type="button" onClick={back}>
          Back
        </button>
      );
    }

    render(
      <WizardFullscreenMock>
        <Wizard
          step={1}
          onStepChange={onStepChange}
          previousStepNavigation="disabled"
        >
          <BackButton />
          <Wizard.Steps>
            <Wizard.Step stepKey="first" label="First">
              <Wizard.Page title="First">First</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="second" label="Second">
              <Wizard.Page title="Second">Second</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    fireEvent.click(screen.getByText("Back"));
    expect(onStepChange).toHaveBeenCalledWith(0, "first");
  });
});

describe("useWizardGrid", () => {
  it("should return gridProps with expected shape and respect initialHeight", () => {
    let hookResult: ReturnType<typeof useWizardGrid> | null = null;

    function Consumer() {
      hookResult = useWizardGrid({ initialHeight: 500 });
      return null;
    }

    render(<Consumer />);

    expect(hookResult).not.toBeNull();
    expect(hookResult!.gridProps).toHaveProperty("activeCardHeight");
    expect(hookResult!.gridProps).toHaveProperty("isTransitioning");
    expect(typeof hookResult!.onActiveStepElementChange).toBe("function");
    expect(hookResult!.gridProps.activeCardHeight).toBe(500);
  });
});

describe("Wizard step registration", () => {
  it("should track items count via totalSteps", () => {
    function StepCounter() {
      const { totalSteps } = useWizard();
      return <div data-testid="count">{totalSteps}</div>;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <StepCounter />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <Wizard.Page title="T2">C2</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("should unregister steps when unmounted", () => {
    function StepCounter() {
      const { totalSteps } = useWizard();
      return <div data-testid="count">{totalSteps}</div>;
    }

    function DynamicWizard({ showThird = true }: { showThird?: boolean }) {
      return (
        <WizardFullscreenMock>
          <Wizard step={0} onStepChange={vi.fn()}>
            <StepCounter />
            <Wizard.Steps>
              <Wizard.Step stepKey="a" label="A">
                <Wizard.Page title="T">C</Wizard.Page>
              </Wizard.Step>
              <Wizard.Step stepKey="b" label="B">
                <Wizard.Page title="T2">C2</Wizard.Page>
              </Wizard.Step>
              {showThird && (
                <Wizard.Step stepKey="c" label="C">
                  <Wizard.Page title="T3">C3</Wizard.Page>
                </Wizard.Step>
              )}
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>
      );
    }

    const { rerender } = render(<DynamicWizard showThird />);
    expect(screen.getByTestId("count").textContent).toBe("3");

    rerender(<DynamicWizard showThird={false} />);
    expect(screen.getByTestId("count").textContent).toBe("2");
  });
});

describe("Wizard step tabIndex", () => {
  it("should make active and previous steps focusable, future steps not", () => {
    render(<TestWizard step={1} />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    // Previous step (index 0) — focusable
    expect(steps[0].getAttribute("tabindex")).toBe("0");
    // Active step (index 1) — focusable
    expect(steps[1].getAttribute("tabindex")).toBe("0");
    // Future step (index 2) — not focusable
    expect(steps[2].getAttribute("tabindex")).toBe("-1");
  });
});

describe("Focus trap includes close button", () => {
  it("should include close button in focus trap cycle", () => {
    render(
      <Wizard.Fullscreen open onClose={vi.fn()}>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page
                title="Title"
                footer={<button data-testid="next-btn">Next</button>}
              >
                Content
              </Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();

    const closeButton = screen.getByRole("button", { name: "Close" });
    const nextButton = screen.getByTestId("next-btn");

    nextButton.focus();
    expect(document.activeElement).toBe(nextButton);

    fireEvent.keyDown(dialog, { key: "Tab" });

    expect(
      document.activeElement === closeButton ||
        dialog.contains(document.activeElement),
    ).toBe(true);
  });

  it("should wrap from close button back to first element on Tab", () => {
    render(
      <Wizard.Fullscreen open onClose={vi.fn()}>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page
                title="Title"
                footer={<button data-testid="action-btn">Action</button>}
              >
                Content
              </Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    const closeButton = screen.getByRole("button", { name: "Close" });

    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).not.toBe(closeButton);
  });

  it("should trap focus on later steps when previous-step navigation is disabled", () => {
    render(
      <Wizard.Fullscreen open onClose={vi.fn()}>
        <Wizard
          step={1}
          onStepChange={vi.fn()}
          previousStepNavigation="disabled"
        >
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page title="First">First content</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <Wizard.Page title="Second">Second content</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    const closeButton = screen.getByRole("button", { name: "Close" });
    const activeStep = document.querySelector(
      '[data-kumo-part="step"][data-step-active]',
    ) as HTMLElement;

    closeButton.focus();
    expect(document.activeElement).toBe(closeButton);

    const firstTabPrevented = fireEvent.keyDown(dialog, { key: "Tab" });

    expect(firstTabPrevented).toBe(false);
    expect(document.activeElement).toBe(activeStep);
    expect(dialog.contains(document.activeElement)).toBe(true);

    const secondTabPrevented = fireEvent.keyDown(dialog, { key: "Tab" });

    expect(secondTabPrevented).toBe(false);
    expect(document.activeElement).toBe(closeButton);
    expect(dialog.contains(document.activeElement)).toBe(true);

    const thirdTabPrevented = fireEvent.keyDown(dialog, { key: "Tab" });

    expect(thirdTabPrevented).toBe(false);
    expect(document.activeElement).toBe(activeStep);
    expect(dialog.contains(document.activeElement)).toBe(true);

    const shiftTabPrevented = fireEvent.keyDown(dialog, {
      key: "Tab",
      shiftKey: true,
    });

    expect(shiftTabPrevented).toBe(false);
    expect(document.activeElement).toBe(closeButton);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});

describe("Scroll position reset on step change", () => {
  it("should reset scrollTop on the wizard container when step changes", () => {
    function StepChanger() {
      const [step, setStep] = React.useState(0);
      return (
        <div>
          <button data-testid="go-next" onClick={() => setStep(1)}>
            Next
          </button>
          <WizardFullscreenMock>
            <Wizard step={step} onStepChange={setStep}>
              <Wizard.Steps>
                <Wizard.Step stepKey="a" label="A">
                  <Wizard.Page title="Step 1">
                    <div style={{ height: "2000px" }}>Tall content</div>
                  </Wizard.Page>
                </Wizard.Step>
                <Wizard.Step stepKey="b" label="B">
                  <Wizard.Page title="Step 2">Short content</Wizard.Page>
                </Wizard.Step>
              </Wizard.Steps>
            </Wizard>
          </WizardFullscreenMock>
        </div>
      );
    }

    render(<StepChanger />);

    const wizardContainer = document.querySelector(
      '[data-kumo-component="Wizard"]',
    ) as HTMLElement;
    expect(wizardContainer).toBeTruthy();

    wizardContainer.scrollTop = 500;

    fireEvent.click(screen.getByTestId("go-next"));

    expect(wizardContainer.scrollTop).toBe(0);
  });
});

describe("Wizard.Fullscreen aria-label", () => {
  it("should use custom aria-label when provided", () => {
    render(
      <Wizard.Fullscreen open aria-label="Setup wizard">
        Content
      </Wizard.Fullscreen>,
    );

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog!.getAttribute("aria-label")).toBe("Setup wizard");
    // No visible header or h1 — the label is purely aria
    expect(document.querySelector("header")).toBeNull();
    expect(document.querySelector("h1")).toBeNull();
  });
});

// Minimal wizard without Wizard.Page/ScrollMask to avoid @base-ui
// ScrollArea timer issues in happy-dom (getAnimations not available)
function GuardWizard({
  step,
  onStepChange,
  onBeforeStepChange,
}: {
  step: number;
  onStepChange: (s: number, key: string) => void;
  onBeforeStepChange: (from: number, to: number) => boolean | Promise<boolean>;
}) {
  return (
    <WizardFullscreenMock>
      <Wizard
        step={step}
        onStepChange={onStepChange}
        onBeforeStepChange={onBeforeStepChange}
      >
        <Wizard.Steps>
          <Wizard.Step stepKey="a" label="A">
            <div>Step A</div>
          </Wizard.Step>
          <Wizard.Step stepKey="b" label="B">
            <div>Step B</div>
          </Wizard.Step>
        </Wizard.Steps>
      </Wizard>
    </WizardFullscreenMock>
  );
}

describe("onBeforeStepChange", () => {
  it("should block transition when guard returns false", async () => {
    const onStepChange = vi.fn();
    const guard = vi.fn(() => false);

    render(
      <GuardWizard
        step={1}
        onStepChange={onStepChange}
        onBeforeStepChange={guard}
      />,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    await act(async () => {
      fireEvent.click(steps[0]);
    });

    expect(guard).toHaveBeenCalledWith(1, 0);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("should allow transition when guard returns true", async () => {
    const onStepChange = vi.fn();
    const guard = vi.fn(() => true);

    render(
      <GuardWizard
        step={1}
        onStepChange={onStepChange}
        onBeforeStepChange={guard}
      />,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    await act(async () => {
      fireEvent.click(steps[0]);
    });

    expect(guard).toHaveBeenCalledWith(1, 0);
    expect(onStepChange).toHaveBeenCalledWith(0, "a");
  });

  it("should block transition when async guard resolves to false", async () => {
    const onStepChange = vi.fn();
    const guard = vi.fn(() => Promise.resolve(false));

    render(
      <GuardWizard
        step={1}
        onStepChange={onStepChange}
        onBeforeStepChange={guard}
      />,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    await act(async () => {
      fireEvent.click(steps[0]);
    });

    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("should allow transition when async guard resolves to true", async () => {
    const onStepChange = vi.fn();
    const guard = vi.fn(() => Promise.resolve(true));

    render(
      <GuardWizard
        step={1}
        onStepChange={onStepChange}
        onBeforeStepChange={guard}
      />,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    await act(async () => {
      fireEvent.click(steps[0]);
    });

    expect(onStepChange).toHaveBeenCalledWith(0, "a");
  });

  it("should expose isChangingStep while async guard is pending", async () => {
    const onStepChange = vi.fn();
    let resolveGuard: (v: boolean) => void;
    const guard = vi.fn(() => new Promise<boolean>((r) => (resolveGuard = r)));
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return (
        <div
          data-testid="changing"
          data-value={String(wizardCtx.isChangingStep)}
        />
      );
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={1} onStepChange={onStepChange} onBeforeStepChange={guard}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>A</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <div>B</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    // Before navigation: isChangingStep is false
    expect(screen.getByTestId("changing").dataset.value).toBe("false");

    // Start navigation — guard is now pending
    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    act(() => {
      fireEvent.click(steps[0]);
    });

    // isChangingStep should be true while the guard promise is unresolved
    expect(screen.getByTestId("changing").dataset.value).toBe("true");

    // Resolve the guard
    await act(async () => {
      resolveGuard!(true);
    });

    // isChangingStep returns to false after resolution
    expect(screen.getByTestId("changing").dataset.value).toBe("false");
    expect(onStepChange).toHaveBeenCalledWith(0, "a");
  });

  it("should ignore re-entrant navigation while guard is pending", async () => {
    const onStepChange = vi.fn();
    let resolveGuard: (v: boolean) => void;
    const guard = vi.fn(() => new Promise<boolean>((r) => (resolveGuard = r)));
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={1} onStepChange={onStepChange} onBeforeStepChange={guard}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>A</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <div>B</div>
            </Wizard.Step>
            <Wizard.Step stepKey="c" label="C">
              <div>C</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    // Start first navigation (step 1 → 0) — guard blocks
    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    act(() => {
      fireEvent.click(steps[0]);
    });

    expect(guard).toHaveBeenCalledTimes(1);

    // While guard is pending, attempt a second navigation via goToStep
    act(() => {
      wizardCtx!.goToStep("c");
    });

    // Guard should NOT have been invoked a second time
    expect(guard).toHaveBeenCalledTimes(1);

    // Resolve the original guard — only the first navigation lands
    await act(async () => {
      resolveGuard!(true);
    });

    expect(onStepChange).toHaveBeenCalledTimes(1);
    expect(onStepChange).toHaveBeenCalledWith(0, "a");
  });
});

describe("Controlled vs uncontrolled step", () => {
  it("should advance internally in uncontrolled mode", () => {
    function UncontrolledNav() {
      const { step, onStepChange, totalSteps } = useWizard();
      return (
        <button
          data-testid="next"
          onClick={() => {
            if (step < totalSteps - 1) onStepChange(step + 1);
          }}
        >
          {step}
        </button>
      );
    }

    render(
      <WizardFullscreenMock>
        <Wizard defaultStep={0}>
          <UncontrolledNav />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <Wizard.Page title="T2">C2</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    expect(screen.getByTestId("next").textContent).toBe("0");
    fireEvent.click(screen.getByTestId("next"));
    expect(screen.getByTestId("next").textContent).toBe("1");
  });

  it("should not self-advance in controlled mode", () => {
    const onStepChange = vi.fn();

    render(<TestWizard step={0} onStepChange={onStepChange} />);

    // Step 0 is active, clicking it should not change anything
    // The step prop stays at 0 regardless
    expect(
      document
        .querySelector('[data-kumo-component="Wizard"]')
        ?.querySelector("[data-step-active]"),
    ).toBeTruthy();
  });

  it("should fire onStepChange with correct index in uncontrolled mode", () => {
    const onStepChange = vi.fn();

    function Nav() {
      const { step, onStepChange: go, totalSteps } = useWizard();
      return (
        <button
          data-testid="go"
          onClick={() => {
            if (step < totalSteps - 1) go(step + 1);
          }}
        >
          Go
        </button>
      );
    }

    render(
      <WizardFullscreenMock>
        <Wizard defaultStep={0} onStepChange={onStepChange}>
          <Nav />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <Wizard.Page title="T2">C2</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    fireEvent.click(screen.getByTestId("go"));
    expect(onStepChange).toHaveBeenCalledWith(1, "b");
  });
});

describe("onComplete", () => {
  it("should fire onComplete when complete() is called on last step", () => {
    const onComplete = vi.fn();

    function CompleteButton() {
      const { complete, isLastStep } = useWizard();
      return (
        <button
          data-testid="done"
          onClick={() => {
            if (isLastStep) complete();
          }}
        >
          Done
        </button>
      );
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={1} onStepChange={vi.fn()} onComplete={onComplete}>
          <CompleteButton />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <Wizard.Page title="T2">C2</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    fireEvent.click(screen.getByTestId("done"));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("should expose isLastStep and isFirstStep", () => {
    function StepInfo() {
      const { isFirstStep, isLastStep } = useWizard();
      return (
        <div
          data-testid="info"
          data-first={String(isFirstStep)}
          data-last={String(isLastStep)}
        />
      );
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <StepInfo />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <Wizard.Page title="T">C</Wizard.Page>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <Wizard.Page title="T2">C2</Wizard.Page>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    const info = screen.getByTestId("info");
    expect(info.dataset.first).toBe("true");
    expect(info.dataset.last).toBe("false");
  });
});

describe("RTL support", () => {
  // jsdom doesn't compute layout or resolve CSS classes, so we verify
  // that the sidebar's class list includes the RTL-aware utilities.
  // Visual RTL verification requires a real browser.
  it("should use RTL-aware position classes on sidebar", () => {
    render(
      <div dir="rtl">
        <WizardFullscreenMock>
          <Wizard step={0} onStepChange={vi.fn()}>
            <Wizard.Sidebar />
            <Wizard.Steps>
              <Wizard.Step stepKey="a" label="A">
                <Wizard.Page title="T">C</Wizard.Page>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>
      </div>,
    );

    const sidebar = document.querySelector(
      '[data-kumo-part="sidebar"]',
    ) as HTMLElement;
    expect(sidebar).toBeTruthy();
    // Logical property: start-full instead of left-full
    expect(sidebar.className).toContain("start-full");
    // RTL translate flip
    expect(sidebar.className).toContain("rtl:-translate-x-5");
  });

  it("should use logical end-4 for close button positioning", () => {
    render(
      <div dir="rtl">
        <Wizard.Fullscreen open>Content</Wizard.Fullscreen>
      </div>,
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    // Positioning classes are on the wrapper div, not the Button itself
    const wrapper = closeButton.parentElement!;
    expect(wrapper.className).toContain("end-4");
    expect(wrapper.className).not.toContain("right-4");
  });
});

describe("Conditional step rendering", () => {
  it("should assign contiguous indices when steps are conditionally rendered", () => {
    // Reproduces the demo pattern: {false && <Step>} leaves falsy holes in children
    function ConditionalWizard({
      showMiddle,
      activeStep,
    }: {
      showMiddle: boolean;
      activeStep: number;
    }) {
      return (
        <WizardFullscreenMock>
          <Wizard step={activeStep} onStepChange={vi.fn()}>
            <Wizard.Steps>
              <Wizard.Step stepKey="first" label="First">
                <div>First content</div>
              </Wizard.Step>
              {showMiddle && (
                <Wizard.Step stepKey="middle" label="Middle">
                  <div>Middle content</div>
                </Wizard.Step>
              )}
              <Wizard.Step stepKey="last" label="Last">
                <div>Last content</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>
      );
    }

    // Without middle step: [first(0), last(1)], active=1 should show "last"
    const { rerender } = render(
      <ConditionalWizard showMiddle={false} activeStep={1} />,
    );

    let steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps).toHaveLength(2);
    // The last step (index 1) should be the active one
    expect(steps[1].hasAttribute("data-step-active")).toBe(true);
    expect(steps[1].getAttribute("data-step-key")).toBe("last");

    // With middle step: [first(0), middle(1), last(2)], active=1 should show "middle"
    rerender(<ConditionalWizard showMiddle={true} activeStep={1} />);

    steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps).toHaveLength(3);
    expect(steps[1].hasAttribute("data-step-active")).toBe(true);
    expect(steps[1].getAttribute("data-step-key")).toBe("middle");
  });

  it("should preserve item and sidebar order when a middle step is inserted", async () => {
    function ItemsInspector() {
      const { items } = useWizard();
      return (
        <div data-testid="items">{items.map((item) => item.key).join(",")}</div>
      );
    }

    function ConditionalWizard({ showMiddle }: { showMiddle: boolean }) {
      return (
        <WizardFullscreenMock>
          <Wizard step={0} onStepChange={vi.fn()}>
            <ItemsInspector />
            <Wizard.Sidebar />
            <Wizard.Steps>
              <Wizard.Step stepKey="a" label="Step A">
                <div>A</div>
              </Wizard.Step>
              {showMiddle && (
                <Wizard.Step stepKey="b" label="Step B">
                  <div>B</div>
                </Wizard.Step>
              )}
              <Wizard.Step stepKey="c" label="Step C">
                <div>C</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>
      );
    }

    const { rerender } = render(<ConditionalWizard showMiddle={false} />);

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe("a,c");
    });

    rerender(<ConditionalWizard showMiddle />);

    await waitFor(() => {
      expect(screen.getByTestId("items").textContent).toBe("a,b,c");
    });

    const sidebar = document.querySelector(
      '[data-kumo-part="sidebar"]',
    ) as HTMLElement;
    expect(
      Array.from(sidebar.querySelectorAll("span")).map(
        (item) => item.textContent,
      ),
    ).toEqual(["Step A", "Step B", "Step C"]);
  });

  it("next() should use render order after a middle step is inserted", async () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    function ConditionalWizard({ showMiddle }: { showMiddle: boolean }) {
      return (
        <WizardFullscreenMock>
          <Wizard step={0} onStepChange={onStepChange}>
            <Inspector />
            <Wizard.Steps>
              <Wizard.Step stepKey="a" label="A">
                <div>A</div>
              </Wizard.Step>
              {showMiddle && (
                <Wizard.Step stepKey="b" label="B">
                  <div>B</div>
                </Wizard.Step>
              )}
              <Wizard.Step stepKey="c" label="C">
                <div>C</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>
      );
    }

    const { rerender } = render(<ConditionalWizard showMiddle={false} />);

    await waitFor(() => {
      expect(wizardCtx?.items.map((item) => item.key)).toEqual(["a", "c"]);
    });

    rerender(<ConditionalWizard showMiddle />);

    await waitFor(() => {
      expect(wizardCtx?.items.map((item) => item.key)).toEqual(["a", "b", "c"]);
    });

    act(() => {
      wizardCtx!.next();
    });

    expect(onStepChange).toHaveBeenCalledWith(1, "b");
  });

  it("should update active step tracking when insertion changes the active element", async () => {
    const onActiveStepElementChange = vi.fn();

    function ConditionalWizard({ showMiddle }: { showMiddle: boolean }) {
      return (
        <WizardFullscreenMock>
          <Wizard
            step={1}
            onStepChange={vi.fn()}
            onActiveStepElementChange={onActiveStepElementChange}
          >
            <Wizard.Steps>
              <Wizard.Step stepKey="a" label="A">
                <div>A</div>
              </Wizard.Step>
              {showMiddle && (
                <Wizard.Step stepKey="b" label="B">
                  <div>B</div>
                </Wizard.Step>
              )}
              <Wizard.Step stepKey="c" label="C">
                <div>C</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>
      );
    }

    const { rerender } = render(<ConditionalWizard showMiddle={false} />);

    await waitFor(() => {
      const calls = onActiveStepElementChange.mock.calls;
      expect(calls[calls.length - 1]?.[0]?.dataset.stepKey).toBe("c");
    });

    rerender(<ConditionalWizard showMiddle />);

    await waitFor(() => {
      const calls = onActiveStepElementChange.mock.calls;
      expect(calls[calls.length - 1]?.[0]?.dataset.stepKey).toBe("b");
    });
  });
});

describe("Key-based navigation", () => {
  it("should resolve string step prop to the correct index", () => {
    render(<TestWizard step="second" />);

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps[1].hasAttribute("data-step-active")).toBe(true);
    expect(steps[1].getAttribute("data-step-key")).toBe("second");
  });

  it("goToStep should navigate to the target key", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="intro" label="Intro">
              <div>Intro</div>
            </Wizard.Step>
            <Wizard.Step stepKey="details" label="Details">
              <div>Details</div>
            </Wizard.Step>
            <Wizard.Step stepKey="review" label="Review">
              <div>Review</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.goToStep("review");
    });

    expect(onStepChange).toHaveBeenCalledWith(2, "review");
  });

  it("goToStep with unknown key should no-op", () => {
    const onStepChange = vi.fn();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>A</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.goToStep("nonexistent");
    });

    expect(onStepChange).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("next() should advance to the next step", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="one" label="One">
              <div>1</div>
            </Wizard.Step>
            <Wizard.Step stepKey="two" label="Two">
              <div>2</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.next();
    });

    expect(onStepChange).toHaveBeenCalledWith(1, "two");
  });

  it("next() should no-op on the last step", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={1} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="one" label="One">
              <div>1</div>
            </Wizard.Step>
            <Wizard.Step stepKey="two" label="Two">
              <div>2</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.next();
    });

    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("back() should go to the previous step", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={2} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="one" label="One">
              <div>1</div>
            </Wizard.Step>
            <Wizard.Step stepKey="two" label="Two">
              <div>2</div>
            </Wizard.Step>
            <Wizard.Step stepKey="three" label="Three">
              <div>3</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.back();
    });

    expect(onStepChange).toHaveBeenCalledWith(1, "two");
  });

  it("back() should no-op on the first step", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="one" label="One">
              <div>1</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.back();
    });

    expect(onStepChange).not.toHaveBeenCalled();
  });

  it("onBeforeStepChange should gate goToStep navigation", async () => {
    const onStepChange = vi.fn();
    const guard = vi.fn().mockResolvedValue(false);
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange} onBeforeStepChange={guard}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>A</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B">
              <div>B</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    await act(async () => {
      wizardCtx!.goToStep("b");
    });

    expect(guard).toHaveBeenCalledWith(0, 1);
    expect(onStepChange).not.toHaveBeenCalled();
  });
});

describe("Wizard.Step when prop", () => {
  it("should assign contiguous indices when a middle step has when={false}", () => {
    render(
      <WizardFullscreenMock>
        <Wizard step={1} onStepChange={vi.fn()}>
          <Wizard.Steps>
            <Wizard.Step stepKey="first" label="First">
              <div>First</div>
            </Wizard.Step>
            <Wizard.Step stepKey="middle" label="Middle" when={false}>
              <div>Middle</div>
            </Wizard.Step>
            <Wizard.Step stepKey="last" label="Last">
              <div>Last</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    const steps = document.querySelectorAll('[data-kumo-part="step"]');
    expect(steps).toHaveLength(2);
    expect(steps[0].getAttribute("data-step-key")).toBe("first");
    expect(steps[1].getAttribute("data-step-key")).toBe("last");
    expect(steps[1].hasAttribute("data-step-active")).toBe(true);
  });

  it("should not render the content of a when={false} step", () => {
    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>Visible</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B" when={false}>
              <div>Hidden</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    expect(screen.getByText("Visible")).toBeTruthy();
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("should show only active steps in the sidebar", () => {
    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={vi.fn()}>
          <Wizard.Sidebar />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="Step A">
              <div>A</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="Step B" when={false}>
              <div>B</div>
            </Wizard.Step>
            <Wizard.Step stepKey="c" label="Step C">
              <div>C</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    expect(screen.getByText("Step A")).toBeTruthy();
    expect(screen.queryByText("Step B")).toBeNull();
    expect(screen.getByText("Step C")).toBeTruthy();
  });

  it("next/back should skip when={false} steps", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>A</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B" when={false}>
              <div>B</div>
            </Wizard.Step>
            <Wizard.Step stepKey="c" label="C">
              <div>C</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.next();
    });

    // Should go directly to "c" (index 1 in the active set, skipping "b")
    expect(onStepChange).toHaveBeenCalledWith(1, "c");
  });

  it("goToStep should work with when={false} steps excluded", () => {
    const onStepChange = vi.fn();
    let wizardCtx: ReturnType<typeof useWizard> | null = null;

    function Inspector() {
      wizardCtx = useWizard();
      return null;
    }

    render(
      <WizardFullscreenMock>
        <Wizard step={0} onStepChange={onStepChange}>
          <Inspector />
          <Wizard.Steps>
            <Wizard.Step stepKey="a" label="A">
              <div>A</div>
            </Wizard.Step>
            <Wizard.Step stepKey="b" label="B" when={false}>
              <div>B</div>
            </Wizard.Step>
            <Wizard.Step stepKey="c" label="C">
              <div>C</div>
            </Wizard.Step>
          </Wizard.Steps>
        </Wizard>
      </WizardFullscreenMock>,
    );

    act(() => {
      wizardCtx!.goToStep("c");
    });

    expect(onStepChange).toHaveBeenCalledWith(1, "c");
  });
});

describe("i18n labels", () => {
  describe("Wizard.Fullscreen labels", () => {
    it("should use custom close label when provided", () => {
      render(
        <Wizard.Fullscreen open labels={{ close: "Fermer" }}>
          Content
        </Wizard.Fullscreen>,
      );

      expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
      expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
    });
  });

  describe("Wizard step go-back labels", () => {
    it("should use default English go-back label when labels prop is omitted", () => {
      render(<TestWizard step={1} />);

      const steps = document.querySelectorAll('[data-kumo-part="step"]');
      expect(steps[0].getAttribute("aria-label")).toBe("Go back to First Step");
    });

    it('should use default "previous step" fallback when step has no label', () => {
      render(
        <WizardFullscreenMock>
          <Wizard step={1} onStepChange={vi.fn()}>
            <Wizard.Steps>
              <Wizard.Step stepKey="a">
                <div>A</div>
              </Wizard.Step>
              <Wizard.Step stepKey="b">
                <div>B</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>,
      );

      const steps = document.querySelectorAll('[data-kumo-part="step"]');
      expect(steps[0].getAttribute("aria-label")).toBe(
        "Go back to previous step",
      );
    });

    it("should use custom goBackTo and previousStep labels when provided", () => {
      render(
        <WizardFullscreenMock>
          <Wizard
            step={1}
            onStepChange={vi.fn()}
            labels={{
              goBackTo: (label) => `Retour à ${label}`,
              previousStep: "étape précédente",
            }}
          >
            <Wizard.Steps>
              <Wizard.Step stepKey="a">
                <div>A</div>
              </Wizard.Step>
              <Wizard.Step stepKey="b">
                <div>B</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>,
      );

      const steps = document.querySelectorAll('[data-kumo-part="step"]');
      expect(steps[0].getAttribute("aria-label")).toBe(
        "Retour à étape précédente",
      );
    });

    it("should use custom goBackTo with the step label prop", () => {
      render(
        <WizardFullscreenMock>
          <Wizard
            step={1}
            onStepChange={vi.fn()}
            labels={{ goBackTo: (label) => `Retour à ${label}` }}
          >
            <Wizard.Steps>
              <Wizard.Step stepKey="a" label="Étape Un">
                <div>A</div>
              </Wizard.Step>
              <Wizard.Step stepKey="b" label="Étape Deux">
                <div>B</div>
              </Wizard.Step>
            </Wizard.Steps>
          </Wizard>
        </WizardFullscreenMock>,
      );

      const steps = document.querySelectorAll('[data-kumo-part="step"]');
      expect(steps[0].getAttribute("aria-label")).toBe("Retour à Étape Un");
    });
  });
});

describe("Portal container", () => {
  it("should portal into document.body by default", () => {
    render(
      <Wizard.Fullscreen open>
        <div data-testid="wizard-content">Content</div>
      </Wizard.Fullscreen>,
    );

    // The dialog should be portaled into document.body
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(document.body.contains(dialog)).toBe(true);
    expect(screen.getByTestId("wizard-content")).toBeTruthy();
  });

  it("should portal into a custom container when container prop is provided", () => {
    const customContainer = document.createElement("div");
    customContainer.setAttribute("data-testid", "custom-container");
    document.body.appendChild(customContainer);

    render(
      <Wizard.Fullscreen open container={customContainer}>
        <div data-testid="wizard-content">Content</div>
      </Wizard.Fullscreen>,
    );

    // The dialog should be inside the custom container, not directly in body
    const dialog = customContainer.querySelector(
      '[role="dialog"]',
    ) as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(screen.getByTestId("wizard-content")).toBeTruthy();

    document.body.removeChild(customContainer);
  });

  it("should respect KumoPortalProvider context when no container prop is given", () => {
    const providerContainer = document.createElement("div");
    providerContainer.setAttribute("data-testid", "provider-container");
    document.body.appendChild(providerContainer);

    render(
      <KumoPortalProvider container={providerContainer}>
        <Wizard.Fullscreen open>
          <div data-testid="wizard-content">Content</div>
        </Wizard.Fullscreen>
      </KumoPortalProvider>,
    );

    // The dialog should be inside the provider container
    const dialog = providerContainer.querySelector(
      '[role="dialog"]',
    ) as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(screen.getByTestId("wizard-content")).toBeTruthy();

    document.body.removeChild(providerContainer);
  });

  it("should prefer container prop over KumoPortalProvider context", () => {
    const providerContainer = document.createElement("div");
    providerContainer.setAttribute("data-testid", "provider-container");
    document.body.appendChild(providerContainer);

    const propContainer = document.createElement("div");
    propContainer.setAttribute("data-testid", "prop-container");
    document.body.appendChild(propContainer);

    render(
      <KumoPortalProvider container={providerContainer}>
        <Wizard.Fullscreen open container={propContainer}>
          <div data-testid="wizard-content">Content</div>
        </Wizard.Fullscreen>
      </KumoPortalProvider>,
    );

    // Container prop wins over provider context
    expect(propContainer.querySelector('[role="dialog"]')).toBeTruthy();
    expect(providerContainer.querySelector('[role="dialog"]')).toBeNull();

    document.body.removeChild(providerContainer);
    document.body.removeChild(propContainer);
  });
});
