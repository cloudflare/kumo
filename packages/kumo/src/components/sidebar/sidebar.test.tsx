// Stub Web Animations API for happy-dom (Base UI ScrollArea calls getAnimations)
if (!HTMLElement.prototype.getAnimations) {
  HTMLElement.prototype.getAnimations = () => [];
}

import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarLoading,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  SidebarMenuChevron,
  SidebarCollapsible,
  SidebarCollapsibleTrigger,
  SidebarCollapsibleContent,
  SidebarSlidingViews,
  SidebarSlidingView,
  useSidebar,
  KUMO_SIDEBAR_VARIANTS,
  KUMO_SIDEBAR_DEFAULT_VARIANTS,
  KUMO_SIDEBAR_STYLING,
} from "./sidebar";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fireTransitionEnd(element: HTMLElement, propertyName: string) {
  const event = new Event("transitionend", { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  fireEvent(element, event);
}

/** Minimal sidebar wrapper for tests that need Provider context. */
function TestSidebar({
  children,
  ...providerProps
}: React.ComponentProps<typeof SidebarProvider>) {
  return (
    <SidebarProvider {...providerProps}>
      <Sidebar>{children}</Sidebar>
      <div data-testid="main">Main</div>
    </SidebarProvider>
  );
}

/** Hook consumer to read sidebar state in tests. */
function StateReader() {
  const { state, open, isPeeking } = useSidebar();
  return (
    <div
      data-testid="state-reader"
      data-state={state}
      data-open={String(open)}
      data-peeking={String(isPeeking)}
    />
  );
}

function setMobileMatchMedia(matches: boolean, prefersReducedMotion = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion")
        ? prefersReducedMotion
        : matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Stub matchMedia for useIsMobile — default to desktop
beforeEach(() => {
  setMobileMatchMedia(false);
});

// ============================================================================
// Exports & Structure
// ============================================================================

describe("Sidebar exports", () => {
  it("should export compound component with all sub-components", () => {
    expect(Sidebar).toBeDefined();
    expect(Sidebar.Provider).toBe(SidebarProvider);
    expect(Sidebar.Header).toBe(SidebarHeader);
    expect(Sidebar.Content).toBe(SidebarContent);
    expect(Sidebar.Footer).toBe(SidebarFooter);
    expect(Sidebar.Group).toBe(SidebarGroup);
    expect(Sidebar.GroupLabel).toBe(SidebarGroupLabel);
    expect(Sidebar.Menu).toBe(SidebarMenu);
    expect(Sidebar.MenuItem).toBe(SidebarMenuItem);
    expect(Sidebar.MenuButton).toBe(SidebarMenuButton);
    expect(Sidebar.MenuBadge).toBe(SidebarMenuBadge);
    expect(Sidebar.MenuSub).toBe(SidebarMenuSub);
    expect(Sidebar.MenuSubItem).toBe(SidebarMenuSubItem);
    expect(Sidebar.MenuSubButton).toBe(SidebarMenuSubButton);
    expect(Sidebar.Separator).toBe(SidebarSeparator);
    expect(Sidebar.Trigger).toBe(SidebarTrigger);
    expect(Sidebar.Rail).toBe(SidebarRail);
    expect(Sidebar.MenuChevron).toBe(SidebarMenuChevron);
    expect(Sidebar.Collapsible).toBe(SidebarCollapsible);
    expect(Sidebar.CollapsibleTrigger).toBe(SidebarCollapsibleTrigger);
    expect(Sidebar.CollapsibleContent).toBe(SidebarCollapsibleContent);
    expect(Sidebar.SlidingViews).toBe(SidebarSlidingViews);
    expect(Sidebar.SlidingView).toBe(SidebarSlidingView);
  });

  it("should not export removed components", () => {
    expect(Sidebar).not.toHaveProperty("Input");
    expect(Sidebar).not.toHaveProperty("MenuAction");
    expect(Sidebar).not.toHaveProperty("GroupContent");
  });

  it("should export useSidebar hook", () => {
    expect(typeof useSidebar).toBe("function");
  });

  it("should throw when useSidebar is called outside provider", () => {
    function Bad() {
      useSidebar();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      "useSidebar must be used within a Sidebar.Provider",
    );
  });

  it("should export variant definitions", () => {
    expect(KUMO_SIDEBAR_VARIANTS.variant).toHaveProperty("sidebar");
    expect(KUMO_SIDEBAR_VARIANTS.variant).toHaveProperty("floating");
    expect(KUMO_SIDEBAR_VARIANTS.variant).toHaveProperty("inset");
    expect(KUMO_SIDEBAR_VARIANTS.collapsible).toHaveProperty("icon");
    expect(KUMO_SIDEBAR_VARIANTS.collapsible).toHaveProperty("offcanvas");
    expect(KUMO_SIDEBAR_VARIANTS.collapsible).toHaveProperty("none");
    expect(KUMO_SIDEBAR_VARIANTS.side).toHaveProperty("left");
    expect(KUMO_SIDEBAR_VARIANTS.side).toHaveProperty("right");
  });

  it("should export default variants", () => {
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.variant).toBe("sidebar");
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.side).toBe("left");
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.collapsible).toBe("icon");
  });

  it("should export updated styling metadata", () => {
    expect(KUMO_SIDEBAR_STYLING.width.expanded).toBe("16.25rem");
    expect(KUMO_SIDEBAR_STYLING.width.icon).toBe("57px");
  });

  it("should set displayName on all forwardRef components", () => {
    expect(SidebarHeader.displayName).toBe("Sidebar.Header");
    expect(SidebarContent.displayName).toBe("Sidebar.Content");
    expect(SidebarFooter.displayName).toBe("Sidebar.Footer");
    expect(SidebarGroup.displayName).toBe("Sidebar.Group");
    expect(SidebarGroupLabel.displayName).toBe("Sidebar.GroupLabel");
    expect(SidebarMenu.displayName).toBe("Sidebar.Menu");
    expect(SidebarMenuItem.displayName).toBe("Sidebar.MenuItem");
    expect(SidebarMenuButton.displayName).toBe("Sidebar.MenuButton");
    expect(SidebarMenuBadge.displayName).toBe("Sidebar.MenuBadge");
    expect(SidebarMenuSub.displayName).toBe("Sidebar.MenuSub");
    expect(SidebarMenuSubItem.displayName).toBe("Sidebar.MenuSubItem");
    expect(SidebarMenuSubButton.displayName).toBe("Sidebar.MenuSubButton");
    expect(SidebarSeparator.displayName).toBe("Sidebar.Separator");
    expect(SidebarTrigger.displayName).toBe("Sidebar.Trigger");
    expect(SidebarRail.displayName).toBe("Sidebar.Rail");
  });
});

// ============================================================================
// Toggle (expand / collapse)
// ============================================================================

