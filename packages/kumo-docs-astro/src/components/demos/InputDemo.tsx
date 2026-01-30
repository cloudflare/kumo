import { Input } from "@cloudflare/kumo";

export function InputBasicDemo() {
  return (
    <Input
      label="Email"
      placeholder="you@example.com"
      description="We'll never share your email"
    />
  );
}

export function InputWithLabelDemo() {
  return (
    <Input
      label="Username"
      placeholder="Choose a username"
      description="3-20 characters, alphanumeric only"
    />
  );
}

export function InputErrorStringDemo() {
  return (
    <Input
      label="Email"
      placeholder="you@example.com"
      value="invalid-email"
      variant="error"
      error="Please enter a valid email address"
    />
  );
}

export function InputErrorObjectDemo() {
  return (
    <Input
      label="Password"
      type="password"
      value="short"
      variant="error"
      error={{
        message: "Password must be at least 8 characters",
        match: "tooShort",
      }}
      minLength={8}
    />
  );
}

export function InputSizesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Input size="xs" label="Extra Small" placeholder="Extra small input" />
      <Input size="sm" label="Small" placeholder="Small input" />
      <Input label="Base" placeholder="Base input (default)" />
      <Input size="lg" label="Large" placeholder="Large input" />
    </div>
  );
}

export function InputDisabledDemo() {
  return <Input label="Disabled field" placeholder="Cannot edit" disabled />;
}

export function InputBareDemo() {
  return <Input placeholder="Search..." aria-label="Search products" />;
}

export function InputTypesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Input type="email" label="Email" placeholder="you@example.com" />
      <Input type="password" label="Password" placeholder="••••••••" />
      <Input type="number" label="Age" placeholder="18" />
      <Input type="tel" label="Phone" placeholder="+1 (555) 000-0000" />
    </div>
  );
}

export function InputOptionalFieldDemo() {
  return (
    <Input
      label="Phone Number"
      required={false}
      placeholder="+1 (555) 000-0000"
    />
  );
}

export function InputLabelTooltipDemo() {
  return (
    <Input
      label="API Key"
      labelTooltip="Find this in your dashboard under Settings > API Keys"
      placeholder="sk_live_..."
    />
  );
}

export function InputReactNodeLabelDemo() {
  return (
    <Input
      label={
        <span>
          Email for <strong>billing</strong>
        </span>
      }
      required
      placeholder="billing@company.com"
      type="email"
    />
  );
}
