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
} from "@phosphor-icons/react";
import { useState } from "react";

function BrandLogo() {
  return (
    <>
      <span className="text-lg font-semibold text-kumo-strong group-data-[state=collapsed]/sidebar:hidden">
        Acme Inc
      </span>
      <span className="text-lg font-semibold text-kumo-strong group-data-[state=expanded]/sidebar:hidden">
        A
      </span>
    </>
  );
}

function DemoContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-lg border border-kumo-line bg-kumo-base">
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

const accounts = [
  { id: "1", name: "Acme Inc", icon: CloudIcon },
  { id: "2", name: "Personal", icon: CloudIcon },
  { id: "3", name: "Staging", icon: CloudIcon },
];

function AccountSwitcher() {
  const [active, setActive] = useState(accounts[0]);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-kumo-overlay"
          >
            <active.icon
              className="size-5 shrink-0 text-kumo-brand"
              weight="fill"
            />
            <span className="flex-1 truncate text-sm font-semibold text-kumo-strong group-data-[state=collapsed]/sidebar:hidden">
              {active.name}
            </span>
            <CaretUpDownIcon className="size-4 shrink-0 text-kumo-strong group-data-[state=collapsed]/sidebar:hidden" />
          </button>
        }
      />
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>Accounts</DropdownMenu.Label>
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
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

/** Basic sidebar with navigation groups, collapsible sub-menus, and active state. */
export function SidebarBasicDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header className="p-4">
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
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
                            <Sidebar.MenuSubButton>
                              Workers & Pages
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                          <Sidebar.MenuSubItem>
                            <Sidebar.MenuSubButton>
                              Durable Objects
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                        </Sidebar.MenuSub>
                      </Sidebar.CollapsibleContent>
                    </Sidebar.Collapsible>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Trigger />
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

/** Sidebar with collapsible groups that animate open/closed via the group label. */
export function SidebarCollapsibleGroupDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header className="p-4">
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group collapsible defaultOpen>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={GlobeIcon}>
                      Domains
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Group collapsible defaultOpen>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={CodeIcon}>
                      Compute
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Group collapsible defaultOpen={false}>
              <Sidebar.GroupLabel>Protect & Connect</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={LockIcon}>
                      Zero Trust
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Trigger />
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

/** Sidebar collapsed to icon-only state. */
export function SidebarCollapsedDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen={false} className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header className="p-4">
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={HouseIcon} tooltip="Home" active>
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon} tooltip="Analytics">
                      Analytics
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={CodeIcon} tooltip="Compute">
                      Compute
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon} tooltip="Storage">
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={GlobeIcon} tooltip="Domains">
                      Domains
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Trigger />
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

function ToggleButton() {
  const { toggleSidebar, state } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="rounded-lg border border-kumo-line bg-kumo-base px-3 py-1.5 text-sm text-kumo-default transition-colors hover:bg-kumo-tint"
    >
      {state === "expanded" ? "Collapse" : "Expand"}
    </button>
  );
}

/** Interactive demo showing expand/collapse toggle. */
export function SidebarToggleDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header className="p-4">
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={HouseIcon} tooltip="Home" active>
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon} tooltip="Analytics">
                      Analytics
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon} tooltip="Storage">
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Trigger />
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain>
          <ToggleButton />
          <p className="text-sm">Click the button or the rail to toggle</p>
        </DemoMain>
      </Sidebar.Provider>
    </DemoContainer>
  );
}

/** Sidebar with account switcher, search input, badges, and full navigation. */
export function SidebarFullDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen className="min-h-0! h-full">
        <Sidebar>
          <Sidebar.Header className="px-2 py-3">
            <AccountSwitcher />
          </Sidebar.Header>

          <Sidebar.Content>
            <div className="px-1 pb-2">
              <Sidebar.Input placeholder="Quick search..." shortcut="⌘K" />
            </div>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics & Logs
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={GlobeIcon}>
                      Domains
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Separator />

            <Sidebar.Group>
              <Sidebar.GroupLabel>Build</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
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
                            <Sidebar.MenuSubButton>
                              Workers & Pages
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                          <Sidebar.MenuSubItem>
                            <Sidebar.MenuSubButton>
                              Durable Objects
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                          <Sidebar.MenuSubItem>
                            <Sidebar.MenuSubButton>
                              Containers
                              <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                            </Sidebar.MenuSubButton>
                          </Sidebar.MenuSubItem>
                        </Sidebar.MenuSub>
                      </Sidebar.CollapsibleContent>
                    </Sidebar.Collapsible>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>

            <Sidebar.Group>
              <Sidebar.GroupLabel>Protect & Connect</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ShieldCheckIcon}>
                      Security
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={LockIcon}>
                      Zero Trust
                      <Sidebar.MenuBadge>Beta</Sidebar.MenuBadge>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>

          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton icon={GearIcon}>
                  Manage account
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Footer>
        </Sidebar>
        <DemoMain />
      </Sidebar.Provider>
    </DemoContainer>
  );
}

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
          <Sidebar.Header className="p-4">
            <BrandLogo />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Overview</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={HouseIcon} active>
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Analytics
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={DatabaseIcon}>
                      Storage
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.Trigger />
              </Sidebar.MenuItem>
            </Sidebar.Menu>
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

/** Right-side sidebar variant. */
export function SidebarRightDemo() {
  return (
    <DemoContainer>
      <Sidebar.Provider defaultOpen side="right" className="min-h-0! h-full">
        <DemoMain />
        <Sidebar>
          <Sidebar.Header className="p-4">
            <span className="text-lg font-semibold text-kumo-strong">
              Details
            </span>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={GearIcon} active>
                      Properties
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={ChartBarIcon}>
                      Metrics
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton icon={BellIcon}>
                      Alerts
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
      </Sidebar.Provider>
    </DemoContainer>
  );
}
