import { useState } from "react";
import { Switch } from "@cloudflare/kumo";

export function SwitchBasicDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch label="Switch" checked={checked} onCheckedChange={setChecked} />
  );
}

export function SwitchOffDemo() {
  return <Switch label="Switch" checked={false} onCheckedChange={() => {}} />;
}

export function SwitchOnDemo() {
  return <Switch label="Switch" checked={true} onCheckedChange={() => {}} />;
}

export function SwitchDisabledDemo() {
  return <Switch label="Disabled" checked={false} disabled />;
}

/** Neutral variant - monochrome switch for subtle, less prominent toggles */
export function SwitchNeutralDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      label="Neutral switch"
      variant="neutral"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

/** Neutral variant in different states */
export function SwitchNeutralStatesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Switch
        label="Neutral off"
        variant="neutral"
        checked={false}
        onCheckedChange={() => {}}
      />
      <Switch
        label="Neutral on"
        variant="neutral"
        checked={true}
        onCheckedChange={() => {}}
      />
      <Switch
        label="Neutral disabled"
        variant="neutral"
        checked={false}
        disabled
      />
    </div>
  );
}

/** All variants comparison */
export function SwitchVariantsDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Switch
        label="Default variant"
        checked={true}
        onCheckedChange={() => {}}
      />
      <Switch
        label="Neutral variant"
        variant="neutral"
        checked={true}
        onCheckedChange={() => {}}
      />
    </div>
  );
}

/** All sizes comparison */
export function SwitchSizesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Switch
        label="Small"
        size="sm"
        checked={true}
        onCheckedChange={() => {}}
      />
      <Switch
        label="Base (default)"
        size="base"
        checked={true}
        onCheckedChange={() => {}}
      />
      <Switch
        label="Large"
        size="lg"
        checked={true}
        onCheckedChange={() => {}}
      />
    </div>
  );
}
