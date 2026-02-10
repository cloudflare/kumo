import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogRoot,
  DialogTitle,
  DialogClose,
} from "../../components/dialog";
import { Input } from "../../components/input";
import { Button } from "../../components/button";
import { cn } from "../../utils/cn";
import {
  CheckIcon,
  CopyIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Banner } from "../../components/banner";

export const KUMO_DELETE_RESOURCE_VARIANTS = {
  size: {
    sm: {
      classes: "",
      description: "Small dialog for simple delete confirmations",
    },
    base: {
      classes: "",
      description: "Default delete confirmation dialog size",
    },
  },
} as const;

export const KUMO_DELETE_RESOURCE_DEFAULT_VARIANTS = {
  size: "base",
} as const;

export type KumoDeleteResourceSize =
  keyof typeof KUMO_DELETE_RESOURCE_VARIANTS.size;

export interface KumoDeleteResourceVariantsProps {
  size?: KumoDeleteResourceSize;
}

export interface DeleteResourceProps extends KumoDeleteResourceVariantsProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** The type of resource being deleted (e.g., "Zone", "Worker", "KV Namespace") */
  resourceType: string;
  /** The name of the specific resource being deleted */
  resourceName: string;
  /** Callback when delete is confirmed */
  onDelete: () => void | Promise<void>;
  /** Whether the delete action is in progress */
  isDeleting?: boolean;
  /** Whether the confirmation input should be case-sensitive (default: true) */
  caseSensitive?: boolean;
  /** Custom delete button text (defaults to "Delete {resourceType}") */
  deleteButtonText?: string;
  /** Additional className for the dialog */
  className?: string;
  /** Error message to display if the delete action fails */
  errorMessage?: string;
}

export function DeleteResource({
  open,
  onOpenChange,
  resourceType,
  resourceName,
  onDelete,
  isDeleting = false,
  caseSensitive = true,
  deleteButtonText,
  size = KUMO_DELETE_RESOURCE_DEFAULT_VARIANTS.size,
  errorMessage,
  className,
}: DeleteResourceProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmationInput("");
      setCopied(false);
    }
  }, [open]);

  const normalizeForComparison = useCallback(
    (str: string) => (caseSensitive ? str : str.toLowerCase()),
    [caseSensitive],
  );

  const isConfirmed =
    normalizeForComparison(confirmationInput) ===
    normalizeForComparison(resourceName);

  const handleDelete = useCallback(async () => {
    if (!isConfirmed || isDeleting) return;
    await onDelete();
  }, [isConfirmed, isDeleting, onDelete]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(resourceName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [resourceName]);

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog size={size} className={cn("p-0", className)}>
        <div className="flex items-center justify-between border-b border-kumo-line px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            Delete {resourceName}
          </DialogTitle>
          <DialogClose>
            <Button
              variant="ghost"
              shape="square"
              size="sm"
              aria-label="Close"
              disabled={isDeleting}
            >
              <XIcon size={18} />
            </Button>
          </DialogClose>
        </div>

        <div className="flex flex-col p-6 gap-4">
          <div className="flex flex-col gap-2">
            {errorMessage && (
              <Banner icon={<WarningCircleIcon />} variant="error">
                {errorMessage}
              </Banner>
            )}
            <p className="text-base text-kumo-subtle max-w-prose text-pretty">
              This action cannot be undone. This will permanently delete the{" "}
              <span className="font-medium text-kumo-default">
                {resourceName}
              </span>{" "}
              {resourceType.toLowerCase()}.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-base">
              <span>
                Type{" "}
                <button
                  className="font-mono text-sm inline font-semibold bg-kumo-tint hover:bg-kumo-fill rounded-md px-2 py-1 group hover:cursor-pointer"
                  onClick={handleCopy}
                  aria-label={`Copy ${resourceName} to clipboard`}
                >
                  {resourceName}

                  {copied ? (
                    <CheckIcon
                      size={12}
                      weight="bold"
                      className="inline ml-1.5"
                    />
                  ) : (
                    <CopyIcon
                      size={12}
                      weight="bold"
                      className="inline text-kumo-subtle group-hover:text-kumo-default ml-1.5"
                    />
                  )}
                </button>{" "}
                to confirm:
              </span>
            </div>
            <Input
              placeholder={resourceName}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              disabled={isDeleting}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label={`Type ${resourceName} to confirm deletion`}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-kumo-line px-6 py-4">
          <DialogClose>
            <Button variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            loading={isDeleting}
          >
            {deleteButtonText || `Delete ${resourceType}`}
          </Button>
        </div>
      </Dialog>
    </DialogRoot>
  );
}

DeleteResource.displayName = "DeleteResource";
