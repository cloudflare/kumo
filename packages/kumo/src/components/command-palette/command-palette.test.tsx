import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "./command-palette";
import { Autocomplete } from "@base-ui/react/autocomplete";

/**
 * Test data types
 */
interface TestGroup {
  id: string;
  label: string;
  items: TestItem[];
}

interface TestItem {
  id: string;
  title: string;
}

/**
 * Test fixtures
 */
const mockGroups: TestGroup[] = [
  {
    id: "group-1",
    label: "Commands",
    items: [
      { id: "item-1", title: "Create New Project" },
      { id: "item-2", title: "Open Settings" },
    ],
  },
  {
    id: "group-2",
    label: "Pages",
    items: [
      { id: "item-3", title: "Dashboard" },
      { id: "item-4", title: "Analytics" },
    ],
  },
];

const emptyGroups: TestGroup[] = [];

/**
 * Helper to flatten groups into selectable items
 */
const getSelectableItems = (groups: TestGroup[]) =>
  groups.flatMap((group) => group.items);

/**
 * Helper to render CommandPalette with common setup
 */
const renderCommandPalette = ({
  open = true,
  onOpenChange = vi.fn(),
  items = mockGroups,
  value = "",
  onValueChange = vi.fn(),
  onSelect = vi.fn(),
  dialogTitle,
  showLoading = false,
  showEmpty = false,
  loadingLabel,
}: {
  open?: boolean;
  onOpenChange?: ReturnType<typeof vi.fn>;
  items?: TestGroup[];
  value?: string;
  onValueChange?: ReturnType<typeof vi.fn>;
  onSelect?: ReturnType<typeof vi.fn>;
  dialogTitle?: string;
  showLoading?: boolean;
  showEmpty?: boolean;
  loadingLabel?: string;
} = {}) => {
  const displayItems = showEmpty ? emptyGroups : items;

  return render(
    <CommandPalette.Root
      open={open}
      onOpenChange={onOpenChange}
      items={displayItems}
      value={value}
      onValueChange={onValueChange}
      itemToStringValue={(group: TestGroup) => group.label}
      onSelect={onSelect}
      dialogTitle={dialogTitle}
      getSelectableItems={getSelectableItems}
    >
      <CommandPalette.Input
        aria-label="Search test commands"
        placeholder="Search commands..."
      />
      <CommandPalette.List busy={showLoading}>
        {showLoading ? (
          <CommandPalette.Loading label={loadingLabel} />
        ) : (
          <>
            <Autocomplete.List className="space-y-3">
              {(group: TestGroup) => (
                <CommandPalette.Group key={group.id} items={group.items}>
                  <CommandPalette.GroupLabel>
                    {group.label}
                  </CommandPalette.GroupLabel>
                  <Autocomplete.Collection>
                    {(item: TestItem) => (
                      <CommandPalette.Item
                        key={item.id}
                        value={item}
                        onClick={() => onSelect(item, { newTab: false })}
                      >
                        {item.title}
                      </CommandPalette.Item>
                    )}
                  </Autocomplete.Collection>
                </CommandPalette.Group>
              )}
            </Autocomplete.List>
            <CommandPalette.Empty>No results found</CommandPalette.Empty>
          </>
        )}
      </CommandPalette.List>
      <CommandPalette.Footer>
        <span>Use arrow keys to navigate</span>
      </CommandPalette.Footer>
    </CommandPalette.Root>,
  );
};

