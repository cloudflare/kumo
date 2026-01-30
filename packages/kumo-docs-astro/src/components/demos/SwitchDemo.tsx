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
