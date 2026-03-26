import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock motion/react so motion.div renders as a plain div in happy-dom
vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLDivElement>) => {
      // Strip motion-specific props, pass the rest through
      const { animate, initial, transition, ...rest } = props;
      return React.createElement("div", { ...rest, ref });
    }),
  },
  useReducedMotion: () => false,
}));
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarInput,
  SidebarTrigger,
  SidebarRail,
  SidebarMenuChevron,
  SidebarCollapsible,
  SidebarCollapsibleTrigger,
  SidebarCollapsibleContent,
  useSidebar,
  KUMO_SIDEBAR_VARIANTS,
  KUMO_SIDEBAR_DEFAULT_VARIANTS,
  KUMO_SIDEBAR_STYLING,
} from "./sidebar";

// Force desktop mode: happy-dom needs matchMedia mock and wide viewport
function mockDesktopViewport() {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1024,
  });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    // Any max-width query should report non-matching (we're "wide" / desktop)
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Sidebar", () => {
  it("should export compound component with all sub-components", () => {
    expect(Sidebar).toBeDefined();
    expect(Sidebar.Provider).toBe(SidebarProvider);
    expect(Sidebar.Header).toBe(SidebarHeader);
    expect(Sidebar.Content).toBe(SidebarContent);
    expect(Sidebar.Footer).toBe(SidebarFooter);
    expect(Sidebar.Group).toBe(SidebarGroup);
    expect(Sidebar.GroupLabel).toBe(SidebarGroupLabel);
    expect(Sidebar.GroupContent).toBe(SidebarGroupContent);
    expect(Sidebar.Menu).toBe(SidebarMenu);
    expect(Sidebar.MenuItem).toBe(SidebarMenuItem);
    expect(Sidebar.MenuButton).toBe(SidebarMenuButton);
    expect(Sidebar.MenuAction).toBe(SidebarMenuAction);
    expect(Sidebar.MenuBadge).toBe(SidebarMenuBadge);
    expect(Sidebar.MenuSub).toBe(SidebarMenuSub);
    expect(Sidebar.MenuSubItem).toBe(SidebarMenuSubItem);
    expect(Sidebar.MenuSubButton).toBe(SidebarMenuSubButton);
    expect(Sidebar.Separator).toBe(SidebarSeparator);
    expect(Sidebar.Input).toBe(SidebarInput);
    expect(Sidebar.Trigger).toBe(SidebarTrigger);
    expect(Sidebar.Rail).toBe(SidebarRail);
    expect(Sidebar.MenuChevron).toBe(SidebarMenuChevron);
    expect(Sidebar.Collapsible).toBe(SidebarCollapsible);
    expect(Sidebar.CollapsibleTrigger).toBe(SidebarCollapsibleTrigger);
    expect(Sidebar.CollapsibleContent).toBe(SidebarCollapsibleContent);
  });

  it("should export useSidebar hook", () => {
    expect(useSidebar).toBeDefined();
    expect(typeof useSidebar).toBe("function");
  });

  it("should export variant definitions", () => {
    expect(KUMO_SIDEBAR_VARIANTS).toBeDefined();
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
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS).toBeDefined();
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.variant).toBe("sidebar");
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.side).toBe("left");
    expect(KUMO_SIDEBAR_DEFAULT_VARIANTS.collapsible).toBe("icon");
  });

  it("should export styling metadata", () => {
    expect(KUMO_SIDEBAR_STYLING).toBeDefined();
    expect(KUMO_SIDEBAR_STYLING.width.expanded).toBe("16rem");
    expect(KUMO_SIDEBAR_STYLING.width.icon).toBe("3rem");
  });

  it("should set displayName on all forwardRef components", () => {
    expect(SidebarHeader.displayName).toBe("Sidebar.Header");
    expect(SidebarContent.displayName).toBe("Sidebar.Content");
    expect(SidebarFooter.displayName).toBe("Sidebar.Footer");
    expect(SidebarGroup.displayName).toBe("Sidebar.Group");
    expect(SidebarGroupLabel.displayName).toBe("Sidebar.GroupLabel");
    expect(SidebarGroupContent.displayName).toBe("Sidebar.GroupContent");
    expect(SidebarMenu.displayName).toBe("Sidebar.Menu");
    expect(SidebarMenuItem.displayName).toBe("Sidebar.MenuItem");
    expect(SidebarMenuButton.displayName).toBe("Sidebar.MenuButton");
    expect(SidebarMenuAction.displayName).toBe("Sidebar.MenuAction");
    expect(SidebarMenuBadge.displayName).toBe("Sidebar.MenuBadge");
    expect(SidebarMenuSub.displayName).toBe("Sidebar.MenuSub");
    expect(SidebarMenuSubItem.displayName).toBe("Sidebar.MenuSubItem");
    expect(SidebarMenuSubButton.displayName).toBe("Sidebar.MenuSubButton");
    expect(SidebarSeparator.displayName).toBe("Sidebar.Separator");
    expect(SidebarInput.displayName).toBe("Sidebar.Input");
    expect(SidebarTrigger.displayName).toBe("Sidebar.Trigger");
    expect(SidebarRail.displayName).toBe("Sidebar.Rail");
  });

  it("should throw when useSidebar is called outside provider", () => {
    expect(() => useSidebar()).toThrow();
  });
});

