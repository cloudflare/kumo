import { useState, useEffect } from "react";
import { Select, Text, Badge } from "@cloudflare/kumo";

/** Basic Select with visible label - the recommended pattern. */
export function SelectBasicDemo() {
  const [value, setValue] = useState("apple");

  return (
    <Select
      label="Favorite Fruit"
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v ?? "apple")}
      items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
    />
  );
}

/** Select without visible label - use aria-label for accessibility. */
export function SelectWithoutLabelDemo() {
  const [value, setValue] = useState("apple");

  return (
    <Select
      aria-label="Select a fruit"
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v ?? "apple")}
      items={{ apple: "Apple", banana: "Banana", cherry: "Cherry" }}
    />
  );
}

/** Select with label, description, and error handling. */
export function SelectWithFieldDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select
      label="Issue Type"
      description="Choose the category that best describes your issue"
      error={!value ? "Please select an issue type" : undefined}
      className="w-[280px]"
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      items={{
        bug: "Bug",
        documentation: "Documentation",
        feature: "Feature",
      }}
    />
  );
}

/** Select with placeholder text when no value is selected. */
export function SelectPlaceholderDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select
      label="Category"
      placeholder="Choose a category..."
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      items={{
        bug: "Bug",
        documentation: "Documentation",
        feature: "Feature",
      }}
    />
  );
}

/** Select with label tooltip for additional context. */
export function SelectWithTooltipDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select
      label="Priority"
      labelTooltip="Higher priority issues are addressed first"
      placeholder="Select priority"
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      items={{
        low: "Low",
        medium: "Medium",
        high: "High",
        critical: "Critical",
      }}
    />
  );
}

const languages = [
  { value: "en", label: "English", emoji: "🇬🇧" },
  { value: "fr", label: "French", emoji: "🇫🇷" },
  { value: "de", label: "German", emoji: "🇩🇪" },
  { value: "es", label: "Spanish", emoji: "🇪🇸" },
  { value: "it", label: "Italian", emoji: "🇮🇹" },
  { value: "pt", label: "Portuguese", emoji: "🇵🇹" },
];

/** Select with custom rendering for complex option display. */
export function SelectCustomRenderingDemo() {
  const [value, setValue] = useState(languages[0]);

  return (
    <Select
      label="Language"
      className="w-[200px]"
      renderValue={(v) => (
        <span>
          {v.emoji} {v.label}
        </span>
      )}
      value={value}
      onValueChange={(v) => setValue(v as (typeof languages)[0])}
    >
      {languages.map((language) => (
        <Select.Option key={language.value} value={language}>
          {language.emoji} {language.label}
        </Select.Option>
      ))}
    </Select>
  );
}

/** Select in loading state. */
export function SelectLoadingDemo() {
  return <Select aria-label="Loading select" className="w-[200px]" loading />;
}

/** Select that loads data asynchronously. */
export function SelectLoadingDataDemo() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<undefined | string[]>();
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setData(["Visal", "John", "Alice", "Michael", "Sok"]);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const items = data?.reduce(
    (acc, item) => {
      acc[item] = item;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <Select
      label="Assignee"
      className="w-[200px]"
      loading={loading}
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      placeholder="Select assignee"
      items={items}
    />
  );
}

/** Multi-select for choosing multiple values. */
export function SelectMultipleDemo() {
  const [value, setValue] = useState<string[]>(["Name", "Location", "Size"]);

  return (
    <Select
      label="Visible Columns"
      className="w-[250px]"
      multiple
      renderValue={(value) => {
        if (value.length > 3) {
          return (
            <span className="line-clamp-1">
              {value.slice(0, 2).join(", ") + ` and ${value.length - 2} more`}
            </span>
          );
        }
        return <span>{value.join(", ")}</span>;
      }}
      value={value}
      onValueChange={(v) => setValue(v as string[])}
    >
      <Select.Option value="Name">Name</Select.Option>
      <Select.Option value="Location">Location</Select.Option>
      <Select.Option value="Size">Size</Select.Option>
      <Select.Option value="Read">Read</Select.Option>
      <Select.Option value="Write">Write</Select.Option>
      <Select.Option value="CreatedAt">Created At</Select.Option>
    </Select>
  );
}

/** Multi-select with long option names to test overflow handling. */
export function SelectMultipleOverflowDemo() {
  const [value, setValue] = useState<string[]>([
    "European Union Privacy Regulation",
    "California Consumer Protection Act",
  ]);

  return (
    <Select
      label="Compliance Frameworks"
      className="w-[280px]"
      multiple
      value={value}
      onValueChange={(v) => setValue(v as string[])}
    >
      <Select.Option value="European Union Privacy Regulation">
        European Union Privacy Regulation
      </Select.Option>
      <Select.Option value="California Consumer Protection Act">
        California Consumer Protection Act
      </Select.Option>
      <Select.Option value="Health Insurance Portability Act">
        Health Insurance Portability Act
      </Select.Option>
      <Select.Option value="Payment Card Industry Standard">
        Payment Card Industry Standard
      </Select.Option>
    </Select>
  );
}

/** Multi-select with a custom indicator badge showing selection count. */
export function SelectMultipleWithIndicatorDemo() {
  const [value, setValue] = useState<string[]>(["bug", "feature"]);

  const allOptions = [
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature Request" },
    { value: "docs", label: "Documentation" },
    { value: "performance", label: "Performance Issue" },
    { value: "security", label: "Security Vulnerability" },
  ];

  return (
    <Select
      label="Issue Types"
      className="w-[220px]"
      multiple
      renderValue={(selected) => (
        <span className="flex items-center gap-2">
          <span>Issue Types</span>
          {selected.length > 0 && (
            <Badge variant="secondary">{selected.length}</Badge>
          )}
        </span>
      )}
      value={value}
      onValueChange={(v) => setValue(v as string[])}
    >
      {allOptions.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
}

const authors = [
  { id: 1, name: "John Doe", title: "Programmer" },
  { id: 2, name: "Alice Smith", title: "Software Engineer" },
  { id: 3, name: "Michael Chan", title: "UI/UX Designer" },
  { id: 4, name: "Sok Dara", title: "DevOps Engineer" },
  { id: 5, name: "Emily Johnson", title: "Product Manager" },
  { id: 6, name: "Visal In", title: "System Engineer" },
  { id: 7, name: "Laura Kim", title: "Technical Writer" },
];

/** Select with complex object values and custom option rendering. */
export function SelectComplexDemo() {
  const [value, setValue] = useState<(typeof authors)[0] | null>(null);

  return (
    <Select
      label="Author"
      description="Select the primary author for this document"
      className="w-[200px]"
      onValueChange={(v) => setValue(v as (typeof authors)[0] | null)}
      value={value}
      isItemEqualToValue={(item, value) => item?.id === value?.id}
      renderValue={(author) => {
        return author?.name ?? "Select an author";
      }}
    >
      {authors.map((author) => (
        <Select.Option key={author.id} value={author}>
          <div className="flex w-[300px] items-center justify-between gap-2">
            <Text>{author.name}</Text>
            <Text variant="secondary">{author.title}</Text>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
}
