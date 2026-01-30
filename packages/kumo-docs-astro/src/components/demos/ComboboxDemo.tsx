import { useState } from "react";
import { Combobox, Text, Button } from "@cloudflare/kumo";

// Basic fruits list for simple demos
const fruits = [
  "Apple",
  "Orange",
  "Banana",
  "Grape",
  "Strawberry",
  "Blueberry",
  "Cherry",
  "Watermelon",
  "Peach",
  "Pear",
];

// Languages with emoji for searchable inside popup demo
type Language = {
  value: string;
  label: string;
  emoji: string;
};

const languages: Language[] = [
  { value: "en", label: "English", emoji: "🇬🇧" },
  { value: "fr", label: "French", emoji: "🇫🇷" },
  { value: "de", label: "German", emoji: "🇩🇪" },
  { value: "es", label: "Spanish", emoji: "🇪🇸" },
  { value: "it", label: "Italian", emoji: "🇮🇹" },
  { value: "pt", label: "Portuguese", emoji: "🇵🇹" },
];

// Server locations for grouped demo
type ServerLocation = {
  label: string;
  value: string;
};

type ServerLocationGroup = {
  value: string;
  items: ServerLocation[];
};

const servers: ServerLocationGroup[] = [
  {
    value: "Asia",
    items: [
      { label: "Japan", value: "japan" },
      { label: "China", value: "china" },
      { label: "Singapore", value: "singapore" },
    ],
  },
  {
    value: "Europe",
    items: [
      { label: "Germany", value: "germany" },
      { label: "France", value: "france" },
      { label: "Italy", value: "italy" },
    ],
  },
];

type DatabaseItem = {
  value: string;
  label: string;
};

const databases: DatabaseItem[] = [
  { value: "postgres", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "sqlite", label: "SQLite" },
];

// Basic demo with TriggerInput
export function ComboboxDemo() {
  const [value, setValue] = useState<string | null>("Apple");

  return (
    <Combobox
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      items={fruits}
    >
      <Combobox.TriggerInput placeholder="Please select" />
      <Combobox.Content>
        <Combobox.Empty />
        <Combobox.List>
          {(item: string) => (
            <Combobox.Item key={item} value={item}>
              {item}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
  );
}

// Searchable inside popup with TriggerValue
export function ComboboxSearchableInsideDemo() {
  const [value, setValue] = useState<Language>(languages[0]);

  return (
    <Combobox
      value={value}
      onValueChange={(v) => setValue(v as Language)}
      items={languages}
    >
      <Combobox.TriggerValue className="w-[200px]" />
      <Combobox.Content>
        <Combobox.Input placeholder="Search languages" />
        <Combobox.Empty />
        <Combobox.List>
          {(item: Language) => (
            <Combobox.Item key={item.value} value={item}>
              {item.emoji} {item.label}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
  );
}

// Grouped items demo
export function ComboboxGroupedDemo() {
  const [value, setValue] = useState<ServerLocation | null>(null);

  return (
    <Combobox
      value={value}
      onValueChange={(v) => setValue(v as ServerLocation | null)}
      items={servers}
    >
      <Combobox.TriggerInput
        className="w-[200px]"
        placeholder="Select server"
      />
      <Combobox.Content>
        <Combobox.Empty />
        <Combobox.List>
          {(group: ServerLocationGroup) => (
            <Combobox.Group key={group.value} items={group.items}>
              <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
              <Combobox.Collection>
                {(item: ServerLocation) => (
                  <Combobox.Item key={item.value} value={item}>
                    {item.label}
                  </Combobox.Item>
                )}
              </Combobox.Collection>
            </Combobox.Group>
          )}
        </Combobox.List>
      </Combobox.Content>
    </Combobox>
  );
}

type BotItem = {
  value: string;
  label: string;
  author: string;
};

const bots: BotItem[] = [
  { value: "googlebot", label: "Googlebot", author: "Google" },
  { value: "bingbot", label: "Bingbot", author: "Microsoft" },
  { value: "yandexbot", label: "YandexBot", author: "Yandex" },
  { value: "duckduckbot", label: "DuckDuckBot", author: "DuckDuckGo" },
  { value: "baiduspider", label: "Baiduspider", author: "Baidu" },
];

export function ComboboxMultipleDemo() {
  const [value, setValue] = useState<BotItem[]>([]);

  return (
    <div className="flex gap-2">
      <Combobox
        value={value}
        onValueChange={setValue}
        items={bots}
        isItemEqualToValue={(bot: BotItem, selected: BotItem) =>
          bot.value === selected.value
        }
        multiple
      >
        <Combobox.TriggerMultipleWithInput
          className="w-[400px]"
          placeholder="Select bots"
          renderItem={(selected: BotItem) => (
            <Combobox.Chip key={selected.value}>{selected.label}</Combobox.Chip>
          )}
          inputSide="right"
        />
        <Combobox.Content className="max-h-[200px] min-w-auto overflow-y-auto">
          <Combobox.Empty />
          <Combobox.List>
            {(item: BotItem) => (
              <Combobox.Item key={item.value} value={item}>
                <div className="flex gap-2">
                  <Text>{item.label}</Text>
                  <Text variant="secondary">{item.author}</Text>
                </div>
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
      <Button variant="primary">Submit</Button>
    </div>
  );
}

export function ComboboxWithFieldDemo() {
  const [value, setValue] = useState<DatabaseItem | null>(null);

  return (
    <div className="w-80">
      <Combobox
        items={databases}
        value={value}
        onValueChange={setValue}
        label="Database"
        description="Select your preferred database"
      >
        <Combobox.TriggerInput placeholder="Select database" />
        <Combobox.Content>
          <Combobox.Empty />
          <Combobox.List>
            {(item: DatabaseItem) => (
              <Combobox.Item key={item.value} value={item}>
                {item.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    </div>
  );
}

export function ComboboxErrorDemo() {
  const [value, setValue] = useState<DatabaseItem | null>(null);

  return (
    <div className="w-80">
      <Combobox
        items={databases}
        value={value}
        onValueChange={setValue}
        label="Database"
        error={{ message: "Please select a database", match: true }}
      >
        <Combobox.TriggerInput placeholder="Select database" />
        <Combobox.Content>
          <Combobox.Empty />
          <Combobox.List>
            {(item: DatabaseItem) => (
              <Combobox.Item key={item.value} value={item}>
                {item.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Content>
      </Combobox>
    </div>
  );
}
