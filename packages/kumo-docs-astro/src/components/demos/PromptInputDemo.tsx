import { useState } from "react";
import { Button, DropdownMenu } from "@cloudflare/kumo";
import {
  BrainIcon,
  FileIcon,
  LightningIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { PromptInput } from "../kumo/prompt-input";

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

const CONTEXTS = ["dashboard-tile-3", "api-usage-chart"];

const MODEL_OPTIONS = [
  { value: "fast", label: "Fast", icon: LightningIcon },
  { value: "balanced", label: "Balanced", icon: SparkleIcon },
  { value: "quality", label: "Quality", icon: BrainIcon },
] as const;

type Model = (typeof MODEL_OPTIONS)[number]["value"];

// ---------------------------------------------------------------------------
// Prompt Input — full-fledged, base size
// ---------------------------------------------------------------------------

/** Full-featured prompt input with context badges and a radio dropdown. */
export function PromptInputDemo() {
  const [value, setValue] = useState("");
  const [contexts, setContexts] = useState<string[]>(CONTEXTS);
  const [model, setModel] = useState<Model>("balanced");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValue("");
  };

  const removeContext = (id: string) => {
    setContexts((prev) => prev.filter((c) => c !== id));
  };

  const selected = MODEL_OPTIONS.find((o) => o.value === model)!;
  const SelectedIcon = selected.icon;

  return (
    <div className="w-full max-w-xl">
      <PromptInput onSubmit={handleSubmit}>
        <PromptInput.Header>
          {contexts.map((id) => (
            <Button
              icon={FileIcon}
              key={id}
              variant="outline"
              size="sm"
              onClick={() => removeContext(id)}
              aria-label={`Remove ${id}`}
              className="shadow-none rounded-full"
            >
              {id}
              <XIcon size={12} />
            </Button>
          ))}
        </PromptInput.Header>
        <PromptInput.Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoResize
        />
        <PromptInput.Footer>
          <DropdownMenu>
            <DropdownMenu.Trigger
              render={
                <Button
                  aria-label="Select model"
                  variant="ghost"
                  size="sm"
                  icon={<SelectedIcon />}
                  className="rounded-full text-kumo-subtle hover:text-kumo-default"
                >
                  {selected.label}
                </Button>
              }
            />
            <DropdownMenu.Content side="top" align="start">
              <DropdownMenu.RadioGroup
                value={model}
                onValueChange={(v) => setModel(v as Model)}
              >
                {MODEL_OPTIONS.map((opt) => (
                  <DropdownMenu.RadioItem
                    key={opt.value}
                    value={opt.value}
                    icon={opt.icon}
                  >
                    {opt.label}
                    <DropdownMenu.RadioItemIndicator />
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
          <PromptInput.SubmitButton disabled={!value.trim()} />
        </PromptInput.Footer>
      </PromptInput>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prompt Input — full-fledged, large size
// ---------------------------------------------------------------------------

/** Full-featured large prompt input with context badges and a radio dropdown. */
export function PromptInputLargeDemo() {
  const [value, setValue] = useState("");
  const [contexts, setContexts] = useState<string[]>(CONTEXTS);
  const [model, setModel] = useState<Model>("balanced");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValue("");
  };

  const removeContext = (id: string) => {
    setContexts((prev) => prev.filter((c) => c !== id));
  };

  const selected = MODEL_OPTIONS.find((o) => o.value === model)!;
  const SelectedIcon = selected.icon;

  return (
    <div className="w-full max-w-xl">
      <PromptInput size="lg" onSubmit={handleSubmit}>
        <PromptInput.Header>
          {contexts.map((id) => (
            <Button
              icon={FileIcon}
              key={id}
              variant="outline"
              size="sm"
              onClick={() => removeContext(id)}
              aria-label={`Remove ${id}`}
              className="rounded-full shadow-none"
            >
              {id}
              <XIcon size={12} />
            </Button>
          ))}
        </PromptInput.Header>
        <PromptInput.Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoResize
        />
        <PromptInput.Footer>
          <DropdownMenu>
            <DropdownMenu.Trigger
              render={
                <Button
                  aria-label="Select model"
                  variant="ghost"
                  icon={<SelectedIcon />}
                  className="rounded-full shadow-none text-kumo-subtle hover:text-kumo-default"
                >
                  {selected.label}
                </Button>
              }
            />
            <DropdownMenu.Content side="top" align="start">
              <DropdownMenu.RadioGroup
                value={model}
                onValueChange={(v) => setModel(v as Model)}
              >
                {MODEL_OPTIONS.map((opt) => (
                  <DropdownMenu.RadioItem
                    key={opt.value}
                    value={opt.value}
                    icon={opt.icon}
                  >
                    {opt.label}
                    <DropdownMenu.RadioItemIndicator />
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
          <PromptInput.SubmitButton disabled={!value.trim()} />
        </PromptInput.Footer>
      </PromptInput>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact — base size
// ---------------------------------------------------------------------------

/** Compact prompt input — base size with model dropdown. */
export function PromptInputCompactDemo() {
  const [value, setValue] = useState("");
  const [model, setModel] = useState<Model>("balanced");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValue("");
  };

  const selected = MODEL_OPTIONS.find((o) => o.value === model)!;
  const SelectedIcon = selected.icon;

  return (
    <div className="w-full max-w-md">
      <PromptInput variant="compact" onSubmit={handleSubmit}>
        <DropdownMenu>
          <DropdownMenu.Trigger
            render={
              <Button
                aria-label="Select model"
                variant="outline"
                size="sm"
                shape="circle"
                icon={<SelectedIcon />}
              />
            }
          />
          <DropdownMenu.Content side="top" align="start">
            <DropdownMenu.RadioGroup
              value={model}
              onValueChange={(v) => setModel(v as Model)}
            >
              {MODEL_OPTIONS.map((opt) => (
                <DropdownMenu.RadioItem
                  key={opt.value}
                  value={opt.value}
                  icon={opt.icon}
                >
                  {opt.label}
                  <DropdownMenu.RadioItemIndicator />
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu>
        <PromptInput.Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <PromptInput.Footer>
          <PromptInput.SubmitButton disabled={!value.trim()} />
        </PromptInput.Footer>
      </PromptInput>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact — large size
// ---------------------------------------------------------------------------

/** Compact prompt input — large size with model dropdown. */
export function PromptInputCompactLargeDemo() {
  const [value, setValue] = useState("");
  const [model, setModel] = useState<Model>("balanced");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValue("");
  };

  const selected = MODEL_OPTIONS.find((o) => o.value === model)!;
  const SelectedIcon = selected.icon;

  return (
    <div className="w-full max-w-md">
      <PromptInput variant="compact" size="lg" onSubmit={handleSubmit}>
        <DropdownMenu>
          <DropdownMenu.Trigger
            render={
              <Button
                aria-label="Select model"
                variant="outline"
                shape="circle"
                icon={<SelectedIcon />}
              />
            }
          />
          <DropdownMenu.Content side="top" align="start">
            <DropdownMenu.RadioGroup
              value={model}
              onValueChange={(v) => setModel(v as Model)}
            >
              {MODEL_OPTIONS.map((opt) => (
                <DropdownMenu.RadioItem
                  key={opt.value}
                  value={opt.value}
                  icon={opt.icon}
                >
                  {opt.label}
                  <DropdownMenu.RadioItemIndicator />
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.Content>
        </DropdownMenu>
        <PromptInput.Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <PromptInput.Footer>
          <PromptInput.SubmitButton disabled={!value.trim()} />
        </PromptInput.Footer>
      </PromptInput>
    </div>
  );
}
