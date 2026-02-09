import { useState } from "react";
import {
  Badge,
  Banner,
  Button,
  Checkbox,
  ClipboardText,
  CodeBlock,
  Collapsible,
  Combobox,
  DateRangePicker,
  Dialog,
  DropdownMenu,
  Grid,
  GridItem,
  Input,
  InputArea,
  Label,
  LayerCard,
  Loader,
  MenuBar,
  Meter,
  Pagination,
  Popover,
  Radio,
  Select,
  SensitiveInput,
  SkeletonLine,
  Surface,
  Switch,
  Table,
  Tabs,
  Text,
  Toasty,
  Tooltip,
  TooltipProvider,
  useKumoToastManager,
} from "@cloudflare/kumo";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TextBolderIcon,
  TextItalicIcon,
  TranslateIcon,
  WarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";

const componentRoutes: Record<string, string> = {
  badge: "/components/badge",
  banner: "/components/banner",
  breadcrumbs: "/components/breadcrumbs",
  button: "/components/button",
  checkbox: "/components/checkbox",
  "clipboard-text": "/components/clipboard-text",
  code: "/components/code",
  collapsible: "/components/collapsible",
  combobox: "/components/combobox",
  "command-palette": "/components/command-palette",
  "date-range-picker": "/components/date-range-picker",
  dialog: "/components/dialog",
  dropdown: "/components/dropdown",
  empty: "/components/empty",
  grid: "/components/grid",
  input: "/components/input",
  "input-area": "/components/input",
  label: "/components/label",
  "layer-card": "/components/layer-card",
  loader: "/components/loader",
  menubar: "/components/menubar",
  meter: "/components/meter",
  pagination: "/components/pagination",
  popover: "/components/popover",
  radio: "/components/radio",
  select: "/components/select",
  "sensitive-input": "/components/sensitive-input",
  "skeleton-line": "/components/skeleton-line",
  surface: "/components/surface",
  switch: "/components/switch",
  table: "/components/table",
  tabs: "/components/tabs",
  text: "/components/text",
  toast: "/components/toast",
  tooltip: "/components/tooltip",
};

function ToastTriggerButton() {
  const toastManager = useKumoToastManager();
  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: `Toast created`,
          description: "This is a toast notification.",
          variant: "warning",
        })
      }
    >
      Give me a toast
    </Button>
  );
}

