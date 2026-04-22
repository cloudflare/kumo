import { useState } from "react";
import { Badge, Radio } from "@cloudflare/kumo";

/** Shows a basic controlled radio group */
export function RadioBasicDemo() {
  const [value, setValue] = useState("email");
  return (
    <Radio.Group
      legend="Notification preference"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item label="Email" value="email" />
      <Radio.Item label="SMS" value="sms" />
      <Radio.Item label="Push notification" value="push" />
    </Radio.Group>
  );
}

/** Shows the default vertical radio group layout */
export function RadioDefaultDemo() {
  const [value, setValue] = useState("personal");
  return (
    <Radio.Group legend="Account type" value={value} onValueChange={setValue}>
      <Radio.Item label="Personal" value="personal" />
      <Radio.Item label="Business" value="business" />
      <Radio.Item label="Enterprise" value="enterprise" />
    </Radio.Group>
  );
}

/** Shows a horizontal radio group layout */
export function RadioHorizontalDemo() {
  const [value, setValue] = useState("md");
  return (
    <Radio.Group
      legend="Size"
      orientation="horizontal"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item label="Small" value="sm" />
      <Radio.Item label="Medium" value="md" />
      <Radio.Item label="Large" value="lg" />
    </Radio.Group>
  );
}

/** Shows a radio group with helper description text */
export function RadioDescriptionDemo() {
  const [value, setValue] = useState("standard");
  return (
    <Radio.Group
      legend="Shipping method"
      description="Choose how you'd like to receive your order"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item label="Standard (5-7 days)" value="standard" />
      <Radio.Item label="Express (2-3 days)" value="express" />
      <Radio.Item label="Overnight" value="overnight" />
    </Radio.Group>
  );
}

/** Shows error state for both default and card radio groups */
export function RadioErrorDemo() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Radio.Group
        legend="Payment method"
        error="Please select a payment method to continue"
      >
        <Radio.Item label="Credit Card" value="card" variant="error" />
        <Radio.Item label="PayPal" value="paypal" variant="error" />
      </Radio.Group>
      <Radio.Group
        legend="Payment method"
        appearance="card"
        error="Please select a payment method to continue"
      >
        <Radio.Item
          label="Credit Card"
          description="Pay with Visa, Mastercard, American Express, or Elo."
          value="card"
          variant="error"
        />
        <Radio.Item
          label="PayPal"
          description="Pay with your PayPal account."
          value="paypal"
          variant="error"
        />
      </Radio.Group>
    </div>
  );
}

/** Shows disabled state for both default and card radio groups */
export function RadioDisabledDemo() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Radio.Group legend="Disabled group" disabled defaultValue="a">
        <Radio.Item label="Option A" value="a" />
        <Radio.Item label="Option B" value="b" />
      </Radio.Group>
      <Radio.Group legend="Individual disabled" defaultValue="available">
        <Radio.Item label="Available" value="available" />
        <Radio.Item label="Unavailable" value="unavailable" disabled />
      </Radio.Group>
      <Radio.Group
        legend="Disabled card group"
        appearance="card"
        disabled
        defaultValue="a"
      >
        <Radio.Item
          label="Option A"
          description="This option is disabled."
          value="a"
        />
        <Radio.Item
          label="Option B"
          description="This option is disabled."
          value="b"
        />
      </Radio.Group>
      <Radio.Group
        legend="Individual disabled card"
        appearance="card"
        defaultValue="available"
      >
        <Radio.Item
          label="Available"
          description="This option can be selected."
          value="available"
        />
        <Radio.Item
          label="Unavailable"
          description="This option is not available."
          value="unavailable"
          disabled
        />
      </Radio.Group>
    </div>
  );
}

/** Shows radio group with labels positioned before the radio control */
export function RadioControlPositionDemo() {
  return (
    <Radio.Group legend="Preferences" controlPosition="end" defaultValue="a">
      <Radio.Item label="Label before radio" value="a" />
      <Radio.Item label="Another option" value="b" />
    </Radio.Group>
  );
}

