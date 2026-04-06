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

/** All variants comparison — 2×2 grid showing off/on for default and neutral */
export function SwitchVariantsDemo() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      <Switch label="Default off" checked={false} onCheckedChange={() => {}} />
      <Switch label="Default on" checked={true} onCheckedChange={() => {}} />
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
    </div>
  );
}

/** Switch with a custom id prop — clicking the label should still toggle the switch. */
export function SwitchCustomIdDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Switch
      id="my-custom-switch"
      label="Custom ID"
      checked={checked}
      onCheckedChange={setChecked}
    />
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
