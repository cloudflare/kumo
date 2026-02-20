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
