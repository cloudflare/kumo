import { Button, cn, Textarea } from "@cloudflare/kumo";
import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react";
import React, {
  createContext,
  useContext,
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";

export const KUMO_PROMPT_INPUT_VARIANTS = {
  size: {
    base: {
      classes: "rounded-2xl gap-1.5 p-3 [&>textarea]:p-1",
      description: "Default prompt input size",
    },
    lg: {
      classes: "[&>textarea]:text-lg gap-2 p-4 [&>textarea]:p-2 rounded-3xl",
      description: "Large prompt input with bigger text",
    },
  },
  variant: {
    default: {
      classes: "",
      description: "Standard stacked layout with textarea above footer",
    },
    compact: {
      classes: "py-2 pl-2 pr-2 [&>textarea]:p-0! gap-2",
      description: "Inline single-row layout for space-constrained contexts",
    },
  },
} as const;

export const KUMO_PROMPT_INPUT_DEFAULT_VARIANTS = {
  size: "base",
  variant: "default",
} as const;

export type KumoPromptInputSize = keyof typeof KUMO_PROMPT_INPUT_VARIANTS.size;
export type KumoPromptInputVariant =
  keyof typeof KUMO_PROMPT_INPUT_VARIANTS.variant;

export interface KumoPromptInputVariantsProps {
  size?: KumoPromptInputSize;
  variant?: KumoPromptInputVariant;
}

export type PromptInputProps = {
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  className?: string;
  children?: React.ReactNode;
} & KumoPromptInputVariantsProps &
  React.HTMLAttributes<HTMLFormElement>;

export type PromptInputTextareaProps = {
  className?: string;
  /** Grow the textarea to fit content up to max-height (default `max-h-64` / 256px). Override max height via className, e.g. `className="max-h-96"`. */
  autoResize?: boolean;
  submitOnEnter?: boolean;
} & React.ComponentProps<typeof Textarea>;

type PromptInputStyleContextValue = {
  size: KumoPromptInputSize;
  variant: KumoPromptInputVariant;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
};

const PromptInputStyleContext =
  createContext<PromptInputStyleContextValue | null>(null);

const usePromptInputStyle = () => {
  const context = useContext(PromptInputStyleContext);
  return context ?? { size: "base" as const, variant: "default" as const };
};

const SIZE_MAP = {
  base: { button: "sm" as const },
  lg: { button: "base" as const },
} as const;

const PromptInputForm = forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInputForm(
    {
      onSubmit,
      size = KUMO_PROMPT_INPUT_DEFAULT_VARIANTS.size,
      variant = KUMO_PROMPT_INPUT_DEFAULT_VARIANTS.variant,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    const BASE_STYLES = cn(
      "relative ring-1 bg-kumo-control ring-kumo-line has-[textarea:focus]:ring-kumo-brand/50 has-[textarea:focus]:ring-[1.5px] transition-all",
      variant === "compact" ? "flex flex-row items-center" : "flex flex-col",
    );

    const handleContainerClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    return (
      <PromptInputStyleContext.Provider value={{ size, variant, textareaRef }}>
        <form onSubmit={onSubmit} className="contents" {...rest}>
          <div
            className={cn(
              BASE_STYLES,
              "cursor-text",
              KUMO_PROMPT_INPUT_VARIANTS.size[size].classes,
              KUMO_PROMPT_INPUT_VARIANTS.variant[variant].classes,
              className,
            )}
            onClick={handleContainerClick}
          >
            {children}
          </div>
        </form>
      </PromptInputStyleContext.Provider>
    );
  },
);

const PromptInputHeader: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useContext(PromptInputStyleContext);
  if (context?.variant === "compact") return null;
  if (React.Children.count(children) === 0) return null;

  return (
    <div
      data-slot="prompt-input-header"
      className="flex flex-wrap items-center gap-2"
    >
      {children}
    </div>
  );
};

const PromptInputTextarea: React.FC<PromptInputTextareaProps> = ({
  className,
  autoResize = false,
  submitOnEnter = true,
  ...props
}) => {
  const context = useContext(PromptInputStyleContext);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = context?.textareaRef ?? fallbackRef;
  const isCompact = context?.variant === "compact";
  const shouldAutoResize = autoResize && !isCompact;

  useEffect(() => {
    if (!shouldAutoResize || !textareaRef.current) return;

    const textarea = textareaRef.current;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    adjustHeight();
    textarea.addEventListener("input", adjustHeight);

    const observer = new ResizeObserver(adjustHeight);
    observer.observe(textarea);

    return () => {
      textarea.removeEventListener("input", adjustHeight);
      observer.disconnect();
    };
  }, [shouldAutoResize, props.value, textareaRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
    props.onKeyDown?.(e);
  };

  const BASE_STYLES = cn(
    "resize-none w-full border-none ring-0 focus:ring-0 focus:ring-transparent bg-transparent outline-none focus:outline-none p-0 !pb-0 m-0 rounded-none",
    isCompact ? "flex-1" : "max-h-64 overflow-y-auto",
  );

  return (
    <Textarea
      ref={textareaRef}
      placeholder={props.placeholder ?? "Ask anything..."}
      name="promptInput"
      rows={isCompact ? 1 : props.rows}
      autoFocus={false}
      {...props}
      className={cn(BASE_STYLES, className)}
      onKeyDown={handleKeyDown}
    />
  );
};

const PromptInputFooter: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useContext(PromptInputStyleContext);
  const isCompact = context?.variant === "compact";

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && context?.textareaRef?.current) {
      context.textareaRef.current.focus();
    }
  };

  return (
    <div
      data-slot="prompt-input-footer"
      className={cn(
        "flex items-center gap-1",
        isCompact ? "shrink-0" : "cursor-text",
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

const PromptInputSubmitButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { status?: "submit" | "stop" }
>(({ status = "submit", ...props }, ref) => {
  const { size } = usePromptInputStyle();
  const isStop = status === "stop";

  return (
    <Button
      ref={ref}
      variant="primary"
      size={SIZE_MAP[size].button}
      shape="circle"
      icon={isStop ? <StopIcon weight="fill" /> : <ArrowUpIcon weight="bold" />}
      aria-label={isStop ? "Stop" : "Submit"}
      type={isStop ? "button" : "submit"}
      {...props}
      className={cn("ml-auto transition-colors", props.className)}
    />
  );
});

export const PromptInput = Object.assign(PromptInputForm, {
  Header: PromptInputHeader,
  Textarea: PromptInputTextarea,
  Footer: PromptInputFooter,
  SubmitButton: PromptInputSubmitButton,
});

PromptInput.displayName = "PromptInput";
PromptInput.Header.displayName = "PromptInput.Header";
PromptInput.Textarea.displayName = "PromptInput.Textarea";
PromptInput.Footer.displayName = "PromptInput.Footer";
PromptInput.SubmitButton.displayName = "PromptInput.SubmitButton";
