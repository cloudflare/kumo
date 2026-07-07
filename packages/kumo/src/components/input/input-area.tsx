import { inputVariants } from "./input";
import { cn } from "../../utils/cn";
import { useCallback, type ReactNode } from "react";
import * as React from "react";
import { Field as FieldBase } from "@base-ui/react/field";
import { Field as KumoField, normalizeFieldError, type FieldErrorMatch } from "../field/field";
import { Popover } from "../popover";
import { Tooltip } from "../tooltip";
import {
  CodeBlockIcon,
  CodeIcon,
  LinkIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  Quotes,
  TextBIcon,
  TextHIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  type Icon,
} from "@phosphor-icons/react";

type RichTextControlDefinition = {
  id:
    | "bold"
    | "italic"
    | "underline"
    | "heading"
    | "bulletList"
    | "numberedList"
    | "quote"
    | "inlineCode"
    | "codeBlock"
    | "link";
  icon: Icon;
  ariaLabel: string;
  command: string;
  value?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeUrl(value: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
}

function selectedLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function closestElement(node: Node) {
  return node.nodeType === Node.ELEMENT_NODE
    ? (node as Element)
    : node.parentElement;
}

function selectedList(range: Range, editor: HTMLElement) {
  const containers = [
    closestElement(range.startContainer),
    closestElement(range.endContainer),
    closestElement(range.commonAncestorContainer),
  ];

  for (const container of containers) {
    const list = container?.closest("ul, ol");
    if (list && editor.contains(list)) return list as HTMLUListElement | HTMLOListElement;
  }

  for (const list of editor.querySelectorAll("ul, ol")) {
    if (range.intersectsNode(list)) return list as HTMLUListElement | HTMLOListElement;
  }

  return null;
}

const RICH_TEXT_LINK_CLASS =
  "text-kumo-link underline underline-offset-[0.15em] decoration-[0.0625em] link-current transition-colors";

const RICH_TEXT_CONTROLS: readonly RichTextControlDefinition[] = [
  { id: "bold", icon: TextBIcon, ariaLabel: "Bold", command: "bold" },
  {
    id: "italic",
    icon: TextItalicIcon,
    ariaLabel: "Italic",
    command: "italic",
  },
  {
    id: "underline",
    icon: TextUnderlineIcon,
    ariaLabel: "Underline",
    command: "underline",
  },
  {
    id: "heading",
    icon: TextHIcon,
    ariaLabel: "Heading",
    command: "formatBlock",
    value: "h3",
  },
  {
    id: "bulletList",
    icon: ListBulletsIcon,
    ariaLabel: "Bulleted list",
    command: "insertUnorderedList",
  },
  {
    id: "numberedList",
    icon: ListNumbersIcon,
    ariaLabel: "Numbered list",
    command: "insertOrderedList",
  },
  {
    id: "quote",
    icon: Quotes,
    ariaLabel: "Quote",
    command: "formatBlock",
    value: "blockquote",
  },
  {
    id: "inlineCode",
    icon: CodeIcon,
    ariaLabel: "Inline code",
    command: "insertHTML",
  },
  {
    id: "codeBlock",
    icon: CodeBlockIcon,
    ariaLabel: "Code block",
    command: "insertHTML",
  },
  {
    id: "link",
    icon: LinkIcon,
    ariaLabel: "Insert link",
    command: "createLink",
  },
] as const;

export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
  (props, ref) => {
    const {
      className,
      onValueChange,
      size = "base",
      variant: variantProp,
      onChange,
      label,
      labelTooltip,
      description,
      error,
      toolbar,
      toolbarPlacement = "top",
      ...inputProps
    } = props;

    // Deprecation warning for variant="error"
    if (process.env.NODE_ENV !== "production" && variantProp === "error") {
      console.warn(
        '[Kumo InputArea]: variant="error" is deprecated. ' +
          "Error styling is now automatically applied when the `error` prop is truthy. " +
          "Simply remove the variant prop and pass an error message instead.",
      );
    }

    // Auto-apply error styling when error prop is truthy
    // Explicit variant prop takes precedence for backwards compatibility
    const variant = variantProp ?? (error ? "error" : "default");

    // Extract required from inputProps to pass to Field for label decoration
    const { required } = inputProps;
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event);
        onValueChange?.(event.target.value);
      },
      [onChange, onValueChange],
    );

    const textareaClassName = cn(
      inputVariants({ size, variant, focusIndicator: true }),
      "h-auto py-2", // Input variant always comes with size, but it does not apply for textarea
      className,
    );

    const toolbarTextareaClassName = cn(
      "min-w-0 w-full resize-y border-0 bg-transparent text-kumo-default outline-none ring-0 focus:outline-none focus:ring-0",
      "kumo-input-placeholder disabled:text-kumo-disabled",
      {
        xs: "px-1.5 pb-2 text-xs",
        sm: "px-2 pb-2 text-xs",
        base: "px-3 pb-3 text-base",
        lg: "px-4 pb-4 text-base",
      }[size],
      toolbarPlacement === "top" ? "pt-1" : "pt-2",
    );

    const renderControl = (
      controlProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    ) => {
      if (!toolbar) {
        return (
          <textarea
            {...controlProps}
            ref={ref}
            className={textareaClassName}
            onChange={handleChange}
            {...inputProps}
          />
        );
      }

      return (
        <div
          data-kumo-component="InputArea.Control"
          className={cn(
            inputVariants({ size, variant, parentFocusIndicator: true }),
            "grid h-auto gap-0 overflow-hidden p-0 bg-kumo-control",
            className,
          )}
        >
          {toolbarPlacement === "top" && (
            <div
              data-kumo-component="InputArea.Toolbar"
              className="overflow-x-auto border-b border-kumo-line bg-kumo-elevated p-1"
            >
              {toolbar}
            </div>
          )}
          <textarea
            {...controlProps}
            ref={ref}
            className={toolbarTextareaClassName}
            onChange={handleChange}
            {...inputProps}
          />
          {toolbarPlacement === "bottom" && (
            <div
              data-kumo-component="InputArea.Toolbar"
              className="overflow-x-auto border-t border-kumo-line bg-kumo-elevated p-1"
            >
              {toolbar}
            </div>
          )}
        </div>
      );
    };

    // Render with Field wrapper if label, error, or description is provided
    // Use FieldBase.Control with render callback to ensure proper label-textarea association.
    // The render callback receives props with the correct id/aria-labelledby from Field context.
    if (label || error || description) {
      return (
        <KumoField
          label={label}
          required={required}
          labelTooltip={labelTooltip}
          description={description}
          error={normalizeFieldError(error)}
        >
          <FieldBase.Control
            render={(controlProps) => renderControl(controlProps)}
          />
        </KumoField>
      );
    }

    // Render bare textarea without Field wrapper
    return renderControl();
  },
);

