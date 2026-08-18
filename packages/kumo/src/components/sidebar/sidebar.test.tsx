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
        top: offsetTop,
        left: 0,
        bottom: offsetTop + height,
        right: 0,
        width: 0,
        height,
        x: 0,
        y: offsetTop,
        toJSON: () => ({}),
      }),
    });
  }

  function stubViewportOrigin(viewport: HTMLDivElement) {
    Object.defineProperty(viewport, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        top: 0,
        left: 0,
        bottom: viewport.clientHeight,
        right: 0,
        width: 0,
        height: viewport.clientHeight,
        x: 0,
        y: 0,
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