describe("Sidebar toggle", () => {
  it("should start expanded with defaultOpen=true", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>,
    );
    const reader = screen.getByTestId("state-reader");
    expect(reader.dataset.state).toBe("expanded");
    expect(reader.dataset.open).toBe("true");
  });

  it("should start collapsed with defaultOpen=false", () => {
    render(
      <TestSidebar defaultOpen={false}>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>,
    );
    const reader = screen.getByTestId("state-reader");
    expect(reader.dataset.state).toBe("collapsed");
    expect(reader.dataset.open).toBe("false");
  });

  it("should toggle on Trigger click", async () => {
    const user = userEvent.setup();
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>,
    );

    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await user.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-label")).toBe("Expand sidebar");
    expect(screen.getByTestId("state-reader").dataset.state).toBe("collapsed");
  });

  it("should call onOpenChange when controlled", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TestSidebar open={true} onOpenChange={onOpenChange}>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>,
    );

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChangeComplete after the sidebar transition finishes", async () => {
    const onOpenChangeComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <TestSidebar defaultOpen onOpenChangeComplete={onOpenChangeComplete}>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>,
    );

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onOpenChangeComplete).not.toHaveBeenCalled();

    fireTransitionEnd(
      document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
      "opacity",
    );
    expect(onOpenChangeComplete).not.toHaveBeenCalled();

    fireTransitionEnd(
      document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
      "width",
    );
    fireTransitionEnd(
      document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
      "width",
    );

    expect(onOpenChangeComplete).toHaveBeenCalledOnce();
    expect(onOpenChangeComplete).toHaveBeenCalledWith(false);
  });

  it("does not complete a parent sidebar from a nested sidebar transition", () => {
    const outerOnOpenChangeComplete = vi.fn();
    const innerOnOpenChangeComplete = vi.fn();
    const nestedSidebars = (open: boolean) => (
      <SidebarProvider
        open={open}
        onOpenChangeComplete={outerOnOpenChangeComplete}
      >
        <Sidebar>
          <span />
        </Sidebar>
        <SidebarProvider
          open={open}
          onOpenChangeComplete={innerOnOpenChangeComplete}
        >
          <Sidebar>
            <span />
          </Sidebar>
        </SidebarProvider>
      </SidebarProvider>
    );
    const { rerender } = render(nestedSidebars(true));
    rerender(nestedSidebars(false));

    const sidebars = document.querySelectorAll<HTMLElement>(
      '[data-sidebar="sidebar"]',
    );
    fireTransitionEnd(sidebars[1]!, "width");

    expect(innerOnOpenChangeComplete).toHaveBeenCalledOnce();
    expect(innerOnOpenChangeComplete).toHaveBeenCalledWith(false);
    expect(outerOnOpenChangeComplete).not.toHaveBeenCalled();
  });

  it("completes the latest state when no transition event fires", () => {
    vi.useFakeTimers();
    const onOpenChangeComplete = vi.fn();

    try {
      render(
        <TestSidebar
          defaultOpen
          animationDuration={100}
          onOpenChangeComplete={onOpenChangeComplete}
        >
          <SidebarFooter>
            <SidebarTrigger />
          </SidebarFooter>
        </TestSidebar>,
      );

      const trigger = screen.getByRole("button", {
        name: "Collapse sidebar",
      });
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      expect(onOpenChangeComplete).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(onOpenChangeComplete).not.toHaveBeenCalled();

      act(() => {
        vi.runAllTimers();
      });

      expect(onOpenChangeComplete).toHaveBeenCalledOnce();
      expect(onOpenChangeComplete).toHaveBeenCalledWith(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("completes an open change when the callback is added with it", () => {
    const onOpenChangeComplete = vi.fn();
    const sidebar = (open: boolean, callback?: (nextOpen: boolean) => void) => (
      <TestSidebar open={open} onOpenChangeComplete={callback}>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>
    );
    const { rerender } = render(sidebar(true));
    rerender(sidebar(false, onOpenChangeComplete));

    fireTransitionEnd(
      document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
      "width",
    );

    expect(onOpenChangeComplete).toHaveBeenCalledOnce();
    expect(onOpenChangeComplete).toHaveBeenCalledWith(false);
  });

  it("completes immediately when reduced motion disables transitions", () => {
    setMobileMatchMedia(false, true);
    const onOpenChangeComplete = vi.fn();
    render(
      <TestSidebar defaultOpen onOpenChangeComplete={onOpenChangeComplete}>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(onOpenChangeComplete).toHaveBeenCalledOnce();
    expect(onOpenChangeComplete).toHaveBeenCalledWith(false);
  });

  it("clears pending state when the callback is removed", () => {
    vi.useFakeTimers();
    const firstCallback = vi.fn();
    const nextCallback = vi.fn();
    const sidebar = (
      open: boolean,
      onOpenChangeComplete?: (open: boolean) => void,
    ) => (
      <TestSidebar open={open} onOpenChangeComplete={onOpenChangeComplete}>
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>
    );

    try {
      const { rerender } = render(sidebar(true, firstCallback));
      rerender(sidebar(false, firstCallback));
      rerender(sidebar(true));
      rerender(sidebar(true, nextCallback));

      fireTransitionEnd(
        document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
        "width",
      );
      act(() => {
        vi.runAllTimers();
      });

      expect(firstCallback).not.toHaveBeenCalled();
      expect(nextCallback).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not complete when switching between desktop and mobile", () => {
    vi.useFakeTimers();
    const onOpenChangeComplete = vi.fn();
    const sidebar = (mobileBreakpoint: number) => (
      <TestSidebar
        defaultOpen
        mobileBreakpoint={mobileBreakpoint}
        onOpenChangeComplete={onOpenChangeComplete}
      >
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>
    );

    try {
      const { rerender } = render(sidebar(768));
      setMobileMatchMedia(true);
      rerender(sidebar(769));

      fireTransitionEnd(
        document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
        "transform",
      );
      act(() => {
        vi.runAllTimers();
      });

      expect(onOpenChangeComplete).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not complete a controlled open state when switching to mobile", () => {
    vi.useFakeTimers();
    const onOpenChangeComplete = vi.fn();
    const sidebar = (mobileBreakpoint: number) => (
      <TestSidebar
        open
        mobileBreakpoint={mobileBreakpoint}
        onOpenChangeComplete={onOpenChangeComplete}
      >
        <SidebarFooter>
          <SidebarTrigger />
        </SidebarFooter>
      </TestSidebar>
    );

    try {
      const { rerender } = render(sidebar(768));
      setMobileMatchMedia(true);
      rerender(sidebar(769));

      fireTransitionEnd(
        document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')!,
        "transform",
      );
      act(() => {
        vi.runAllTimers();
      });

      expect(onOpenChangeComplete).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ============================================================================
// Collapsible (sub-menu expand/collapse)
// ============================================================================

describe("Sidebar.Collapsible", () => {
  function CollapsibleTest({
    defaultOpen = false,
    open,
    autoScrollOnOpen = false,
    onOpenChangeComplete,
    sidebarOpen,
  }: {
    defaultOpen?: boolean;
    open?: boolean;
    autoScrollOnOpen?: boolean;
    onOpenChangeComplete?: (open: boolean) => void;
    sidebarOpen?: boolean;
  }) {
    return (
      <TestSidebar defaultOpen open={sidebarOpen} previewOnHover>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarCollapsible
                defaultOpen={defaultOpen}
                open={open}
                autoScrollOnOpen={autoScrollOnOpen}
                onOpenChangeComplete={onOpenChangeComplete}
              >
                <SidebarCollapsibleTrigger
                  render={
                    <SidebarMenuButton>
                      Compute
                      <SidebarMenuChevron />
                    </SidebarMenuButton>
                  }
                />
                <SidebarCollapsibleContent data-testid="collapsible-content">
                  <SidebarMenuSub>
                    <SidebarMenuSubButton>
                      <svg data-testid="sub-icon" aria-hidden="true" />
                      Workers
                    </SidebarMenuSubButton>
                  </SidebarMenuSub>
                </SidebarCollapsibleContent>
              </SidebarCollapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>
    );
  }

  it("should be closed by default", () => {
    render(<CollapsibleTest />);
    const content = screen.getByTestId("collapsible-content");
    expect(content.getAttribute("aria-hidden")).toBe("true");
  });

  it("should be open when defaultOpen=true", () => {
    render(<CollapsibleTest defaultOpen />);
    const content = screen.getByTestId("collapsible-content");
    expect(content.getAttribute("aria-hidden")).toBe("false");
  });

  it("should toggle on trigger click", () => {
    render(<CollapsibleTest />);

    const trigger = screen.getByText("Compute").closest("button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const content = screen.getByTestId("collapsible-content");
    expect(content.getAttribute("aria-hidden")).toBe("false");
  });

  it("should set aria-controls linking trigger to content", () => {
    render(<CollapsibleTest />);
    const trigger = screen.getByRole("button", { name: /Compute/i });
    const content = screen.getByTestId("collapsible-content");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
  });

  it("should preview nested content on hover without toggling open", () => {
    vi.useFakeTimers();
    render(<CollapsibleTest />);

    try {
      const trigger = screen.getByRole("button", { name: /Compute/i });
      const collapsible = trigger.parentElement!;
      const content = screen.getByTestId("collapsible-content");

      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(content.getAttribute("aria-hidden")).toBe("true");

      fireEvent.mouseEnter(collapsible);

      const preview = document.querySelector(
        "[data-sidebar='collapsible-preview']",
      );
      expect(preview).toBeTruthy();
      // Mouse-only affordance: hidden from the accessibility tree, but NOT
      // inert (so it stays clickable). Keyboard users get inline expansion.
      expect(preview?.getAttribute("aria-hidden")).toBe("true");
      expect(preview?.hasAttribute("inert")).toBe(false);
      expect(preview?.hasAttribute("role")).toBe(false);
      expect(preview?.textContent).toContain("Workers");

      // The popup opens from its parent trigger, so the top-level sub-list sits
      // flush: a wrapper collapses the indent and hides the tree connector line
      // via direct-child (`>`) overrides. Icons still pass through.
      const previewSub = preview?.querySelector(
        "[data-sidebar='menu-sub']",
      ) as HTMLElement;
      expect(previewSub).toBeTruthy();
      // The line is still in the DOM (hidden via CSS), not removed.
      expect(
        previewSub.querySelector(":scope > li[aria-hidden='true']"),
      ).toBeTruthy();
      // Wrapper carries the top-level-only flatten overrides.
      const flattenWrapper = previewSub.parentElement as HTMLElement;
      expect(flattenWrapper.className).toContain(
        "[&>[data-sidebar=menu-sub]]:pl-0",
      );
      expect(flattenWrapper.className).toContain(
        "[&>[data-sidebar=menu-sub]>li[aria-hidden=true]]:hidden",
      );
      expect(preview?.querySelector("[data-testid='sub-icon']")).toBeTruthy();
      expect(
        (preview as HTMLElement).style.getPropertyValue("--sidebar-active-bg"),
      ).toBe("var(--color-kumo-tint)");
      expect(trigger.getAttribute("data-preview-open")).toBe("true");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(content.getAttribute("aria-hidden")).toBe("true");

      fireEvent.click(trigger);

      expect(
        document.querySelector("[data-sidebar='collapsible-preview']"),
      ).toBeNull();
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(content.getAttribute("aria-hidden")).toBe("false");

      fireEvent.click(trigger);
      fireEvent.mouseEnter(collapsible);

      fireEvent.mouseLeave(collapsible);
      fireEvent.mouseEnter(
        document.querySelector(
          "[data-sidebar='collapsible-preview']",
        ) as HTMLElement,
      );
      act(() => {
        vi.advanceTimersByTime(120);
      });

      expect(
        document.querySelector("[data-sidebar='collapsible-preview']"),
      ).toBeTruthy();

      fireEvent.mouseLeave(
        document.querySelector(
          "[data-sidebar='collapsible-preview']",
        ) as HTMLElement,
      );
      act(() => {
        vi.advanceTimersByTime(120);
      });

      expect(
        document.querySelector("[data-sidebar='collapsible-preview']"),
      ).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  // Single collapsible driving all preview tests: the provider toggle, initial
  // rail/section open states, and the trigger's optional `tooltip`.
  function PreviewFixture({
    previewOnHover,
    railOpen = true,
    sectionOpen = false,
    tooltip,
  }: {
    previewOnHover?: boolean;
    railOpen?: boolean;
    sectionOpen?: boolean;
    tooltip?: string;
  }) {
    return (
      <TestSidebar defaultOpen={railOpen} previewOnHover={previewOnHover}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarCollapsible defaultOpen={sectionOpen}>
                <SidebarCollapsibleTrigger
                  render={
                    <SidebarMenuButton tooltip={tooltip}>
                      Compute
                      <SidebarMenuChevron />
                    </SidebarMenuButton>
                  }
                />
                <SidebarCollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubButton>Workers</SidebarMenuSubButton>
                  </SidebarMenuSub>
                </SidebarCollapsibleContent>
              </SidebarCollapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>
    );
  }

  const previewEl = () =>
    document.querySelector("[data-sidebar='collapsible-preview']");

  it("should not preview when previewOnHover is unset (opt-in)", () => {
    render(<PreviewFixture />);
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    expect(previewEl()).toBeNull();
  });

  it("should preview when the Provider opts in", () => {
    render(<PreviewFixture previewOnHover />);
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    expect(previewEl()).toBeTruthy();
  });

  it("should not preview an open section when the rail is expanded", () => {
    render(<PreviewFixture previewOnHover sectionOpen />);
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    // Expanded rail already shows the section inline → no popup.
    expect(previewEl()).toBeNull();
  });

  it("should preview an open section when the rail is collapsed", () => {
    // A collapsed rail cannot render inline content, so even a section marked
    // open must fall back to the hover popup.
    render(<PreviewFixture previewOnHover railOpen={false} sectionOpen />);
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    expect(previewEl()).toBeTruthy();
  });

  it("should anchor the popup top to the trigger, offset by its padding", () => {
    // Align the popup's first row with the row that opened it: top is the
    // trigger's top minus the popup padding (PREVIEW_PADDING = 6, matching
    // `p-1.5`). A fixed rect keeps this above the viewport-inset clamp.
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        top: 120,
        left: 40,
        right: 88,
        bottom: 154,
        width: 48,
        height: 34,
        x: 40,
        y: 120,
        toJSON: () => ({}),
      } as DOMRect);

    try {
      render(<PreviewFixture previewOnHover />);
      fireEvent.mouseEnter(
        screen.getByRole("button", { name: /Compute/i }).parentElement!,
      );
      const preview = previewEl() as HTMLElement;
      expect(preview).toBeTruthy();
      expect(preview.style.top).toBe("114px"); // 120 - 6
    } finally {
      rectSpy.mockRestore();
    }
  });

  it("should align the collapsed popup's title row with the trigger", () => {
    // The title mirrors the parent, so it overlays the trigger row: no offset,
    // the popup's top edge meets the trigger's top (both are min-h-8.5).
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        top: 120,
        left: 40,
        right: 88,
        bottom: 154,
        width: 48,
        height: 34,
        x: 40,
        y: 120,
        toJSON: () => ({}),
      } as DOMRect);

    try {
      render(
        <PreviewFixture previewOnHover railOpen={false} tooltip="Compute" />,
      );
      fireEvent.mouseEnter(
        screen.getByRole("button", { name: /Compute/i }).parentElement!,
      );
      const preview = previewEl() as HTMLElement;
      expect(preview).toBeTruthy();
      expect(preview.style.top).toBe("120px"); // 120 - 0
    } finally {
      rectSpy.mockRestore();
    }
  });

  const titleEl = () =>
    document.querySelector(
      "[data-sidebar='collapsible-preview-title']",
    ) as HTMLElement | null;

  it("should replace the tooltip with a popup title on collapsed preview", () => {
    // With a preview available the tooltip is suppressed (showTooltip is
    // gated on !hasPreview) and the popup carries the parent's name instead.
    // The tooltip popup is portaled + hover/delay driven and unreliable under
    // happy-dom, so we assert the observable outcome: preview + title present,
    // no tooltip popup leaked into the DOM.
    render(
      <PreviewFixture previewOnHover railOpen={false} tooltip="Compute" />,
    );

    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );

    expect(previewEl()).toBeTruthy();
    expect(titleEl()?.textContent).toBe("Compute");
    expect(document.querySelector(".kumo-tooltip-popup")).toBeNull();
  });

  it("should title the collapsed popup from the trigger's tooltip", () => {
    render(
      <PreviewFixture previewOnHover railOpen={false} tooltip="Compute" />,
    );
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    expect(titleEl()?.textContent).toBe("Compute");
  });

  it("should title the collapsed popup from the trigger's text when no tooltip", () => {
    render(<PreviewFixture previewOnHover railOpen={false} />);
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    // Text extraction skips the chevron element → just the label.
    expect(titleEl()?.textContent).toBe("Compute");
  });

  it("should not title the popup when the rail is expanded", () => {
    render(<PreviewFixture previewOnHover tooltip="Compute" />);
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    expect(previewEl()).toBeTruthy();
    expect(titleEl()).toBeNull();
  });

  it("should title only the top-level popup, not nested ones", () => {
    render(<NestedCollapsibleTest railOpen={false} tooltip="Compute" />);

    // Open the top-level popup, then the nested one.
    fireEvent.mouseEnter(
      screen.getByRole("button", { name: /Compute/i }).parentElement!,
    );
    const popup1 = previewEl() as HTMLElement;
    fireEvent.mouseEnter(
      popup1.querySelector("[data-sidebar='menu-sub-button']")!.parentElement!,
    );

    expect(
      document.querySelectorAll("[data-sidebar='collapsible-preview']").length,
    ).toBe(2);
    // Nested popup omits the title — its parent row shows in popup 1 to the
    // left — so only the top-level "Compute" title exists.
    const titles = document.querySelectorAll(
      "[data-sidebar='collapsible-preview-title']",
    );
    expect(titles.length).toBe(1);
    expect(titles[0].textContent).toBe("Compute");
  });

  it("should keep preview items clickable but out of the tab order", () => {
    render(<CollapsibleTest />);

    const trigger = screen.getByRole("button", { name: /Compute/i });
    const collapsible = trigger.parentElement!;

    // Keyboard never opens the popup — the trigger does not advertise one.
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false);

    fireEvent.mouseEnter(collapsible);
    const preview = document.querySelector(
      "[data-sidebar='collapsible-preview']",
    ) as HTMLElement;
    expect(preview).toBeTruthy();

    // Items inside are removed from the tab order (keyboard-invisible)...
    const subButton = preview.querySelector(
      "[data-sidebar='menu-sub-button']",
    ) as HTMLElement;
    expect(subButton).toBeTruthy();
    expect(subButton.getAttribute("tabindex")).toBe("-1");

    // ...but remain mouse-clickable.
    const onClick = vi.fn();
    subButton.addEventListener("click", onClick);
    fireEvent.click(subButton);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  function NestedCollapsibleTest({
    railOpen = true,
    tooltip,
  }: {
    railOpen?: boolean;
    tooltip?: string;
  } = {}) {
    return (
      <TestSidebar defaultOpen={railOpen} previewOnHover>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarCollapsible>
                <SidebarCollapsibleTrigger
                  render={
                    <SidebarMenuButton tooltip={tooltip}>
                      Compute
                      <SidebarMenuChevron />
                    </SidebarMenuButton>
                  }
                />
                <SidebarCollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarCollapsible>
                        <SidebarCollapsibleTrigger
                          render={
                            <SidebarMenuSubButton>
                              Workers & Pages
                              <SidebarMenuChevron />
                            </SidebarMenuSubButton>
                          }
                        />
                        <SidebarCollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubButton href="/overview">
                              Overview
                            </SidebarMenuSubButton>
                          </SidebarMenuSub>
                        </SidebarCollapsibleContent>
                      </SidebarCollapsible>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarCollapsibleContent>
              </SidebarCollapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>
    );
  }

  it("should dismiss the whole popup stack when a leaf item is clicked", () => {
    render(<NestedCollapsibleTest />);

    const trigger = screen.getByRole("button", { name: /Compute/i });
    fireEvent.mouseEnter(trigger.parentElement!);

    const popup1 = document.querySelector(
      "[data-sidebar='collapsible-preview']",
    ) as HTMLElement;
    expect(popup1).toBeTruthy();

    // Hover the nested parent inside popup 1 to open popup 2.
    const nestedParent = popup1.querySelector(
      "[data-sidebar='menu-sub-button']",
    ) as HTMLElement;
    fireEvent.mouseEnter(nestedParent.parentElement!);

    const popups = () =>
      document.querySelectorAll("[data-sidebar='collapsible-preview']");
    expect(popups().length).toBe(2);

    // Click a leaf (link) in the deepest popup: navigation is allowed and the
    // entire popup stack is dismissed. (Popups are aria-hidden, so query the
    // DOM directly rather than by accessible role.)
    const popup2 = popups()[1] as HTMLElement;
    const overview = popup2.querySelector('a[href="/overview"]') as HTMLElement;
    expect(overview).toBeTruthy();
    const clickEvent = fireEvent.click(overview);
    expect(clickEvent).toBe(true); // not preventDefault-ed → navigation proceeds
    expect(popups().length).toBe(0);
  });

  it("should not toggle a parent's disclosure when clicked inside a popup", () => {
    render(<NestedCollapsibleTest />);

    const trigger = screen.getByRole("button", { name: /Compute/i });
    fireEvent.mouseEnter(trigger.parentElement!);

    const popup1 = document.querySelector(
      "[data-sidebar='collapsible-preview']",
    ) as HTMLElement;
    const nestedParent = popup1.querySelector(
      "[data-sidebar='menu-sub-button']",
    ) as HTMLElement;

    // Chevron on a parent inside the popup is static (never rotated open).
    const chevron = nestedParent.querySelector("svg") as SVGElement;
    expect(chevron.getAttribute("class") ?? "").not.toContain("rotate-90");

    // A hover-only parent (children, no href) has no click action → no pointer.
    // `!` beats the unlayered cursor:pointer base rule in kumo.css. (Only the
    // class can be checked here; happy-dom doesn't load Tailwind CSS.)
    expect(nestedParent.className).toContain("cursor-default!");

    // Clicking the parent keeps the popup open (children are hover-only) and
    // does not flip the disclosure — so hovering it still opens its popup.
    fireEvent.click(nestedParent);
    expect(
      document.querySelectorAll("[data-sidebar='collapsible-preview']").length,
    ).toBe(1);
    expect(nestedParent.getAttribute("data-open")).toBeNull();

    fireEvent.mouseEnter(nestedParent.parentElement!);
    expect(
      document.querySelectorAll("[data-sidebar='collapsible-preview']").length,
    ).toBe(2);
  });

  function HrefParentTest() {
    return (
      <TestSidebar defaultOpen previewOnHover>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarCollapsible>
                <SidebarCollapsibleTrigger
                  render={
                    <SidebarMenuButton>
                      Compute
                      <SidebarMenuChevron />
                    </SidebarMenuButton>
                  }
                />
                <SidebarCollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarCollapsible>
                        <SidebarCollapsibleTrigger
                          render={
                            <SidebarMenuSubButton href="/workers">
                              Workers & Pages
                              <SidebarMenuChevron />
                            </SidebarMenuSubButton>
                          }
                        />
                        <SidebarCollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubButton href="/overview">
                              Overview
                            </SidebarMenuSubButton>
                          </SidebarMenuSub>
                        </SidebarCollapsibleContent>
                      </SidebarCollapsible>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarCollapsibleContent>
              </SidebarCollapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>
    );
  }

  it("should navigate and dismiss all popups when a parent with href is clicked", () => {
    render(<HrefParentTest />);

    const trigger = screen.getByRole("button", { name: /Compute/i });
    fireEvent.mouseEnter(trigger.parentElement!);

    const popup1 = document.querySelector(
      "[data-sidebar='collapsible-preview']",
    ) as HTMLElement;
    const nestedParent = popup1.querySelector(
      'a[href="/workers"]',
    ) as HTMLElement;
    expect(nestedParent).toBeTruthy();

    // A parent with an href is a real link → keeps the pointer cursor.
    expect(nestedParent.className).not.toContain("cursor-default");

    // Clicking navigates (not preventDefault-ed) and dismisses the popup stack.
    const clickEvent = fireEvent.click(nestedParent);
    expect(clickEvent).toBe(true);
    expect(
      document.querySelectorAll("[data-sidebar='collapsible-preview']").length,
    ).toBe(0);
  });

  it("should have role=region on content", () => {
    render(<CollapsibleTest />);
    const content = screen.getByTestId("collapsible-content");
    expect(content.getAttribute("role")).toBe("region");
  });

  it("should set inert on closed content", () => {
    render(<CollapsibleTest />);
    const content = screen.getByTestId("collapsible-content");
    expect(content.hasAttribute("inert")).toBe(true);
    expect(content.getAttribute("aria-hidden")).toBe("true");
  });

  it("calls onOpenChangeComplete after the content transition finishes", () => {
    const onOpenChangeComplete = vi.fn();
    render(<CollapsibleTest onOpenChangeComplete={onOpenChangeComplete} />);

    fireEvent.click(screen.getByText("Compute").closest("button")!);
    expect(onOpenChangeComplete).not.toHaveBeenCalled();

    fireTransitionEnd(screen.getByTestId("collapsible-content"), "opacity");
    expect(onOpenChangeComplete).not.toHaveBeenCalled();

    fireTransitionEnd(
      screen.getByTestId("collapsible-content"),
      "grid-template-rows",
    );
    fireTransitionEnd(
      screen.getByTestId("collapsible-content"),
      "grid-template-rows",
    );

    expect(onOpenChangeComplete).toHaveBeenCalledOnce();
    expect(onOpenChangeComplete).toHaveBeenCalledWith(true);
  });

  it("completes a controlled change when the callback is added with it", () => {
    const onOpenChangeComplete = vi.fn();
    const { rerender } = render(<CollapsibleTest open />);
    rerender(
      <CollapsibleTest
        open={false}
        onOpenChangeComplete={onOpenChangeComplete}
      />,
    );

    fireTransitionEnd(
      screen.getByTestId("collapsible-content"),
      "grid-template-rows",
    );

    expect(onOpenChangeComplete).toHaveBeenCalledOnce();
    expect(onOpenChangeComplete).toHaveBeenCalledWith(false);
  });

  it.each([
    { change: "the sidebar expands", isMobile: false, sidebarOpen: true },
    { change: "the sidebar collapses", isMobile: false, sidebarOpen: false },
    {
      change: "the controlled mobile drawer opens",
      isMobile: true,
      sidebarOpen: true,
    },
  ])("completes an open group when $change", ({ isMobile, sidebarOpen }) => {
    setMobileMatchMedia(isMobile);
    const onOpenChangeComplete = vi.fn();
    const { rerender } = render(
      <CollapsibleTest
        open
        sidebarOpen={!sidebarOpen}
        onOpenChangeComplete={onOpenChangeComplete}
      />,
    );
    rerender(
      <CollapsibleTest
        open
        sidebarOpen={sidebarOpen}
        onOpenChangeComplete={onOpenChangeComplete}
      />,
    );
    expect(onOpenChangeComplete).not.toHaveBeenCalled();

    fireTransitionEnd(
      screen.getByTestId("collapsible-content"),
      "grid-template-rows",
    );

    expect(onOpenChangeComplete).toHaveBeenCalledOnce();
    expect(onOpenChangeComplete).toHaveBeenCalledWith(sidebarOpen);
  });

  it("completes an open group when the uncontrolled mobile drawer opens and closes", () => {
    setMobileMatchMedia(true);
    const onOpenChangeComplete = vi.fn();
    function DrawerToggle() {
      const { toggleSidebar } = useSidebar();
      return (
        <button
          type="button"
          onClick={toggleSidebar}
          data-testid="drawer-toggle"
        >
          Toggle drawer
        </button>
      );
    }
    render(
      <SidebarProvider>
        <DrawerToggle />
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarCollapsible
                  open
                  onOpenChangeComplete={onOpenChangeComplete}
                >
                  <SidebarCollapsibleTrigger
                    render={<SidebarMenuButton>Compute</SidebarMenuButton>}
                  />
                  <SidebarCollapsibleContent data-testid="collapsible-content">
                    <SidebarMenuSub>
                      <SidebarMenuSubButton>Workers</SidebarMenuSubButton>
                    </SidebarMenuSub>
                  </SidebarCollapsibleContent>
                </SidebarCollapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    const content = screen.getByTestId("collapsible-content");
    expect(content.getAttribute("aria-hidden")).toBe("true");

    fireEvent.click(screen.getByTestId("drawer-toggle"));
    expect(content.getAttribute("aria-hidden")).toBe("false");
    fireTransitionEnd(content, "grid-template-rows");
    expect(onOpenChangeComplete).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByTestId("drawer-toggle"));
    expect(content.getAttribute("aria-hidden")).toBe("true");
    fireTransitionEnd(content, "grid-template-rows");
    expect(onOpenChangeComplete).toHaveBeenCalledTimes(2);
    expect(onOpenChangeComplete).toHaveBeenLastCalledWith(false);
  });

  it("should scroll opened content into view when enabled", () => {
    vi.useFakeTimers();
    const scrollIntoView = vi.fn();
    const originalScrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollIntoView",
    );
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: scrollIntoView,
    });

    try {
      render(<CollapsibleTest autoScrollOnOpen />);

      fireEvent.click(screen.getByText("Compute").closest("button")!);
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(scrollIntoView).toHaveBeenCalledWith({
        block: "nearest",
        behavior: "smooth",
      });
    } finally {
      if (originalScrollIntoViewDescriptor) {
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollIntoView",
          originalScrollIntoViewDescriptor,
        );
      } else {
        delete (HTMLElement.prototype as { scrollIntoView?: unknown })
          .scrollIntoView;
      }
      vi.useRealTimers();
    }
  });
});

// ============================================================================
// Peeking
// ============================================================================

describe("Sidebar peeking", () => {
  it("should not peek when peekable is false", () => {
    render(
      <TestSidebar defaultOpen={false} peekable={false}>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>,
    );

    const sidebar = document.querySelector("[data-sidebar='peek-zone']")!;
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByTestId("state-reader").dataset.state).toBe("collapsed");
    expect(screen.getByTestId("state-reader").dataset.peeking).toBe("false");
  });

  it("should peek on mouseEnter when collapsed and peekable", () => {
    render(
      <TestSidebar defaultOpen={false} peekable>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>,
    );

    const sidebar = document.querySelector("[data-sidebar='peek-zone']")!;
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByTestId("state-reader").dataset.state).toBe("peeking");
    expect(screen.getByTestId("state-reader").dataset.peeking).toBe("true");
  });

  it("should stop peeking on mouseLeave", () => {
    render(
      <TestSidebar defaultOpen={false} peekable>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>,
    );

    const sidebar = document.querySelector("[data-sidebar='peek-zone']")!;
    fireEvent.mouseEnter(sidebar);
    expect(screen.getByTestId("state-reader").dataset.state).toBe("peeking");

    fireEvent.mouseLeave(sidebar);
    expect(screen.getByTestId("state-reader").dataset.state).toBe("collapsed");
  });

  it("should not peek when already expanded", () => {
    render(
      <TestSidebar defaultOpen peekable>
        <SidebarContent>
          <StateReader />
        </SidebarContent>
      </TestSidebar>,
    );

    const sidebar = document.querySelector("[data-sidebar='peek-zone']")!;
    fireEvent.mouseEnter(sidebar);

    expect(screen.getByTestId("state-reader").dataset.state).toBe("expanded");
    expect(screen.getByTestId("state-reader").dataset.peeking).toBe("false");
  });
});

// ============================================================================
// SlidingViews
// ============================================================================

describe("Sidebar.SlidingViews", () => {
  function SlidingTest({ activeKey = "a" }: { activeKey?: string }) {
    return (
      <TestSidebar defaultOpen>
        <SidebarSlidingViews activeKey={activeKey}>
          <SidebarSlidingView value="a">
            <SidebarContent>
              <div data-testid="view-a">View A</div>
            </SidebarContent>
          </SidebarSlidingView>
          <SidebarSlidingView value="b">
            <SidebarContent>
              <div data-testid="view-b">View B</div>
            </SidebarContent>
          </SidebarSlidingView>
        </SidebarSlidingViews>
      </TestSidebar>
    );
  }

  function PeekingSlidingTest({ activeKey = "a" }: { activeKey?: string }) {
    return (
      <TestSidebar defaultOpen={false} peekable>
        <StateReader />
        <SidebarSlidingViews activeKey={activeKey}>
          <SidebarSlidingView value="a">
            <SidebarContent>
              <button type="button" data-testid="view-a-button">
                Go to B
              </button>
            </SidebarContent>
          </SidebarSlidingView>
          <SidebarSlidingView value="b">
            <SidebarContent>
              <button type="button">Go to A</button>
            </SidebarContent>
          </SidebarSlidingView>
        </SidebarSlidingViews>
      </TestSidebar>
    );
  }

  it("should show the active view", () => {
    render(<SlidingTest activeKey="a" />);
    const viewA = screen
      .getByTestId("view-a")
      .closest("[data-sidebar='sliding-view']")!;
    expect(viewA.getAttribute("aria-hidden")).toBe("false");
  });

  it("should hide inactive views with aria-hidden and inert", () => {
    render(<SlidingTest activeKey="a" />);
    const viewB = screen
      .getByTestId("view-b")
      .closest("[data-sidebar='sliding-view']")!;
    expect(viewB.getAttribute("aria-hidden")).toBe("true");
    expect(viewB.hasAttribute("inert")).toBe(true);
  });

  it("should switch active view when activeKey changes", () => {
    const { rerender } = render(<SlidingTest activeKey="a" />);

    rerender(<SlidingTest activeKey="b" />);

    const viewA = screen
      .getByTestId("view-a")
      .closest("[data-sidebar='sliding-view']")!;
    const viewB = screen
      .getByTestId("view-b")
      .closest("[data-sidebar='sliding-view']")!;
    expect(viewA.getAttribute("aria-hidden")).toBe("true");
    expect(viewB.getAttribute("aria-hidden")).toBe("false");
  });

  it("should keep peeking when a view change blurs the active item under the pointer", () => {
    const { rerender } = render(<PeekingSlidingTest activeKey="a" />);

    const peekZone = document.querySelector("[data-sidebar='peek-zone']")!;
    fireEvent.mouseEnter(peekZone);

    const activeButton = screen.getByTestId("view-a-button");
    fireEvent.focus(activeButton);
    expect(screen.getByTestId("state-reader").dataset.state).toBe("peeking");

    rerender(<PeekingSlidingTest activeKey="b" />);
    fireEvent.blur(activeButton, { relatedTarget: null });

    expect(screen.getByTestId("state-reader").dataset.state).toBe("peeking");

    fireEvent.mouseLeave(peekZone);
    expect(screen.getByTestId("state-reader").dataset.state).toBe("collapsed");
  });
});

// ============================================================================
// Resize handle
// ============================================================================

describe("Sidebar.ResizeHandle", () => {
  it("should have correct ARIA attributes", () => {
    render(
      <TestSidebar
        defaultOpen
        resizable
        defaultWidth={240}
        minWidth={180}
        maxWidth={400}
      >
        <Sidebar.ResizeHandle data-testid="handle" />
      </TestSidebar>,
    );

    const handle = screen.getByTestId("handle");
    expect(handle.tagName).toBe("BUTTON");
    expect(handle.getAttribute("aria-label")).toBe("Resize sidebar");
    expect(handle.getAttribute("tabindex")).toBe("0");
  });
});

// ============================================================================
// MenuButton
// ============================================================================

describe("Sidebar.MenuButton", () => {
  it("should auto-wrap in <li> when not inside MenuItem", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton>Home</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const button = screen.getByRole("button", { name: "Home" });
    expect(button.closest("li")).toBeTruthy();
    expect(button.closest("li")!.dataset.sidebar).toBe("menu-item");
  });

  it("should set data-active when active", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton active>Home</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const button = screen.getByRole("button", { name: "Home" });
    expect(button.getAttribute("data-active")).toBe("true");
  });

  it("should render as link when href provided", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton href="/home">Home</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const link = screen.getByText("Home").closest("a");
    expect(link).toBeTruthy();
    expect(link!.getAttribute("href")).toBe("/home");
  });

  it("should preserve extra link attributes when href provided", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton href="/tenants" active aria-current="true">
              Tenants
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );

    const link = screen.getByText("Tenants").closest("a");
    expect(link!.getAttribute("aria-current")).toBe("true");
    expect(link!.getAttribute("data-active")).toBe("true");
    expect(link!.getAttribute("data-kumo-part")).toBe("menu-button-link");
  });

  // The collapsed rail labels every item via a tooltip. The popup render is
  // portal + hover-delay driven (unreliable under happy-dom), so we assert the
  // wrapping: a labelled button becomes a tooltip trigger, a bare one does not.
  it("should tooltip a collapsed item from its own text when no tooltip is set", () => {
    render(
      <TestSidebar defaultOpen={false}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton>Analytics</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const button = screen.getByRole("button", { name: "Analytics" });
    expect(button.hasAttribute("data-base-ui-tooltip-trigger")).toBe(true);
  });

  it("should not tooltip a collapsed item with no label", () => {
    render(
      <TestSidebar defaultOpen={false}>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton aria-label="icon only" />
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const button = screen.getByRole("button", { name: "icon only" });
    expect(button.hasAttribute("data-base-ui-tooltip-trigger")).toBe(false);
  });
});

describe("Sidebar.MenuSub", () => {
  it("renders only list items as direct children of the list", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSub data-testid="menu-sub">
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>Workers</SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton>Pages</SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );

    const list = screen.getByTestId("menu-sub");
    const children = Array.from(list.children);
    expect(children.every((child) => child.tagName === "LI")).toBe(true);

    const guideLine = children[0];
    expect(guideLine.getAttribute("aria-hidden")).toBe("true");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("Sidebar.MenuSubButton", () => {
  it("should render as link when href provided", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuSubButton href="/observability">
              Observability
            </SidebarMenuSubButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const link = screen.getByText("Observability").closest("a");
    expect(link).toBeTruthy();
    expect(link!.getAttribute("href")).toBe("/observability");
  });

  it("should forward target to the link when href provided", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuSubButton href="https://example.com" target="_self">
              External
            </SidebarMenuSubButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    const link = screen.getByText("External").closest("a");
    expect(link!.getAttribute("target")).toBe("_self");
  });

  it("should preserve extra link attributes when href provided", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuSubButton
              href="/observability"
              active
              aria-current="page"
            >
              Observability
            </SidebarMenuSubButton>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );

    const link = screen.getByText("Observability").closest("a");
    expect(link!.getAttribute("aria-current")).toBe("page");
    expect(link!.getAttribute("data-active")).toBe("true");
    expect(link!.getAttribute("data-kumo-part")).toBe("menu-sub-button-link");
  });
});

