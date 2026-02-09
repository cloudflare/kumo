export interface PageState {
  name: string;
  selector?: string;
  action?: "click" | "hover" | "focus";
  waitAfter?: number;
}

export interface PageConfig {
  path: string;
  name: string;
  demoFiles: string[];
  states: PageState[];
  waitForSelector?: string;
  viewport?: { width: number; height: number };
}

export const PAGE_CONFIGS: PageConfig[] = [
  {
    path: "/components/button",
    name: "Button",
    demoFiles: ["ButtonDemo.tsx"],
    states: [{ name: "default" }],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/dialog",
    name: "Dialog",
    demoFiles: ["DialogDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "open",
        selector: "[data-demo='dialog'] button",
        action: "click",
        waitAfter: 300,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/dropdown",
    name: "Dropdown",
    demoFiles: ["DropdownDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "open",
        selector: "[data-demo='dropdown'] button",
        action: "click",
        waitAfter: 300,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/tooltip",
    name: "Tooltip",
    demoFiles: ["TooltipDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "visible",
        selector: "[data-demo='tooltip'] button",
        action: "hover",
        waitAfter: 500,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/select",
    name: "Select",
    demoFiles: ["SelectDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "open",
        selector: "[data-demo='select'] button",
        action: "click",
        waitAfter: 300,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/combobox",
    name: "Combobox",
    demoFiles: ["ComboboxDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "open",
        selector: "[data-demo='combobox'] input",
        action: "click",
        waitAfter: 300,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/tabs",
    name: "Tabs",
    demoFiles: ["TabsDemo.tsx"],
    states: [{ name: "default" }],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/toast",
    name: "Toast",
    demoFiles: ["ToastDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "showing",
        selector: "[data-demo='toast'] button",
        action: "click",
        waitAfter: 500,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/collapsible",
    name: "Collapsible",
    demoFiles: ["CollapsibleDemo.tsx"],
    states: [
      { name: "default" },
      {
        name: "expanded",
        selector: "[data-demo='collapsible'] button",
        action: "click",
        waitAfter: 300,
      },
    ],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/input",
    name: "Input",
    demoFiles: ["InputDemo.tsx"],
    states: [{ name: "default" }],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/checkbox",
    name: "Checkbox",
    demoFiles: ["CheckboxDemo.tsx"],
    states: [{ name: "default" }],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/badge",
    name: "Badge",
    demoFiles: ["BadgeDemo.tsx"],
    states: [{ name: "default" }],
    waitForSelector: "[data-component]",
  },
  {
    path: "/components/banner",
    name: "Banner",
    demoFiles: ["BannerDemo.tsx"],
    states: [{ name: "default" }],
    waitForSelector: "[data-component]",
  },
  {
    path: "/",
    name: "Home",
    demoFiles: ["HomeGrid.tsx"],
    states: [{ name: "default" }],
    viewport: { width: 1280, height: 900 },
  },
];

export function getAffectedPages(changedFiles: string[]): PageConfig[] {
  const demoFileNames = changedFiles
    .filter((f) => f.includes("/demos/") && f.endsWith(".tsx"))
    .map((f) => f.split("/").pop()!);

  if (demoFileNames.length === 0) {
    return [];
  }

  return PAGE_CONFIGS.filter((page) =>
    page.demoFiles.some((demo) => demoFileNames.includes(demo)),
  );
}
