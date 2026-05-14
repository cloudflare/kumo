import {
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactNode,
  forwardRef,
} from "react";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "../../utils/cn";

export const KUMO_TAG_VARIANTS = {
  variant: {
    default: {
      classes: "bg-kumo-recessed ring-1 ring-kumo-line",
      description: "Standard tag",
    },
  },
} as const;

export const KUMO_TAG_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type KumoTagVariant = keyof typeof KUMO_TAG_VARIANTS.variant;

const TAG_BASE =
  "inline-flex h-6 max-w-[320px] shrink-0 items-center gap-2.5 rounded-sm bg-kumo-recessed text-sm ring-1 ring-kumo-line";

const TAG_CLICKABLE =
  "cursor-pointer hover:bg-kumo-fill-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kumo-brand";

const MAIN_BUTTON =
  "inline-flex min-w-0 items-center gap-1 rounded-sm bg-transparent p-0 [font:inherit] leading-4 text-kumo-default outline-none cursor-pointer disabled:cursor-not-allowed";

const DISMISS_BUTTON =
  "flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-sm bg-transparent text-kumo-subtle hover:bg-kumo-control hover:text-kumo-default focus-visible:bg-kumo-interact focus-visible:text-kumo-default focus-visible:outline focus-visible:outline-1 focus-visible:outline-kumo-brand disabled:cursor-not-allowed";

const FOCUS_RING_PRIMARY =
  "[&:has(>button:first-child:focus-visible)]:outline [&:has(>button:first-child:focus-visible)]:outline-2 [&:has(>button:first-child:focus-visible)]:outline-offset-1 [&:has(>button:first-child:focus-visible)]:outline-kumo-brand";

const HOVER_PRIMARY =
  "[&:has(>button:first-child)]:hover:bg-kumo-fill-hover [&:has(>button:first-child:disabled)]:hover:bg-kumo-recessed";

interface TagVisualProps {
  /** Leading icon before the label. */
  icon?: ReactNode;
  /** Key prefix displayed before the label (e.g. "KEY: label"). */
  tagKey?: string;
  /** Content rendered in the aside section, separated by a divider. */
  aside?: ReactNode;
}

const TagVisual = ({
  icon,
  tagKey,
  aside,
  children,
}: TagVisualProps & { children?: ReactNode }) => (
  <>
    {icon && (
      <span aria-hidden="true" className="shrink-0">
        {icon}
      </span>
    )}
    {tagKey && (
      <span className="shrink-0 font-medium text-kumo-subtle">{tagKey}:</span>
    )}
    <span className="truncate">{children}</span>
    {aside && (
      <>
        <span aria-hidden="true" className="h-3 w-px shrink-0 bg-kumo-line" />
        <span className="inline-flex shrink-0 items-center gap-1">{aside}</span>
      </>
    )}
  </>
);

export interface TagLabelProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    TagVisualProps {
  children?: ReactNode;
}

const TagLabel = forwardRef<HTMLSpanElement, TagLabelProps>(
  ({ icon, tagKey, aside, children, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex min-w-0 items-center gap-1", className)}
      {...props}
    >
      <TagVisual icon={icon} tagKey={tagKey} aside={aside}>
        {children}
      </TagVisual>
    </span>
  ),
);

export interface TagRootProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Adds space for the dismiss button and main-focus outer ring behavior. */
  dismissible?: boolean;
}

const TagRoot = forwardRef<HTMLSpanElement, TagRootProps>(
  ({ dismissible = false, className, ...props }, ref) => (
    <span
      ref={ref}
      role={dismissible ? "group" : undefined}
      className={cn(
        TAG_BASE,
        dismissible ? "pl-2 pr-[3px]" : "pl-2 pr-2",
        HOVER_PRIMARY,
        FOCUS_RING_PRIMARY,
        className,
      )}
      {...props}
    />
  ),
);

export interface TagMainProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    TagVisualProps {
  children?: ReactNode;
}

