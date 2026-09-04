import { useState } from "react";
import { TagInput } from "@cloudflare/kumo";

export function TagInputDemo() {
  const [recipients, setRecipients] = useState(["ava@cloudflare.com"]);
  return (
    <TagInput
      label="Recipients"
      description="Paste comma- or newline-separated email addresses."
      placeholder="name@example.com"
      autoComplete="off"
      value={recipients}
      onValueChange={setRecipients}
      validateValue={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
    />
  );
}

export function TagInputUnrestrictedDemo() {
  return (
    <TagInput
      defaultValue={["frontend", "priority"]}
      label="Labels"
      description="Accepts any non-empty value."
      placeholder="Add a label"
    />
  );
}

export function TagInputLimitedDemo() {
  return (
    <TagInput
      defaultValue={["alpha"]}
      label="Access groups"
      maxValues={3}
      description="A maximum of three groups."
      placeholder="Type a group name"
    />
  );
}
