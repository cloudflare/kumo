import { useState } from "react";
import { Button, TagInput } from "@cloudflare/kumo";

export function TagInputDemo() {
  const [recipients, setRecipients] = useState(["ava@cloudflare.com"]);
  return (
    <TagInput
      label="Recipients"
      description="Paste comma- or newline-separated email addresses."
      placeholder="name@example.com"
      autoComplete="off"
      value={recipients}
      onValueChange={setRecipients}
      validateValue={(value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
    />
  );
}

export function TagInputUnrestrictedDemo() {
  return (
    <TagInput
      defaultValue={["frontend", "priority"]}
      label="Labels"
      description="Accepts any non-empty value."
      placeholder="Add a label"
    />
  );
}

export function TagInputLimitedDemo() {
  return (
    <TagInput
      defaultValue={["alpha"]}
      label="Access groups"
      maxValues={3}
      description="A maximum of three groups."
      placeholder="Type a group name"
    />
  );
}

/** Each tag is submitted as its own form value, and `required` follows the tags. */
export function TagInputFormDemo() {
  const [submitted, setSubmitted] = useState<string[] | null>(null);

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(data.getAll("topics").map(String));
      }}
    >
      <TagInput
        name="topics"
        required
        label="Topics"
        description="Add at least one topic, then submit."
        placeholder="Add a topic"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Submit
        </Button>
        {submitted ? (
          <code className="text-sm text-kumo-subtle">
            topics: {JSON.stringify(submitted)}
          </code>
        ) : null}
      </div>
    </form>
  );
}

export function TagInputReadOnlyDemo() {
  return (
    <TagInput
      readOnly
      defaultValue={["billing", "dns", "workers"]}
      label="Assigned teams"
      description="Managed by your organization's administrator."
    />
  );
}

export function TagInputLocalizationDemo() {
  return (
    <TagInput
      defaultValue={["uno"]}
      label="Etiquetas"
      labels={{
        input: "Agregar etiqueta",
        removeValue: (value) => `Eliminar ${value}`,
        invalidValue: (value) => `${value} no es valido.`,
        maxValuesReached: (maxValues) => `Maximo de ${maxValues} etiquetas.`,
      }}
      maxValues={3}
      placeholder="Agregar una etiqueta"
    />
  );
}
