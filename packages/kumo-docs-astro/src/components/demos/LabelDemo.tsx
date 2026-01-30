import { Label, Input, Select, Checkbox } from "@cloudflare/kumo";

export function LabelBasicDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Label>Default Label</Label>
      <Label showOptional>Optional Label</Label>
      <Label tooltip="More information about this field">
        Label with Tooltip
      </Label>
    </div>
  );
}

export function LabelOptionalFieldDemo() {
  return (
    <Input label="Phone Number" required={false} placeholder="+1 555-0000" />
  );
}

export function LabelWithTooltipDemo() {
  return (
    <Input
      label="API Key"
      labelTooltip="Find this in your dashboard settings under API > Keys"
      placeholder="sk_live_..."
    />
  );
}

export function LabelReactNodeDemo() {
  return (
    <Checkbox
      label={
        <span>
          I agree to the <strong>Terms of Service</strong>
        </span>
      }
    />
  );
}

export function LabelFormMixedDemo() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <Input label="Full Name" placeholder="John Doe" />
      <Input
        label="Email"
        labelTooltip="We'll send your receipt here"
        placeholder="john@example.com"
        type="email"
      />
      <Input label="Company" required={false} placeholder="Acme Inc." />
      <Select label="Country" hideLabel={false} placeholder="Select a country">
        <Select.Option value="us">United States</Select.Option>
        <Select.Option value="uk">United Kingdom</Select.Option>
        <Select.Option value="ca">Canada</Select.Option>
      </Select>
    </div>
  );
}

export function LabelStandaloneDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Label>Default</Label>
      <Label showOptional>Optional</Label>
      <Label tooltip="Important field">With Tooltip</Label>
    </div>
  );
}
