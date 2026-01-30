import { useState } from "react";
import { Checkbox } from "@cloudflare/kumo";

export function CheckboxBasicDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="Accept terms and conditions"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

export function CheckboxDefaultDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="Enable notifications"
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

export function CheckboxCheckedDemo() {
  const [checked, setChecked] = useState(true);
  return (
    <Checkbox label="I agree" checked={checked} onCheckedChange={setChecked} />
  );
}

export function CheckboxIndeterminateDemo() {
  const [indeterminate, setIndeterminate] = useState(true);
  return (
    <Checkbox
      label="Select all"
      indeterminate={indeterminate}
      onCheckedChange={setIndeterminate}
    />
  );
}

export function CheckboxLabelFirstDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="Remember me"
      controlFirst={false}
      checked={checked}
      onCheckedChange={setChecked}
    />
  );
}

export function CheckboxDisabledDemo() {
  return <Checkbox label="Disabled option" disabled />;
}

export function CheckboxErrorDemo() {
  return <Checkbox label="Invalid option" variant="error" />;
}

export function CheckboxGroupDemo() {
  const [preferences, setPreferences] = useState<string[]>(["email"]);

  return (
    <Checkbox.Group
      legend="Email preferences"
      description="Choose how you'd like to receive updates"
      value={preferences}
      onValueChange={setPreferences}
    >
      <Checkbox.Item value="email" label="Email notifications" />
      <Checkbox.Item value="sms" label="SMS notifications" />
      <Checkbox.Item value="push" label="Push notifications" />
    </Checkbox.Group>
  );
}

export function CheckboxGroupErrorDemo() {
  return (
    <Checkbox.Group
      legend="Required preferences"
      error="Please select at least one notification method"
      value={[]}
      onValueChange={() => {}}
    >
      <Checkbox.Item value="email" label="Email" variant="error" />
      <Checkbox.Item value="sms" label="SMS" variant="error" />
    </Checkbox.Group>
  );
}
