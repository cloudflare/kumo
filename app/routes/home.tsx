import { Button } from "~/components/button/button";
import type { Route } from "./+types/home";
import {
  CalendarDotIcon,
  CodeIcon,
  GlobeIcon,
  HouseIcon,
  PlusIcon,
  RowsPlusBottomIcon,
  SquaresFourIcon,
  TextBolderIcon,
  TextItalicIcon,
  TranslateIcon,
  WarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import { Input } from "~/components/input/input";
import { Surface } from "~/components/surface/surface";
import {
  Dialog,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "~/components/dialog/dialog";
import { Checkbox } from "~/components/checkbox/checkbox";
import { DropdownMenu } from "~/components/dropdown/dropdown";
import { Option, Select } from "~/components/select/select";
import { Tooltip, TooltipProvider } from "~/components/tooltip/tooltip";
import { ClipboardText } from "~/components/clipboard-text/clipboard-text";
import { Expandable } from "~/components/expandable/expandable";
import { Combobox } from "~/components/combobox/combobox";
import { MenuBar } from "~/components/menubar/menubar";
import { Toggle } from "~/components/toggle/toggle";
import { CodeBlock } from "~/components/code/code-lazy";
import { LayerCard } from "~/components/layer-card/layer-card";
import { Loader } from "~/components/loader/loader";
import { SkeletonLine } from "~/components/loader/skeleton-line";
import { Field } from "~/components/field/field";
import { Banner, BannerVariant } from "~/components/banner/banner";
import { Tabs } from "~/components/tabs/tabs";
import { Badge } from "~/components/badge/badge";
import { Toasty as Toast } from "~/components/toast/toast";
import { Toast as BaseToast } from '@base-ui-components/react/toast';
import DateRangePicker from "~/components/calendar/calendar";
import { useState } from "react";
import { Empty } from "~/blocks/empty";
import Breadcrumbs from "~/blocks/breadcrumbs";
import { PageHeader } from "~/blocks/page-header";
import { ResourceListPage } from "~/layouts/resource-list";
import { Pagination } from "~/components/pagination/pagination";
import { InputArea } from "~/components/input/input-area";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kumo" },
    { name: "description", content: "Kumo – a modern component library" },
  ];
}

function ToastTriggerButton() {
  const toastManager = BaseToast.useToastManager();
  return (
    <Button
      onClick={() =>
        toastManager.add({
          title: `Toast created`,
          description: 'This is a toast notification.',
        })
      }
    >
      Give me a toast
    </Button>
  );
}

