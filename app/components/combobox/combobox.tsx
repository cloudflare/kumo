import { Combobox as ComboboxBase } from "@base-ui-components/react/combobox";
import { inputVariants } from "../input/input";
import { cn } from "../utils";
import {
  CaretDownIcon,
  CheckIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useId, useMemo, useState, type ComponentPropsWithoutRef } from "react";

interface LabelItem {
  creatable?: string;
  id: string;
  value: string;
}

type RootProps = ComponentPropsWithoutRef<typeof ComboboxBase.Root>;

type ComboboxProps = Omit<
  RootProps,
  | "multiple"
  | "items"
  | "inputValue"
  | "onInputValueChange"
  | "onValueChange"
> & {
  onCreate?: (value: string) => void;
  items?: LabelItem[];
  initialItems?: LabelItem[];
  onInputValueChange?: (value: string) => string | undefined;
  onValueChange?: (value: LabelItem | null) => void;
  placeholder?: string;
  inputId?: string;
  label?: string;
  hideLabel?: boolean;
};

export function Combobox({
  items,
  initialItems,
  onCreate,
  onInputValueChange,
  value: valueProp,
  onValueChange: onValueChangeProp,
  placeholder,
  onOpenChange,
  inputId,
  label,
  hideLabel = true,
  ...props
}: ComboboxProps) {
  const isValueControlled = valueProp !== undefined;
  const isItemsControlled = items !== undefined;

  const [controlledLabels, setLabels] = useState<LabelItem[]>(
    initialItems ?? items ?? []
  );
  const [uncontrolledValue, setUncontrolledValue] = useState<LabelItem | null>(
    null
  );
  const [query, setQuery] = useState("");

  const labels = (isItemsControlled ? items : controlledLabels) ?? [];

  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const exactExists = labels.some(
    (l) => l.value.trim().toLocaleLowerCase() === lowered
  );

  const currentValue: LabelItem | null =
    (valueProp as LabelItem | null | undefined) ?? uncontrolledValue;

  const hasSelectedValue = currentValue !== null;

  const setSelected = (next: LabelItem | null) => {
    if (!isValueControlled) {
      setUncontrolledValue(next);
    }
    onValueChangeProp?.(next ?? null);
  };

  function handleCreate() {
    const nextItem = { id: lowered, value: trimmed };
    if (!isItemsControlled)
      setLabels((prevLabels) => {
        const exists = prevLabels.some((l) => l.id === lowered);
        if (exists) return prevLabels;
        return [...prevLabels, nextItem];
      });
    setSelected(nextItem);
    onCreate?.(trimmed);
  }

  const itemsForView = useMemo(() => {
    if (!onCreate) return labels;
    if (trimmed === "" || exactExists) return labels;
    return [
      ...labels,
      {
        creatable: trimmed,
        id: `create:${lowered}`,
        value: `Create "${trimmed}"`,
      },
    ];
  }, [labels, onCreate, trimmed, lowered, exactExists]);

  const hasCreatable = itemsForView.at(-1)?.creatable;
  const generatedInputId = useId();
  const computedInputId = inputId ?? generatedInputId;
  const labelId = useId();
  const propsLookup = props as Record<string, unknown>;
  const ariaLabelFromProps = propsLookup["aria-label"] as string | undefined;
  const ariaLabelledbyFromProps = propsLookup["aria-labelledby"] as string | undefined;
  const inputLabelledBy =
    ariaLabelledbyFromProps ?? (label ? labelId : undefined);
  const inputAriaLabel =
    ariaLabelFromProps ?? (!inputLabelledBy ? label : undefined);

  return (
    <>
      {label && (
        <label
          id={labelId}
          htmlFor={computedInputId}
          className={hideLabel ? "sr-only" : "block text-sm font-medium text-surface"}
        >
          {label}
        </label>
      )}
      <ComboboxBase.Root
      items={itemsForView}
      onValueChange={(nextItem) => {
        const next = nextItem as LabelItem;
        if (next && next.creatable) {
          handleCreate();
          return;
        }
        setSelected(next);
        setQuery("");
      }}
      value={currentValue}
      inputValue={query}
      onInputValueChange={(v) => {
        const modifiedStr = onInputValueChange?.(v) ?? v;
        setQuery(modifiedStr);
      }}
      onOpenChange={(open, details) => {
        onOpenChange?.(open, details);
        if (
          "key" in details.event &&
          details.event.key === "Enter" &&
          details.reason !== "item-press"
        ) {
          // When pressing Enter:
          // - If the typed value exactly matches an existing item, add that item to the selected chips
          // - Otherwise, create a new item
          if (trimmed === "") {
            return;
          }

          /**
           * If the typed value exactly matches an existing item, set that item
           * as the selected item
           */
          const existing = labels.find(
            (l) => l.value.trim().toLocaleLowerCase() === lowered
          );
          if (existing) {
            setSelected(existing);
            setQuery("");
            return;
          }

          // Otherwise, create a new item
          handleCreate();
        }
      }}
      {...props}
    >
      <div className="relative">
        <ComboboxBase.Input
          id={computedInputId}
          placeholder={placeholder}
          aria-label={inputAriaLabel}
          aria-labelledby={inputLabelledBy}
          className={inputVariants()}
        />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex">
          <ComboboxBase.Clear
            aria-label="Clear selection"
            className={cn(
              "size-8 cursor-pointer",
              hasSelectedValue ? "flex items-center justify-center" : "hidden"
            )}
          >
            <XIcon />
          </ComboboxBase.Clear>
          {!hasSelectedValue && (
            <ComboboxBase.Trigger
              aria-label="Toggle options"
              className="size-8 flex items-center justify-center cursor-pointer"
            >
              <CaretDownIcon />
            </ComboboxBase.Trigger>
          )}
        </div>
      </div>
      <ComboboxBase.Portal>
        <ComboboxBase.Positioner
          className="z-50 outline-none"
          align="start"
          sideOffset={4}
        >
          <ComboboxBase.Popup
            className={cn(
              "min-w-(--anchor-width) max-h-[min(var(--available-height),24rem)] max-w-(--available-width) overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain p-1.5",
              "z-50 bg-surface dark:bg-neutral-900 text-surface overflow-hidden", // background
              "ring ring-neutral-950/10 dark:ring-neutral-800 shadow-lg rounded-lg" // border part
            )}
          >
            <ComboboxBase.Empty className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No labels found.
            </ComboboxBase.Empty>
            <ComboboxBase.List>
              {(item: LabelItem) =>
                item.creatable ? (
                  <ComboboxBase.Item
                    key={item.id}
                    className="data-highlighted:bg-neutral-100 dark:data-highlighted:bg-neutral-800 px-2 rounded py-1.5 text-base grid grid-cols-[16px_1fr] gap-2 group"
                    value={item}
                  >
                    <span className="col-start-1 flex items-center">
                      <PlusIcon />
                    </span>
                    <div className="col-start-2">Create "{item.creatable}"</div>
                  </ComboboxBase.Item>
                ) : (
                  <div
                    className={cn(
                      hasCreatable &&
                        "nth-last-[2]:mb-1.5 nth-last-[2]:pb-1.5 nth-last-[2]:border-b border-neutral-200 dark:border-neutral-800"
                    )}
                  >
                  <ComboboxBase.Item
                    key={item.id}
                    className="data-highlighted:bg-neutral-100 dark:data-highlighted:bg-neutral-800 px-2 rounded py-1.5 text-base grid grid-cols-[16px_1fr] gap-2 group cursor-pointer"
                    value={item}
                  >
                      <ComboboxBase.ItemIndicator className="col-start-1 flex items-center">
                        <CheckIcon />
                      </ComboboxBase.ItemIndicator>
                      <div className="col-start-2">{item.value}</div>
                    </ComboboxBase.Item>
                  </div>
                )
              }
            </ComboboxBase.List>
          </ComboboxBase.Popup>
        </ComboboxBase.Positioner>
      </ComboboxBase.Portal>
    </ComboboxBase.Root>
    </>
  );
}
