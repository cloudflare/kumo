import { XIcon } from "@phosphor-icons/react";
import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../button/button";
import {
  Field,
  normalizeFieldError,
  type FieldErrorMatch,
} from "../field/field";
import { cn } from "../../utils/cn";
import { inputVariants, type KumoInputVariant } from "../input/input";

export const KUMO_TAG_INPUT_VARIANTS = {
  variant: {
    default: { classes: "", description: "Default tag input appearance." },
    error: { classes: "", description: "Error state for validation failures." },
  },
} as const;

export const KUMO_TAG_INPUT_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export const KUMO_TAG_INPUT_STYLING = {
  baseClasses: "flex flex-wrap items-center",
} as const;

type NativeInputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "defaultValue" | "disabled" | "size" | "value"
>;

export interface TagInputProps extends NativeInputProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  validateValue?: (value: string, acceptedValues: string[]) => boolean;
  maxValues?: number;
  label?: ReactNode;
  labelTooltip?: ReactNode;
  description?: ReactNode;
  error?: string | { message: ReactNode; match: FieldErrorMatch };
  variant?: KumoInputVariant;
  disabled?: boolean;
}

function splitValues(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value,
      defaultValue = [],
      onValueChange,
      validateValue,
      maxValues,
      label,
      labelTooltip,
      description,
      error,
      variant,
      disabled,
      className,
      placeholder,
      id,
      autoComplete = "off",
      onBlur,
      onChange,
      onKeyDown: onKeyDownProp,
      onPaste: onPasteProp,
      ...inputProps
    },
    forwardedRef,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [inputValue, setInputValue] = useState("");
    const [message, setMessage] = useState<string>();
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();
    const values = value ?? uncontrolledValue;

    const setValues = (nextValue: string[]) => {
      if (value === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };

    const commit = (rawValue: string) => {
      const entries = splitValues(rawValue);
      const nextValues = [...values];
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        if (nextValues.includes(entry)) continue;
        if (maxValues && nextValues.length >= maxValues) {
          setInputValue(entries.slice(index).join(", "));
          setMessage(`Limit of ${maxValues} tags reached.`);
          setValues(nextValues);
          return false;
        }
        if (validateValue && !validateValue(entry, nextValues)) {
          setInputValue(entries.slice(index).join(", "));
          setMessage(`"${entry}" is not valid.`);
          setValues(nextValues);
          return false;
        }
        nextValues.push(entry);
      }
      setValues(nextValues);
      setInputValue("");
      setMessage(undefined);
      return true;
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!inputValue && event.key === "Backspace") {
        setValues(values.slice(0, -1));
        return;
      }
      if (!inputValue || !["Enter", ",", "Tab"].includes(event.key)) return;
      const didCommit = commit(inputValue);
      if (event.key !== "Tab" || didCommit) event.preventDefault();
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      onPasteProp?.(event);
      if (event.defaultPrevented) return;
      const text = event.clipboardData.getData("text");
      if (!/[\n,]/.test(text)) return;
      event.preventDefault();
      commit(text);
    };

    const fieldError =
      normalizeFieldError(error) ?? normalizeFieldError(message);
    const inputVariant = variant ?? (fieldError ? "error" : "default");
    const chipClassName = cn(
      "flex w-fit max-w-full shrink-0 items-center gap-2.5 rounded-sm bg-kumo-overlay ring-1 ring-kumo-hairline",
      "h-6 py-0 pr-[3px] pl-2 text-sm",
    );
    const control = (
      <div
        className={cn(
          inputVariants({
            variant: inputVariant,
            parentFocusIndicator: true,
          }),
          "flex h-auto min-h-9 flex-wrap items-center gap-x-2 gap-y-1.5 px-2 py-1.5",
          className,
        )}
      >
        {values.map((item) => (
          <span key={item} className={cn(chipClassName, "text-kumo-default")}>
            <span className="truncate">{item}</span>
            <Button
              aria-label={`Remove ${item}`}
              icon={<XIcon size={10} />}
              shape="square"
              size="xs"
              variant="ghost"
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() =>
                setValues(values.filter((value) => value !== item))
              }
            />
          </span>
        ))}
        <input
          {...inputProps}
          ref={(node) => {
            inputRef.current = node;
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
          }}
          aria-invalid={Boolean(fieldError)}
          aria-label={
            inputProps["aria-label"] ??
            (typeof label === "string" ? label : "Add tag")
          }
          className={cn(
            "min-w-32 flex-1 bg-transparent outline-none",
            "px-1 py-0.5",
          )}
          disabled={disabled}
          autoComplete={autoComplete}
          id={id ?? inputId}
          placeholder={placeholder}
          value={inputValue}
          onBlur={(event) => {
            onBlur?.(event);
            if (!event.defaultPrevented) commit(inputValue);
          }}
          onChange={(event) => {
            setInputValue(event.target.value);
            setMessage(undefined);
            onChange?.(event);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>
    );
    if (label || description || fieldError) {
      return (
        <Field
          label={label ?? ""}
          labelTooltip={labelTooltip}
          description={description}
          error={fieldError}
        >
          {control}
        </Field>
      );
    }

    return control;
  },
);
TagInput.displayName = "TagInput";