// =============================================================================
// Behavioral tests
// =============================================================================

// Helper: render a sidebar in desktop mode with standard wrapper
function renderDesktopSidebar(ui: React.ReactNode) {
  mockDesktopViewport();
  return render(
    <Sidebar.Provider defaultOpen className="min-h-0 h-full">
      <Sidebar>{ui}</Sidebar>
    </Sidebar.Provider>,
  );
}

// Helper: render a collapsed sidebar in desktop mode
function renderCollapsedSidebar(
  ui: React.ReactNode,
  providerProps?: Record<string, unknown>,
) {
  mockDesktopViewport();
  return render(
    <Sidebar.Provider
      defaultOpen={false}
      className="min-h-0 h-full"
      {...providerProps}
    >
      <Sidebar>{ui}</Sidebar>
    </Sidebar.Provider>,
  );
}

// ---------------------------------------------------------------------------
// Sidebar.Collapsible (item-level)
// ---------------------------------------------------------------------------

describe("Sidebar.Collapsible", () => {
  beforeEach(() => mockDesktopViewport());

  it("renders content when defaultOpen is true", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent>
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    // Content is in the DOM (grid-rows animation keeps it mounted)
    expect(screen.getByText("Workers")).toBeTruthy();
  });

  it("renders content in DOM even when defaultOpen is false (grid-rows keeps it mounted)", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen={false}>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent>
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    // Content is still in the DOM (visually collapsed via grid-rows-[0fr])
    expect(screen.getByText("Workers")).toBeTruthy();
  });

  it("trigger has aria-expanded reflecting open state", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent>
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const trigger = screen.getByRole("button", { name: /Compute/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("trigger aria-expanded is false when collapsed", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen={false}>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent>
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const trigger = screen.getByRole("button", { name: /Compute/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("collapsible content wrapper has data-sidebar attribute", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent data-testid="collapse-content">
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("collapse-content");
    expect(content.getAttribute("data-sidebar")).toBe("collapsible-content");
  });

  // --- Semantic hiding on collapsed content ---

  it("collapsed content has aria-hidden=true when closed", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen={false}>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent data-testid="cc">
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("cc");
    expect(content.getAttribute("aria-hidden")).toBe("true");
  });

  it("collapsed content has inert attribute when closed", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen={false}>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent data-testid="cc">
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("cc");
    expect(content.getAttribute("inert")).toBeDefined();
  });

  it("open content does not have aria-hidden", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent data-testid="cc">
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("cc");
    expect(content.getAttribute("aria-hidden")).toBe("false");
  });

  it("open content does not have inert", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent data-testid="cc">
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("cc");
    expect(content.hasAttribute("inert")).toBe(false);
  });

  it("trigger has aria-controls pointing to content id", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.Collapsible defaultOpen>
              <Sidebar.CollapsibleTrigger
                render={<Sidebar.MenuButton>Compute</Sidebar.MenuButton>}
              />
              <Sidebar.CollapsibleContent data-testid="cc">
                <Sidebar.MenuSub>
                  <Sidebar.MenuSubButton>Workers</Sidebar.MenuSubButton>
                </Sidebar.MenuSub>
              </Sidebar.CollapsibleContent>
            </Sidebar.Collapsible>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const trigger = screen.getByRole("button", { name: /Compute/i });
    const content = screen.getByTestId("cc");
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(content.id).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Sidebar.Group (collapsible)
// ---------------------------------------------------------------------------

describe("Sidebar.Group collapsible", () => {
  beforeEach(() => mockDesktopViewport());

  it("renders group content when collapsible and defaultOpen", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Group collapsible defaultOpen>
          <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuButton>Compute</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>,
    );

    expect(screen.getByText("Compute")).toBeTruthy();
  });

  it("group content stays in DOM when defaultOpen is false (grid-rows keeps it mounted)", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Group collapsible defaultOpen={false}>
          <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuButton>Compute</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>,
    );

    // Content is in the DOM (collapsed visually via grid-rows-[0fr])
    expect(screen.getByText("Compute")).toBeTruthy();
  });

  it("group label trigger has aria-expanded=true when open", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Group collapsible defaultOpen>
          <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuButton>Compute</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>,
    );

    const trigger = screen.getByRole("button", { name: /Build/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("group label trigger has aria-expanded=false when collapsed", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Group collapsible defaultOpen={false}>
          <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuButton>Compute</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>,
    );

    const trigger = screen.getByRole("button", { name: /Build/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  // --- Semantic hiding on collapsed group content ---

  it("collapsed group content has aria-hidden=true when closed", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Group collapsible defaultOpen={false}>
          <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
          <Sidebar.GroupContent data-testid="gc">
            <Sidebar.Menu>
              <Sidebar.MenuButton>Compute</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("gc");
    expect(content.getAttribute("aria-hidden")).toBe("true");
  });

  it("collapsed group content has inert attribute when closed", () => {
    renderDesktopSidebar(
      <Sidebar.Content>
        <Sidebar.Group collapsible defaultOpen={false}>
          <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
          <Sidebar.GroupContent data-testid="gc">
            <Sidebar.Menu>
              <Sidebar.MenuButton>Compute</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>,
    );

    const content = screen.getByTestId("gc");
    expect(content.getAttribute("inert")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Peeking behavior
// ---------------------------------------------------------------------------

describe("Sidebar peeking", () => {
  beforeEach(() => mockDesktopViewport());

  it("sidebar is in collapsed state when defaultOpen=false", () => {
    renderCollapsedSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuButton>Home</Sidebar.MenuButton>
        </Sidebar.Menu>
      </Sidebar.Content>,
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']");
    expect(sidebar?.getAttribute("data-state")).toBe("collapsed");
  });

  it("sidebar enters peeking state on mouseenter when peekable and collapsed", () => {
    renderCollapsedSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuButton>Home</Sidebar.MenuButton>
        </Sidebar.Menu>
      </Sidebar.Content>,
      { peekable: true },
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");

    fireEvent.mouseEnter(sidebar);

    expect(sidebar.getAttribute("data-state")).toBe("peeking");
  });

  it("sidebar exits peeking state on mouseleave", () => {
    renderCollapsedSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuButton>Home</Sidebar.MenuButton>
        </Sidebar.Menu>
      </Sidebar.Content>,
      { peekable: true },
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;

    fireEvent.mouseEnter(sidebar);
    expect(sidebar.getAttribute("data-state")).toBe("peeking");

    fireEvent.mouseLeave(sidebar);
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
  });

  it("does not enter peeking state when peekable=false", () => {
    renderCollapsedSidebar(
      <Sidebar.Content>
        <Sidebar.Menu>
          <Sidebar.MenuButton>Home</Sidebar.MenuButton>
        </Sidebar.Menu>
      </Sidebar.Content>,
      { peekable: false },
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;

    fireEvent.mouseEnter(sidebar);
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
  });

  it("does not peek when sidebar is expanded", () => {
    mockDesktopViewport();
    render(
      <Sidebar.Provider defaultOpen peekable className="min-h-0 h-full">
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuButton>Home</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;
    expect(sidebar.getAttribute("data-state")).toBe("expanded");

    fireEvent.mouseEnter(sidebar);
    // Should remain expanded, not switch to peeking
    expect(sidebar.getAttribute("data-state")).toBe("expanded");
  });
});

// ---------------------------------------------------------------------------
// Footer peek prevention
// ---------------------------------------------------------------------------

describe("Sidebar.Footer peek prevention", () => {
  beforeEach(() => mockDesktopViewport());

  it("hovering the footer does not leave sidebar in peeking state", () => {
    renderCollapsedSidebar(
      <>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuButton>Home</Sidebar.MenuButton>
          </Sidebar.Menu>
        </Sidebar.Content>
        <Sidebar.Footer data-testid="footer">
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </>,
      { peekable: true },
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;
    const footer = screen.getByTestId("footer");

    // In a real browser, entering the sidebar via the footer fires mouseenter
    // on both the aside and the footer. The footer's handler calls stopPeek(),
    // and React 18 batches both updates. Net effect: no peek.
    fireEvent.mouseEnter(sidebar);
    fireEvent.mouseEnter(footer);

    // Should be collapsed — footer cancels any peek
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
  });

  it("moving mouse from content to footer cancels active peek", () => {
    renderCollapsedSidebar(
      <>
        <Sidebar.Content>
          <Sidebar.Menu>
            <Sidebar.MenuButton>Home</Sidebar.MenuButton>
          </Sidebar.Menu>
        </Sidebar.Content>
        <Sidebar.Footer data-testid="footer">
          <Sidebar.Trigger />
        </Sidebar.Footer>
      </>,
      { peekable: true },
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;
    const footer = screen.getByTestId("footer");

    // Start peek via sidebar content area
    fireEvent.mouseEnter(sidebar);
    expect(sidebar.getAttribute("data-state")).toBe("peeking");

    // Move to footer — should cancel the peek
    fireEvent.mouseEnter(footer);
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
  });
});

// ---------------------------------------------------------------------------
// Sidebar.Trigger
// ---------------------------------------------------------------------------

describe("Sidebar.Trigger", () => {
  beforeEach(() => mockDesktopViewport());

  it("has aria-expanded=true when sidebar is open", () => {
    render(
      <Sidebar.Provider defaultOpen className="min-h-0 h-full">
        <Sidebar>
          <Sidebar.Footer>
            <Sidebar.Trigger data-testid="trigger" />
          </Sidebar.Footer>
        </Sidebar>
      </Sidebar.Provider>,
    );

    const trigger = screen.getByTestId("trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("has aria-expanded=false when sidebar is collapsed", () => {
    renderCollapsedSidebar(
      <Sidebar.Footer>
        <Sidebar.Trigger data-testid="trigger" />
      </Sidebar.Footer>,
    );

    const trigger = screen.getByTestId("trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("has dynamic aria-label based on open state", () => {
    renderCollapsedSidebar(
      <Sidebar.Footer>
        <Sidebar.Trigger data-testid="trigger" />
      </Sidebar.Footer>,
    );

    const trigger = screen.getByTestId("trigger");
    expect(trigger.getAttribute("aria-label")).toBe("Expand sidebar");
  });

  it("renders animated panel icon by default", () => {
    renderDesktopSidebar(
      <Sidebar.Footer>
        <Sidebar.Trigger data-testid="trigger" />
      </Sidebar.Footer>,
    );

    const trigger = screen.getByTestId("trigger");
    const svg = trigger.querySelector("svg");
    expect(svg).toBeTruthy();
    // Should have the animated divider path
    expect(svg?.querySelectorAll("path").length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Keyboard shortcut
// ---------------------------------------------------------------------------

describe("Sidebar keyboard shortcut", () => {
  beforeEach(() => mockDesktopViewport());

  it("mod+b toggles sidebar when keyboardShortcut is configured", () => {
    render(
      <Sidebar.Provider
        defaultOpen
        keyboardShortcut="mod+b"
        className="min-h-0 h-full"
      >
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Menu>
              <Sidebar.MenuButton>Home</Sidebar.MenuButton>
            </Sidebar.Menu>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>,
    );

    const sidebar = document.querySelector("[data-sidebar='sidebar']") as HTMLElement;
    expect(sidebar.getAttribute("data-state")).toBe("expanded");

    // Simulate Ctrl+B (non-Mac in happy-dom)
    fireEvent.keyDown(document, { key: "b", ctrlKey: true });
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");

    // Toggle back
    fireEvent.keyDown(document, { key: "b", ctrlKey: true });
    expect(sidebar.getAttribute("data-state")).toBe("expanded");
  });
});

// ---------------------------------------------------------------------------
// Sidebar.SlidingViews accessibility
// ---------------------------------------------------------------------------

describe("Sidebar.SlidingViews", () => {
  beforeEach(() => mockDesktopViewport());

  it("active view does not have aria-hidden", () => {
    renderDesktopSidebar(
      <Sidebar.SlidingViews activeKey="account">
        <Sidebar.SlidingView value="account">
          <div>Account Nav</div>
        </Sidebar.SlidingView>
        <Sidebar.SlidingView value="zone">
          <div>Zone Nav</div>
        </Sidebar.SlidingView>
      </Sidebar.SlidingViews>,
    );

    const accountView = screen.getByText("Account Nav").closest("[data-sidebar='sliding-view']");
    expect(accountView?.getAttribute("aria-hidden")).toBe("false");
  });

  it("inactive view has aria-hidden=true", () => {
    renderDesktopSidebar(
      <Sidebar.SlidingViews activeKey="account">
        <Sidebar.SlidingView value="account">
          <div>Account Nav</div>
        </Sidebar.SlidingView>
        <Sidebar.SlidingView value="zone">
          <div>Zone Nav</div>
        </Sidebar.SlidingView>
      </Sidebar.SlidingViews>,
    );

    const zoneView = screen.getByText("Zone Nav").closest("[data-sidebar='sliding-view']");
    expect(zoneView?.getAttribute("aria-hidden")).toBe("true");
  });

  it("inactive view has inert attribute", () => {
    renderDesktopSidebar(
      <Sidebar.SlidingViews activeKey="account">
        <Sidebar.SlidingView value="account">
          <div>Account Nav</div>
        </Sidebar.SlidingView>
        <Sidebar.SlidingView value="zone">
          <div>Zone Nav</div>
        </Sidebar.SlidingView>
      </Sidebar.SlidingViews>,
    );

    const zoneView = screen.getByText("Zone Nav").closest("[data-sidebar='sliding-view']");
    // React renders inert="" as a string attribute; check it exists in the DOM
    expect(zoneView?.getAttribute("inert")).toBeDefined();
  });

  it("active view does not have inert attribute", () => {
    renderDesktopSidebar(
      <Sidebar.SlidingViews activeKey="account">
        <Sidebar.SlidingView value="account">
          <div>Account Nav</div>
        </Sidebar.SlidingView>
        <Sidebar.SlidingView value="zone">
          <div>Zone Nav</div>
        </Sidebar.SlidingView>
      </Sidebar.SlidingViews>,
    );

    const accountView = screen.getByText("Account Nav").closest("[data-sidebar='sliding-view']");
    expect(accountView?.hasAttribute("inert")).toBe(false);
  });
});
