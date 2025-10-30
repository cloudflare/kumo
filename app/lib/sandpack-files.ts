/**
 * Sandpack Files Configuration
 * 
 * This file contains all the Kumo component source code embedded as strings
 * so Sandpack can bundle them properly
 */

import type { SandpackFiles } from "@codesandbox/sandpack-react";

// Read component source files at build time
// For now, we'll define the essential ones manually
// You can expand this by reading from the filesystem

export const KUMO_COMPONENT_FILES: SandpackFiles = {
  "/components/utils.ts": `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,

  "/components/button.tsx": `import React from "react";
import { cn } from "./utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "xs" | "sm" | "base" | "lg";
  shape?: "base" | "square" | "circle";
  icon?: React.ComponentType<any> | React.ReactNode;
  loading?: boolean;
}

const sizeStyles = {
  xs: "h-5 gap-1 rounded-sm px-1.5 text-xs",
  sm: "h-6.5 gap-1 rounded-md px-2 text-xs",
  base: "h-9 gap-1.5 rounded-lg px-3 text-base",
  lg: "h-10 gap-2 rounded-lg px-4 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading,
      shape = "base",
      size = "base",
      variant = "secondary",
      icon: IconComponent,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
      ghost: "bg-transparent hover:bg-gray-100",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "bg-white border border-gray-300 hover:bg-gray-50",
    };

    const isCompactShape = shape === "square" || shape === "circle";
    const compactSizeStyles = {
      xs: "size-5",
      sm: "size-6.5",
      base: "size-9",
      lg: "size-10",
    };

    const renderIcon = () => {
      if (!IconComponent) return null;
      if (React.isValidElement(IconComponent)) return IconComponent;
      const Icon = IconComponent as React.ComponentType<any>;
      return <Icon />;
    };

    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center font-medium select-none cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          isCompactShape && compactSizeStyles[size],
          isCompactShape && "p-0",
          shape === "circle" && "rounded-full",
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <span className="animate-spin">⏳</span>}
        {!loading && renderIcon()}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";`,

  "/components/input.tsx": `import React from "react";
import { cn } from "./utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 px-3 rounded-lg text-base w-full",
          "bg-white border border-gray-300",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "error" && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";`,

  "/components/field.tsx": `import React from "react";
import { cn } from "./utils";

interface FieldProps {
  label?: string;
  description?: string;
  error?: { message: string; match?: string };
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, description, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-600">{error.message}</p>
      )}
    </div>
  );
}`,

  "/components/checkbox.tsx": `import React from "react";
import { cn } from "./utils";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ label, checked, onChange, className }: CheckboxProps) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}`,

  "/components/surface.tsx": `import React from "react";
import { cn } from "./utils";

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
}

export function Surface({ children, className }: SurfaceProps) {
  return (
    <div className={cn("bg-white border border-gray-200 shadow-sm", className)}>
      {children}
    </div>
  );
}`,

  "/components/badge.tsx": `import React from "react";
import { cn } from "./utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "destructive";
  className?: string;
}

export function Badge({ children, variant = "primary", className }: BadgeProps) {
  const variants = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    outline: "bg-white border border-gray-300 text-gray-700",
    destructive: "bg-red-100 text-red-800",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}`,

  "/components/toggle.tsx": `import React from "react";
import { cn } from "./utils";

interface ToggleProps {
  toggled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Toggle({ toggled, onClick, className }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
        toggled ? "bg-blue-600" : "bg-gray-200",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          toggled ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}`,

  "/components/select.tsx": `import React, { useState } from "react";
import { cn } from "./utils";

interface SelectProps {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  renderValue?: (value: string) => React.ReactNode;
}

interface OptionProps {
  value: string;
  children: React.ReactNode;
}

export function Option({ value, children }: OptionProps) {
  return <option value={value}>{children}</option>;
}

export function Select({ 
  children, 
  className, 
  defaultValue, 
  value: controlledValue,
  onChange,
  renderValue 
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  return (
    <select
      value={value}
      onChange={handleChange}
      className={cn(
        "h-9 px-3 rounded-lg text-base w-full",
        "bg-white border border-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </select>
  );
}`,

  "/components/dialog.tsx": `import React, { useState } from "react";
import { cn } from "./utils";

interface DialogRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DialogTriggerProps {
  children?: React.ReactNode;
  render?: React.ReactElement;
}

interface DialogProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function DialogRoot({ children, open: controlledOpen, onOpenChange }: DialogRootProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, render }: DialogTriggerProps) {
  const { setOpen } = React.useContext(DialogContext);
  
  const handleClick = () => setOpen(true);
  
  if (render) {
    return React.cloneElement(render, { onClick: handleClick });
  }
  
  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
}

export function Dialog({ children, className }: DialogProps) {
  const { open, setOpen } = React.useContext(DialogContext);
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => setOpen(false)}
      />
      <div className={cn(
        "relative z-50 bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-xl font-semibold mb-2", className)}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-gray-600 text-sm", className)}>{children}</p>;
}`,

  "/components/dropdown.tsx": `import React, { useState, useRef, useEffect } from "react";
import { cn } from "./utils";

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuTriggerProps {
  children?: React.ReactNode;
  render?: React.ReactElement;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const DropdownContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

function DropdownMenuRoot({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function DropdownMenuTrigger({ children, render }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownContext);
  
  const handleClick = () => setOpen(!open);
  
  if (render) {
    return React.cloneElement(render, { onClick: handleClick });
  }
  
  return (
    <button onClick={handleClick}>
      {children}
    </button>
  );
}

function DropdownMenuContent({ children, className }: DropdownMenuContentProps) {
  const { open, setOpen } = React.useContext(DropdownContext);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);
  
  if (!open) return null;
  
  return (
    <div 
      ref={ref}
      className={cn(
        "absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200 py-1 z-50",
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownContext);
  
  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
}

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
});`,

  "/components/tooltip.tsx": `import React, { useState } from "react";
import { cn } from "./utils";

interface TooltipProviderProps {
  children: React.ReactNode;
}

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  asChild?: boolean;
  className?: string;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export function Tooltip({ children, content, asChild, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1",
          "bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50",
          className
        )}>
          {content}
        </div>
      )}
    </div>
  );
}`,

  "/components/banner.tsx": `import React from "react";
import { cn } from "./utils";

export enum BannerVariant {
  DEFAULT = "default",
  ALERT = "alert",
  ERROR = "error"
}

interface BannerProps {
  icon?: React.ReactNode;
  text: string;
  variant?: BannerVariant | "default" | "alert" | "error";
  className?: string;
}

export function Banner({ icon, text, variant = "default", className }: BannerProps) {
  const variantStyles = {
    default: "bg-blue-500/20 border-blue-500 dark:border-blue-700 text-blue-800 dark:text-blue-400",
    alert: "bg-yellow-500/20 border-yellow-500 dark:border-yellow-700 text-yellow-800 dark:text-yellow-400",
    error: "bg-red-500/20 border-red-500 dark:border-red-700 text-red-800 dark:text-red-400",
  };

  const variantKey = typeof variant === "string" ? variant : "default";

  return (
    <div className={cn(
      "rounded-lg w-full px-4 py-1.5 border flex items-center gap-2 text-base",
      variantStyles[variantKey as keyof typeof variantStyles],
      className
    )}>
      {icon}
      <p>{text}</p>
    </div>
  );
}`,

  "/components/layer-card.tsx": `import React from "react";
import { Surface } from "./surface";
import { cn } from "./utils";

interface LayerCardProps {
  className?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  badge?: React.ReactNode;
}

export function LayerCard({ className, title, children, href, badge }: LayerCardProps) {
  const header = (
    <header className={cn(
      "px-4 py-2.5 font-medium text-neutral-500 flex items-center justify-between text-base",
      href && "hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
    )}>
      <div className="flex items-center gap-2">
        {title}
        {badge}
      </div>
      {href && <span>→</span>}
    </header>
  );

  return (
    <Surface className={cn("overflow-hidden rounded-lg bg-neutral-25 dark:bg-surface", className)}>
      {href ? (
        <a href={href} className="!no-underline">
          {header}
        </a>
      ) : (
        header
      )}
      <div className="bg-surface dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 -mx-px -mb-px dark:ring-neutral-800 rounded-lg">
        {children}
      </div>
    </Surface>
  );
}`,

  "/components/loader.tsx": `import React from "react";

interface LoaderProps {
  className?: string;
  size?: number;
}

export function Loader({ className, size = 24 }: LoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="0 150;42 150;42 150"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0;-16;-59"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        opacity={0.1}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}`,

  "/layouts/resource-list.tsx": `import React from "react";
import { cn } from "../components/utils";

interface ResourceListPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  usage?: React.ReactNode;
  additionalContent?: React.ReactNode;
  children: React.ReactNode;
}

export function ResourceListPage({ 
  title, 
  description, 
  icon, 
  usage, 
  additionalContent, 
  children 
}: ResourceListPageProps) {
  return (
    <div className="w-full h-full min-h-screen bg-bg-secondary">
      <div className="flex flex-col p-6 md:p-8 lg:px-10 lg:py-9 md:gap-4 xl:gap-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col">
          <div className="!mb-1.5 flex items-center gap-1.5">
            {icon && icon}
            <h1 className="font-heading !text-3xl !font-semibold !m-0 !p-0">{title}</h1>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg hidden md:block leading-normal text-pretty !p-0">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse xl:flex-row gap-6 xl:gap-8">
          <div className="min-w-0 grow">{children}</div>

          {(usage || additionalContent) && (
            <div className="xl:w-[380px] w-full xl:sticky top-22 h-fit flex flex-col gap-4 shrink-0">
              {usage && usage}
              <div className={cn("hidden xl:block", usage ? "mt-6" : "")}>
                {additionalContent && additionalContent}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 xl:hidden">{additionalContent}</div>
      </div>
    </div>
  );
}`,

  "/blocks/empty.tsx": `import React, { useState } from "react";
import { Button } from "./components/button";

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  commandLine?: string;
  contents?: React.ReactNode;
}

export function Empty({ icon, title, description, commandLine, contents }: EmptyProps) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="w-full px-10 py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col gap-6 items-center">
      {icon}
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description && (
        <p className="text-center max-w-140 text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      )}
      {commandLine && (
        <div className="bg-neutral-50 dark:bg-black rounded-lg h-10 inline-flex items-center gap-2 font-mono pl-3 pr-2 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60">
          <span className="text-xs text-neutral-400 dark:text-neutral-600">$</span>
          <span className="text-[#f6821f] text-sm">{commandLine}</span>
          <Button
            size="sm"
            variant="ghost"
            shape="square"
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
              navigator.clipboard.writeText(commandLine);
            }}
          >
            {copied ? "✓" : "📋"}
          </Button>
        </div>
      )}
      {contents && contents}
    </div>
  );
}`,
};