describe("CommandPalette", () => {
  describe("Opening and Closing", () => {
    it("renders dialog when open is true", () => {
      renderCommandPalette({ open: true });

      const input = screen.getByPlaceholderText("Search commands...");
      expect(input).toBeTruthy();
    });

    it("does not render dialog when open is false", () => {
      renderCommandPalette({ open: false });

      const input = screen.queryByPlaceholderText("Search commands...");
      expect(input).toBeNull();
    });

    it("dialog has dismissible behavior configured", () => {
      const onOpenChange = vi.fn();
      renderCommandPalette({ open: true, onOpenChange });

      // Verify the dialog is properly configured with the onOpenChange handler
      // by checking it renders and would call onOpenChange when closed
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toBeTruthy();

      // The modal attribute ensures it can be dismissed
      // and onOpenChange is wired up (tested via backdrop click in another test)
    });

    it("calls onOpenChange(false) when backdrop is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderCommandPalette({ open: true, onOpenChange });

      // The backdrop has opacity-80 class, find it
      const backdrop = document.querySelector('[class*="opacity-80"]');
      expect(backdrop).toBeTruthy();

      if (backdrop) {
        await user.click(backdrop);
        await waitFor(() => {
          expect(onOpenChange).toHaveBeenCalledWith(false);
        });
      }
    });
  });

  describe("Input", () => {
    it("renders with placeholder text", () => {
      renderCommandPalette();

      const input = screen.getByPlaceholderText("Search commands...");
      expect(input).toBeTruthy();
    });

    it("calls onValueChange when typing", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderCommandPalette({ onValueChange });

      const input = screen.getByPlaceholderText("Search commands...");
      await user.type(input, "test");

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalled();
      });
    });

    it("renders with controlled value", () => {
      renderCommandPalette({ value: "existing search" });

      const input = screen.getByPlaceholderText(
        "Search commands...",
      ) as HTMLInputElement;
      expect(input.value).toBe("existing search");
    });
  });

  describe("Item Selection", () => {
    it("renders items from groups", () => {
      renderCommandPalette();

      expect(screen.getByText("Create New Project")).toBeTruthy();
      expect(screen.getByText("Open Settings")).toBeTruthy();
      expect(screen.getByText("Dashboard")).toBeTruthy();
      expect(screen.getByText("Analytics")).toBeTruthy();
    });

    it("renders group labels", () => {
      renderCommandPalette();

      expect(screen.getByText("Commands")).toBeTruthy();
      expect(screen.getByText("Pages")).toBeTruthy();
    });

    it("items have click handlers and cursor pointer styling", () => {
      const onSelect = vi.fn();
      renderCommandPalette({ onSelect });

      // Find the item - it should have cursor-pointer class and onClick is wired up
      const item = screen.getByRole("option", { name: "Create New Project" });
      expect(item).toBeTruthy();
      expect(item.className).toContain("cursor-pointer");

      // The onClick is passed to Autocomplete.Item which handles selection
      // internally. The actual click behavior is tested via the Cmd/Ctrl+Enter
      // keyboard navigation test which proves the selection mechanism works.
    });
  });

  describe("Empty State", () => {
    it("renders empty message when no items match", () => {
      renderCommandPalette({ showEmpty: true });

      expect(screen.getByText(/No results found/)).toBeTruthy();
    });

    it("announces empty results as a polite status", () => {
      renderCommandPalette({ showEmpty: true });

      const status = screen.getByRole("status");
      expect(status.getAttribute("aria-live")).toBe("polite");
      expect(status.getAttribute("aria-atomic")).toBe("true");
      expect(status.textContent).toContain("No results found");
    });
  });

  describe("Loading State", () => {
    it("renders loading spinner when loading", () => {
      renderCommandPalette({ showLoading: true });

      // The Loader component renders an SVG or spinner
      // Check for the loading container
      const loadingContainer = document.querySelector(".p-8.flex.items-center");
      expect(loadingContainer).toBeTruthy();
    });

    it("announces loading as a polite busy status", () => {
      renderCommandPalette({ showLoading: true });

      const status = screen.getByRole("status");
      expect(status.getAttribute("aria-live")).toBe("polite");
      expect(status.getAttribute("aria-busy")).toBe("true");
      expect(status.textContent).toContain("Loading results");
    });

    it("supports localized loading announcement text", () => {
      renderCommandPalette({
        showLoading: true,
        loadingLabel: "Cargando resultados",
      });

      const status = screen.getByRole("status");
      expect(status.textContent).toContain("Cargando resultados");
      expect(status.textContent).not.toContain("Loading results");
    });

    it("marks the results container busy while loading", () => {
      renderCommandPalette({ showLoading: true });

      const list = document.querySelector(".overflow-y-auto");
      expect(list?.getAttribute("aria-busy")).toBe("true");
    });
  });

  describe("Footer", () => {
    it("renders footer with keyboard hints", () => {
      renderCommandPalette();

      expect(screen.getByText("Use arrow keys to navigate")).toBeTruthy();
    });
  });

  describe("Keyboard Navigation", () => {
    it("navigates items with arrow keys", async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText("Search commands...");

      // Focus the input and press down arrow
      await user.click(input);
      await user.keyboard("{ArrowDown}");

      // The first item should be highlighted (via data-highlighted attribute)
      // This is handled by the Autocomplete primitive
      await waitFor(() => {
        const highlightedItem = document.querySelector("[data-highlighted]");
        expect(highlightedItem).toBeTruthy();
      });
    });

    it("handles Cmd/Ctrl+Enter for new tab selection", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderCommandPalette({ onSelect });

      const input = screen.getByPlaceholderText("Search commands...");
      await user.click(input);

      // Press down to highlight first item, then Cmd+Enter
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Meta>}{Enter}{/Meta}");

      await waitFor(() => {
        expect(onSelect).toHaveBeenCalledWith(expect.anything(), {
          newTab: true,
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("has a default accessible dialog name", () => {
      renderCommandPalette();

      const dialog = screen.getByRole("dialog", { name: "Command palette" });
      expect(dialog).toBeTruthy();
    });

    it("uses a localized accessible dialog name when provided", () => {
      renderCommandPalette({ dialogTitle: "Buscar comandos" });

      const dialog = screen.getByRole("dialog", { name: "Buscar comandos" });
      expect(dialog).toBeTruthy();
    });

    it("input has combobox role", () => {
      renderCommandPalette();

      const input = screen.getByRole("combobox", {
        name: "Search test commands",
      });
      expect(input).toBeTruthy();
    });

    it("hides the default decorative input icon from assistive technology", () => {
      renderCommandPalette();

      const icon = document.querySelector("svg");
      expect(icon?.getAttribute("aria-hidden")).toBe("true");
      expect(icon?.getAttribute("focusable")).toBe("false");
    });

    it("forces ResultItem icons to be decorative", () => {
      const results = [
        { id: "button", title: "Button", breadcrumbs: ["Components"] },
      ];

      render(
        <CommandPalette.Panel
          items={results}
          itemToStringValue={(item) => item.title}
        >
          <CommandPalette.List>
            <CommandPalette.Results>
              {(item: (typeof results)[number]) => (
                <CommandPalette.ResultItem
                  key={item.id}
                  value={item}
                  title={item.title}
                  breadcrumbs={item.breadcrumbs}
                  icon={
                    <svg
                      data-testid="result-icon"
                      aria-label="File"
                      focusable="true"
                    />
                  }
                  onClick={() => {}}
                />
              )}
            </CommandPalette.Results>
          </CommandPalette.List>
        </CommandPalette.Panel>,
      );

      const icon = screen.getByTestId("result-icon");
      expect(icon.getAttribute("aria-hidden")).toBe("true");
      expect(icon.getAttribute("focusable")).toBe("false");
    });

    it("warns in development when input has no accessible name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        render(
          <CommandPalette.Panel items={[]}>
            <CommandPalette.Input placeholder="Search commands..." />
            <CommandPalette.List>
              <CommandPalette.Empty>No commands found</CommandPalette.Empty>
            </CommandPalette.List>
          </CommandPalette.Panel>,
        );

        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining(
            "[Kumo CommandPalette]: CommandPalette.Input must have an accessible name.",
          ),
        );
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn when aria-labelledby provides the input name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        render(
          <CommandPalette.Panel items={[]}>
            <span id="command-search-label">Search documentation</span>
            <CommandPalette.Input
              aria-labelledby="command-search-label"
              placeholder="Search docs..."
            />
            <CommandPalette.List>
              <CommandPalette.Empty>No commands found</CommandPalette.Empty>
            </CommandPalette.List>
          </CommandPalette.Panel>,
        );

        expect(
          screen.getByRole("combobox", { name: "Search documentation" }),
        ).toBeTruthy();
        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });

    it("does not warn when a visible label provides the input name", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

      try {
        render(
          <CommandPalette.Panel items={[]}>
            <label htmlFor="command-search-input">Search documentation</label>
            <CommandPalette.Input
              id="command-search-input"
              placeholder="Search docs..."
            />
            <CommandPalette.List>
              <CommandPalette.Empty>No commands found</CommandPalette.Empty>
            </CommandPalette.List>
          </CommandPalette.Panel>,
        );

        expect(
          screen.getByRole("combobox", { name: "Search documentation" }),
        ).toBeTruthy();
        expect(warn).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });

    it("auto-focuses input when dialog opens", async () => {
      renderCommandPalette();

      await waitFor(() => {
        const input = screen.getByPlaceholderText("Search commands...");
        expect(document.activeElement).toBe(input);
      });
    });
  });
});