/** Shows radio card appearance with Cloudflare plan options */
export function RadioCardDemo() {
  const [value, setValue] = useState("free");
  return (
    <Radio.Group
      legend="Choose a plan"
      appearance="card"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item
        label="Free"
        description="For personal or hobby projects that aren't business-critical."
        value="free"
      />
      <Radio.Item
        label="Pro"
        description="For professional websites that aren't business-critical."
        value="pro"
      />
      <Radio.Item
        label="Business"
        description="For small businesses operating online."
        value="business"
      />
      <Radio.Item
        label="Contract"
        description="For mission-critical applications that are core to your business."
        value="contract"
      />
    </Radio.Group>
  );
}

/** Shows Radio.Legend with sr-only to visually hide the legend while keeping it accessible, useful when a parent Field already provides a visible label */
export function RadioLegendSrOnlyDemo() {
  const [value, setValue] = useState("all");
  return (
    <Radio.Group defaultValue="all" value={value} onValueChange={setValue}>
      <Radio.Legend className="sr-only">Paths</Radio.Legend>
      <Radio.Item label="Allow all paths" value="all" />
      <Radio.Item label="Restrict to specific paths" value="specific" />
    </Radio.Group>
  );
}

/** Shows Radio.Legend with custom styling for full control over legend presentation */
export function RadioLegendCustomDemo() {
  const [value, setValue] = useState("email");
  return (
    <Radio.Group value={value} onValueChange={setValue}>
      <Radio.Legend className="text-sm font-normal text-kumo-subtle">
        Notification preference
      </Radio.Legend>
      <Radio.Item label="Email" value="email" />
      <Radio.Item label="SMS" value="sms" />
      <Radio.Item label="Push notification" value="push" />
    </Radio.Group>
  );
}

/** Shows radio card appearance with the control positioned on the left via controlPosition="start" */
export function RadioCardControlStartDemo() {
  const [value, setValue] = useState("free");
  return (
    <Radio.Group
      legend="Choose a plan"
      appearance="card"
      controlPosition="start"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item
        label="Free"
        description="For personal or hobby projects that aren't business-critical."
        value="free"
      />
      <Radio.Item
        label="Pro"
        description="For professional websites that aren't business-critical."
        value="pro"
      />
    </Radio.Group>
  );
}

/** Shows Radio.Item labels with rich ReactNode content (icons, badges, or additional markup) */
export function RadioRichLabelDemo() {
  const [value, setValue] = useState("pro");
  return (
    <Radio.Group
      legend="Choose a plan"
      appearance="card"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item
        label={
          <span className="flex items-center gap-2">
            Free
            <Badge variant="neutral">$0</Badge>
          </span>
        }
        description="For personal or hobby projects."
        value="free"
      />
      <Radio.Item
        label={
          <span className="flex items-center gap-2">
            Pro
            <Badge variant="primary">Popular</Badge>
          </span>
        }
        description="For professional websites."
        value="pro"
      />
    </Radio.Group>
  );
}

/** Shows radio card appearance in horizontal layout */
export function RadioCardHorizontalDemo() {
  const [value, setValue] = useState("free");
  return (
    <Radio.Group
      legend="Choose a plan"
      appearance="card"
      orientation="horizontal"
      value={value}
      onValueChange={setValue}
    >
      <Radio.Item
        label="Free"
        description="For personal or hobby projects that aren't business-critical."
        value="free"
      />
      <Radio.Item
        label="Pro"
        description="For professional websites that aren't business-critical."
        value="pro"
      />
      <Radio.Item
        label="Business"
        description="For small businesses operating online."
        value="business"
      />
      <Radio.Item
        label="Contract"
        description="For mission-critical applications that are core to your business."
        value="contract"
      />
    </Radio.Group>
  );
}