// ============================================================================
// Contained mode
// ============================================================================

describe("Sidebar contained mode", () => {
  it("should not apply min-h-svh when contained", () => {
    render(
      <TestSidebar defaultOpen contained>
        <SidebarContent>Content</SidebarContent>
      </TestSidebar>,
    );
    const wrapper = document.querySelector("[data-sidebar-wrapper]")!;
    expect(wrapper.className).not.toContain("min-h-svh");
  });

  it("should apply min-h-svh when not contained", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>Content</SidebarContent>
      </TestSidebar>,
    );
    const wrapper = document.querySelector("[data-sidebar-wrapper]")!;
    expect(wrapper.className).toContain("min-h-svh");
  });
});

describe("Sidebar.Content scrollbar", () => {
  it("should hide the native scrollbar without Base UI's injected style", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>Content</SidebarContent>
      </TestSidebar>,
    );
    // Base UI's own rule lives in a <style> that head-swapping client
    // routers can remove, so the viewport must carry Kumo's.
    expect(getViewport().className).toMatch(/(^|\s)no-scrollbar(\s|$)/);
  });
});

// ============================================================================
// Mobile behavior
// ============================================================================

describe("Sidebar mobile behavior", () => {
  function MobileToggle() {
    const { toggleSidebar } = useSidebar();
    return (
      <button type="button" onClick={toggleSidebar} data-testid="mobile-toggle">
        Open sidebar
      </button>
    );
  }

  function MobileTest() {
    return (
      <SidebarProvider mobileBreakpoint={9999}>
        <MobileToggle />
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuButton>Home</SidebarMenuButton>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <button type="button" data-testid="after-sidebar">
          After sidebar
        </button>
      </SidebarProvider>
    );
  }

  it("should render closed mobile navigation as inert and aria-hidden", () => {
    setMobileMatchMedia(true);
    render(<MobileTest />);

    const nav = document.querySelector("nav[data-sidebar='sidebar']")!;
    expect(nav.getAttribute("aria-hidden")).toBe("true");
    expect(nav.hasAttribute("inert")).toBe(true);
  });

  it("should open mobile navigation and move focus to the first item", async () => {
    setMobileMatchMedia(true);
    const user = userEvent.setup();
    render(<MobileTest />);

    const nav = document.querySelector("nav[data-sidebar='sidebar']")!;
    await user.click(screen.getByTestId("mobile-toggle"));

    await waitFor(() => expect(nav.getAttribute("aria-hidden")).toBe("false"));
    expect(nav.hasAttribute("inert")).toBe(false);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Home" }),
      ),
    );
  });

  it("should close on Escape and return focus to the opener", async () => {
    setMobileMatchMedia(true);
    const user = userEvent.setup();
    render(<MobileTest />);

    const toggle = screen.getByTestId("mobile-toggle");
    const nav = document.querySelector("nav[data-sidebar='sidebar']")!;
    await user.click(toggle);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Home" }),
      ),
    );

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(nav.getAttribute("aria-hidden")).toBe("true"));
    await waitFor(() => expect(document.activeElement).toBe(toggle));
  });

  it("should NOT close when focus moves outside the sidebar (e.g. to portaled content)", async () => {
    setMobileMatchMedia(true);
    const user = userEvent.setup();
    render(<MobileTest />);

    const nav = document.querySelector("nav[data-sidebar='sidebar']")!;
    const afterSidebar = screen.getByTestId("after-sidebar");
    await user.click(screen.getByTestId("mobile-toggle"));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Home" }),
      ),
    );

    afterSidebar.focus();
    fireEvent.focusOut(nav, { relatedTarget: afterSidebar });

    expect(nav.getAttribute("aria-hidden")).toBe("false");
    expect(nav.hasAttribute("inert")).toBe(false);
  });
});

