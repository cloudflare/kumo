import { Combobox, InputGroup, Select, Toolbar } from "@cloudflare/kumo";
import {
  DownloadSimpleIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";

/** Basic Toolbar with an InputGroup and adjacent action buttons. */
export function ToolbarDemo() {
  return (
    <Toolbar className="w-full max-w-md">
      <Toolbar.InputGroup aria-label="Search DNS records" className="flex-1">
        <InputGroup.Addon>
          <MagnifyingGlassIcon />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Search DNS records" />
      </Toolbar.InputGroup>
      <Toolbar.Button icon={FunnelSimpleIcon} aria-label="Filter" />
      <Toolbar.Button icon={GearSixIcon} aria-label="Settings" />
    </Toolbar>
  );
}

/** @deprecated Toolbar size customization remains for compatibility. */
export function ToolbarSizesDemo() {
  return (
    <div className="grid gap-3">
      {(["xs", "sm", "base", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-10 text-sm text-kumo-subtle">{size}</span>
          <Toolbar size={size} className="w-fit">
            <Toolbar.Input
              aria-label={`${size} search`}
              placeholder="Search..."
            />
            <Toolbar.Button>Apply</Toolbar.Button>
          </Toolbar>
        </div>
      ))}
    </div>
  );
}

/** Toolbar can use the simpler Input shorthand. */
export function ToolbarMixedControlsDemo() {
  return (
    <Toolbar className="w-full max-w-md">
      <Toolbar.Input
        aria-label="Search DNS records"
        placeholder="Search DNS records"
        className="flex-1"
      />
      <Toolbar.Button icon={FunnelSimpleIcon} aria-label="Filter" />
      <Toolbar.Button icon={GearSixIcon} aria-label="Settings" />
    </Toolbar>
  );
}

/** Toolbar can compose an InputGroup with adjacent actions. */
export function ToolbarInputGroupDemo() {
  return (
    <Toolbar className="w-full max-w-lg">
      <Toolbar.InputGroup aria-label="Worker subdomain" className="flex-1">
        <InputGroup.Input placeholder="my-worker" />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
      </Toolbar.InputGroup>
      <Toolbar.Button>Visit</Toolbar.Button>
    </Toolbar>
  );
}

/** Toolbar buttons always use quiet toolbar styling. */
export function ToolbarActionsDemo() {
  return (
    <Toolbar>
      <Toolbar.Button icon={UploadSimpleIcon}>Upload</Toolbar.Button>
      <Toolbar.Button icon={DownloadSimpleIcon}>Download</Toolbar.Button>
    </Toolbar>
  );
}

/** Toolbar items use aria-label for compact accessible names. */
export function ToolbarLabelsDemo() {
  return (
    <Toolbar className="w-full max-w-lg">
      <Toolbar.Input
        aria-label="Search records"
        className="flex-1"
        placeholder="Search"
      />
      <Toolbar.Button icon={MagnifyingGlassIcon} aria-label="Search" />
    </Toolbar>
  );
}

/** Select composes its trigger with Toolbar.Button. */
export function ToolbarSelectDemo() {
  return (
    <Toolbar>
      <Toolbar.Button icon={FunnelSimpleIcon}>Filter</Toolbar.Button>
      <Select
        aria-label="Sort records"
        defaultValue="name"
        items={{ name: "Name", created: "Created date", status: "Status" }}
        render={<Toolbar.Button />}
      />
      <Toolbar.Button icon={GearSixIcon} aria-label="View settings" />
    </Toolbar>
  );
}

const toolbarComboboxItems = ["All records", "Active", "Paused", "Failed"];

/** Combobox composes its editable trigger with Toolbar.Input. */
export function ToolbarComboboxDemo() {
  return (
    <Toolbar className="w-full max-w-md">
      <Toolbar.Button icon={FunnelSimpleIcon}>Status</Toolbar.Button>
      <Combobox items={toolbarComboboxItems}>
        <Combobox.TriggerInput
          aria-label="Filter status"
          className="flex-1"
          placeholder="Filter status…"
          render={<Toolbar.Input />}
        />
        <Combobox.Content>
          <Combobox.List>
            {(item: string) => (
              <Combobox.Item key={item} value={item}>
                {item}
              </Combobox.Item>
            )}
          </Combobox.List>
          <Combobox.Empty>No matching statuses.</Combobox.Empty>
        </Combobox.Content>
      </Combobox>
    </Toolbar>
  );
}
