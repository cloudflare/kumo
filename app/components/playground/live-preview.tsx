/**
 * Live Preview Component
 * 
 * Safely renders user-generated JSX code with comprehensive error handling
 */

import React, { useEffect, useState, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { compileAndExecuteJSX, wrapInComponent } from "../../lib/jsx-runtime";
import { cn } from "../utils";
import { Loader } from "../loader/loader";

// Import all Kumo components for the preview scope
import { Button } from "../button/button";
import { Input } from "../input/input";
import { InputArea } from "../input/input-area";
import { Select, Option } from "../select/select";
import { Checkbox } from "../checkbox/checkbox";
import { Switch } from "../switch/switch";
import {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "../dialog/dialog";
import { Tooltip, TooltipProvider } from "../tooltip/tooltip";
import { DropdownMenu } from "../dropdown/dropdown";
import { Surface } from "../surface/surface";
import { Field } from "../field/field";
import { Loader as LoaderComponent } from "../loader/loader";
import { SkeletonLine } from "../loader/skeleton-line";
import { Badge } from "../badge/badge";
import { Banner, BannerVariant } from "../banner/banner";
import { Expandable } from "../expandable/expandable";
import { ClipboardText } from "../clipboard-text/clipboard-text";
import { CodeBlock } from "../code/code";
import { LayerCard } from "../layer-card/layer-card";
import { Combobox } from "../combobox/combobox";
import { MenuBar } from "../menubar/menubar";

// Import common icons
import {
  PlusIcon,
  XIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  WarningIcon,
  InfoIcon,
  GearIcon,
  UserIcon,
  WarningOctagonIcon,
  CalendarIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  StarIcon,
  BellIcon,
  ChatIcon,
  HouseIcon,
  DownloadIcon,
  UploadIcon,
} from "@phosphor-icons/react";

interface LivePreviewProps {
  code: string;
  className?: string;
}

/**
 * Component scope - all components and utilities available in preview
 */
const COMPONENT_SCOPE = {
  // React
  React,
  
  // Kumo Components
  Button,
  Input,
  InputArea,
  Select,
  Option,
  Checkbox,
  Switch,
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  Tooltip,
  TooltipProvider,
  DropdownMenu,
  Surface,
  Field,
  Loader: LoaderComponent,
  SkeletonLine,
  Badge,
  Banner,
  BannerVariant,
  Expandable,
  ClipboardText,
  CodeBlock,
  LayerCard,
  Combobox,
  MenuBar,
  
  // Icons
  PlusIcon,
  XIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  WarningIcon,
  InfoIcon,
  GearIcon,
  UserIcon,
  WarningOctagonIcon,
  CalendarIcon,
  EnvelopeIcon,
  LockIcon,
  EyeIcon,
  EyeSlashIcon,
  HeartIcon,
  StarIcon,
  BellIcon,
  ChatIcon,
  HouseIcon,
  DownloadIcon,
  UploadIcon,
  
  // Utilities
  cn,
};

/**
 * Error fallback component
 */
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-8 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-red-200 dark:border-red-800">
      <WarningOctagonIcon className="w-12 h-12 text-red-500 mb-4" weight="fill" />
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
        Preview Error
      </h3>
      <p className="text-sm text-red-700 dark:text-red-300 text-center mb-4 max-w-md">
        {error.message}
      </p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </div>
  );
}

/**
 * Compilation error display
 */
function CompilationError({ error }: { error: { type: string; message: string; details?: string } }) {
  return (
    <div className="flex flex-col items-start justify-center h-full min-h-[200px] p-6 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3 mb-4">
        <WarningIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" weight="fill" />
        <div>
          <h3 className="text-base font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
            {error.type === "validation" ? "Validation Error" : 
             error.type === "compilation" ? "Compilation Error" : 
             "Runtime Error"}
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            {error.message}
          </p>
          {error.details && (
            <pre className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded overflow-x-auto font-mono">
              {error.details}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8 text-neutral-400">
      <CodeBlock lang="tsx" code="<Button>Hello World</Button>" />
      <p className="text-sm mt-4">Generate or write code to see a live preview</p>
    </div>
  );
}

/**
 * Main LivePreview component
 */
export function LivePreview({ code, className }: LivePreviewProps) {
  const [key, setKey] = useState(0);
  
  // Compile the code
  const compilationResult = useMemo(() => {
    if (!code || code.trim().length === 0) {
      return null;
    }
    
    // Wrap code in component if needed
    const wrappedCode = wrapInComponent(code);
    
    // Compile and execute
    return compileAndExecuteJSX(wrappedCode, COMPONENT_SCOPE);
  }, [code]);
  
  // Reset error boundary when code changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [code]);
  
  // Empty state
  if (!code || code.trim().length === 0) {
    return (
      <div className={cn("w-full h-full", className)}>
        <EmptyState />
      </div>
    );
  }
  
  // Compilation error
  if (compilationResult && !compilationResult.success) {
    return (
      <div className={cn("w-full h-full", className)}>
        <CompilationError error={compilationResult.error!} />
      </div>
    );
  }
  
  // Success - render component
  const PreviewComponent = compilationResult?.component;
  
  if (!PreviewComponent) {
    return (
      <div className={cn("w-full h-full", className)}>
        <EmptyState />
      </div>
    );
  }
  
  return (
    <div className={cn("w-full h-full", className)}>
      <ErrorBoundary
        key={key}
        FallbackComponent={ErrorFallback}
        onReset={() => setKey(prev => prev + 1)}
      >
        <div className="p-8">
          <PreviewComponent />
        </div>
      </ErrorBoundary>
    </div>
  );
}
