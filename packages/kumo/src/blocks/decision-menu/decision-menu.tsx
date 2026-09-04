import { Button } from "../../components/button";
import { Collapsible } from "../../components/collapsible";
import { Loader } from "../../components/loader";
import { LayerCard } from "../../components/layer-card";
import { cn } from "../../utils/cn";
import { Radio } from "../../primitives/radio";
import { RadioGroup } from "../../primitives/radio-group";
import { CheckIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecisionStatus =
  | "pending"
  | "applying"
  | "completed"
  | "failed"
  | "rejected";

export type DecisionOperation = "create" | "update" | "delete";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export const KUMO_DECISION_MENU_VARIANTS = {
  size: {
    base: {
      classes: "@container rounded-xl px-4 py-3 gap-3",
      description: "Default decision menu size",
    },
    lg: {
      classes:
        "@container rounded-2xl px-4 py-3 @min-md:px-5 @min-md:py-4 gap-4",
      description: "Large decision menu with responsive container padding",
    },
  },
} as const;

export const KUMO_DECISION_MENU_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoDecisionMenuSize =
  keyof typeof KUMO_DECISION_MENU_VARIANTS.size;

export interface KumoDecisionMenuVariantsProps {
  size?: KumoDecisionMenuSize;
}

// ---------------------------------------------------------------------------
// Private: Kbd
// ---------------------------------------------------------------------------

const Kbd = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <kbd
    className={cn(
      "inline-flex items-center justify-center rounded border border-kumo-line bg-kumo-base font-mono text-[9px] leading-none px-1 min-w-[1rem] h-[1rem]",
      className,
    )}
  >
    {children}
  </kbd>
);

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

interface DecisionMenuContextValue {
  formId: string;
  onCancel?: () => void;
}

const DecisionMenuContext = createContext<DecisionMenuContextValue>({
  formId: "",
});

interface DecisionActionsContextValue {
  selectedValue: string;
  submitForm: () => void;
  disabled: boolean;
  registerOption: (value: string) => number;
  unregisterOption: (value: string) => void;
}

const DecisionActionsContext =
  createContext<DecisionActionsContextValue | null>(null);

// ---------------------------------------------------------------------------
// DecisionMenu (Root)
// ---------------------------------------------------------------------------

export type DecisionMenuProps = {
  children?: ReactNode;
  className?: string;
  onCancel?: () => void;
} & KumoDecisionMenuVariantsProps;

