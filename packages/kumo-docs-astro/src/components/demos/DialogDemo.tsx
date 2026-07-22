import { useState } from "react";
import {
  Dialog,
  Button,
  Select,
  Combobox,
  DropdownMenu,
  Input,
  Radio,
  Banner,
} from "@cloudflare/kumo";
import type { DialogProps } from "@cloudflare/kumo";
import { Warning, X } from "@phosphor-icons/react";

export function DialogBasicDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Click me</Button>} />
      <Dialog.Content className="p-8">
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
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function DialogWithActionsDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Delete</Button>} />
      <Dialog.Content className="p-8">
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
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Dialog with a consumer-provided max width and wide intrinsic content.
 * The panel should stay capped at max-w-lg on desktop.
 */
export function DialogMaxWidthDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(p) => <Button {...p}>Open capped dialog</Button>}
      />
      <Dialog.Content className="max-w-lg p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-2xl font-semibold">
            Max width override
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
          This dialog uses <code>className="max-w-lg"</code> and should stay
          capped around 512px on desktop.
        </Dialog.Description>
        <div className="mt-4 truncate rounded-md border border-kumo-line bg-kumo-recessed p-3 font-mono text-sm">
          abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
        </div>
      </Dialog.Content>
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
      <Dialog.Content className="p-8">
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
      </Dialog.Content>
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
      <Dialog.Content className="p-8">
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
      </Dialog.Content>
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
      <Dialog.Content className="p-8">
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
          placeholder="Select region..."
          renderValue={(v) => regions.find((r) => r.value === v)?.label}
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
      </Dialog.Content>
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
      <Dialog.Content className="p-8">
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
      </Dialog.Content>
    </Dialog.Root>
  );
}

export function DialogWithDropdownDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Open Form</Button>} />
      <Dialog.Content className="p-8">
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
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Side-by-side triggers for comparing the base and layer dialog variants.
 */
export function DialogVariantsComparisonDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog.Root>
        <Dialog.Trigger
          render={(p) => (
            <Button {...p} variant="secondary">
              Open base variant
            </Button>
          )}
        />
        <Dialog.Content className="p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <Dialog.Title className="text-2xl font-semibold">
              Base Dialog
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
            The base variant preserves the existing modal surface and spacing.
          </Dialog.Description>
          <div className="mt-8 flex justify-end gap-2">
            <Dialog.Close
              render={(p) => (
                <Button {...p} variant="secondary">
                  Cancel
                </Button>
              )}
            />
            <Button>Continue</Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root>
        <Dialog.Trigger
          render={(p) => <Button {...p}>Open layer variant</Button>}
        />
        <Dialog.Content variant="layer" className="max-w-lg">
          <Dialog.Body>
            <Dialog.Title>Layer Dialog</Dialog.Title>
            <Dialog.Description>
              The layer variant composes the dialog with LayerCard sections for
              product workflows.
            </Dialog.Description>
          </Dialog.Body>
          <Dialog.Footer className="justify-between">
            <Dialog.Close
              render={(p) => (
                <Button {...p} variant="ghost">
                  Cancel
                </Button>
              )}
            />
            <Button>Continue</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

const DIALOG_REGION_OPTIONS = [
  { label: "Asia-Pacific (APAC)", value: "apac" },
  { label: "Eastern Europe (EEUR)", value: "eeur" },
  { label: "Eastern North America (ENAM)", value: "enam" },
  { label: "Oceania (OC)", value: "oc" },
  { label: "Western Europe (WEUR)", value: "weur" },
  { label: "Western North America (WNAM)", value: "wnam" },
];

/**
 * Dialog using the layer variant for product workflow confirmations.
 */
export function DialogLayerVariantDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(p) => <Button {...p}>Open layer dialog</Button>}
      />
      <Dialog.Content variant="layer" className="max-w-lg">
        <Dialog.Body>
          <Dialog.Title>Remove Database</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to remove this database? This action cannot be
            undone.
          </Dialog.Description>
        </Dialog.Body>
        <Dialog.Footer className="justify-between">
          <Dialog.Close
            render={(p) => (
              <Button {...p} variant="ghost">
                Close
              </Button>
            )}
          />
          <Button variant="destructive">Confirm</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Layer variant dialog with form fields and structured footer actions.
 */
