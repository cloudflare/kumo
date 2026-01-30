import { useState, useEffect } from "react";
import { Select, Text } from "@cloudflare/kumo";

export function SelectBasicDemo() {
  const [value, setValue] = useState("Apple");

  return (
    <Select
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v ?? "Apple")}
      placeholder="Please select"
    >
      <Select.Option value="Apple">Apple</Select.Option>
      <Select.Option value="Banana">Banana</Select.Option>
      <Select.Option value="Cherry">Cherry</Select.Option>
    </Select>
  );
}

export function SelectLabelValueDemo() {
  const [value, setValue] = useState("bug");

  return (
    <Select
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v as string)}
      items={{
        bug: "Bug",
        documentation: "Documentation",
        feature: "Feature",
      }}
    >
      <Select.Option value="bug">Bug</Select.Option>
      <Select.Option value="documentation">Documentation</Select.Option>
      <Select.Option value="feature">Feature</Select.Option>
    </Select>
  );
}

export function SelectPlaceholderDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Select
      className="w-[200px]"
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      items={[
        { value: null, label: "Please select" },
        { value: "bug", label: "Bug" },
        { value: "documentation", label: "Documentation" },
        { value: "feature", label: "Feature" },
      ]}
    >
      <Select.Option value="bug">Bug</Select.Option>
      <Select.Option value="documentation">Documentation</Select.Option>
      <Select.Option value="feature">Feature</Select.Option>
    </Select>
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

export function SelectCustomRenderingDemo() {
  const [value, setValue] = useState(languages[0]);

  return (
    <Select
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

export function SelectLoadingDemo() {
  return <Select className="w-[200px]" loading />;
}

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

  return (
    <Select
      className="w-[200px]"
      loading={loading}
      value={value}
      onValueChange={(v) => setValue(v as string | null)}
      placeholder="Please select"
    >
      {data?.map((item) => (
        <Select.Option key={item} value={item}>
          {item}
        </Select.Option>
      ))}
    </Select>
  );
}

export function SelectMultipleDemo() {
  const [value, setValue] = useState<string[]>(["Name", "Location", "Size"]);

  return (
    <Select
      className="w-[250px]"
      multiple
      renderValue={(value) => {
        if (value.length > 3) {
          return (
            <span className="line-clamp-1">
              {value.slice(2).join(", ") + ` and ${value.length - 2} more`}
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

const authors = [
  { id: 1, name: "John Doe", title: "Programmer" },
  { id: 2, name: "Alice Smith", title: "Software Engineer" },
  { id: 3, name: "Michael Chan", title: "UI/UX Designer" },
  { id: 4, name: "Sok Dara", title: "DevOps Engineer" },
  { id: 5, name: "Emily Johnson", title: "Product Manager" },
  { id: 6, name: "Visal In", title: "System Engineer" },
  { id: 7, name: "Laura Kim", title: "Technical Writer" },
];

export function SelectComplexDemo() {
  const [value, setValue] = useState<(typeof authors)[0] | null>(null);

  return (
    <Select
      className="w-[200px]"
      onValueChange={(v) => setValue(v as (typeof authors)[0] | null)}
      value={value}
      isItemEqualToValue={(item, value) => item?.id === value?.id}
      renderValue={(author) => {
        return author?.name ?? "Please select author";
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
