import {
  LayerDialog,
  Button,
  Input,
  Select,
  Radio,
  Banner,
} from "@cloudflare/kumo";

/**
 * Basic LayerDialog with a title and body content.
 */
export function LayerDialogBasicDemo() {
  return (
    <LayerDialog>
      <LayerDialog.Trigger render={<Button>Open dialog</Button>} />
      <LayerDialog.Content className="max-w-lg">
        <LayerDialog.Body>
          <LayerDialog.Title>Remove Database</LayerDialog.Title>
          <p className="text-base">
            Are you sure you want to remove this database. This is permanently
            delete
          </p>
        </LayerDialog.Body>
        <LayerDialog.Footer className="justify-between">
          <LayerDialog.Close render={<Button variant="ghost">Close</Button>} />
          <Button variant="destructive">Confirm</Button>
        </LayerDialog.Footer>
      </LayerDialog.Content>
    </LayerDialog>
  );
}

const REGION_OPTIONS = [
  {
    label: "Asia-Pacific (APAC)",
    value: "apac",
  },
  {
    label: "Eastern Europe (EEUR)",
    value: "eeur",
  },
  {
    label: "Eastern North America (ENAM)",
    value: "enam",
  },
  {
    label: "Oceania (OC)",
    value: "oc",
  },
  {
    label: "Western Europe (WEUR)",
    value: "weur",
  },
  {
    label: "Western North America (WNAM)",
    value: "wnam",
  },
];

/**
 * LayerDialog with footer actions for confirmation flows.
 */
export function LayerDialogWithForm() {
  return (
    <LayerDialog>
      <LayerDialog.Trigger render={<Button>Open dialog</Button>} />
      <LayerDialog.Content className="max-w-lg">
        <LayerDialog.Body>
          <LayerDialog.Title>Create Bucket</LayerDialog.Title>
          <LayerDialog.Description>
            High-performance storage for files and objects with zero egress
            charges.
          </LayerDialog.Description>

          <div className="space-y-4 mt-4">
            <Input label="Bucket name" placeholder="bucket-name" />
            <Select
              value={"apac"}
              items={REGION_OPTIONS}
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
        </LayerDialog.Body>
        <LayerDialog.Footer className="justify-between">
          <LayerDialog.Close render={<Button variant="ghost">Close</Button>} />
          <Button variant="primary">Create</Button>
        </LayerDialog.Footer>
      </LayerDialog.Content>
    </LayerDialog>
  );
}

/**
 * LayerDialog showing an inline error Banner for validation feedback.
 */
export function LayerDialogWithForm2() {
  return (
    <LayerDialog>
      <LayerDialog.Trigger render={<Button>Open dialog</Button>} />
      <LayerDialog.Content className="max-w-lg">
        <LayerDialog.Body>
          <LayerDialog.Title>Create Bucket</LayerDialog.Title>
          <LayerDialog.Description>
            High-performance storage for files and objects with zero egress
            charges.
          </LayerDialog.Description>

          <div className="space-y-4 mt-4">
            <Input label="Bucket name" placeholder="bucket-name" />

            <Banner variant="error">
              You do not have permission to create bucket in this region
            </Banner>
          </div>
        </LayerDialog.Body>
        <LayerDialog.Footer className="justify-between">
          <LayerDialog.Close render={<Button variant="ghost">Close</Button>} />
          <Button variant="primary">Create</Button>
        </LayerDialog.Footer>
      </LayerDialog.Content>
    </LayerDialog>
  );
}

/**
 * LayerDialog with a Separator to divide content sections.
 */
export function LayerDialogWithForm3() {
  return (
    <LayerDialog>
      <LayerDialog.Trigger render={<Button>Open dialog</Button>} />
      <LayerDialog.Content className="max-w-lg">
        <LayerDialog.Body>
          <LayerDialog.Title>Domain Registration</LayerDialog.Title>
          <LayerDialog.Description>
            At-cost domain registration and renewal. Securely register,
            transfer, consolidate, and manage your domain portfolios — without
            add-on fees or inflated renewal costs.
          </LayerDialog.Description>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name" placeholder="Matt" />
              <Input label="Last name" placeholder="Flare" />
            </div>
            <Input label="Address" placeholder="Address" />
          </div>

          <LayerDialog.Separator />
          <LayerDialog.Description>
            This information is required for domain ownership records and to
            ensure we can contact you regarding your registration
          </LayerDialog.Description>
          <div className="space-y-4 mt-2">
            <Input label="Email" placeholder="example@example.com" />
            <Input label="Phone Number" placeholder="bucket-name" />
          </div>
        </LayerDialog.Body>
        <LayerDialog.Footer className="justify-between">
          <LayerDialog.Close render={<Button variant="ghost">Close</Button>} />
          <Button variant="primary">Register</Button>
        </LayerDialog.Footer>
      </LayerDialog.Content>
    </LayerDialog>
  );
}
