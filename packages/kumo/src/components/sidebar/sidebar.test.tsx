// Stub Web Animations API for happy-dom (Base UI ScrollArea calls getAnimations)
if (!HTMLElement.prototype.getAnimations) {
  HTMLElement.prototype.getAnimations = () => [];
}

import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
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

function setMobileMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
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
});

// ============================================================================
// Collapsible (sub-menu expand/collapse)
// ============================================================================

describe("Sidebar.Collapsible", () => {
  function CollapsibleTest({
    defaultOpen = false,
    autoScrollOnOpen = false,
  }: {
    defaultOpen?: boolean;
    autoScrollOnOpen?: boolean;
  }) {
    return (
      <TestSidebar defaultOpen>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarCollapsible
                defaultOpen={defaultOpen}
                autoScrollOnOpen={autoScrollOnOpen}
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
        delete HTMLElement.prototype.scrollIntoView;
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
    expect(link.getAttribute("href")).toBe("/home");
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
