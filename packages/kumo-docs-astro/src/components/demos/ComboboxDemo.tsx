import { useState } from "react";
import { Combobox, Text, Button } from "@cloudflare/kumo";

// Basic fruits list for simple demos (expanded to test scrolling)
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
  "Persimmon",
  "Pineapple",
  "Plum",
  "Pomegranate",
  "Raspberry",
  "Starfruit",
  "Strawberry",
  "Tangerine",
  "Watermelon",
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
  { value: "nl", label: "Dutch", emoji: "🇳🇱" },
  { value: "pl", label: "Polish", emoji: "🇵🇱" },
  { value: "ru", label: "Russian", emoji: "🇷🇺" },
  { value: "ja", label: "Japanese", emoji: "🇯🇵" },
  { value: "zh", label: "Chinese", emoji: "🇨🇳" },
  { value: "ko", label: "Korean", emoji: "🇰🇷" },
  { value: "ar", label: "Arabic", emoji: "🇸🇦" },
  { value: "hi", label: "Hindi", emoji: "🇮🇳" },
  { value: "tr", label: "Turkish", emoji: "🇹🇷" },
  { value: "vi", label: "Vietnamese", emoji: "🇻🇳" },
  { value: "th", label: "Thai", emoji: "🇹🇭" },
  { value: "sv", label: "Swedish", emoji: "🇸🇪" },
  { value: "no", label: "Norwegian", emoji: "🇳🇴" },
  { value: "da", label: "Danish", emoji: "🇩🇰" },
  { value: "fi", label: "Finnish", emoji: "🇫🇮" },
  { value: "el", label: "Greek", emoji: "🇬🇷" },
  { value: "cs", label: "Czech", emoji: "🇨🇿" },
  { value: "ro", label: "Romanian", emoji: "🇷🇴" },
  { value: "hu", label: "Hungarian", emoji: "🇭🇺" },
  { value: "uk", label: "Ukrainian", emoji: "🇺🇦" },
  { value: "id", label: "Indonesian", emoji: "🇮🇩" },
  { value: "ms", label: "Malay", emoji: "🇲🇾" },
  { value: "he", label: "Hebrew", emoji: "🇮🇱" },
  { value: "fa", label: "Persian", emoji: "🇮🇷" },
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
      { label: "South Korea", value: "south-korea" },
      { label: "India", value: "india" },
      { label: "Hong Kong", value: "hong-kong" },
      { label: "Taiwan", value: "taiwan" },
      { label: "Thailand", value: "thailand" },
    ],
  },
  {
    value: "Europe",
    items: [
      { label: "Germany", value: "germany" },
      { label: "France", value: "france" },
      { label: "Italy", value: "italy" },
      { label: "United Kingdom", value: "uk" },
      { label: "Netherlands", value: "netherlands" },
      { label: "Spain", value: "spain" },
      { label: "Poland", value: "poland" },
      { label: "Sweden", value: "sweden" },
    ],
  },
  {
    value: "North America",
    items: [
      { label: "United States (East)", value: "us-east" },
      { label: "United States (West)", value: "us-west" },
      { label: "Canada", value: "canada" },
      { label: "Mexico", value: "mexico" },
    ],
  },
  {
    value: "South America",
    items: [
      { label: "Brazil", value: "brazil" },
      { label: "Argentina", value: "argentina" },
      { label: "Chile", value: "chile" },
    ],
  },
  {
    value: "Oceania",
    items: [
      { label: "Australia", value: "australia" },
      { label: "New Zealand", value: "new-zealand" },
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
  { value: "mariadb", label: "MariaDB" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "sqlite", label: "SQLite" },
  { value: "cassandra", label: "Apache Cassandra" },
  { value: "dynamodb", label: "Amazon DynamoDB" },
  { value: "couchdb", label: "CouchDB" },
  { value: "neo4j", label: "Neo4j" },
  { value: "elasticsearch", label: "Elasticsearch" },
  { value: "cockroachdb", label: "CockroachDB" },
  { value: "timescaledb", label: "TimescaleDB" },
  { value: "clickhouse", label: "ClickHouse" },
  { value: "firestore", label: "Google Firestore" },
  { value: "supabase", label: "Supabase" },
  { value: "planetscale", label: "PlanetScale" },
  { value: "fauna", label: "Fauna" },
  { value: "d1", label: "Cloudflare D1" },
  { value: "turso", label: "Turso" },
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
  { value: "slurp", label: "Yahoo Slurp", author: "Yahoo" },
  { value: "applebot", label: "Applebot", author: "Apple" },
  { value: "facebookbot", label: "Facebookbot", author: "Meta" },
  { value: "twitterbot", label: "Twitterbot", author: "X" },
  { value: "linkedinbot", label: "LinkedInBot", author: "LinkedIn" },
  { value: "pinterestbot", label: "Pinterest", author: "Pinterest" },
  { value: "discordbot", label: "Discordbot", author: "Discord" },
  { value: "slackbot", label: "Slackbot", author: "Slack" },
  { value: "telegrambot", label: "TelegramBot", author: "Telegram" },
  { value: "whatsapp", label: "WhatsApp", author: "Meta" },
  { value: "semrushbot", label: "SemrushBot", author: "Semrush" },
  { value: "ahrefsbot", label: "AhrefsBot", author: "Ahrefs" },
  { value: "mj12bot", label: "MJ12bot", author: "Majestic" },
  { value: "dotbot", label: "DotBot", author: "Moz" },
  { value: "petalbot", label: "PetalBot", author: "Huawei" },
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
