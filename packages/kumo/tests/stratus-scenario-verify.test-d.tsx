/**
 * Verify the inferred type is correct, not just "compiles"
 */
import { useState } from "react";
import { Select } from "../src/components/select/select";
import { expectTypeOf } from "vitest";

interface Tunnel {
  id: string;
  name: string;
}

function VerifyInferredTypes() {
  const [tunnel, setTunnel] = useState<Tunnel | null>(null);

  return (
    <Select
      value={tunnel}
      onValueChange={(v) => {
        // v should be Tunnel | null
        expectTypeOf(v).toEqualTypeOf<Tunnel | null>();
        setTunnel(v);
      }}
      renderValue={(t) => {
        // t should be Tunnel (non-null) - this is the key assertion
        expectTypeOf(t).toEqualTypeOf<Tunnel>();
        return t.name;
      }}
    >
      <Select.Option value={{ id: "1", name: "Tunnel 1" }}>Tunnel 1</Select.Option>
    </Select>
  );
}

export { VerifyInferredTypes };