export function HomeGrid() {
  const [switchToggled, setSwitchToggled] = useState(true);
  const [checked, setChecked] = useState(true);

  const components: Array<{
    name: string;
    id: string;
    Component: React.ReactNode;
  }> = [
    {
      name: "Button",
      id: "button",
      Component: (
        <div className="grid gap-3">
          <Button icon={PlusIcon}>Create Worker</Button>
          <Button variant="primary" icon={PlusIcon}>
            Create Worker
          </Button>
          <Button loading>Create Worker</Button>
        </div>
      ),
    },
    {
      name: "Input",
      id: "input",
      Component: (
        <div className="grid gap-3">
          <Input placeholder="Type something..." />
          <Input variant="error" value="Invalid!" />
        </div>
      ),
    },
    {
      name: "Select",
      id: "select",
      Component: (
        <Select
          className="w-[200px]"
          renderValue={(v) => {
            const labels: Record<string, string> = {
              all: "All deployed versions",
              active: "Active versions",
              specific: "Specific versions",
            };
            if (!v) return "Select a version...";
            return labels[v as string];
          }}
        >
          <Select.Option value="all">All deployed versions</Select.Option>
          <Select.Option value="active">Active versions</Select.Option>
          <Select.Option value="specific">Specific versions</Select.Option>
        </Select>
      ),
    },
    {
      name: "Combobox",
      id: "combobox",
      Component: (
        <Combobox
          items={[
            { id: "bug", value: "bug" },
            { id: "docs", value: "documentation" },
            { id: "enhancement", value: "enhancement" },
            { id: "help-wanted", value: "help wanted" },
            { id: "good-first-issue", value: "good first issue" },
          ]}
        >
          <Combobox.TriggerInput placeholder="Select an issue..." />
          <Combobox.Content>
            <Combobox.List>
              {(item: { id: string; value: string }) => (
                <Combobox.Item key={item.id} value={item.value}>
                  {item.value}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>
      ),
    },
    {
      name: "Switch",
      id: "switch",
      Component: (
        <Switch
          checked={switchToggled}
          onClick={() => {
            setSwitchToggled(!switchToggled);
          }}
        />
      ),
    },
    {
      name: "Input (with validation)",
      id: "input",
      Component: (
        <Input
          label="Email"
          placeholder="name@example.com"
          type="email"
          variant="error"
          error={{
            message: "Please enter a valid email.",
            match: "typeMismatch",
          }}
          description="The email to send notifications to."
        />
      ),
    },
    {
      name: "Dialog",
      id: "dialog",
      Component: (
        <Dialog.Root>
          <Dialog.Trigger render={(p) => <Button {...p}>Click me!</Button>} />
          <Dialog>
            <Dialog.Title>Hello!</Dialog.Title>
            <Dialog.Description>I'm a dialog.</Dialog.Description>
          </Dialog>
        </Dialog.Root>
      ),
    },
    {
      name: "Tooltip",
      id: "tooltip",
      Component: (
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip content="Add" asChild open>
              <Button shape="square" icon={PlusIcon} />
            </Tooltip>
            <Tooltip content="Change language" asChild>
              <Button shape="square" icon={TranslateIcon} />
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
    {
      name: "Dropdown",
      id: "dropdown",
      Component: (
        <DropdownMenu>
          <DropdownMenu.Trigger render={<Button icon={PlusIcon}>Add</Button>} />
          <DropdownMenu.Content>
            <DropdownMenu.Item>Worker</DropdownMenu.Item>
            <DropdownMenu.Item>Pages</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
    },
    {
      name: "Collapsible",
      id: "collapsible",
      Component: (
        <Collapsible label="What is Kumo?">
          Kumo is Cloudflare's component library.
        </Collapsible>
      ),
    },
    {
      name: "Checkbox",
      id: "checkbox",
      Component: (
        <Checkbox
          label="Max bandwidth"
          checked={checked}
          onValueChange={(checked) => {
            setChecked(checked);
          }}
        />
      ),
    },
    {
      name: "LayerCard",
      id: "layer-card",
      Component: (
        <LayerCard className="w-[200px]">
          <LayerCard.Secondary>Next Steps</LayerCard.Secondary>
          <LayerCard.Primary>Hello</LayerCard.Primary>
        </LayerCard>
      ),
    },
    {
      name: "Loader",
      id: "loader",
      Component: <Loader />,
    },
    {
      name: "SkeletonLine",
      id: "skeleton-line",
      Component: (
        <div className="flex w-[200px] flex-col gap-2">
          <SkeletonLine minWidth={50} maxWidth={100} />
          <SkeletonLine minWidth={100} />
          <SkeletonLine minWidth={50} maxWidth={150} />
        </div>
      ),
    },
    {
      name: "Surface",
      id: "surface",
      Component: (
        <Surface className="flex h-24 w-40 items-center justify-center rounded-lg bg-kumo-base text-sm text-kumo-subtle">
          <em>To put things over.</em>
        </Surface>
      ),
    },
    {
      name: "Code",
      id: "code",
      Component: (
        <CodeBlock lang="ts" code={`const a = callMyFunction("hello")`} />
      ),
    },
    {
      name: "Banner",
      id: "banner",
      Component: (
        <div className="flex flex-col gap-2">
          <Banner text="This is a default banner." />
          <Banner
            icon={<WarningIcon weight="fill" />}
            text="This is an alert banner."
            variant="alert"
          />
          <Banner
            icon={<WarningOctagonIcon weight="fill" />}
            text="This is an error banner."
            variant="error"
          />
        </div>
      ),
    },
    {
      name: "Tabs",
      id: "tabs",
      Component: (
        <Tabs
          tabs={[
            { value: "home", label: "Home" },
            { value: "about", label: "About" },
            { value: "contact", label: "Contact" },
          ]}
        />
      ),
    },
    {
      name: "Badge",
      id: "badge",
      Component: (
        <div className="flex flex-col gap-2">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="beta">Beta</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      ),
    },
    {
      name: "Toast",
      id: "toast",
      Component: (
        <Toasty>
          <ToastTriggerButton />
        </Toasty>
      ),
    },
    {
      name: "Pagination",
      id: "pagination",
      Component: (
        <Pagination page={1} perPage={10} totalCount={100} setPage={() => {}} />
      ),
    },
    {
      name: "InputArea",
      id: "input-area",
      Component: <InputArea placeholder="Enter your name" />,
    },
    {
      name: "Meter",
      id: "meter",
      Component: (
        <div className="w-full px-4">
          <Meter value={75} label="My meter" customValue="100 / 5,000" />
        </div>
      ),
    },
    {
      name: "MenuBar",
      id: "menubar",
      Component: (
        <MenuBar
          isActive={0}
          options={[
            { icon: <TextBolderIcon />, onClick: () => {}, tooltip: "Bold" },
            { icon: <TextItalicIcon />, onClick: () => {}, tooltip: "Italic" },
          ]}
        />
      ),
    },
    {
      name: "DateRangePicker",
      id: "date-range-picker",
      Component: (
        <div className="scale-90">
          <DateRangePicker
            onStartDateChange={() => {}}
            onEndDateChange={() => {}}
          />
        </div>
      ),
    },
    {
      name: "Breadcrumbs",
      id: "breadcrumbs",
      Component: (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-kumo-subtle">Home</span>
          <span className="text-kumo-inactive">/</span>
          <span className="text-kumo-subtle">Docs</span>
          <span className="text-kumo-inactive">/</span>
          <span className="font-medium">Page</span>
        </div>
      ),
    },
    {
      name: "ClipboardText",
      id: "clipboard-text",
      Component: <ClipboardText text="npx kumo add button" />,
    },
    {
      name: "CommandPalette",
      id: "command-palette",
      Component: (
        <Button icon={MagnifyingGlassIcon}>Open Command Palette</Button>
      ),
    },
    {
      name: "Empty",
      id: "empty",
      Component: (
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-sm font-medium">No results</span>
          <span className="text-xs text-kumo-subtle">
            Try a different search
          </span>
        </div>
      ),
    },
    {
      name: "Grid",
      id: "grid",
      Component: (
        <Grid variant="side-by-side" gap="sm" className="w-[140px]">
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            1
          </GridItem>
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            2
          </GridItem>
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            3
          </GridItem>
          <GridItem className="rounded bg-kumo-control p-3 text-center text-xs">
            4
          </GridItem>
        </Grid>
      ),
    },
    {
      name: "Label",
      id: "label",
      Component: (
        <div className="flex flex-col gap-2">
          <Label>Default Label</Label>
          <Label showOptional>Optional Field</Label>
          <Label tooltip="More info">With Tooltip</Label>
        </div>
      ),
    },
    {
      name: "Popover",
      id: "popover",
      Component: (
        <Popover>
          <Popover.Trigger render={<Button>Open Popover</Button>} />
          <Popover.Content>
            <Popover.Title>Popover Title</Popover.Title>
            <Popover.Description>This is a popover.</Popover.Description>
          </Popover.Content>
        </Popover>
      ),
    },
    {
      name: "Radio",
      id: "radio",
      Component: (
        <Radio.Group legend="Select option" defaultValue="option1">
          <Radio.Item value="option1" label="Option 1" />
          <Radio.Item value="option2" label="Option 2" />
        </Radio.Group>
      ),
    },
    {
      name: "SensitiveInput",
      id: "sensitive-input",
      Component: <SensitiveInput value="super-secret-api-key" readOnly />,
    },
    {
      name: "Table",
      id: "table",
      Component: (
        <Table className="w-[200px] text-sm">
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Worker 1</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Worker 2</Table.Cell>
              <Table.Cell>Paused</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Worker 3</Table.Cell>
              <Table.Cell>Active</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ),
    },
    {
      name: "Text",
      id: "text",
      Component: (
        <div className="flex flex-col gap-1">
          <Text size="lg" bold>
            Large Bold Text
          </Text>
          <Text size="base">Regular text content</Text>
          <Text size="sm" color="subtle">
            Small subtle text
          </Text>
        </div>
      ),
    },
  ];

  return (
    <ul className="grid auto-rows-min grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {components.map((c) => {
        const route = componentRoutes[c.id] || null;
        return (
          <li
            className="relative flex aspect-square items-center justify-center bg-kumo-elevated ring-1 ring-kumo-line"
            key={c.name}
          >
            {route ? (
              <a
                href={route}
                className="absolute top-4 left-4 text-base font-medium text-kumo-subtle hover:text-kumo-default"
              >
                {c.name}
              </a>
            ) : (
              <span className="absolute top-4 left-4 text-base font-medium text-kumo-subtle italic">
                {c.name}
              </span>
            )}
            {c.Component ?? (
              <p className="text-base font-medium text-kumo-subtle">TBD</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
