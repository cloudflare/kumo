import { useState } from "react";
import { Badge, Checkbox } from "@cloudflare/kumo";
import { ChatCircleTextIcon, EnvelopeIcon } from "@phosphor-icons/react";

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

export function CheckboxBorderedGroupDemo() {
  const [notifications, setNotifications] = useState<string[]>(["email"]);
  const [alertCategories, setAlertCategories] = useState<string[]>([
    "security",
    "performance",
  ]);
  const [exportContents, setExportContents] = useState<string[]>([
    "configuration",
    "analytics",
  ]);
  const [permissions, setPermissions] = useState<string[]>(["read", "edit"]);

  return (
    <div className="flex flex-col gap-8">
      <Checkbox.Group
        legend="Notifications"
        appearance="bordered"
        orientation="horizontal"
        value={notifications}
        onValueChange={setNotifications}
      >
        <Checkbox.Item
          value="email"
          label={
            <span className="flex items-center gap-2">
              <EnvelopeIcon
                size={18}
                className="text-kumo-subtle"
                aria-hidden
              />
              Email
            </span>
          }
        />
        <Checkbox.Item
          value="sms"
          label={
            <span className="flex items-center gap-2">
              <ChatCircleTextIcon
                size={18}
                className="text-kumo-subtle"
                aria-hidden
              />
              SMS
            </span>
          }
        />
      </Checkbox.Group>
      <Checkbox.Group
        legend="Alert categories (control first)"
        appearance="bordered"
        controlFirst
        value={alertCategories}
        onValueChange={setAlertCategories}
      >
        <Checkbox.Item value="security" label="Security" />
        <Checkbox.Item value="performance" label="Performance" />
        <Checkbox.Item
          value="reliability"
          label={
            <span className="flex flex-wrap items-center gap-2">
              Reliability
              <Badge variant="neutral">Beta</Badge>
            </span>
          }
        />
        <Checkbox.Item value="billing" label="Billing (unavailable)" disabled />
      </Checkbox.Group>
      <Checkbox.Group
        legend="Export contents"
        description="Long labels should wrap without moving or shrinking the controls."
        appearance="bordered"
        orientation="horizontal"
        value={exportContents}
        onValueChange={setExportContents}
      >
        <Checkbox.Item
          value="configuration"
          label="Account and zone configuration settings"
        />
        <Checkbox.Item
          value="analytics"
          label="Historical analytics and event data"
        />
        <Checkbox.Item
          value="members"
          label="Member profiles, roles, and access policies"
        />
      </Checkbox.Group>
      <Checkbox.Group
        legend="Team permissions"
        appearance="bordered"
        controlFirst
        value={permissions}
        onValueChange={setPermissions}
      >
        <Checkbox.Item value="read" label="View resources" />
        <Checkbox.Item value="edit" label="Create and edit resources" />
        <Checkbox.Item value="deploy" label="Deploy to production" />
        <Checkbox.Item value="members" label="Manage team members" />
        <Checkbox.Item value="billing" label="Manage billing" disabled />
      </Checkbox.Group>
    </div>
  );
}

/** Shows Checkbox.Legend with sr-only to visually hide the legend while keeping it accessible, useful when a parent Field already provides a visible label */
export function CheckboxLegendSrOnlyDemo() {
  const [preferences, setPreferences] = useState<string[]>(["email"]);
  return (
    <Checkbox.Group value={preferences} onValueChange={setPreferences}>
      <Checkbox.Legend className="sr-only">
        Notification preferences
      </Checkbox.Legend>
      <Checkbox.Item value="email" label="Email notifications" />
      <Checkbox.Item value="sms" label="SMS notifications" />
      <Checkbox.Item value="push" label="Push notifications" />
    </Checkbox.Group>
  );
}

/** Shows Checkbox.Legend with custom styling for full control over legend presentation */
export function CheckboxLegendCustomDemo() {
  const [preferences, setPreferences] = useState<string[]>(["email"]);
  return (
    <Checkbox.Group value={preferences} onValueChange={setPreferences}>
      <Checkbox.Legend className="text-sm font-normal text-kumo-subtle">
        Notification preferences
      </Checkbox.Legend>
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
