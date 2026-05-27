import { Sidebar, useSidebar, DropdownMenu, type SidebarState } from "@cloudflare/kumo";
import {
  HouseIcon,
  GlobeIcon,
  GearIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DatabaseIcon,
  CodeIcon,
  LockIcon,
  CubeIcon,
  BellIcon,
  CaretUpDownIcon,
  CheckIcon,
  StackIcon,
  StackSimpleIcon,
  UserIcon,
  ArrowsLeftRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function DemoContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-lg border border-kumo-line bg-kumo-base">
      {children}
    </div>
  );
}

function DemoMain({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-kumo-subtle text-base">
      {children ?? "Main content area"}
    </main>
  );
}

function BrandLogo() {
  return (
    <div className="flex w-full min-w-0 items-center gap-2 px-3 group-data-[state=collapsed]/sidebar:px-2 transition-[padding] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)">
      <CubeIcon className="size-4 shrink-0 text-kumo-brand" weight="duotone" />
      <span className="flex-1 text-sm font-semibold text-kumo-strong truncate">
        Company
      </span>
    </div>
  );
}

const accounts = [
  { id: "1", name: "Company", icon: CubeIcon },
  { id: "2", name: "Personal", icon: StackIcon },
  { id: "3", name: "Staging", icon: StackSimpleIcon },
];

function AccountSwitcher() {
  const [active, setActive] = useState(accounts[0]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <button
            type="button"
            className="cursor-pointer flex w-full min-w-0 items-center gap-2 rounded-lg px-3 group-data-[state=collapsed]/sidebar:px-1.5 py-2 text-left text-sm font-medium text-kumo-default hover:bg-kumo-tint focus-visible:ring-1 focus-visible:ring-kumo-line outline-none transition-[padding] duration-(--sidebar-animation-duration) ease-(--sidebar-easing)"
          >
            <active.icon
              className="size-4 shrink-0 text-kumo-brand"
              weight="duotone"
            />
            <span className="flex flex-1 items-center min-w-0 text-left overflow-hidden">
              {active.name}
            </span>
            <span className="shrink-0 overflow-hidden transition-[width] duration-(--sidebar-animation-duration) ease-(--sidebar-easing) w-4 group-data-[state=collapsed]/sidebar:w-0">
              <CaretUpDownIcon className="size-4 text-kumo-subtle" />
            </span>
          </button>
        }
      />
      <DropdownMenu.Content className="w-(--anchor-width)">
        {accounts.map((account) => (
          <DropdownMenu.Item
            key={account.id}
            className="gap-2 cursor-pointer"
            onClick={() => setActive(account)}
          >
            <account.icon className="size-4 text-kumo-brand" weight="duotone" />
            {account.name}
            {account.id === active.id && (
              <CheckIcon className="ml-auto size-4" />
            )}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// 1. Basic — absolute minimum: no header, no footer
// ---------------------------------------------------------------------------

/** Minimal sidebar with groups and active state. No header or footer. */
export function SidebarBasicDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={GlobeIcon}>
                  Domains
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.Collapsible defaultOpen>
                    <Sidebar.CollapsibleTrigger
                      render={
                        <Sidebar.MenuButton icon={CodeIcon}>
                          Compute
                          <Sidebar.MenuChevron />
                        </Sidebar.MenuButton>
                      }
                    />
                    <Sidebar.CollapsibleContent>
                      <Sidebar.MenuSub>
                        <Sidebar.MenuSubItem>
                          <Sidebar.Collapsible>
                            <Sidebar.CollapsibleTrigger
                              render={
                                <Sidebar.MenuSubButton>
                                  Workers & Pages
                                  <Sidebar.MenuChevron />
                                </Sidebar.MenuSubButton>
                              }
                            />
                            <Sidebar.CollapsibleContent>
                              <Sidebar.MenuSub>
                                <Sidebar.MenuSubButton>
                                  Overview
                                </Sidebar.MenuSubButton>
                                <Sidebar.MenuSubButton>
                                  Workers
                                </Sidebar.MenuSubButton>
                                <Sidebar.MenuSubButton>
                                  Pages
                                </Sidebar.MenuSubButton>
                              </Sidebar.MenuSub>
                            </Sidebar.CollapsibleContent>
                          </Sidebar.Collapsible>
                        </Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton>
                          Durable Objects
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSub>
                    </Sidebar.CollapsibleContent>
                  </Sidebar.Collapsible>
                </Sidebar.MenuItem>
                <Sidebar.MenuButton icon={DatabaseIcon}>
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 2. Toggle — expand/collapse with trigger + tooltips
// ---------------------------------------------------------------------------

function ToggleButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="cursor-pointer rounded-lg border border-kumo-line bg-kumo-base px-3 py-1.5 text-base text-kumo-default transition-colors hover:bg-kumo-tint"
    >
      {state === "expanded" ? "Collapse" : "Expand"}
    </button>
  );
}

/** Interactive demo showing expand/collapse toggle with tooltips in collapsed state. */
export function SidebarToggleDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} tooltip="Home" active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon} tooltip="Analytics">
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={CodeIcon} tooltip="Compute">
                  Compute
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon} tooltip="Storage">
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <ToggleButton />
          <p>
            Click the button or the sidebar trigger to toggle
          </p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 3. Resizable — drag handle with auto-collapse