export const SANDPACK_TEMPLATE_FILES: SandpackFiles = {
  "/App.tsx": `import { Button } from "./components/button";
import { Input } from "./components/input";
import { Field } from "./components/field";

export default function App() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to Kumo Playground</h1>
      <p className="text-gray-600 mb-8">
        Use the AI prompt above to generate components, or write your own code here!
      </p>
      
      <div className="space-y-4">
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Input placeholder="Type something..." />
      </div>
    </div>
  );
}`,

  "/index.tsx": `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`,

  "/styles.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Cloudflare Design System Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --surface: #ffffff;
  --surface-secondary: #f3f4f6;
  --surface-active: #f3f4f6;
  --border: #e5e7eb;
  --border-hover: #d1d5db;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent: #f3f4f6;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
}

.dark {
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --surface: #1a1a1a;
  --surface-secondary: #262626;
  --surface-active: #2a2a2a;
  --border: #404040;
  --border-hover: #525252;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-muted: #737373;
  --accent: #262626;
  --primary: #3b82f6;
  --primary-hover: #60a5fa;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* Cloudflare-style utilities */
.bg-bg-primary { background-color: var(--bg-primary); }
.bg-bg-secondary { background-color: var(--bg-secondary); }
.bg-surface { background-color: var(--surface); }
.bg-surface-secondary { background-color: var(--surface-secondary); }
.bg-surface-active { background-color: var(--surface-active); }
.text-neutral-500 { color: var(--text-secondary); }
.text-neutral-600 { color: var(--text-secondary); }
.text-neutral-400 { color: var(--text-muted); }
.border-neutral-200 { border-color: var(--border); }
.border-neutral-800 { border-color: var(--border); }

/* Card styles */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* List item hover */
.list-item-hover:hover {
  background-color: var(--surface-active);
}`,

  "/public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kumo Playground</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
};

// Merge component files with template files
export function getSandpackFiles(): SandpackFiles {
  return {
    ...KUMO_COMPONENT_FILES,
    ...SANDPACK_TEMPLATE_FILES,
  };
}
