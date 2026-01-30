import { useState } from "react";
import { Radio } from "@cloudflare/kumo";

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

export function RadioErrorDemo() {
  return (
    <Radio.Group
      legend="Payment method"
      error="Please select a payment method to continue"
    >
      <Radio.Item label="Credit Card" value="card" variant="error" />
      <Radio.Item label="PayPal" value="paypal" variant="error" />
      <Radio.Item label="Bank Transfer" value="bank" variant="error" />
    </Radio.Group>
  );
}

export function RadioDisabledDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Radio.Group legend="Disabled group" disabled defaultValue="a">
        <Radio.Item label="Option A" value="a" />
        <Radio.Item label="Option B" value="b" />
      </Radio.Group>
      <Radio.Group legend="Individual disabled" defaultValue="available">
        <Radio.Item label="Available" value="available" />
        <Radio.Item label="Unavailable" value="unavailable" disabled />
      </Radio.Group>
    </div>
  );
}

export function RadioControlPositionDemo() {
  return (
    <Radio.Group legend="Preferences" controlPosition="end" defaultValue="a">
      <Radio.Item label="Label before radio" value="a" />
      <Radio.Item label="Another option" value="b" />
    </Radio.Group>
  );
}