const TagMain = forwardRef<HTMLButtonElement, TagMainProps>(
  ({ type, className, icon, tagKey, aside, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(MAIN_BUTTON, "max-w-[284px]", className)}
      {...props}
    >
      <TagVisual icon={icon} tagKey={tagKey} aside={aside}>
        {children}
      </TagVisual>
    </button>
  ),
);

export interface TagDismissProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** Accessible label announced by assistive technology. */
  dismissLabel?: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const TagDismiss = forwardRef<HTMLButtonElement, TagDismissProps>(
  (
    {
      type,
      className,
      dismissLabel = "Dismiss",
      onMouseDown,
      onClick,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={dismissLabel}
      className={cn(DISMISS_BUTTON, className)}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
        }
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" size={11} />}
    </button>
  ),
);

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children" | "onClick"> {
  children: ReactNode;
  icon?: ReactNode;
  tagKey?: string;
  aside?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onDismiss?: () => void;
  dismissLabel?: string;
  disabled?: boolean;
}

function getDefaultDismissLabel(children: ReactNode, tagKey?: string) {
  const label =
    typeof children === "string" || typeof children === "number"
      ? String(children).trim()
      : "";

  if (!label) return "Dismiss";
  return `Dismiss ${tagKey ? `${tagKey}: ` : ""}${label}`;
}

const TagBase = forwardRef<HTMLElement, TagProps>(
  (
    {
      children,
      icon,
      tagKey,
      aside,
      onClick,
      onDismiss,
      dismissLabel,
      disabled = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const isDismissible = !!onDismiss;
    const hasMainAction = !!onClick;
    const resolvedDismissLabel =
      dismissLabel ?? getDefaultDismissLabel(children, tagKey);

    const onMainKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (disabled || !onDismiss) return;
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onDismiss();
      }
    };

    if (!hasMainAction && !isDismissible) {
      return (
        <TagRoot
          ref={ref as React.Ref<HTMLSpanElement>}
          aria-disabled={disabled || undefined}
          className={cn(disabled && "opacity-50", className)}
          aria-label={ariaLabel}
          {...rest}
        >
          <TagLabel icon={icon} tagKey={tagKey} aside={aside}>
            {children}
          </TagLabel>
        </TagRoot>
      );
    }

    if (hasMainAction && !isDismissible) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            TAG_BASE,
            "pl-2 pr-2",
            TAG_CLICKABLE,
            disabled && "opacity-50",
            className,
          )}
          aria-label={ariaLabel}
          {...rest}
        >
          <TagLabel icon={icon} tagKey={tagKey} aside={aside}>
            {children}
          </TagLabel>
        </button>
      );
    }

    return (
      <TagRoot
        ref={ref as React.Ref<HTMLSpanElement>}
        dismissible
        aria-disabled={disabled || undefined}
        className={cn(disabled && "opacity-50", className)}
        aria-label={ariaLabel}
        {...rest}
      >
        {hasMainAction ? (
          <TagMain
            disabled={disabled}
            onClick={onClick}
            onKeyDown={onMainKeyDown}
            icon={icon}
            tagKey={tagKey}
            aside={aside}
          >
            {children}
          </TagMain>
        ) : (
          <TagLabel icon={icon} tagKey={tagKey} aside={aside}>
            {children}
          </TagLabel>
        )}
        <TagDismiss
          disabled={disabled}
          dismissLabel={resolvedDismissLabel}
          onClick={() => onDismiss?.()}
        />
      </TagRoot>
    );
  },
);

TagBase.displayName = "Tag";
TagRoot.displayName = "Tag.Root";
TagLabel.displayName = "Tag.Label";
TagMain.displayName = "Tag.Main";
TagDismiss.displayName = "Tag.Dismiss";

export const Tag = Object.assign(TagBase, {
  Root: TagRoot,
  Main: TagMain,
  Label: TagLabel,
  Dismiss: TagDismiss,
});
