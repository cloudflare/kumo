/**
 * This test replicates the EXACT scenario that broke in stratus.
 * NO explicit generic - relies entirely on inference.
 */
import { useState } from "react";
import { Select } from "../src/components/select/select";

interface Tunnel {
  id: string;
  name: string;
}

function StratusBrokenScenario() {
  const [tunnel, setTunnel] = useState<Tunnel | null>(null);

  // This is the exact pattern that caused T to infer as `never` in stratus
  return (
    <Select
      value={tunnel}
      onValueChange={setTunnel}
      renderValue={(t) => {
        // If T inferred as `never`, this would error:
        // "Property 'name' does not exist on type 'never'"
        return t.name;
      }}
    >
      <Select.Option value={{ id: "1", name: "Tunnel 1" }}>Tunnel 1</Select.Option>
    </Select>
  );
}

// Also test with isItemEqualToValue which was mentioned in the original bug
function StratusWithIsItemEqual() {
  const [tunnel, setTunnel] = useState<Tunnel | null>(null);

  return (
    <Select
      value={tunnel}
      onValueChange={setTunnel}
      isItemEqualToValue={(item, val) => {
        // If T = never, item and val would both be never
        return item.id === val.id;
      }}
      renderValue={(t) => t.name}
    >
      <Select.Option value={{ id: "1", name: "Tunnel 1" }}>Tunnel 1</Select.Option>
    </Select>
  );
}

export { StratusBrokenScenario, StratusWithIsItemEqual };
