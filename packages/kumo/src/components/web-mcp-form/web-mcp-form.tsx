import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../utils/cn";

export const KUMO_WEB_MCP_FORM_VARIANTS = {} as const;
export const KUMO_WEB_MCP_FORM_DEFAULT_VARIANTS = {} as const;

/**
 * Props for a form exposed to agents through the experimental declarative
 * WebMCP API.
 *
 * @example
 * ```tsx
 * <WebMCPForm
 *   toolName="search-products"
 *   toolDescription="Search products by name"
 * >
 *   <Input name="query" label="Search" />
 *   <Button type="submit">Search</Button>
 * </WebMCPForm>
 * ```
 */
export interface WebMCPFormProps extends ComponentPropsWithoutRef<"form"> {
  /** Stable tool identifier exposed to agents. */
  toolName: string;
  /** Agent-facing description of what submitting the form does. */
  toolDescription: string;
  /**
   * Allow an agent to submit the form without waiting for the user to review it.
   * Keep this disabled for consequential actions.
   * @default false
   */
  autoSubmit?: boolean;
}

/**
 * A native form annotated for the experimental declarative WebMCP API.
 * Unsupported browsers treat it as an ordinary form.
 */
export const WebMCPForm = forwardRef<HTMLFormElement, WebMCPFormProps>(
  (
    { toolName, toolDescription, autoSubmit = false, className, ...props },
    ref,
  ) => (
    <form
      ref={ref}
      className={cn(className)}
      {...props}
      {...{
        toolname: toolName,
        tooldescription: toolDescription,
        toolautosubmit: autoSubmit ? "" : undefined,
      }}
    />
  ),
);

WebMCPForm.displayName = "WebMCPForm";