export function DialogLayerFormDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(p) => <Button {...p}>Open form dialog</Button>}
      />
      <Dialog.Content variant="layer" className="max-w-lg">
        <Dialog.Body>
          <Dialog.Title>Create Bucket</Dialog.Title>
          <Dialog.Description>
            High-performance storage for files and objects with zero egress
            charges.
          </Dialog.Description>

          <div className="space-y-4 mt-4">
            <Input label="Bucket name" placeholder="bucket-name" />
            <Select
              value="apac"
              items={DIALOG_REGION_OPTIONS}
              className="w-full"
              label="Region"
              placeholder="Region"
            />
            <Radio.Group
              legend="Choose a plan"
              appearance="card"
              orientation="horizontal"
              value="Standard"
            >
              <Radio.Item
                label="Standard"
                value="Standard"
                description="Recommended for objects that will be accessed at least once a month."
              />
              <Radio.Item
                label="Infrequent Access"
                value="Infrequent Access"
                description="Recommended for objects that will be accessed less than once a month."
              />
            </Radio.Group>
          </div>
        </Dialog.Body>
        <Dialog.Footer className="justify-between">
          <Dialog.Close
            render={(p) => (
              <Button {...p} variant="ghost">
                Close
              </Button>
            )}
          />
          <Button variant="primary">Create</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Layer variant dialog with a separator and inline validation feedback.
 */
export function DialogLayerSeparatorDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={(p) => <Button {...p}>Open separated dialog</Button>}
      />
      <Dialog.Content variant="layer" className="max-w-lg">
        <Dialog.Body>
          <Dialog.Title>Domain Registration</Dialog.Title>
          <Dialog.Description>
            At-cost domain registration and renewal. Securely register,
            transfer, consolidate, and manage your domain portfolios.
          </Dialog.Description>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" placeholder="Matt" />
              <Input label="Last name" placeholder="Flare" />
            </div>
            <Input label="Address" placeholder="Address" />
          </div>

          <Dialog.Separator />
          <Dialog.Description>
            This information is required for domain ownership records and to
            ensure we can contact you regarding your registration.
          </Dialog.Description>
          <div className="space-y-4 mt-2">
            <Input label="Email" placeholder="example@example.com" />
            <Banner
              variant="error"
              description="You do not have permission to register domains in this region."
            />
          </div>
        </Dialog.Body>
        <Dialog.Footer className="justify-between">
          <Dialog.Close
            render={(p) => (
              <Button {...p} variant="ghost">
                Close
              </Button>
            )}
          />
          <Button variant="primary">Register</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

/**
 * Demonstrates that each dialog size holds its fixed width regardless of
 * content. Each dialog contains a wide table that would previously cause the
 * dialog to stretch beyond its intended size.
 */
export function DialogSizesDemo() {
  const sizes: { size: NonNullable<DialogProps["size"]>; label: string; width: string }[] = [
    { size: "sm", label: "Small", width: "288px" },
    { size: "base", label: "Base", width: "384px" },
    { size: "lg", label: "Large", width: "512px" },
    { size: "xl", label: "Extra Large", width: "768px" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map(({ size, label, width }) => (
        <Dialog.Root key={size}>
          <Dialog.Trigger
            render={(p) => (
              <Button variant="secondary" {...p}>
                {label} ({width})
              </Button>
            )}
          />
          <Dialog size={size} className="p-8">
            <div className="mb-4 flex items-start justify-between gap-4">
              <Dialog.Title className="text-2xl font-semibold">
                {label} Dialog
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
              This <code>size="{size}"</code> dialog should stay at {width} wide
              regardless of the content below.
            </Dialog.Description>
            <div className="mt-4 overflow-auto rounded-md border border-kumo-line">
              <table className="w-max text-sm">
                <thead className="bg-kumo-elevated text-left">
                  <tr>
                    <th className="px-3 py-2">Resource</th>
                    <th className="px-3 py-2">Region</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Latency</th>
                    <th className="px-3 py-2">Requests</th>
                    <th className="px-3 py-2">Last Deployed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kumo-hairline">
                  <tr>
                    <td className="px-3 py-2">api-gateway-prod</td>
                    <td className="px-3 py-2">us-east-1</td>
                    <td className="px-3 py-2 text-kumo-success">Healthy</td>
                    <td className="px-3 py-2">12ms</td>
                    <td className="px-3 py-2">1,234,567</td>
                    <td className="px-3 py-2">2026-06-23</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">worker-analytics</td>
                    <td className="px-3 py-2">eu-west-1</td>
                    <td className="px-3 py-2 text-kumo-warning">Degraded</td>
                    <td className="px-3 py-2">89ms</td>
                    <td className="px-3 py-2">456,789</td>
                    <td className="px-3 py-2">2026-06-22</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end gap-2">
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
      ))}
    </div>
  );
}