// ---------------------------------------------------------------------------

/** Resizable sidebar with drag handle. Drag the right edge to resize. */
export function SidebarResizableDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained
        defaultOpen
        resizable
        defaultWidth={240}
        minWidth={180}
        maxWidth={400}
        className="min-h-0! h-full"
      >
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon}>
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
          <Sidebar.ResizeHandle />
        </Sidebar>
        <DemoMain>
          <p>Drag the sidebar edge to resize</p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 4. Right Side — right-aligned, content only
// ---------------------------------------------------------------------------

/** Right-side sidebar variant. */
export function SidebarRightDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen side="right" className="min-h-0! h-full">
        <DemoMain />
        <Sidebar>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Details</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={GearIcon} active>
                  Properties
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Metrics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={BellIcon}>Alerts</Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 5. Peeking — hover to temporarily expand collapsed sidebar
// ---------------------------------------------------------------------------

function PeekStateIndicator() {
  const { state } = useSidebar();
  const labels: Record<SidebarState, string> = {
    expanded: "Expanded",
    collapsed: "Collapsed",
    peeking: "Peeking",
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text font-medium text-kumo-default">
        State: {labels[state]}
      </span>
      <p>Collapse, then hover the sidebar to peek</p>
    </div>
  );
}

/** Peekable sidebar that temporarily expands on hover when collapsed. */
export function SidebarPeekingDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen peekable className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header>
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} tooltip="Home" active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon} tooltip="Analytics">
                  Analytics
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={CodeIcon} tooltip="Compute">
                  Compute
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={DatabaseIcon} tooltip="Storage">
                  Storage
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <PeekStateIndicator />
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 6. Sliding Views — animated horizontal transitions between surfaces
// ---------------------------------------------------------------------------

