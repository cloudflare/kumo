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
      classes: "bg-kumo-overlay ring-1 ring-kumo-line",
      description: "Standard tag",
    },
  },
} as const;

export const KUMO_TAG_DEFAULT_VARIANTS = {
  variant: "default",
} as const;

export type KumoTagVariant = keyof typeof KUMO_TAG_VARIANTS.variant;

const TAG_BASE =
  "inline-flex h-6 max-w-[320px] shrink-0 items-center gap-2.5 rounded-sm bg-kumo-overlay text-sm ring-1 ring-kumo-line";

const TAG_CLICKABLE =
  "cursor-pointer hover:bg-kumo-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-kumo-brand";

const MAIN_BUTTON =
  "inline-flex min-w-0 items-center gap-1 rounded-sm bg-transparent p-0 [font:inherit] leading-4 text-kumo-default outline-none cursor-pointer disabled:cursor-not-allowed";

const DISMISS_BUTTON =
  "flex cursor-pointer items-center rounded-md bg-transparent p-1 text-kumo-subtle transition-colors hover:bg-kumo-control hover:text-kumo-default hover:outline hover:outline-1 hover:outline-kumo-line hover:[&>svg]:scale-110 focus-visible:bg-kumo-interact focus-visible:text-kumo-default focus-visible:outline focus-visible:outline-1 focus-visible:outline-kumo-brand [&>svg]:transition-transform [&>svg]:duration-150 disabled:cursor-not-allowed";

const FOCUS_RING_PRIMARY =
  "[&:has(>button:first-child:focus-visible)]:outline [&:has(>button:first-child:focus-visible)]:outline-2 [&:has(>button:first-child:focus-visible)]:outline-offset-1 [&:has(>button:first-child:focus-visible)]:outline-kumo-brand";

const HOVER_PRIMARY =
  "[&:has(>button:first-child)]:hover:bg-kumo-tint [&:has(>button:first-child:disabled)]:hover:bg-kumo-overlay";

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
    {icon && <span className="shrink-0">{icon}</span>}
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
  disabled?: boolean;
}

const TagRoot = forwardRef<HTMLSpanElement, TagRootProps>(
  ({ dismissible = false, disabled = false, className, ...props }, ref) => (
    <span
      ref={ref}
      role={dismissible ? "group" : undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        TAG_BASE,
        dismissible ? "pl-2 pr-[3px]" : "pl-2 pr-2",
        HOVER_PRIMARY,
        FOCUS_RING_PRIMARY,
        disabled && "opacity-50",
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
      {children ?? <XIcon size={11} />}
    </button>
  ),
);

export interface TagProps {
  children: ReactNode;
  icon?: ReactNode;
  tagKey?: string;
  aside?: ReactNode;
  onClick?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
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
      dismissLabel = "Dismiss",
      disabled = false,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) => {
    const isDismissible = !!onDismiss;
    const hasMainAction = !!onClick;

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
          disabled={disabled}
          className={className}
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
        disabled={disabled}
        className={className}
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
          dismissLabel={dismissLabel}
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