InputArea.displayName = "InputArea";

/** Alias for InputArea — provided for discoverability when migrating from other libraries */
export const Textarea = InputArea;

/**
 * InputArea component props
 * @property {ReactNode} [label] - Label content for the textarea (enables Field wrapper)
 * @property {ReactNode} [description] - Helper text displayed below the textarea
 * @property {string | { message: ReactNode, match: FieldErrorMatch }} [error] - Error message or validation error object
 */
export type InputAreaToolbarPlacement = "top" | "bottom";

export type InputAreaProps = {
  onValueChange?: (value: string) => void;
  variant?: "default" | "error";
  size?: "xs" | "sm" | "base" | "lg";
  // Then other custom props
  children?: React.ReactNode;
  className?: string;
  /** Label content for the textarea (enables Field wrapper) - can be a string or any React node */
  label?: ReactNode;
  /** Tooltip content to display next to the label via an info icon */
  labelTooltip?: ReactNode;
  /** Helper text displayed below the textarea */
  description?: ReactNode;
  /** Error message or validation error object */
  error?: string | { message: ReactNode; match: FieldErrorMatch };
  /** Inline controls rendered inside the textarea shell. */
  toolbar?: ReactNode;
  /** Where to render inline controls when `toolbar` is provided. Defaults to `"top"`. */
  toolbarPlacement?: InputAreaToolbarPlacement;

  // Finally, spread the native input props (least important)
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;

export type RichTextInputAreaControl = (typeof RICH_TEXT_CONTROLS)[number]["id"];

export const RichTextInputArea = React.forwardRef<
  HTMLDivElement,
  RichTextInputAreaProps
>((props, ref) => {
  const {
    className,
    editorClassName,
    onValueChange,
    size = "base",
    variant: variantProp,
    label,
    labelTooltip,
    description,
    error,
    required,
    value,
    defaultValue,
    placeholder,
    disabled,
    controls = RICH_TEXT_CONTROLS.map((control) => control.id),
    onClick,
    onInput,
    onKeyDown,
    ...rootProps
  } = props;
  const editorRef = React.useRef<HTMLDivElement>(null);
  const linkInputRef = React.useRef<HTMLInputElement>(null);
  const initializedRef = React.useRef(false);
  const savedSelectionRef = React.useRef<Range | null>(null);
  const [linkPopoverOpen, setLinkPopoverOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");
  const linkUrlId = React.useId();
  const linkTextId = React.useId();

  React.useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== undefined) {
      if (editor.innerHTML !== value) editor.innerHTML = value;
      return;
    }

    if (!initializedRef.current) {
      editor.innerHTML = defaultValue ?? "";
      initializedRef.current = true;
    }
  }, [defaultValue, value]);

  React.useEffect(() => {
    if (!linkPopoverOpen) return;

    requestAnimationFrame(() => {
      linkInputRef.current?.focus({ preventScroll: true });
    });
  }, [linkPopoverOpen]);

  const variant = variantProp ?? (error ? "error" : "default");

  const handleInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      onInput?.(event);
      onValueChange?.(event.currentTarget.innerHTML);
    },
    [onInput, onValueChange],
  );

  const handleEditorClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || (!event.metaKey && !event.ctrlKey)) return;

      const link = (event.target as Element | null)?.closest("a[href]");
      if (!link) return;

      event.preventDefault();
      window.open(
        (link as HTMLAnchorElement).href,
        "_blank",
        "noopener,noreferrer",
      );
    },
    [onClick],
  );

  const handleEditorKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
    },
    [onKeyDown],
  );

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const editor = editorRef.current;

    if (!range || !editor || !editor.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = null;
      return;
    }

    savedSelectionRef.current = range.cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !savedSelectionRef.current) return;

    selection.removeAllRanges();
    selection.addRange(savedSelectionRef.current);
  }, []);

  const insertHtmlAtSelection = useCallback(
    (html: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      editor.focus();
      restoreSelection();

      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      if (!selection || !range) return;

      range.deleteContents();

      const template = document.createElement("template");
      template.innerHTML = html;
      const fragment = template.content;
      const lastChild = fragment.lastChild;

      range.insertNode(fragment);

      if (lastChild) {
        range.setStartAfter(lastChild);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      savedSelectionRef.current = null;
      onValueChange?.(editor.innerHTML);
    },
    [onValueChange, restoreSelection],
  );

  const runCommand = useCallback(
    (control: (typeof RICH_TEXT_CONTROLS)[number]) => {
      if (disabled) return;

      editorRef.current?.focus();
      restoreSelection();

      if (control.id === "inlineCode") {
        const selectedText = window.getSelection()?.toString() ?? "code";
        document.execCommand(
          control.command,
          false,
          `<code>${escapeHtml(selectedText || "code")}</code>`,
        );
      } else if (control.id === "codeBlock") {
        const selectedText = window.getSelection()?.toString() ?? "code";
        document.execCommand(
          control.command,
          false,
          `<pre><code>${escapeHtml(selectedText || "code")}</code></pre><div><br></div>`,
        );
      } else if (control.id === "bulletList" || control.id === "numberedList") {
        const editor = editorRef.current;
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const listTag = control.id === "bulletList" ? "ul" : "ol";

        if (editor && range) {
          const list = selectedList(range, editor);

          if (list) {
            if (list.localName !== listTag) {
              const replacement = document.createElement(listTag);
              replacement.innerHTML = list.innerHTML;
              list.replaceWith(replacement);
              onValueChange?.(editor.innerHTML);
            }

            savedSelectionRef.current = null;
            return;
          }
        }

        const selectedText = window.getSelection()?.toString() ?? "";
        const lines = selectedLines(selectedText);
        const items = lines.length
          ? lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")
          : "<li><br></li>";

        insertHtmlAtSelection(`<${listTag}>${items}</${listTag}><div><br></div>`);
        return;
      } else if (control.id === "quote") {
        const selectedText = window.getSelection()?.toString() ?? "";
        const quote = selectedText
          ? escapeHtml(selectedText).replaceAll("\n", "<br>")
          : "<br>";

        insertHtmlAtSelection(`<blockquote>${quote}</blockquote><div><br></div>`);
        return;
      } else {
        document.execCommand(
          control.command,
          false,
          "value" in control ? control.value : undefined,
        );
      }

      if (editorRef.current) onValueChange?.(editorRef.current.innerHTML);
    },
    [disabled, insertHtmlAtSelection, onValueChange, restoreSelection],
  );

  const insertLink = useCallback(
    (url: string, displayText?: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      editor.focus();

      const selection = window.getSelection();
      if (selection && savedSelectionRef.current) {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRef.current);
      }

      const selectedText = displayText || selection?.toString() || url;
      document.execCommand(
        "insertHTML",
        false,
        `<a class="${RICH_TEXT_LINK_CLASS}" href="${escapeHtml(url)}">${escapeHtml(selectedText)}</a>`,
      );

      onValueChange?.(editor.innerHTML);
    },
    [onValueChange],
  );

  const submitLink = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const url = linkUrl.trim();
      if (!url) return;

      insertLink(normalizeUrl(url), linkText.trim() || undefined);
      setLinkPopoverOpen(false);
      setLinkUrl("");
      setLinkText("");
    },
    [insertLink, linkText, linkUrl],
  );

  const editorClass = cn(
    "min-w-0 w-full overflow-auto bg-kumo-control text-kumo-default outline-none",
    "empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)] empty:before:text-kumo-placeholder",
    "[&_code]:rounded-sm [&_code]:bg-kumo-recessed [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm",
    "[&_a]:text-kumo-link [&_a]:underline [&_a]:underline-offset-[0.15em] [&_a]:decoration-[0.0625em]",
    "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-kumo-line [&_blockquote]:pl-3 [&_blockquote]:text-kumo-muted",
    "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
    "[&_pre]:my-2 [&_pre]:rounded-md [&_pre]:bg-kumo-recessed [&_pre]:p-2 [&_pre]:font-mono [&_pre]:text-sm",
    "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
    disabled && "cursor-not-allowed opacity-50",
    {
      xs: "min-h-[60px] px-1.5 py-2 text-xs",
      sm: "min-h-[72px] px-2 py-2 text-xs",
      base: "min-h-[88px] px-3 py-3 text-base",
      lg: "min-h-[100px] px-4 py-4 text-base",
    }[size],
    editorClassName,
  );

  const control = (
    <div
      className={cn(
        inputVariants({ size, variant, parentFocusIndicator: true }),
        "grid h-auto gap-0 overflow-hidden p-0 bg-kumo-control",
        className,
      )}
    >
      <div className="flex overflow-x-auto border-b border-kumo-line bg-kumo-elevated p-1">
        {RICH_TEXT_CONTROLS.filter((item) => controls.includes(item.id)).map(
          (item) => {
            const IconComponent = item.icon;

            const button = (
              <button
                aria-label={item.ariaLabel}
                className={cn(
                  "inline-flex h-7 w-8 shrink-0 cursor-pointer items-center justify-center text-kumo-default",
                  "not-first:border-l not-first:border-kumo-line hover:bg-kumo-base focus:z-2 focus:outline-none focus:ring-[1.5px] focus:ring-kumo-focus/50",
                  disabled &&
                    "cursor-not-allowed pointer-events-none opacity-50",
                )}
                disabled={disabled}
                onMouseDown={(event) => {
                  saveSelection();
                  event.preventDefault();
                }}
                onClick={() => {
                  if (item.id === "link") {
                    saveSelection();
                    setLinkText(window.getSelection()?.toString() ?? "");
                    setLinkPopoverOpen(true);
                    return;
                  }

                  runCommand(item);
                }}
                type="button"
              >
                <IconComponent aria-hidden size={16} />
              </button>
            );

            if (item.id === "link") {
              return (
                <Popover
                  key={item.id}
                  open={linkPopoverOpen}
                  onOpenChange={setLinkPopoverOpen}
                >
                  <Tooltip
                    className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    content={item.ariaLabel}
                    delay={300}
                    render={<Popover.Trigger render={button} />}
                  />
                  <Popover.Content align="start" className="w-72 gap-3" side="bottom">
                    <Popover.Title>Insert link</Popover.Title>
                    <form className="grid gap-3" onSubmit={submitLink}>
                      <label
                        className="grid gap-1 text-sm font-medium text-kumo-default"
                        htmlFor={linkUrlId}
                      >
                        URL
                        <input
                          aria-label="URL"
                          id={linkUrlId}
                          ref={linkInputRef}
                          className="h-8 rounded-md border-0 bg-kumo-control px-2 text-sm text-kumo-default ring ring-kumo-line outline-none focus:ring-[1.5px] focus:ring-kumo-focus/50"
                          onChange={(event) => setLinkUrl(event.target.value)}
                          placeholder="https://example.com"
                          type="text"
                          value={linkUrl}
                        />
                      </label>
                      <label
                        className="grid gap-1 text-sm font-medium text-kumo-default"
                        htmlFor={linkTextId}
                      >
                        Display text
                        <input
                          aria-label="Display text"
                          id={linkTextId}
                          className="h-8 rounded-md border-0 bg-kumo-control px-2 text-sm text-kumo-default ring ring-kumo-line outline-none focus:ring-[1.5px] focus:ring-kumo-focus/50"
                          onChange={(event) => setLinkText(event.target.value)}
                          placeholder="Link text"
                          type="text"
                          value={linkText}
                        />
                      </label>
                      <div className="flex justify-end gap-2">
                        <button
                          className="h-7 cursor-pointer rounded-md px-2 text-sm text-kumo-default hover:bg-kumo-elevated"
                          onClick={() => {
                            setLinkPopoverOpen(false);
                            setLinkUrl("");
                            setLinkText("");
                          }}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className="h-7 cursor-pointer rounded-md bg-kumo-contrast px-2 text-sm text-kumo-inverse hover:opacity-90"
                          type="submit"
                        >
                          Insert
                        </button>
                      </div>
                    </form>
                  </Popover.Content>
                </Popover>
              );
            }

            return (
              <Tooltip
                key={item.id}
                className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
                content={item.ariaLabel}
                delay={300}
                render={button}
              />
            );
          },
        )}
      </div>
      <div
        {...rootProps}
        ref={editorRef}
        aria-disabled={disabled || undefined}
        aria-multiline="true"
        className={editorClass}
        contentEditable={!disabled}
        data-placeholder={placeholder}
        onClick={handleEditorClick}
        onInput={handleInput}
        onKeyDown={handleEditorKeyDown}
        role="textbox"
        suppressContentEditableWarning
        tabIndex={rootProps.tabIndex ?? 0}
      />
    </div>
  );

  if (label || error || description) {
    return (
      <KumoField
        label={label}
        required={required}
        labelTooltip={labelTooltip}
        description={description}
        error={normalizeFieldError(error)}
      >
        {control}
      </KumoField>
    );
  }

  return control;
});

RichTextInputArea.displayName = "RichTextInputArea";

export type RichTextInputAreaProps = {
  onValueChange?: (value: string) => void;
  variant?: "default" | "error";
  size?: "xs" | "sm" | "base" | "lg";
  className?: string;
  editorClassName?: string;
  label?: ReactNode;
  labelTooltip?: ReactNode;
  description?: ReactNode;
  error?: string | { message: ReactNode; match: FieldErrorMatch };
  required?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  controls?: RichTextInputAreaControl[];
  onInput?: React.FormEventHandler<HTMLDivElement>;
} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onInput"
>;