// ============================================================================
// Sidebar.Loading
// ============================================================================

describe("Sidebar.Loading", () => {
  it("should expose a status role with a default accessible label", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarLoading />
      </TestSidebar>,
    );
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-label")).toBe("Loading");
    expect(status.dataset.sidebar).toBe("loading");
  });

  it("should use a custom label when provided", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarLoading label="Loading navigation" />
      </TestSidebar>,
    );
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
      "Loading navigation",
    );
  });

  it("should render a group-label and item skeleton for every placeholder row", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarLoading />
      </TestSidebar>,
    );
    const status = screen.getByRole("status");
    // 2 groups × (1 group-label + 3 rows × [icon + label]) = 2 + 12 = 14 blocks
    expect(status.querySelectorAll(".skeleton-line")).toHaveLength(14);
  });

  it("should forward ref and className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <TestSidebar defaultOpen>
        <SidebarLoading ref={ref} className="custom-loading" />
      </TestSidebar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.dataset.sidebar).toBe("loading");
    expect(
      screen.getByRole("status").classList.contains("custom-loading"),
    ).toBe(true);
  });
});

// ============================================================================
// Mobile detection (useIsMobile) — SSR / hydration safety
// ============================================================================
//
// useIsMobile must be SSR-safe: during server rendering and hydration it must
// report desktop (getServerSnapshot), so the SSR HTML (desktop <aside>) can be
// hydrated without a mismatch even on a mobile viewport, then switch to the
// mobile overlay once the client subscribes to matchMedia.
describe("Sidebar mobile detection (useIsMobile)", () => {
  it("should render the desktop <aside> during SSR regardless of viewport", () => {
    setMobileMatchMedia(true);

    const html = renderToString(
      <SidebarProvider mobileBreakpoint={768}>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>,
    );

    expect(html).toContain("<aside");
    expect(html).not.toContain("data-mobile");
  });

  it("should hydrate the SSR output without a hydration mismatch on a mobile viewport", () => {
    setMobileMatchMedia(true);

    const ui = (
      <SidebarProvider mobileBreakpoint={768}>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    );

    const container = document.createElement("div");
    container.innerHTML = renderToString(ui);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    act(() => {
      hydrateRoot(container, ui);
    });

    const hydrationErrors = errorSpy.mock.calls.filter((args) =>
      /hydration|did not match|hydrate/i.test(args.map(String).join(" ")),
    );
    expect(hydrationErrors).toEqual([]);

    errorSpy.mockRestore();
  });

  it("should render the mobile overlay on the client when the viewport matches", () => {
    setMobileMatchMedia(true);

    render(
      <TestSidebar mobileBreakpoint={768}>
        <SidebarHeader>Header</SidebarHeader>
      </TestSidebar>,
    );

    expect(document.querySelector('[data-mobile="true"]')).not.toBeNull();
  });

  it("should render the desktop aside on the client on a desktop viewport", () => {
    setMobileMatchMedia(false);

    render(
      <TestSidebar mobileBreakpoint={768}>
        <SidebarHeader>Header</SidebarHeader>
      </TestSidebar>,
    );

    expect(
      document.querySelector('aside[data-sidebar="sidebar"]'),
    ).not.toBeNull();
    expect(document.querySelector('[data-mobile="true"]')).toBeNull();
  });
});