export default function Home() {
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const components = [
  {
    name: "Button",
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
    Component: (
      <div className="grid gap-3">
        <Input placeholder="Type something..." />
        <Input variant="error" value="Invalid!" />
      </div>
    ),
  },
  {
    name: "Select",
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
          return labels[v];
        }}
      >
        <Option value="all">All deployed versions</Option>
        <Option value="active">Active versions</Option>
        <Option value="specific">Specific versions</Option>
      </Select>
    ),
  },
  {
    name: "Combobox",
    Component: (
      <Combobox
        initialItems={[
          { id: "bug", value: "bug" },
          { id: "docs", value: "documentation" },
          { id: "enhancement", value: "enhancement" },
          { id: "help-wanted", value: "help wanted" },
          { id: "good-first-issue", value: "good first issue" },
        ]}
        onCreate={(v) => console.log(`Created ${v}`)}
        placeholder="Select an issue..."
      />
    ),
  },
  {
    name: "Toggle",
    Component: <Toggle toggled onClick={() => {}} />,
  },
  {
    name: "Field",
    Component: (
      <Field
        label="Email"
        error={{
          message: "Please enter a valid email.",
          match: "typeMismatch",
        }}
        description="The email to send notifications to."
      >
        <Input placeholder="name@example.com" type="email" />
      </Field>
    ),
  },
  {
    name: "Dialog",
    Component: (
      <DialogRoot>
        <DialogTrigger render={(p) => <Button {...p}>Click me!</Button>} />
        <Dialog>
          <DialogTitle>Hello!</DialogTitle>
          <DialogDescription>I'm a dialog.</DialogDescription>
        </Dialog>
      </DialogRoot>
    ),
  },
  {
    name: "Tooltip",
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
    Component: (
      <DropdownMenu open modal={false}>
        <DropdownMenu.Trigger render={<Button icon={PlusIcon}>Add</Button>} />
        <DropdownMenu.Content>
          <DropdownMenu.Item>Worker</DropdownMenu.Item>
          <DropdownMenu.Item>Pages</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    ),
  },
  {
    name: "Expandable",
    Component: (
      <Expandable title="What is Kumo?">
        Kumo is Cloudflare's new design system.
      </Expandable>
    ),
  },
  {
    name: "Checkbox",
    Component: <Checkbox label="Max bandwidth" />,
  },
  {
    name: "LayerCard",
    Component: (
      <LayerCard className="w-[200px]" title="Next Steps" href="/">
        <div className="p-4">Hello</div>
      </LayerCard>
    ),
  },
  {
    name: "Loader",
    Component: <Loader />,
  },
  {
    name: "SkeletonLine",
    Component: (
      <div className="flex flex-col gap-2 w-[200px]">
        <SkeletonLine minWidth={50} maxWidth={100} />
        <SkeletonLine minWidth={100} />
        <SkeletonLine minWidth={50} maxWidth={150}  />
      </div>
    ),
  },
  {
    name: "MenuBar",
    Component: (
      <MenuBar
        isActive="bold"
        optionIds
        options={[
          {
            icon: <TextBolderIcon />,
            id: "bold",
            tooltip: "Bold",
            onClick: () => {},
          },
          {
            icon: <TextItalicIcon />,
            id: "italic",
            tooltip: "Italic",
            onClick: () => {},
          },
        ]}
      />
    ),
  },
  {
    name: "Clipboard Text",
    Component: <ClipboardText text="0c239dd2" />,
  },
  {
    name: "Surface",
    Component: (
      <Surface className="w-40 h-24 rounded-lg bg-surface flex items-center justify-center text-sm text-neutral-500">
        <em>To put things over.</em>
      </Surface>
    ),
  },
  {
    name: "Code",
    Component: (
      <CodeBlock lang="ts" code={`const a = callMyFunction("hello")`} />
    ),
  },
  {
    name: "Banner",
    Component: (
      <div className="flex flex-col gap-2">
        <Banner
          text="This is a default banner."
        />
        <Banner
          icon={<WarningIcon weight="fill" />}
          text="This is an alert banner."
          variant={BannerVariant.ALERT}
        />
        <Banner
          icon={<WarningOctagonIcon weight="fill" />}
          text="This is an error banner."
          variant={BannerVariant.ERROR}
        />
      </div>
    ),
  },
  {
    name: "Tabs",
    Component: (
      <Tabs 
        links={[
        { label: "Home", href: "/" },
        { label: "About", href: "/?id=2" },
        { label: "Contact", href: "/?id=3" },
      ]}
        matchQuery={true}
        matchQueryKeys={["id"]}
      />
    ),
  },
  {
    name: "Badge",
    Component: (
      <div className="flex flex-col gap-2">
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <div className="flex items-center gap-2">
          <Badge>1</Badge>
          <Badge variant="outline">10</Badge>
          <Badge variant="secondary">20+</Badge>
        </div>
      </div>
    ),
  },
  {
    name: "Toast",
    Component: (
      <Toast>
        <ToastTriggerButton />
      </Toast>
    )
  },
  {
    name: "Date Picker",
    Component: (
      <DropdownMenu open={datePickerOpen} modal={true} onOpenChange={setDatePickerOpen}>
        <DropdownMenu.Trigger render={<Button icon={CalendarDotIcon}>Calendar</Button>} />
        <DropdownMenu.Content>
          <DropdownMenu.Item>
            <DateRangePicker onStartDateChange={function (date: Date | null): void {
                throw new Error("Function not implemented.");
              } } onEndDateChange={function (date: Date | null): void {
                throw new Error("Function not implemented.");
              } } 
            />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      
    )
  },
  {
    name: "Pagination",
    Component: (
      <Pagination page={1} perPage={10} totalCount={100} setPage={function (page: number): void {
          throw new Error("Function not implemented.");
        }}
      />
    )
  },
  {
    name: "Input Area",
    Component: (
      <InputArea placeholder="Enter your name" />
    )
  }
];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800 pr-12 sticky top-0 z-10 bg-surface-secondary">
        <div className="flex items-center border-r border-neutral-200 dark:border-neutral-800 h-12 px-4 mx-auto">
          <p className="font-mono ml-auto text-base text-neutral-500">
            @cloudflare/kumo
          </p>
        </div>
      </header>
      <main className="pr-12 grow flex flex-col">
        <div className="border-r border-neutral-200 dark:border-neutral-800 grow mx-auto w-full">
          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 auto-rows-min">
            {components.map((c) => {
              return (
                <li
                  className="aspect-square flex items-center justify-center ring-1 ring-neutral-200 dark:ring-neutral-800 relative bg-surface-secondary"
                  key={c.name}
                >
                  <span className="absolute text-neutral-500 font-medium top-4 left-4 text-base">
                    {c.name}
                  </span>
                  {c.Component ?? (
                    <p className="text-base font-medium text-neutral-400">
                      TBD
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* <div className="flex flex-col gap-4 p-12">
          <div>
            <span className="text-neutral-500 font-medium top-4 left-4 text-base">
              Empty
            </span>
            <Empty 
              icon={<SquaresFourIcon size={48} />}
              title="Create a Queue" 
              description="Build event-driven systems by creating a Queue above, or use Wrangler CLI to create a Queue." 
              commandLine="npx wrangler queues create BINDING_NAME" 
              contents={<div className="flex items-center gap-2">
                <Button icon={<CodeIcon />}>See examples</Button>
                <Button icon={<GlobeIcon />} variant="primary">View documentation</Button>
              </div>}
            />
          </div>

          <div>
            <span className="text-neutral-500 font-medium top-4 left-4 text-base">
              Breadcrumbs
            </span>
            <Breadcrumbs
              items={[
                {
                  icon: <HouseIcon />,
                  label: "Workers & Pages",
                  to: "/",
                },
                {
                  label: "cloudflare-dev-platform",
                  to: "/about",
                }
              ]}
            />
          </div>

          <div className="bg-surface-secondary">
            <span className="text-neutral-500 font-medium top-4 left-4 text-base">
              Page Header
            </span>
            <PageHeader
              breadcrumbs={[
                {
                  icon: <HouseIcon />,
                  label: "Workers & Pages",
                  to: "/",
                },
                {
                  label: "cloudflare-dev-platform",
                  to: "/about",
                }
              ]}
              tabs={[
                { label: "Overview", href: "/" },
                { label: "Metrics", href: "/?id=metrics" },
                { label: "Deployments", href: "/?id=deployments" },
                { label: "Bindings", href: "/?id=bindings" },
                { label: "Observability", href: "/?id=observability" },
                { label: "Settings", href: "/?id=settings" },
            ]}
            >
              <Button icon={<CodeIcon />}>Edit code</Button>
              <Button icon={<GlobeIcon />} variant="primary">Visit</Button>
            </PageHeader>
          </div>

          <div className="bg-surface-secondary">
            <span className="text-neutral-500 font-medium top-4 left-4 text-base">
              Resource List Page
            </span>
            <ResourceListPage
              title="Resource List Page"
              description="This is a resource list page."
              icon={<SquaresFourIcon size={28} />}
              usage={<>Usage Section</>}
              additionalContent={<>Additional Content Section</>}
            >
              <Empty 
                icon={<SquaresFourIcon size={48} />}
                title="Create a Queue" 
                description="Build event-driven systems by creating a Queue above, or use Wrangler CLI to create a Queue." 
                commandLine="npx wrangler queues create BINDING_NAME" 
                contents={<div className="flex items-center gap-2">
                  <Button icon={<CodeIcon />}>See examples</Button>
                  <Button icon={<GlobeIcon />} variant="primary">View documentation</Button>
                </div>}
              />

              <div className="mt-4">
                <Pagination page={1} perPage={10} totalCount={100} setPage={function (page: number): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>
            </ResourceListPage>
          </div>

        </div> */}
      </main>
    </div>
  );
}
