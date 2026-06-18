import {
  Button,
  Combobox,
  ControlGroup,
  Input,
  InputGroup,
  Select,
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

/** Basic ControlGroup with an input and adjacent action buttons. */
export function ControlGroupDemo() {
  return (
    <ControlGroup className="w-full max-w-md">
      <Input
        aria-label="Search DNS records"
        className="flex-1"
        placeholder="Search DNS Records"
      />
      <Button shape="square" icon={FunnelSimpleIcon} aria-label="Filter" />
      <Button shape="square" icon={GearSixIcon} aria-label="Settings" />
    </ControlGroup>
  );
}

/** ControlGroup locks child control sizes to the group size. */
export function ControlGroupSizesDemo() {
  return (
    <div className="grid gap-3">
      {(["xs", "sm", "base", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-10 text-sm text-kumo-subtle">{size}</span>
          <ControlGroup size={size} className="w-fit">
            <Input aria-label={`${size} search`} placeholder="Search..." />
            <Button>Apply</Button>
          </ControlGroup>
        </div>
      ))}
    </div>
  );
}

/** ControlGroup can mix Input, Select, and Button controls. */
export function ControlGroupMixedControlsDemo() {
  return (
    <ControlGroup className="w-full max-w-xl">
      <Select
        label="Record type"
        className="w-32"
        value="all"
        items={{ all: "All", a: "A", aaaa: "AAAA", cname: "CNAME" }}
      />
      <Input label="Record name" className="flex-1" placeholder="Name" />
      <Button icon={PlusIcon}>Add</Button>
    </ControlGroup>
  );
}

/** ControlGroup can compose an InputGroup with adjacent actions. */
export function ControlGroupInputGroupDemo() {
  return (
    <ControlGroup className="w-full max-w-lg">
      <InputGroup label="Worker subdomain" className="flex-1">
        <InputGroup.Input placeholder="my-worker" aria-label="Worker subdomain" />
        <InputGroup.Suffix>.workers.dev</InputGroup.Suffix>
      </InputGroup>
      <Button>Visit</Button>
    </ControlGroup>
  );
}

/** ControlGroup forces Button children to ghost styling. */
export function ControlGroupActionsDemo() {
  return (
    <ControlGroup size="base">
      <Button icon={UploadSimpleIcon} variant="primary">
        Upload
      </Button>
      <Button icon={DownloadSimpleIcon} variant="destructive">
        Download
      </Button>
    </ControlGroup>
  );
}

/** Labels inside ControlGroup stay accessible but are visually hidden. */
export function ControlGroupLabelsDemo() {
  return (
    <ControlGroup className="w-full max-w-lg">
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
      <Input label="Search records" className="flex-1" placeholder="Search" />
      <Button shape="square" icon={MagnifyingGlassIcon} aria-label="Search" />
    </ControlGroup>
  );
}
