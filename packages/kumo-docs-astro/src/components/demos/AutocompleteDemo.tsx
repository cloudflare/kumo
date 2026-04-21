import { useState } from "react";
import { Autocomplete } from "@cloudflare/kumo";

const fruits = [
  "Apple",
  "Apricot",
  "Avocado",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cantaloupe",
  "Cherry",
  "Coconut",
  "Cranberry",
  "Date",
  "Dragon Fruit",
  "Fig",
  "Grape",
  "Grapefruit",
  "Guava",
  "Honeydew",
  "Kiwi",
  "Lemon",
  "Lime",
  "Lychee",
  "Mango",
  "Nectarine",
  "Orange",
  "Papaya",
  "Passion Fruit",
  "Peach",
  "Pear",
  "Pineapple",
  "Plum",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

type Country = {
  code: string;
  label: string;
};

const countries: Country[] = [
  { code: "us", label: "United States" },
  { code: "gb", label: "United Kingdom" },
  { code: "de", label: "Germany" },
  { code: "fr", label: "France" },
  { code: "jp", label: "Japan" },
  { code: "cn", label: "China" },
  { code: "in", label: "India" },
  { code: "br", label: "Brazil" },
  { code: "ca", label: "Canada" },
  { code: "au", label: "Australia" },
  { code: "mx", label: "Mexico" },
  { code: "kr", label: "South Korea" },
  { code: "it", label: "Italy" },
  { code: "es", label: "Spain" },
  { code: "nl", label: "Netherlands" },
  { code: "se", label: "Sweden" },
  { code: "no", label: "Norway" },
  { code: "pl", label: "Poland" },
  { code: "ar", label: "Argentina" },
  { code: "za", label: "South Africa" },
];

type ServerLocation = {
  label: string;
  value: string;
};

type ServerGroup = {
  value: string;
  items: ServerLocation[];
};

const servers: ServerGroup[] = [
  {
    value: "North America",
    items: [
      { label: "US East (Virginia)", value: "us-east-1" },
      { label: "US West (Oregon)", value: "us-west-2" },
      { label: "Canada (Central)", value: "ca-central-1" },
    ],
  },
  {
    value: "Europe",
    items: [
      { label: "EU West (Ireland)", value: "eu-west-1" },
      { label: "EU Central (Frankfurt)", value: "eu-central-1" },
      { label: "EU North (Stockholm)", value: "eu-north-1" },
    ],
  },
  {
    value: "Asia Pacific",
    items: [
      { label: "AP Southeast (Singapore)", value: "ap-southeast-1" },
      { label: "AP Northeast (Tokyo)", value: "ap-northeast-1" },
      { label: "AP South (Mumbai)", value: "ap-south-1" },
    ],
  },
];

/** Basic autocomplete with a flat list of strings. */
export function AutocompleteDemo() {
  return (
    <Autocomplete items={fruits}>
      <Autocomplete.InputGroup placeholder="Search fruits…" />
      <Autocomplete.Content>
        <Autocomplete.List>
          {(item: string) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>
  );
}

/** Autocomplete with label, description, and Field wrapper. */
export function AutocompleteWithFieldDemo() {
  return (
    <div className="w-80">
      <Autocomplete
        items={countries}
        label="Country"
        description="Start typing to filter countries"
        filter={(item: Country, query: string) =>
          item.label.toLowerCase().includes(query.toLowerCase())
        }
      >
        <Autocomplete.InputGroup placeholder="Search countries…" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: Country) => (
              <Autocomplete.Item key={item.code} value={item}>
                {item.label}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
    </div>
  );
}

/** Autocomplete with error state via the Field wrapper. */
export function AutocompleteErrorDemo() {
  return (
    <div className="w-80">
      <Autocomplete
        items={countries}
        label="Country"
        error={{ message: "Please enter a valid country", match: true }}
        filter={(item: Country, query: string) =>
          item.label.toLowerCase().includes(query.toLowerCase())
        }
      >
        <Autocomplete.InputGroup placeholder="Search countries…" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: Country) => (
              <Autocomplete.Item key={item.code} value={item}>
                {item.label}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
    </div>
  );
}

/** Autocomplete with grouped items using Group and GroupLabel. */
export function AutocompleteGroupedDemo() {
  return (
    <Autocomplete items={servers}>
      <Autocomplete.InputGroup placeholder="Select region…" />
      <Autocomplete.Content>
        <Autocomplete.List>
          {(group: ServerGroup) => (
            <Autocomplete.Group key={group.value} items={group.items}>
              <Autocomplete.GroupLabel>{group.value}</Autocomplete.GroupLabel>
              <Autocomplete.Collection>
                {(item: ServerLocation) => (
                  <Autocomplete.Item key={item.value} value={item}>
                    {item.label}
                  </Autocomplete.Item>
                )}
              </Autocomplete.Collection>
            </Autocomplete.Group>
          )}
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>
  );
}

/** Demonstrates the four size variants: xs, sm, base, and lg. */
export function AutocompleteSizesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Autocomplete items={fruits.slice(0, 10)}>
        <Autocomplete.InputGroup size="xs" placeholder="xs" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
      <Autocomplete items={fruits.slice(0, 10)}>
        <Autocomplete.InputGroup size="sm" placeholder="sm" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
      <Autocomplete items={fruits.slice(0, 10)}>
        <Autocomplete.InputGroup size="base" placeholder="base (default)" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
      <Autocomplete items={fruits.slice(0, 10)}>
        <Autocomplete.InputGroup size="lg" placeholder="lg" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
    </div>
  );
}

/** Controlled autocomplete with value and onValueChange. */
export function AutocompleteControlledDemo() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-3 w-80">
      <Autocomplete
        items={fruits}
        value={value}
        onValueChange={(v) => setValue(v)}
      >
        <Autocomplete.InputGroup placeholder="Type a fruit…" />
        <Autocomplete.Content>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Content>
      </Autocomplete>
      {value && (
        <p className="text-sm text-kumo-subtle">
          Value: <span className="text-kumo-default font-medium">{value}</span>
        </p>
      )}
    </div>
  );
}
