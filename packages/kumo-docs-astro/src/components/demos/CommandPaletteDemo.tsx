import { useState } from "react";
import { CommandPalette, Button } from "@cloudflare/kumo";
import {
  GearIcon,
  FileIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  HouseIcon,
  ChartLineIcon,
  UsersIcon,
} from "@phosphor-icons/react";

// Types for our demo data
interface CommandItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

// Sample data
const sampleGroups: CommandGroup[] = [
  {
    id: "commands",
    label: "Commands",
    items: [
      {
        id: "new-project",
        title: "Create New Project",
        icon: <FolderIcon size={16} />,
      },
      { id: "settings", title: "Open Settings", icon: <GearIcon size={16} /> },
      {
        id: "search",
        title: "Search Files",
        icon: <MagnifyingGlassIcon size={16} />,
      },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    items: [
      { id: "home", title: "Home", icon: <HouseIcon size={16} /> },
      {
        id: "dashboard",
        title: "Dashboard",
        icon: <ChartLineIcon size={16} />,
      },
      { id: "users", title: "Users", icon: <UsersIcon size={16} /> },
    ],
  },
];

// Helper to flatten groups into selectable items
const getSelectableItems = (groups: CommandGroup[]) =>
  groups.flatMap((group) => group.items);

export function CommandPaletteBasicDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSelect = (item: CommandItem) => {
    setSelectedItem(item.title);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      {selectedItem && (
        <p className="text-sm text-kumo-subtle">
          Last selected:{" "}
          <span className="text-kumo-default">{selectedItem}</span>
        </p>
      )}

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={sampleGroups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        onSelect={(item, { newTab }) => {
          console.log("Selected:", item.title, newTab ? "(new tab)" : "");
          handleSelect(item);
        }}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Type a command or search..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(group: CommandGroup) => (
              <CommandPalette.Group key={group.id}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: CommandItem) => (
                    <CommandPalette.Item
                      key={item.id}
                      value={item}
                      onClick={() => handleSelect(item)}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon && (
                          <span className="text-kumo-subtle">{item.icon}</span>
                        )}
                        <span>{item.title}</span>
                      </span>
                    </CommandPalette.Item>
                  )}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No commands found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↵
            </kbd>
            <span>Select</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}

// Simple flat list example
interface SimpleItem {
  id: string;
  title: string;
}

const simpleItems: SimpleItem[] = [
  { id: "1", title: "Copy" },
  { id: "2", title: "Paste" },
  { id: "3", title: "Cut" },
  { id: "4", title: "Delete" },
  { id: "5", title: "Select All" },
];

export function CommandPaletteSimpleDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Simple Palette</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={simpleItems}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        onSelect={(item) => {
          console.log("Selected:", item.title);
          setOpen(false);
        }}
        getSelectableItems={(items) => items}
      >
        <CommandPalette.Input placeholder="Search actions..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SimpleItem) => (
              <CommandPalette.Item
                key={item.id}
                value={item}
                onClick={() => {
                  console.log("Clicked:", item.title);
                  setOpen(false);
                }}
              >
                {item.title}
              </CommandPalette.Item>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No actions found</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

// With loading state
export function CommandPaletteLoadingDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpen = () => {
    setOpen(true);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div>
      <Button onClick={handleOpen}>Open with Loading</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={loading ? [] : sampleGroups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Search..." />
        <CommandPalette.List>
          {loading ? (
            <CommandPalette.Loading />
          ) : (
            <>
              <CommandPalette.Results>
                {(group: CommandGroup) => (
                  <CommandPalette.Group key={group.id}>
                    <CommandPalette.GroupLabel>
                      {group.label}
                    </CommandPalette.GroupLabel>
                    <CommandPalette.Items>
                      {(item: CommandItem) => (
                        <CommandPalette.Item
                          key={item.id}
                          value={item}
                          onClick={() => setOpen(false)}
                        >
                          <span className="flex items-center gap-3">
                            {item.icon && (
                              <span className="text-kumo-subtle">
                                {item.icon}
                              </span>
                            )}
                            <span>{item.title}</span>
                          </span>
                        </CommandPalette.Item>
                      )}
                    </CommandPalette.Items>
                  </CommandPalette.Group>
                )}
              </CommandPalette.Results>
              <CommandPalette.Empty>No results found</CommandPalette.Empty>
            </>
          )}
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

// ResultItem with breadcrumbs and highlights
interface SearchResult {
  id: string;
  title: string;
  breadcrumbs: string[];
  icon?: React.ReactNode;
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "Button",
    breadcrumbs: ["Components"],
    icon: <FileIcon size={16} />,
  },
  {
    id: "2",
    title: "Dialog",
    breadcrumbs: ["Components"],
    icon: <FileIcon size={16} />,
  },
  {
    id: "3",
    title: "Page Header",
    breadcrumbs: ["Blocks"],
    icon: <FileIcon size={16} />,
  },
];

export function CommandPaletteResultItemDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open with ResultItem</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={searchResults}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        getSelectableItems={(items) => items}
      >
        <CommandPalette.Input placeholder="Search documentation..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SearchResult) => (
              <CommandPalette.ResultItem
                key={item.id}
                value={item}
                title={item.title}
                breadcrumbs={item.breadcrumbs}
                icon={item.icon}
                onClick={() => {
                  console.log("Navigate to:", item.title);
                  setOpen(false);
                }}
              />
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No pages found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-line bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ⌘↵
            </kbd>
            <span>Open in new tab</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}