// ============================================================================
// Scroll restoration + imperative scrollToItem
// ============================================================================

function getViewport(): HTMLDivElement {
  const v = document.querySelector<HTMLDivElement>('[data-sidebar="viewport"]');
  if (!v) throw new Error("viewport not found");
  return v;
}

function setViewportGeometry(
  el: HTMLDivElement,
  scrollHeight: number,
  clientHeight: number,
) {
  Object.defineProperty(el, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(el, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
}

function readScrollTop(el: HTMLDivElement): number {
  return el.scrollTop;
}

describe("Sidebar scrollToItem", () => {
  function findItem(id: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(
      `[data-sidebar-item-id="${id}"]`,
    );
    if (!el) throw new Error(`Item not found: ${id}`);
    return el;
  }

  // Assumes viewportRect.top = 0 and viewport.scrollTop = 0 at the moment
  // scrollToItem runs — which is true for these tests but would silently
  // produce wrong geometry if you stub the item AFTER pre-scrolling the
  // viewport. Pair with `stubViewportOrigin` and don't move the viewport
  // before calling.
  function stubItemGeometry(
    el: HTMLElement,
    offsetTop: number,
    height: number,
    scale = 1,
    viewportTop = 0,
  ) {
    Object.defineProperty(el, "offsetTop", {
      configurable: true,
      value: offsetTop,
    });
    Object.defineProperty(el, "offsetHeight", {
      configurable: true,
      value: height,
    });
    Object.defineProperty(el, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        top: viewportTop + offsetTop * scale,
        left: 0,
        bottom: viewportTop + (offsetTop + height) * scale,
        right: 0,
        width: 0,
        height: height * scale,
        x: 0,
        y: viewportTop + offsetTop * scale,
        toJSON: () => ({}),
      }),
    });
  }

  function stubViewportOrigin(viewport: HTMLDivElement, scale = 1, top = 0) {
    Object.defineProperty(viewport, "offsetHeight", {
      configurable: true,
      value: viewport.clientHeight,
    });
    Object.defineProperty(viewport, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        top,
        left: 0,
        bottom: top + viewport.clientHeight * scale,
        right: 0,
        width: 0,
        height: viewport.clientHeight * scale,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }),
    });
  }

  it("scrolls the viewport so the target lands at the start", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("zero-trust", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="home">Home</SidebarMenuButton>
            <SidebarMenuButton itemId="zero-trust">
              Zero Trust
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport);
    stubItemGeometry(findItem("zero-trust"), 800, 40);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(800);
  });

  it.each([
    ["preserves a visible item", 100, 0, 0],
    ["start-aligns an item below the viewport", 800, 0, 800],
    ["start-aligns an item above the viewport", -400, 500, 100],
    ["start-aligns an item clipped below the viewport", 380, 0, 380],
    ["start-aligns an item clipped above the viewport", -20, 500, 480],
  ])("%s", async (_, itemTop, initialScrollTop, expectedScrollTop) => {
    function Ctrl() {
      const { scrollItemIntoView } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollItemIntoView("zero-trust", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="zero-trust">
              Zero Trust
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport);
    stubItemGeometry(findItem("zero-trust"), itemTop, 40);
    viewport.scrollTop = initialScrollTop;

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(expectedScrollTop);
  });

  it.each([
    ["uses default auto alignment", undefined, 440],
    ["center-aligns an offscreen item", { align: "center" } as const, 620],
    ["end-aligns an offscreen item", { align: "end" } as const, 440],
  ])("%s", async (_, options, expectedScrollTop) => {
    function Ctrl() {
      const { scrollItemIntoView } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollItemIntoView("target", options)}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="target">Target</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport);
    stubItemGeometry(findItem("target"), 800, 40);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(expectedScrollTop);
  });

  it("normalizes scaled geometry before start-aligning the target", async () => {
    function Ctrl() {
      const { scrollItemIntoView } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollItemIntoView("target", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="target">Target</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport, 0.5, 100);
    stubItemGeometry(findItem("target"), 800, 40, 0.5, 100);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(800);
  });

  it("centers the target when align is 'center'", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("target", { align: "center" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="target">Target</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport);
    stubItemGeometry(findItem("target"), 800, 40);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(800 - (400 - 40) / 2);
  });

  it("does not scroll ancestors — only the viewport", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("target", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="target">Target</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport);
    stubItemGeometry(findItem("target"), 800, 40);

    // If we called scrollIntoView, ancestors would scroll too. This test
    // fails loudly if we regress by dispatching a scrollIntoView.
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView =
      scrollIntoView as unknown as typeof HTMLElement.prototype.scrollIntoView;

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(readScrollTop(viewport)).toBe(800);
  });

  it("clamps to the viewport's max scroll range", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("target", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="target">Target</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 1000, 400);
    stubViewportOrigin(viewport);
    stubItemGeometry(findItem("target"), 900, 40);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(600);
  });

  it("is a no-op when the id doesn't match anything", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("nope")}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuButton itemId="real">Real</SidebarMenuButton>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 1000, 400);
    stubViewportOrigin(viewport);
    const before = readScrollTop(viewport);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(before);
  });

  it("MenuItem forwards itemId as data-sidebar-item-id", () => {
    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem itemId="wrapped">
              <SidebarMenuButton>Wrapped</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </TestSidebar>,
    );
    expect(
      document.querySelector('li[data-sidebar-item-id="wrapped"]'),
    ).toBeTruthy();
  });

  it("registers itemId on a MenuButton inside an explicit MenuItem", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("compute", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton itemId="compute">Compute</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <Ctrl />
      </TestSidebar>,
    );

    const viewport = getViewport();
    setViewportGeometry(viewport, 2000, 400);
    stubViewportOrigin(viewport);
    const target = document.querySelector<HTMLElement>(
      'button[data-sidebar-item-id="compute"]',
    );
    if (!target) throw new Error("expected button to carry itemId");
    stubItemGeometry(target, 500, 40);

    await userEvent.click(screen.getByTestId("ctrl"));
    expect(readScrollTop(viewport)).toBe(500);
  });

  it("scrolls the correct viewport when multiple are mounted (SlidingViews)", async () => {
    function Ctrl() {
      const { scrollToItem } = useSidebar();
      return (
        <button
          type="button"
          data-testid="ctrl"
          onClick={() => scrollToItem("target-b", { align: "start" })}
        />
      );
    }

    render(
      <TestSidebar defaultOpen>
        <SidebarSlidingViews activeKey="a">
          <SidebarSlidingView value="a">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuButton itemId="target-a">A</SidebarMenuButton>
              </SidebarMenu>
            </SidebarContent>
          </SidebarSlidingView>
          <SidebarSlidingView value="b">
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuButton itemId="target-b">B</SidebarMenuButton>
              </SidebarMenu>
            </SidebarContent>
          </SidebarSlidingView>
        </SidebarSlidingViews>
        <Ctrl />
      </TestSidebar>,
    );

    // Both viewports are mounted at once — this is the SlidingViews bug that
    // a `viewport.querySelector` implementation would fail: it would pick the
    // first viewport in DOM order (view A) and miss `target-b` in view B.
    const viewports = document.querySelectorAll<HTMLDivElement>(
      '[data-sidebar="viewport"]',
    );
    expect(viewports.length).toBe(2);
    const [viewportA, viewportB] = viewports as unknown as [
      HTMLDivElement,
      HTMLDivElement,
    ];
    setViewportGeometry(viewportA, 2000, 400);
    setViewportGeometry(viewportB, 2000, 400);
    stubViewportOrigin(viewportA);
    stubViewportOrigin(viewportB);

    stubItemGeometry(findItem("target-b"), 800, 40);

    await userEvent.click(screen.getByTestId("ctrl"));

    // View B scrolled to the target; view A untouched.
    expect(readScrollTop(viewportB)).toBe(800);
    expect(readScrollTop(viewportA)).toBe(0);
  });
});
