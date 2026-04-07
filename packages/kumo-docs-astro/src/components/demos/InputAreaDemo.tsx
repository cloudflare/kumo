import { InputArea } from "@cloudflare/kumo";

export function InputAreaBasicDemo() {
  return (
    <InputArea
      label="Description"
      placeholder="Enter a description..."
      description="Provide details about your project"
    />
  );
}

export function InputAreaWithLabelDemo() {
  return (
    <InputArea
      label="Bio"
      placeholder="Tell us about yourself"
      description="Max 500 characters"
    />
  );
}

export function InputAreaErrorStringDemo() {
  return (
    <InputArea
      label="Message"
      placeholder="Enter your message"
      value="Hi"
      error="Message must be at least 10 characters"
    />
  );
}

export function InputAreaErrorObjectDemo() {
  return (
    <InputArea
      label="Feedback"
      value="Bad"
      error={{
        message: "Feedback must be at least 20 characters",
        match: "tooShort",
      }}
      minLength={20}
    />
  );
}

export function InputAreaSizesDemo() {
  return (
    <div className="flex flex-col gap-4">
      <InputArea
        size="xs"
        label="Extra Small"
        placeholder="Extra small textarea"
      />
      <InputArea size="sm" label="Small" placeholder="Small textarea" />
      <InputArea label="Base" placeholder="Base textarea (default)" />
      <InputArea size="lg" label="Large" placeholder="Large textarea" />
    </div>
  );
}

export function InputAreaDisabledDemo() {
  return (
    <InputArea label="Disabled field" placeholder="Cannot edit" disabled />
  );
}

export function InputAreaBareDemo() {
  return <InputArea placeholder="Add notes..." aria-label="Notes" rows={3} />;
}

export function InputAreaRowsDemo() {
  return (
    <div className="flex flex-col gap-4">
      <InputArea label="2 rows" placeholder="Small area" rows={2} />
      <InputArea label="4 rows (default)" placeholder="Medium area" rows={4} />
      <InputArea label="8 rows" placeholder="Large area" rows={8} />
    </div>
  );
}

export function InputAreaOptionalFieldDemo() {
  return (
    <InputArea
      label="Additional Notes"
      required={false}
      placeholder="Any additional information..."
    />
  );
}

export function InputAreaLabelTooltipDemo() {
  return (
    <InputArea
      label="Worker Script"
      labelTooltip="Enter your Cloudflare Worker script code here"
      placeholder="export default { async fetch(request) { ... } }"
      rows={4}
    />
  );
}

export function InputAreaReactNodeLabelDemo() {
  return (
    <InputArea
      label={
        <span>
          Notes for <strong>review</strong>
        </span>
      }
      required
      placeholder="Add notes for the reviewer..."
      rows={3}
    />
  );
}
