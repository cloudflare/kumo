import { Sidebar, useSidebar, DropdownMenu } from "@cloudflare/kumo";
import {
  HouseIcon,
  GlobeIcon,
  GearIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DatabaseIcon,
  CodeIcon,
  LockIcon,
  CloudIcon,
  BellIcon,
  CaretUpDownIcon,
  CheckIcon,
  RocketIcon,
  FlaskIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function DemoContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-lg border border-kumo-hairline bg-kumo-base">
      {children}
    </div>
  );
}

function DemoMain({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-kumo-subtle">
      {children ?? "Main content area"}
    </main>
  );
}

function BrandLogo() {
  return (
    <div className="flex w-full min-w-0 items-center gap-2 px-3 group-data-[state=collapsed]/sidebar:px-2 transition-[padding] duration-250 ease-[cubic-bezier(0.77,0,0.175,1)]">
      <div className="size-4 shrink-0 rounded bg-kumo-brand" />
      <span className="text-sm font-semibold text-kumo-strong truncate group-data-[state=collapsed]/sidebar:hidden">
        Acme Inc
      </span>
    </div>
  );
}

const accounts = [
  { id: "1", name: "Acme Inc", icon: CloudIcon },
  { id: "2", name: "Personal", icon: RocketIcon },
  { id: "3", name: "Staging", icon: FlaskIcon },
];

function AccountSwitcher() {
  const [active, setActive] = useState(accounts[0]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <button
            type="button"
            className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-kumo-default hover:bg-kumo-tint focus-visible:ring-1 focus-visible:ring-kumo-hairline outline-none transition-[color,background-color,padding] duration-250 ease-[cubic-bezier(0.77,0,0.175,1)] group-data-[state=collapsed]/sidebar:px-2"
          >
            <active.icon
              className="size-4 shrink-0 text-kumo-brand"
              weight="fill"
            />
            <span className="flex-1 truncate text-left font-semibold text-kumo-strong group-data-[state=collapsed]/sidebar:hidden">
              {active.name}
            </span>
            <CaretUpDownIcon className="size-4 shrink-0 text-kumo-subtle group-data-[state=collapsed]/sidebar:hidden" />
          </button>
        }
      />
      <DropdownMenu.Content className="w-[var(--anchor-width)]">
        {accounts.map((account) => (
          <DropdownMenu.Item
            key={account.id}
            className="gap-2"
            onClick={() => setActive(account)}
          >
            <account.icon className="size-4 text-kumo-brand" weight="fill" />
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
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
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
                        <Sidebar.MenuSubButton>
                          Workers & Pages
                        </Sidebar.MenuSubButton>
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
// 2. Collapsible Groups — group-level collapse via label click
// ---------------------------------------------------------------------------

/** Sidebar with collapsible groups that animate open/closed via the group label. */
export function SidebarCollapsibleGroupDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Content>
            {/* GroupContent is required for collapsible groups (provides grid-rows animation) */}
            <Sidebar.Group collapsible defaultOpen>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
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
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Group collapsible defaultOpen>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuButton icon={CodeIcon}>
                    Compute
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={DatabaseIcon}>
                    Storage
                  </Sidebar.MenuButton>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Group collapsible defaultOpen={false}>
              <Sidebar.GroupLabel>Protect & Connect</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuButton icon={ShieldCheckIcon}>
                    Security
                  </Sidebar.MenuButton>
                  <Sidebar.MenuButton icon={LockIcon}>
                    Zero Trust
                  </Sidebar.MenuButton>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 3. Toggle — expand/collapse with trigger + tooltips
// ---------------------------------------------------------------------------

function ToggleButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="rounded-lg border border-kumo-hairline bg-kumo-base px-3 py-1.5 text-sm text-kumo-default transition-colors hover:bg-kumo-tint"
    >
      {state === "expanded" ? "Collapse" : "Expand"}
    </button>
  );
}

/** Interactive demo showing expand/collapse toggle with tooltips in collapsed state. */
export function SidebarToggleDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
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
          <p className="text-sm">
            Click the button or the sidebar trigger to toggle
          </p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 4. Full — kitchen sink: header, account switcher, search, badges, footer
// ---------------------------------------------------------------------------

/** Sidebar with account switcher, search input, badges, and full navigation. */
export function SidebarFullDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header>
            <AccountSwitcher />
          </Sidebar.Header>

          <Sidebar.Content>
            <div className="px-1 pb-2">
              <Sidebar.Input placeholder="Quick search..." shortcut="⌘K" />
            </div>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.Menu>
                <Sidebar.MenuButton icon={HouseIcon} active>
                  Home
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={ChartBarIcon}>
                  Analytics & Logs
                </Sidebar.MenuButton>
                <Sidebar.MenuButton icon={GlobeIcon}>
                  Domains
                </Sidebar.MenuButton>
              </Sidebar.Menu>
            </Sidebar.Group>

            <Sidebar.Separator />

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
                        <Sidebar.MenuSubButton>
                          Workers & Pages
                        </Sidebar.MenuSubButton>
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

          <Sidebar.Footer>
            <Sidebar.MenuButton icon={GearIcon}>
              Manage account
            </Sidebar.MenuButton>
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 5. Resizable — drag handle with auto-collapse
// ---------------------------------------------------------------------------

/** Resizable sidebar with drag handle. Drag the right edge to resize. */
export function SidebarResizableDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider
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
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
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
          <p className="text-sm">Drag the sidebar edge to resize</p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

// ---------------------------------------------------------------------------
// 6. Right Side — right-aligned, content only
// ---------------------------------------------------------------------------

/** Right-side sidebar variant. */
export function SidebarRightDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen side="right" className="min-h-0! h-full">
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
