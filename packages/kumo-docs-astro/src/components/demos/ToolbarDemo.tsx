import {
  Button,
  Combobox,
  Input,
  InputGroup,
  Select,
  Toolbar,
} from "@cloudflare/kumo";
import {
  DownloadSimpleIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

const zones = ["example.com", "kumo-ui.com", "workers.dev", "pages.dev"];

/** Basic Toolbar with explicitly rendered controls. */
export function ToolbarDemo() {
  return (
    <Toolbar className="w-full max-w-md">
      <Toolbar.Control
        render={
          <Input
            aria-label="Search DNS records"
            className="flex-1"
            placeholder="Search DNS Records"
          />
        }
      />
      <Toolbar.Control
        render={
          <Button shape="square" icon={FunnelSimpleIcon} aria-label="Filter" />
        }
      />
      <Toolbar.Control
        render={
          <Button shape="square" icon={GearSixIcon} aria-label="Settings" />
        }
      />
    </Toolbar>
  );
}

/** Toolbar locks Toolbar.Control sizes to the toolbar size. */
export function ToolbarSizesDemo() {
  return (
    <div className="grid gap-3">
      {(["xs", "sm", "base", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-10 text-sm text-kumo-subtle">{size}</span>
          <Toolbar size={size} className="w-fit">
            <Toolbar.Control
              render={
                <Input aria-label={`${size} search`} placeholder="Search..." />
              }
            />
            <Toolbar.Control render={<Button>Apply</Button>} />
          </Toolbar>
        </div>
      ))}
    </div>
  );
}

/** Toolbar can mix Input, Select, and Button controls. */
export function ToolbarMixedControlsDemo() {
  return (
    <Toolbar className="w-full max-w-xl">
      <Toolbar.Control
        render={
          <Select
            label="Record type"
            className="w-32"
            value="all"
            items={{ all: "All", a: "A", aaaa: "AAAA", cname: "CNAME" }}
          />
        }
      />
      <Toolbar.Control
        render={
          <Input label="Record name" className="flex-1" placeholder="Name" />
        }
      />
      <Toolbar.Control render={<Button icon={PlusIcon}>Add</Button>} />
    </Toolbar>
  );
}

/** Toolbar can compose an InputGroup with adjacent actions. */
export function ToolbarInputGroupDemo() {
  return (
    <Toolbar className="w-full max-w-lg">
      <Toolbar.Control
        render={
          <InputGroup label="Worker subdomain" className="flex-1">
            <InputGroup.Input
              placeholder="my-worker"
              aria-label="Worker subdomain"
            />
            <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
          </InputGroup>
        }
      />
      <Toolbar.Control render={<Button>Visit</Button>} />
    </Toolbar>
  );
}

/** Toolbar forces Toolbar.Control Button children to ghost styling. */
export function ToolbarActionsDemo() {
  return (
    <Toolbar size="base">
      <Toolbar.Control
        render={
          <Button icon={UploadSimpleIcon} variant="primary">
            Upload
          </Button>
        }
      />
      <Toolbar.Control
        render={
          <Button icon={DownloadSimpleIcon} variant="destructive">
            Download
          </Button>
        }
      />
    </Toolbar>
  );
}

/** Labels inside Toolbar.Control stay accessible but are visually hidden. */
export function ToolbarLabelsDemo() {
  return (
    <Toolbar className="w-full max-w-lg">
      <Toolbar.Control
        render={
          <Combobox items={zones} label="Zone" value="kumo-ui.com">
            <Combobox.TriggerInput placeholder="Select zone" />
            <Combobox.Content>
              <Combobox.List>
                {(zone: string) => (
                  <Combobox.Item key={zone} value={zone}>
                    {zone}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Content>
          </Combobox>
        }
      />
      <Toolbar.Control
        render={
          <Input label="Search records" className="flex-1" placeholder="Search" />
        }
      />
      <Toolbar.Control
        render={
          <Button shape="square" icon={MagnifyingGlassIcon} aria-label="Search" />
        }
      />
    </Toolbar>
  );
}

/** Direct children do not receive Toolbar.Control styling or sizing. */
export function ToolbarExplicitControlsDemo() {
  return (
    <Toolbar size="sm" className="w-full max-w-xl">
      <Toolbar.Control
        render={
          <Input aria-label="Toolbar search" placeholder="Toolbar controlled" />
        }
      />
      <Input aria-label="Standalone search" placeholder="Standalone input" />
    </Toolbar>
  );
}
