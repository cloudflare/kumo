import { useState } from "react";
import { SensitiveInput, Button } from "@cloudflare/kumo";

export function SensitiveInputDemo() {
  return (
    <div className="w-80">
      <SensitiveInput label="API Key" defaultValue="sk_live_abc123xyz789" />
    </div>
  );
}

export function SensitiveInputSizesDemo() {
  const sizes = ["xs", "sm", "base", "lg"] as const;
  return (
    <div className="flex flex-col gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <span className="w-12 text-sm text-kumo-subtle">{size}</span>
          <SensitiveInput
            label={`${size} size`}
            size={size}
            defaultValue="secret-api-key-123"
          />
        </div>
      ))}
    </div>
  );
}

export function SensitiveInputControlledDemo() {
  const [value, setValue] = useState("my-secret-value");

  return (
    <div className="flex w-80 flex-col gap-4">
      <SensitiveInput
        label="Controlled Secret"
        value={value}
        onValueChange={setValue}
      />
      <div className="text-sm text-kumo-subtle">
        Current value: <code className="text-kumo-default">{value}</code>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => setValue("new-secret-" + Date.now())}
          variant="primary"
          size="sm"
        >
          Change value
        </Button>
        <Button onClick={() => setValue("")} variant="secondary" size="sm">
          Clear
        </Button>
      </div>
    </div>
  );
}

export function SensitiveInputStatesDemo() {
  return (
    <div className="flex w-80 flex-col gap-4">
      <SensitiveInput
        label="Error State"
        variant="error"
        defaultValue="invalid-key"
        error="This API key is not valid"
      />
      <SensitiveInput label="Disabled" defaultValue="cannot-edit" disabled />
      <SensitiveInput
        label="Read-only"
        defaultValue="view-only-secret-key"
        readOnly
      />
      <SensitiveInput
        label="With Description"
        defaultValue="my-secret-value"
        description="Keep this value secure and don't share it"
      />
    </div>
  );
}