/** Sidebar with animated sliding views between Account and Zone navigation. */
export function SidebarSlidingViewsDemo() {
  const [surface, setSurface] = useState<"account" | "zone">("account");

  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header>
            <button
              type="button"
              onClick={() =>
                setSurface((s) => (s === "account" ? "zone" : "account"))
              }
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-kumo-default hover:bg-kumo-tint transition-colors"
            >
              <ArrowsLeftRightIcon className="size-4 shrink-0 text-kumo-brand" />
              <span className="flex-1 text-left font-semibold text-kumo-strong">
                {surface === "account" ? "Account Nav" : "Zone Nav"}
              </span>
            </button>
          </Sidebar.Header>

          <Sidebar.SlidingViews
            activeKey={surface}
            direction={surface === "zone" ? "left" : "right"}
          >
            <Sidebar.SlidingView value="account">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={UserIcon}>
                      Members
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={GearIcon}>
                      Settings
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>

            <Sidebar.SlidingView value="zone">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>Zone</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={GlobeIcon} active>
                      Overview
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={LockIcon}>
                      SSL/TLS
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Caching
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>
          </Sidebar.SlidingViews>
        </Sidebar>
        <DemoMain>
          <div className="flex flex-col items-center gap-2">
            <p className="font-medium text-kumo-default">
              Active: {surface === "account" ? "Account" : "Zone"} surface
            </p>
            <p>
              Click the header button to slide between views
            </p>
          </div>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 7. Full — kitchen sink showcasing every subcomponent
// ---------------------------------------------------------------------------

/** Kitchen sink sidebar showcasing every subcomponent: header with account switcher, groups with labels, collapsible sections with nested expandable, badges, sliding views via Domains, and a footer trigger. */
export function SidebarFullDemo() {
  const [surface, setSurface] = useState<"account" | "domain">("account");

  return (
    <DemoContainer>
      <Sidebar.Provider contained defaultOpen peekable className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header>
            <AccountSwitcher />
          </Sidebar.Header>
          <Sidebar.SlidingViews
            activeKey={surface}
            direction={surface === "domain" ? "left" : "right"}
          >
            <Sidebar.SlidingView value="account">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton
                      icon={MagnifyingGlassIcon}
                      tooltip="Search"
                      className="ring ring-kumo-line group-data-[state=collapsed]/sidebar:ring-transparent"
                    >
                      Quick search&hellip;
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
                <Sidebar.Group>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics & Logs
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton
                      icon={GlobeIcon}
                      onClick={() => setSurface("domain")}
                    >
                      Domains
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Group>
                  <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuItem>
                      <Sidebar.Collapsible defaultOpen>
                        <Sidebar.CollapsibleTrigger
                          render={
                            <Sidebar.MenuButton icon={CodeIcon}>
                              Compute
                              <Sidebar.MenuChevron />
                            </Sidebar.MenuButton>
                          }
                        />
                        <Sidebar.CollapsibleContent>
                          <Sidebar.MenuSub>
                            <Sidebar.MenuSubItem>
                              <Sidebar.Collapsible>
                                <Sidebar.CollapsibleTrigger
                                  render={
                                    <Sidebar.MenuSubButton>
                                      Workers & Pages
                                      <Sidebar.MenuChevron />
                                    </Sidebar.MenuSubButton>
                                  }
                                />
                                <Sidebar.CollapsibleContent>
                                  <Sidebar.MenuSub>
                                    <Sidebar.MenuSubButton>
                                      Overview
                                    </Sidebar.MenuSubButton>
                                    <Sidebar.MenuSubButton>
                                      Workers
                                    </Sidebar.MenuSubButton>
                                    <Sidebar.MenuSubButton>
                                      Pages
                                    </Sidebar.MenuSubButton>
                                  </Sidebar.MenuSub>
                                </Sidebar.CollapsibleContent>
                              </Sidebar.Collapsible>
                            </Sidebar.MenuSubItem>
                            <Sidebar.MenuSubButton>
                              Durable Objects
                            </Sidebar.MenuSubButton>
                            <Sidebar.MenuSubButton>
                              Containers
                              <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSub>
                        </Sidebar.CollapsibleContent>
                      </Sidebar.Collapsible>
                    </Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>

                <Sidebar.Group>
                  <Sidebar.GroupLabel>Protect & Connect</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={LockIcon}>
                      Zero Trust
                      <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>

            <Sidebar.SlidingView value="domain">
              <Sidebar.Content>
                <Sidebar.Group>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton
                      icon={ArrowLeftIcon}
                      onClick={() => setSurface("account")}
                    >
                      Back
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
                <Sidebar.Group>
                  <Sidebar.GroupLabel>example.com</Sidebar.GroupLabel>
                  <Sidebar.Menu>
                    <Sidebar.MenuButton icon={GlobeIcon} active>
                      Overview
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={LockIcon}>
                      SSL/TLS
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Caching
                    </Sidebar.MenuButton>
                  </Sidebar.Menu>
                </Sidebar.Group>
              </Sidebar.Content>
            </Sidebar.SlidingView>
          </Sidebar.SlidingViews>

          <Sidebar.Footer>
            <Sidebar.Trigger />
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}