const DecisionMenuRoot: React.FC<DecisionMenuProps> = ({
  children,
  className,
  onCancel,
  size = KUMO_DECISION_MENU_DEFAULT_VARIANTS.size,
}) => {
  const formId = useId();
  return (
    <DecisionMenuContext.Provider value={{ formId, onCancel }}>
      <LayerCard
        className={cn(
          "flex flex-col leading-relaxed",
          KUMO_DECISION_MENU_VARIANTS.size[size].classes,
          className,
        )}
      >
        {children}
      </LayerCard>
    </DecisionMenuContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// DecisionMenu.Description
// ---------------------------------------------------------------------------

export type DecisionMenuDescriptionProps = {
  children?: ReactNode;
  className?: string;
};

const DecisionMenuDescription: React.FC<DecisionMenuDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("text-base text-kumo-default", className)}>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// DecisionMenu.Actions
// ---------------------------------------------------------------------------

export type DecisionMenuActionsProps = {
  children?: ReactNode;
  className?: string;
  onSubmit: (value: string) => void;
  value?: string;
  disabled?: boolean;
};

const DecisionMenuActions: React.FC<DecisionMenuActionsProps> = ({
  children,
  onSubmit,
  className,
  value: valueProp,
  disabled = false,
}) => {
  const [value, setValue] = useState(valueProp ?? "");
  const { formId, onCancel } = useContext(DecisionMenuContext);
  const formRef = useRef<HTMLFormElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const optionRegistry = useRef<string[]>([]);

  // Sync controlled value
  useEffect(() => {
    if (valueProp != null) setValue(valueProp);
  }, [valueProp]);

  // Auto-focus first radio on mount
  useEffect(() => {
    if (disabled) return;
    const checked = groupRef.current?.querySelector<HTMLElement>(
      '[role="radio"][data-checked]',
    );
    (
      checked ?? groupRef.current?.querySelector<HTMLElement>('[role="radio"]')
    )?.focus();
  }, [disabled]);

  const submitForm = useCallback(() => {
    formRef.current?.requestSubmit();
  }, []);

  const registerOption = useCallback((optionValue: string) => {
    const registry = optionRegistry.current;
    if (!registry.includes(optionValue)) {
      registry.push(optionValue);
    }
    return registry.indexOf(optionValue);
  }, []);

  const unregisterOption = useCallback((optionValue: string) => {
    const registry = optionRegistry.current;
    const idx = registry.indexOf(optionValue);
    if (idx !== -1) {
      registry.splice(idx, 1);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
      return;
    }

    const digit = parseInt(e.key, 10);
    if (digit >= 1 && digit <= 9) {
      const target = optionRegistry.current[digit - 1];
      if (target != null) {
        setValue(target);
      }
    }
  };

  return (
    <DecisionActionsContext.Provider
      value={{ selectedValue: value, submitForm, disabled, registerOption, unregisterOption }}
    >
      <form
        ref={formRef}
        id={formId}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      >
        <div ref={groupRef}>
          <RadioGroup
            value={value}
            onValueChange={disabled ? undefined : setValue}
            className={cn("flex flex-col gap-0.5", className)}
          >
            {children}
          </RadioGroup>
        </div>
      </form>
    </DecisionActionsContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// DecisionMenu.Option
// ---------------------------------------------------------------------------

export type DecisionMenuOptionProps = {
  label: string;
  value: string;
  disabled?: boolean;
  customShortcut?: { label: string; key: string };
  className?: string;
};

const DecisionMenuOption: React.FC<DecisionMenuOptionProps> = ({
  label,
  value,
  customShortcut,
  className,
  disabled: disabledProp,
}) => {
  const actionsCtx = useContext(DecisionActionsContext);
  const isDisabled = disabledProp || actionsCtx?.disabled || false;

  useEffect(() => {
    if (!actionsCtx) return;
    actionsCtx.registerOption(value);
    return () => actionsCtx.unregisterOption(value);
  }, [actionsCtx, value]);

  const handleClick = () => {
    if (isDisabled || !actionsCtx) return;
    if (actionsCtx.selectedValue === value) {
      actionsCtx.submitForm();
    }
  };

  return (
    <label
      className={cn(
        "py-2 px-3 m-0 text-base font-medium rounded-lg [&:has([data-checked])]:bg-kumo-tint flex gap-2 items-center cursor-pointer",
        !isDisabled && "hover:bg-kumo-recessed",
        isDisabled &&
          "not-[&:has([data-checked])]:text-kumo-subtle [&:has([data-checked])]:bg-kumo-info-tint [&:has([data-checked])]:text-kumo-info cursor-default",
        className,
      )}
      onClick={handleClick}
    >
      {label}
      <Radio.Root value={value} disabled={isDisabled}>
        <Radio.Indicator />
      </Radio.Root>
      {!isDisabled && customShortcut && (
        <Kbd className="ml-auto text-[9px] bg-kumo-base">
          {customShortcut.label}
        </Kbd>
      )}
    </label>
  );
};

// ---------------------------------------------------------------------------
// DecisionMenu.Footer
// ---------------------------------------------------------------------------

const DecisionMenuFooter: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <hr className="my-0 border-kumo-hairline" />
      <div className="flex gap-1">{children}</div>
    </>
  );
};

// ---------------------------------------------------------------------------
// DecisionMenu.ShortcutButton
// ---------------------------------------------------------------------------

export type ShortcutButtonProps = {
  children: ReactNode;
  shortcut: string;
  onClick?: () => void;
  type?: "submit" | "cancel";
};

const DecisionMenuShortcutButton: React.FC<ShortcutButtonProps> = ({
  children,
  shortcut,
  onClick,
  type,
}) => {
  const { formId, onCancel } = useContext(DecisionMenuContext);
  const isSubmit = type === "submit";
  const isCancel = type === "cancel";
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-kumo-subtle hover:text-kumo-default"
      {...(isSubmit ? { type: "submit", form: formId } : {})}
      onClick={isCancel ? (onCancel ?? onClick) : onClick}
    >
      {children}
      <Kbd className="text-[9px] h-fit w-fit py-0">{shortcut}</Kbd>
    </Button>
  );
};

// ---------------------------------------------------------------------------
// DecisionMenu.StatusIndicator
// ---------------------------------------------------------------------------

export type StatusIndicatorProps = {
  status: "done" | "cancelled" | "loading" | "failed";
  action?: ReactNode;
  description?: string;
};

const DecisionMenuStatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  action,
  description,
}) => {
  const [open, setOpen] = useState(false);

  const statusRow = (
    <div className="flex items-center gap-2 text-base font-medium w-full py-1">
      <div
        className={cn(
          "size-5 rounded-md aspect-square flex items-center justify-center shrink-0",
          status === "done" && "bg-kumo-info-tint",
          status === "cancelled" && "bg-kumo-fill",
          status === "loading" && "bg-transparent",
          status === "failed" && "bg-kumo-danger-tint",
        )}
      >
        {status === "loading" && <Loader size={12} />}
        {status === "done" && (
          <CheckIcon size={10} className="text-kumo-info" weight="bold" />
        )}
        {status === "cancelled" && (
          <XIcon size={10} className="text-kumo-subtle" weight="bold" />
        )}
        {status === "failed" && (
          <WarningIcon size={10} className="text-kumo-danger" weight="bold" />
        )}
      </div>
      <p
        className={cn(
          "capitalize grow",
          status === "loading" && "animate-pulse italic",
        )}
      >
        {status === "loading" ? "Working on it..." : status}
      </p>
      {description && (
        <Collapsible.Trigger className="text-xs text-kumo-default whitespace-nowrap hover:underline shrink-0">
          {open ? "Show less" : "Show more"}
        </Collapsible.Trigger>
      )}
      {action}
    </div>
  );

  if (description) {
    return (
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        {statusRow}
        <Collapsible.Panel>
          <p className="text-sm text-kumo-subtle mt-1">{description}</p>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  }

  return statusRow;
};

// ---------------------------------------------------------------------------
// Compose the namespace
// ---------------------------------------------------------------------------

export const DecisionMenu = Object.assign(DecisionMenuRoot, {
  Description: DecisionMenuDescription,
  Actions: DecisionMenuActions,
  Option: DecisionMenuOption,
  Footer: DecisionMenuFooter,
  ShortcutButton: DecisionMenuShortcutButton,
  StatusIndicator: DecisionMenuStatusIndicator,
});

DecisionMenu.displayName = "DecisionMenu";
DecisionMenu.Description.displayName = "DecisionMenu.Description";
DecisionMenu.Actions.displayName = "DecisionMenu.Actions";
DecisionMenu.Option.displayName = "DecisionMenu.Option";
DecisionMenu.Footer.displayName = "DecisionMenu.Footer";
DecisionMenu.ShortcutButton.displayName = "DecisionMenu.ShortcutButton";
DecisionMenu.StatusIndicator.displayName = "DecisionMenu.StatusIndicator";
