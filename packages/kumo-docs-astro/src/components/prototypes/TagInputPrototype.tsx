import { XIcon } from "@phosphor-icons/react";
import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

type CommitResult = {
  values: string[];
  inputValue: string;
  rejected: boolean;
  message?: string;
};

type TagInputProps = {
  defaultValues?: string[];
  description: string;
  label: string;
  maxValues?: number;
  placeholder: string;
  validateValue?: (value: string, acceptedValues: string[]) => boolean;
  validationMessage?: string;
  allowPaste?: boolean;
};

function hasDelimiter(value: string) {
  return /[\n,]/.test(value);
}

function splitValues(value: string) {
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function commitText({
  rawValue,
  values,
  maxValues = -1,
  validateValue,
  validationMessage,
}: {
  rawValue: string;
  values: string[];
  maxValues?: number;
  validateValue?: TagInputProps["validateValue"];
  validationMessage?: string;
}): CommitResult {
  const entries = hasDelimiter(rawValue)
    ? splitValues(rawValue)
    : [rawValue.trim()].filter(Boolean);

  if (entries.length === 0) return { values, inputValue: "", rejected: false };

  const nextValues = [...values];

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];

    if (nextValues.includes(entry)) continue;

    if (maxValues > 0 && nextValues.length >= maxValues) {
      return {
        values: nextValues,
        inputValue: entries.slice(index).join(", "),
        rejected: true,
        message: `Limit of ${maxValues} tags reached.`,
      };
    }

    if (validateValue && !validateValue(entry, nextValues)) {
      return {
        values: nextValues,
        inputValue: entries.slice(index).join(", "),
        rejected: true,
        message: validationMessage ?? `“${entry}” is not valid.`,
      };
    }

    nextValues.push(entry);
  }

  return { values: nextValues, inputValue: "", rejected: false };
}

function TagInput({
  defaultValues = [],
  description,
  label,
  maxValues,
  placeholder,
  validateValue,
  validationMessage,
  allowPaste = true,
}: TagInputProps) {
  const [values, setValues] = useState(defaultValues);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (rawValue: string) => {
    const result = commitText({
      rawValue,
      values,
      maxValues,
      validateValue,
      validationMessage,
    });

    setInputValue(result.inputValue);
    setValues(result.values);
    setMessage(result.message);
    return !result.rejected;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!inputValue && event.key === "Backspace") {
      setValues((current) => current.slice(0, -1));
      setMessage(undefined);
      return;
    }

    if (!inputValue || !["Enter", ",", "Tab"].includes(event.key)) return;

    const didCommit = commit(inputValue);
    if (event.key !== "Tab" || didCommit) event.preventDefault();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (!allowPaste) {
      event.preventDefault();
      setMessage("Pasting is disabled for this input.");
      return;
    }

    const pasted = event.clipboardData.getData("text");
    const input = event.currentTarget;
    const selectionStart = input.selectionStart ?? inputValue.length;
    const selectionEnd = input.selectionEnd ?? inputValue.length;
    const nextInputValue =
      inputValue.slice(0, selectionStart) +
      pasted +
      inputValue.slice(selectionEnd);

    if (!hasDelimiter(nextInputValue)) return;

    event.preventDefault();
    commit(nextInputValue);
  };

  return (
    <div className="grid gap-2">
      <div className="grid gap-0.5">
        <label className="text-sm font-medium text-kumo-default">{label}</label>
        <p className="text-sm text-kumo-subtle">{description}</p>
      </div>
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg bg-kumo-control px-2 py-1.5 ring ring-kumo-line focus-within:ring-[1.5px] focus-within:ring-kumo-focus/50"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            inputRef.current?.focus();
          }
        }}
      >
        {values.map((value) => (
          <span
            key={value}
            className="flex h-6 max-w-full items-center gap-2.5 rounded-sm bg-kumo-overlay py-0 pr-[3px] pl-2 text-sm text-kumo-default ring-1 ring-kumo-hairline"
          >
            <span className="truncate">{value}</span>
            <button
              aria-label={`Remove ${value}`}
              className="flex cursor-pointer rounded-md bg-transparent p-1 text-kumo-subtle hover:bg-kumo-fill-hover hover:text-kumo-default focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-kumo-focus"
              data-kumo-component="TagInput"
              data-kumo-part="chip-remove"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setValues((current) => current.filter((tag) => tag !== value));
                setMessage(undefined);
              }}
              type="button"
            >
              <XIcon aria-hidden="true" size={10} />
            </button>
          </span>
        ))}
        <input
          aria-label={`Add a tag to ${label}`}
          className="min-w-32 flex-1 bg-transparent px-1 py-0.5 text-sm text-kumo-default outline-none placeholder:text-kumo-subtle"
          placeholder={values.length === 0 ? placeholder : undefined}
          ref={inputRef}
          value={inputValue}
          onBlur={() => commit(inputValue)}
          onChange={(event) => {
            setInputValue(event.target.value);
            setMessage(undefined);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
      <p aria-live="polite" className="min-h-5 text-sm text-kumo-danger">
        {message}
      </p>
    </div>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function TagInputPrototype() {
  return (
    <div className="grid gap-6">
      <TagInput
        defaultValues={["ava@cloudflare.com"]}
        description="Paste a comma- or newline-separated recipient list. Invalid addresses remain in the input for correction."
        label="Recipients"
        placeholder="name@example.com"
        validateValue={(value) => emailPattern.test(value)}
        validationMessage="Enter a valid email address."
      />
      <TagInput
        defaultValues={["frontend", "priority"]}
        description="Accepts any non-empty value. Commas, Enter, Tab, blur, and multi-value paste create tags."
        label="Labels"
        placeholder="Add a label"
      />
      <TagInput
        defaultValues={["alpha"]}
        description="A three-tag limit with pasting disabled, for deliberate one-at-a-time entry."
        label="Access groups"
        maxValues={3}
        placeholder="Type a group name"
        allowPaste={false}
      />
    </div>
  );
}
