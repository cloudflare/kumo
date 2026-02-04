import { useState } from "react";
import { NativeSelect, Input } from "@cloudflare/kumo";

export function NativeSelectBasicDemo() {
  const [value, setValue] = useState("apple");

  return (
    <NativeSelect
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        setValue(e.target.value)
      }
      aria-label="Select a fruit"
      className="w-[200px]"
    >
      <option value="apple">Apple</option>
      <option value="banana">Banana</option>
      <option value="cherry">Cherry</option>
      <option value="date">Date</option>
    </NativeSelect>
  );
}

export function NativeSelectWithLabelDemo() {
  const [value, setValue] = useState("");

  return (
    <NativeSelect
      label="Country"
      description="Where you're located"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        setValue(e.target.value)
      }
      className="w-[280px]"
    >
      <option value="">Select a country</option>
      <option value="us">United States</option>
      <option value="ca">Canada</option>
      <option value="uk">United Kingdom</option>
      <option value="au">Australia</option>
    </NativeSelect>
  );
}

export function NativeSelectSizesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <NativeSelect size="xs" aria-label="Extra small" className="w-[160px]">
        <option>Extra Small</option>
        <option>Option 2</option>
      </NativeSelect>
      <NativeSelect size="sm" aria-label="Small" className="w-[180px]">
        <option>Small</option>
        <option>Option 2</option>
      </NativeSelect>
      <NativeSelect size="base" aria-label="Base" className="w-[200px]">
        <option>Base (default)</option>
        <option>Option 2</option>
      </NativeSelect>
      <NativeSelect size="lg" aria-label="Large" className="w-[220px]">
        <option>Large</option>
        <option>Option 2</option>
      </NativeSelect>
    </div>
  );
}

export function NativeSelectDisabledDemo() {
  return (
    <NativeSelect label="Disabled select" disabled className="w-[200px]">
      <option>Cannot change</option>
      <option>Option 2</option>
    </NativeSelect>
  );
}

export function NativeSelectErrorDemo() {
  return (
    <NativeSelect
      label="Category"
      error="Please select a category"
      className="w-[200px]"
    >
      <option value="">Select category</option>
      <option value="bug">Bug</option>
      <option value="feature">Feature</option>
    </NativeSelect>
  );
}

export function NativeSelectOptionalDemo() {
  return (
    <NativeSelect
      label="Preferred contact method"
      required={false}
      className="w-[280px]"
    >
      <option value="">No preference</option>
      <option value="email">Email</option>
      <option value="phone">Phone</option>
      <option value="mail">Mail</option>
    </NativeSelect>
  );
}

export function NativeSelectComparisonDemo() {
  const [nativeValue, setNativeValue] = useState("apple");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm text-kumo-subtle">
          NativeSelect (uses native OS picker on mobile)
        </p>
        <NativeSelect
          value={nativeValue}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setNativeValue(e.target.value)
          }
          aria-label="Native select"
          className="w-[200px]"
        >
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </NativeSelect>
      </div>
    </div>
  );
}

export function NativeSelectAutofillDemo() {
  return (
    <form className="flex max-w-sm flex-col gap-4">
      <Input
        label="Street address"
        name="street-address"
        autoComplete="street-address"
        placeholder="123 Main St"
      />
      <NativeSelect
        label="Country"
        name="country"
        autoComplete="country"
        className="w-full"
      >
        <option value="">Select a country</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="GB">United Kingdom</option>
        <option value="AU">Australia</option>
        <option value="DE">Germany</option>
        <option value="FR">France</option>
        <option value="JP">Japan</option>
      </NativeSelect>

      <div className="rounded-lg bg-kumo-elevated p-3">
        <p className="mb-2 text-xs font-medium text-kumo-default">
          How to test autofill:
        </p>
        <ol className="list-inside list-decimal space-y-1 text-xs text-kumo-subtle">
          <li>Click on the Street address input</li>
          <li>Chrome will offer to autofill from saved addresses</li>
          <li>Accept autofill - the Country select will be filled too</li>
        </ol>
      </div>
    </form>
  );
}
