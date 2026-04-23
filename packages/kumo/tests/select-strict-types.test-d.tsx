/**
 * Type-level tests for Select with strictNullChecks and strictFunctionTypes.
 * These tests verify the TypeScript inference works correctly in strict mode.
 *
 * Run with: pnpm --filter @cloudflare/kumo test:types
 */

import { useState } from "react";
import { Select } from "../src/components/select/select";
import { expectTypeOf } from "vitest";

// =============================================================================
// Test: Object value with null state (the original bug)
// =============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

function TestObjectOrNull() {
  const [selected, setSelected] = useState<User | null>(null);

  // This should NOT cause T to infer as `never`
  return (
    <Select<User>
      value={selected}
      onValueChange={(value) => {
        // value should be User | null, not never
        expectTypeOf(value).toEqualTypeOf<User | null>();
        setSelected(value);
      }}
      renderValue={(user) => {
        // user should be User (non-null), since renderValue is only called with values
        expectTypeOf(user).toEqualTypeOf<User>();
        return user.name;
      }}
    >
      <Select.Option value={{ id: "1", name: "Alice", email: "a@b.com" }}>
        Alice
      </Select.Option>
    </Select>
  );
}

// =============================================================================
// Test: String value with null state
// =============================================================================

function TestStringOrNull() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        expectTypeOf(v).toEqualTypeOf<string | null>();
        setValue(v);
      }}
      items={{ a: "A", b: "B" }}
    />
  );
}

// =============================================================================
// Test: Multiple selection with object values
// =============================================================================

function TestMultipleObjects() {
  const [selected, setSelected] = useState<User[]>([]);

  return (
    <Select<User, true>
      multiple
      value={selected}
      onValueChange={(users) => {
        // users should be User[]
        expectTypeOf(users).toEqualTypeOf<User[]>();
        setSelected(users);
      }}
      renderValue={(users) => {
        // users should be User[] in multiple mode
        expectTypeOf(users).toEqualTypeOf<User[]>();
        return users.map((u) => u.name).join(", ");
      }}
    >
      <Select.Option value={{ id: "1", name: "Alice", email: "a@b.com" }}>
        Alice
      </Select.Option>
    </Select>
  );
}

// =============================================================================
// Test: renderValue receives non-null value
// =============================================================================

function TestRenderValueNonNull() {
  const [country, setCountry] = useState<{ code: string; name: string } | null>(
    null
  );

  return (
    <Select
      value={country}
      onValueChange={setCountry}
      placeholder="Select..."
      renderValue={(c) => {
        // c should NOT be null - renderValue is only called with actual values
        // This is the fix: renderValue typed as (value: T) => ReactNode, not (value: T | null)
        expectTypeOf(c).toEqualTypeOf<{ code: string; name: string }>();
        return c.name; // Should not need null check
      }}
    >
      <Select.Option value={{ code: "us", name: "USA" }}>USA</Select.Option>
    </Select>
  );
}

// =============================================================================
// Test: Inference without explicit generic
// =============================================================================

function TestInference() {
  const [value, setValue] = useState<string | null>(null);

  // Without explicit <string>, TS should infer from items/value
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        // Should infer string | null from the value prop
        setValue(v as string | null);
      }}
      items={{ foo: "Foo", bar: "Bar" }}
    />
  );
}

// Ensure tests are used (prevents unused variable warnings)
export { TestObjectOrNull, TestStringOrNull, TestMultipleObjects, TestRenderValueNonNull, TestInference };
