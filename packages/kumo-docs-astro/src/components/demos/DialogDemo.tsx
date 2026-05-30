import { useState } from "react";
import {
  Dialog,
  Button,
  Select,
  Combobox,
  DropdownMenu,
} from "@cloudflare/kumo";
import { Warning, X } from "@phosphor-icons/react";

export function DialogBasicDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Click me</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Modal Title
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="text-kumo-subtle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Dialog.Description>
      </Dialog>
    </Dialog.Root>
  );
}

export function DialogWithActionsDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Delete</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Modal Title
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="text-kumo-subtle">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Dialog.Description>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Cancel
              </Button>
            )}
          />
          <Dialog.Close
            render={(props) => (
              <Button variant="destructive" {...props}>
                Delete
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

export function DialogConfirmationDemo() {
  return (
    <Dialog.Root disablePointerDismissal>
      <Dialog.Trigger
        render={(p) => (
          <Button {...p} variant="destructive">
            Delete Project
          </Button>
        )}
      />
      <Dialog className="p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kumo-danger/20">
            <Warning size={20} className="text-kumo-danger" />
          </div>
          <Dialog.Title className="text-xl font-semibold">
            Delete Project?
          </Dialog.Title>
        </div>
        <Dialog.Description className="text-kumo-subtle">
          This action cannot be undone. This will permanently delete the project
          and all associated data.
        </Dialog.Description>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Cancel
              </Button>
            )}
          />
          <Dialog.Close
            render={(props) => (
              <Button variant="destructive" {...props}>
                Delete
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

/**
 * Alert dialog for destructive actions that uses role="alertdialog".
 * This provides proper accessibility semantics for confirmation flows.
 */
export function DialogAlertDemo() {
  return (
    <Dialog.Root role="alertdialog">
      <Dialog.Trigger
        render={(p) => (
          <Button {...p} variant="destructive">
            Delete Account
          </Button>
        )}
      />
      <Dialog className="p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kumo-danger/20">
            <Warning size={20} className="text-kumo-danger" weight="fill" />
          </div>
          <Dialog.Title className="text-xl font-semibold">
            Delete Account?
          </Dialog.Title>
        </div>
        <Dialog.Description className="text-kumo-subtle">
          This action cannot be undone. All your data will be permanently
          removed from our servers. Are you sure you want to proceed?
        </Dialog.Description>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Cancel
              </Button>
            )}
          />
          <Dialog.Close
            render={(props) => (
              <Button variant="destructive" {...props}>
                Delete Account
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

const regions = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "eu-west", label: "EU West" },
  { value: "ap-south", label: "AP South" },
];

export function DialogWithSelectDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Open Form</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Create Resource
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="mb-4 text-kumo-subtle">
          Select a region for your new resource.
        </Dialog.Description>
        <Select
          className="w-full"
          renderValue={(v) =>
            regions.find((r) => r.value === v)?.label ?? "Select region..."
          }
        >
          {regions.map((region) => (
            <Select.Option key={region.value} value={region.value}>
              {region.label}
            </Select.Option>
          ))}
        </Select>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Cancel
              </Button>
            )}
          />
          <Button variant="primary">Create</Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

export function DialogWithComboboxDemo() {
  const [value, setValue] = useState<{ value: string; label: string } | null>(
    null,
  );

  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Open Form</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Create Resource
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="mb-4 text-kumo-subtle">
          Search and select a region for your new resource.
        </Dialog.Description>
        <Combobox value={value} onValueChange={setValue} items={regions}>
          <Combobox.TriggerInput
            className="w-full"
            placeholder="Search regions..."
          />
          <Combobox.Content>
            <Combobox.Empty>No regions found</Combobox.Empty>
            <Combobox.List>
              {(item: { value: string; label: string }) => (
                <Combobox.Item key={item.value} value={item}>
                  {item.label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Content>
        </Combobox>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Cancel
              </Button>
            )}
          />
          <Button variant="primary">Create</Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

/**
 * Demonstrates the `busy` prop. When `busy={true}`, Escape, outside clicks,
 * and Dialog.Close buttons are all swallowed, preventing the user from
 * abandoning an in-flight Save. Programmatic close still works (the demo
 * resolves and closes after 2s).
 */
export function DialogBusyDemo() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} busy={saving}>
      <Dialog.Trigger render={(p) => <Button {...p}>Open</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            {saving ? "Saving…" : "Save changes"}
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="text-kumo-subtle">
          {saving
            ? "Don't go anywhere — Escape, outside clicks, and the close button are temporarily disabled while we save your changes."
            : "Click Save to start a fake 2-second save. While it runs, Escape, outside clicks, and Close are blocked."}
        </Dialog.Description>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props} disabled={saving}>
                Cancel
              </Button>
            )}
          />
          <Button
            variant="primary"
            disabled={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                setOpen(false);
              }, 2000);
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

/**
 * Demonstrates the `2xl` size variant (min 1024px). Useful for dialogs
 * containing data-dense layouts: tables, side-by-side forms, summary panels.
 */
export function DialogSize2xlDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Open 2xl dialog</Button>} />
      <Dialog size="2xl" className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Wide layout (size=&quot;2xl&quot;)
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="mb-6 text-kumo-subtle">
          The <code>2xl</code> size gives you at least 1024px of horizontal
          space — enough for two columns of form fields, a small table, or a
          side-by-side preview.
        </Dialog.Description>
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border border-kumo-hairline p-4">
            <h4 className="mb-2 font-medium">Column A</h4>
            <p className="text-sm text-kumo-subtle">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <div className="rounded-lg border border-kumo-hairline p-4">
            <h4 className="mb-2 font-medium">Column B</h4>
            <p className="text-sm text-kumo-subtle">
              Sed do eiusmod tempor incididunt ut labore et dolore magna.
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Close
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

/**
 * Demonstrates `verticalAlign="top"` with a `topOffset` so the dialog clears
 * a fixed-position header. Useful for apps with a persistent navbar where
 * a centered dialog would visually overlap or compete with the chrome.
 */
export function DialogVerticalAlignTopDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(p) => <Button {...p}>Open top-anchored dialog</Button>}
      />
      <Dialog verticalAlign="top" topOffset={64} className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Top-anchored
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="text-kumo-subtle">
          With <code>verticalAlign=&quot;top&quot;</code> and{" "}
          <code>topOffset=&#123;64&#125;</code>, this dialog opens flush to the
          top of the viewport with a 64px gap — enough to clear a typical app
          navbar.
        </Dialog.Description>
        <div className="mt-8 flex justify-end">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Close
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}

export function DialogWithDropdownDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Open Form</Button>} />
      <Dialog className="p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Resource Actions
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            render={(props) => (
              <Button
                {...props}
                variant="secondary"
                shape="square"
                icon={<X />}
                aria-label="Close"
              />
            )}
          />
        </div>
        <Dialog.Description className="mb-4 text-kumo-subtle">
          Choose an action for the selected resource.
        </Dialog.Description>
        <DropdownMenu>
          <DropdownMenu.Trigger render={<Button>Actions</Button>} />
          <DropdownMenu.Content>
            <DropdownMenu.Item>Edit</DropdownMenu.Item>
            <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item variant="danger">Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <div className="mt-8 flex justify-end">
          <Dialog.Close
            render={(props) => (
              <Button variant="secondary" {...props}>
                Close
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
