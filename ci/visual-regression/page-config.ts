export interface ScreenshotConfig {
  id: string;
  name: string;
  url: string;
  demoFiles: string[];
  viewport?: { width: number; height: number };
  actions?: Array<{
    type: "click" | "hover" | "focus";
    selector: string;
    waitAfter?: number;
  }>;
}

export const SCREENSHOT_CONFIGS: ScreenshotConfig[] = [
  {
    id: "button",
    name: "Button",
    url: "/components/button",
    demoFiles: ["ButtonDemo.tsx", "button.tsx"],
  },
  {
    id: "dialog-closed",
    name: "Dialog - Closed",
    url: "/components/dialog",
    demoFiles: ["DialogDemo.tsx", "dialog.tsx"],
  },
  {
    id: "dialog-open",
    name: "Dialog - Open",
    url: "/components/dialog",
    demoFiles: ["DialogDemo.tsx", "dialog.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 400 }],
  },
  {
    id: "dropdown-closed",
    name: "Dropdown - Closed",
    url: "/components/dropdown",
    demoFiles: ["DropdownDemo.tsx", "dropdown.tsx"],
  },
  {
    id: "dropdown-open",
    name: "Dropdown - Open",
    url: "/components/dropdown",
    demoFiles: ["DropdownDemo.tsx", "dropdown.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 300 }],
  },
  {
    id: "tooltip",
    name: "Tooltip - Visible",
    url: "/components/tooltip",
    demoFiles: ["TooltipDemo.tsx", "tooltip.tsx"],
    actions: [{ type: "hover", selector: "button", waitAfter: 500 }],
  },
  {
    id: "select-closed",
    name: "Select - Closed",
    url: "/components/select",
    demoFiles: ["SelectDemo.tsx", "select.tsx"],
  },
  {
    id: "select-open",
    name: "Select - Open",
    url: "/components/select",
    demoFiles: ["SelectDemo.tsx", "select.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 300 }],
  },
  {
    id: "combobox-closed",
    name: "Combobox - Closed",
    url: "/components/combobox",
    demoFiles: ["ComboboxDemo.tsx", "combobox.tsx"],
  },
  {
    id: "combobox-open",
    name: "Combobox - Open",
    url: "/components/combobox",
    demoFiles: ["ComboboxDemo.tsx", "combobox.tsx"],
    actions: [{ type: "click", selector: "input", waitAfter: 300 }],
  },
  {
    id: "toast",
    name: "Toast - Visible",
    url: "/components/toast",
    demoFiles: ["ToastDemo.tsx", "toast.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 500 }],
  },
  {
    id: "collapsible-collapsed",
    name: "Collapsible - Collapsed",
    url: "/components/collapsible",
    demoFiles: ["CollapsibleDemo.tsx", "collapsible.tsx"],
  },
  {
    id: "collapsible-expanded",
    name: "Collapsible - Expanded",
    url: "/components/collapsible",
    demoFiles: ["CollapsibleDemo.tsx", "collapsible.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 300 }],
  },
  {
    id: "tabs",
    name: "Tabs",
    url: "/components/tabs",
    demoFiles: ["TabsDemo.tsx", "tabs.tsx"],
  },
  {
    id: "input",
    name: "Input",
    url: "/components/input",
    demoFiles: ["InputDemo.tsx", "input.tsx"],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    url: "/components/checkbox",
    demoFiles: ["CheckboxDemo.tsx", "checkbox.tsx"],
  },
  {
    id: "switch",
    name: "Switch",
    url: "/components/switch",
    demoFiles: ["SwitchDemo.tsx", "switch.tsx"],
  },
  {
    id: "badge",
    name: "Badge",
    url: "/components/badge",
    demoFiles: ["BadgeDemo.tsx", "badge.tsx"],
  },
  {
    id: "banner",
    name: "Banner",
    url: "/components/banner",
    demoFiles: ["BannerDemo.tsx", "banner.tsx"],
  },
  {
    id: "popover-open",
    name: "Popover - Open",
    url: "/components/popover",
    demoFiles: ["PopoverDemo.tsx", "popover.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 300 }],
  },
  {
    id: "date-range-picker-open",
    name: "Date Range Picker - Open",
    url: "/components/date-range-picker",
    demoFiles: ["DateRangePickerDemo.tsx", "date-range-picker.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 300 }],
  },
  {
    id: "command-palette-open",
    name: "Command Palette - Open",
    url: "/components/command-palette",
    demoFiles: ["CommandPaletteDemo.tsx", "command-palette.tsx"],
    actions: [{ type: "click", selector: "button", waitAfter: 300 }],
  },
  {
    id: "loader",
    name: "Loader",
    url: "/components/loader",
    demoFiles: ["LoaderDemo.tsx", "loader.tsx"],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    url: "/components/skeleton-line",
    demoFiles: ["SkeletonLineDemo.tsx", "skeleton-line.tsx"],
  },
  {
    id: "table",
    name: "Table",
    url: "/components/table",
    demoFiles: ["TableDemo.tsx", "table.tsx"],
  },
  {
    id: "pagination",
    name: "Pagination",
    url: "/components/pagination",
    demoFiles: ["PaginationDemo.tsx", "pagination.tsx"],
  },
  {
    id: "radio",
    name: "Radio",
    url: "/components/radio",
    demoFiles: ["RadioDemo.tsx", "radio.tsx"],
  },
  {
    id: "meter",
    name: "Meter",
    url: "/components/meter",
    demoFiles: ["MeterDemo.tsx", "meter.tsx"],
  },
  {
    id: "code",
    name: "Code",
    url: "/components/code",
    demoFiles: ["CodeDemo.tsx", "code.tsx"],
  },
  {
    id: "link",
    name: "Link",
    url: "/components/link",
    demoFiles: ["LinkDemo.tsx", "link.tsx"],
  },
  {
    id: "label",
    name: "Label",
    url: "/components/label",
    demoFiles: ["LabelDemo.tsx", "label.tsx"],
  },
  {
    id: "text",
    name: "Text",
    url: "/components/text",
    demoFiles: ["TextDemo.tsx", "text.tsx"],
  },
  {
    id: "home",
    name: "Home Page",
    url: "/",
    demoFiles: ["HomeGrid.tsx"],
    viewport: { width: 1280, height: 900 },
  },
];

export function getAffectedScreenshots(
  changedFiles: string[],
): ScreenshotConfig[] {
  const fileNames = changedFiles
    .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    .map((f) => f.split("/").pop()!);

  if (fileNames.length === 0) {
    return [];
  }

  return SCREENSHOT_CONFIGS.filter((config) =>
    config.demoFiles.some((demo) => fileNames.includes(demo)),
  );
}
