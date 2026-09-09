import { useState } from "react";
import { Button, Input, LayerDialog, Text } from "@cloudflare/kumo";

function LongContent() {
  return (
    <>
      <Text variant="secondary">
        Browse available shortcuts without changing a setting.
      </Text>
      <div className="mt-6 rounded-lg border border-kumo-line p-4 text-kumo-subtle">
        Navigation and command shortcuts
      </div>
      <div className="mt-6">
        <Text variant="secondary">
          The title frame stays visible, receives a divider once content
          scrolls, and the scroll mask indicates more content below.
        </Text>
      </div>
      <div className="h-96" />
    </>
  );
}

export function LayerDialogInformationalDemo() {
  return (
    <LayerDialog.Root>
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Open keyboard shortcuts</Button>}
      />
      <LayerDialog.Content>
        <LayerDialog.Title>Keyboard shortcuts</LayerDialog.Title>
        <LayerDialog.Body>
          <LongContent />
        </LayerDialog.Body>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}

export function LayerDialogActionDemo() {
  const [name, setName] = useState("Production API");
  const [hostname, setHostname] = useState("api.example.com");

  return (
    <LayerDialog.Root>
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Open settings</Button>}
      />
      <LayerDialog.Content>
        <LayerDialog.Title>Configure custom hostname</LayerDialog.Title>
        <LayerDialog.Body>
          <Text variant="secondary">
            Route requests for this hostname to your Worker.
          </Text>
          <div className="mt-6 flex flex-col gap-5">
            <Input
              label="Hostname"
              onChange={(event) => setHostname(event.target.value)}
              value={hostname}
            />
            <Input
              label="Display name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </div>
        </LayerDialog.Body>
        <LayerDialog.Actions>
          <LayerDialog.Actions.Primary
            disabled={!hostname || !name}
            onClick={() => undefined}
          >
            Save hostname
          </LayerDialog.Actions.Primary>
        </LayerDialog.Actions>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}

export function LayerDialogCancelDemo() {
  const [email, setEmail] = useState("alex@example.com");
  const [name, setName] = useState("Alex Morgan");

  return (
    <LayerDialog.Root>
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Edit profile</Button>}
      />
      <LayerDialog.Content>
        <LayerDialog.Title>Edit profile</LayerDialog.Title>
        <LayerDialog.Body>
          <Text variant="secondary">
            Update the profile information shown to your teammates. Changes are
            not saved until you confirm.
          </Text>
          <div className="mt-6 flex flex-col gap-5">
            <Input
              label="Display name"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
            <Input
              label="Email address"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>
        </LayerDialog.Body>
        <LayerDialog.Actions dismissLabel="cancel">
          <LayerDialog.Actions.Primary
            disabled={!email || !name}
            onClick={() => undefined}
          >
            Save changes
          </LayerDialog.Actions.Primary>
        </LayerDialog.Actions>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}

export function LayerDialogAlertDemo() {
  const workerName = "example-worker";
  const [confirmation, setConfirmation] = useState("");

  return (
    <LayerDialog.Alert>
      <LayerDialog.Trigger
        render={(props) => (
          <Button variant="secondary-destructive" {...props}>
            Delete Worker
          </Button>
        )}
      />
      <LayerDialog.Content>
        <LayerDialog.Title>Delete Worker</LayerDialog.Title>
        <LayerDialog.Body>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Text variant="secondary">
                Deleting{" "}
                <strong className="text-kumo-default">{workerName}</strong> is
                permanent.
              </Text>
              <Text variant="secondary">
                This deletes the Worker, deployments, and configuration. If this
                Worker consumes Queues, those connections are removed first.
                Queues, D1 databases, and messages stay in your account.
              </Text>
            </div>
            <Input
              label={
                <>
                  Type <strong>{workerName}</strong> to confirm
                </>
              }
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={workerName}
              value={confirmation}
            />
          </div>
        </LayerDialog.Body>
        <LayerDialog.Actions>
          <LayerDialog.Actions.Primary
            disabled={confirmation !== workerName}
            onClick={() => undefined}
          >
            Delete Worker
          </LayerDialog.Actions.Primary>
        </LayerDialog.Actions>
      </LayerDialog.Content>
    </LayerDialog.Alert>
  );
}

export function LayerDialogPendingDemo() {
  const [pending, setPending] = useState(false);
  return (
    <LayerDialog.Root dismissDisabled={pending}>
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Save a setting</Button>}
      />
      <LayerDialog.Content>
        <LayerDialog.Title>Save a setting</LayerDialog.Title>
        <LayerDialog.Body>
          <Text variant="secondary">
            While saving, Close, Escape, backdrop, and mobile swipe dismissals
            are blocked together.
          </Text>
        </LayerDialog.Body>
        <LayerDialog.Actions>
          <LayerDialog.Actions.Primary
            loading={pending}
            onClick={() => {
              setPending(true);
              window.setTimeout(() => setPending(false), 1500);
            }}
          >
            Save changes
          </LayerDialog.Actions.Primary>
        </LayerDialog.Actions>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}

export function LayerDialogCleanupDemo() {
  const [open, setOpen] = useState(false);
  const [cleanupCount, setCleanupCount] = useState(0);
  return (
    <LayerDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setCleanupCount((count) => count + 1);
        setOpen(nextOpen);
      }}
    >
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Open draft</Button>}
      />
      <LayerDialog.Content>
        <LayerDialog.Title>Draft settings</LayerDialog.Title>
        <LayerDialog.Body>
          <Text variant="secondary">
            Cleanup has run {cleanupCount} time{cleanupCount === 1 ? "" : "s"}.
          </Text>
        </LayerDialog.Body>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}

export function LayerDialogTopAlignDemo() {
  return (
    <LayerDialog.Root>
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Open top-aligned dialog</Button>}
      />
      <LayerDialog.Content verticalAlign="top">
        <LayerDialog.Title>Top-aligned dialog</LayerDialog.Title>
        <LayerDialog.Body>
          <Text variant="secondary">Mobile dialogs remain bottom sheets.</Text>
        </LayerDialog.Body>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}

export function LayerDialogSizeDemo() {
  return (
    <LayerDialog.Root>
      <LayerDialog.Trigger
        render={(props) => <Button {...props}>Review configuration</Button>}
      />
      <LayerDialog.Content size="lg">
        <LayerDialog.Title>Review deployment configuration</LayerDialog.Title>
        <LayerDialog.Body>
          <Text variant="secondary">
            Confirm the service details and routing configuration before this
            deployment is created.
          </Text>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input label="Service name" defaultValue="production-api" />
            <Input label="Environment" defaultValue="Production" />
            <Input label="Hostname" defaultValue="api.example.com" />
            <Input label="Compatibility date" defaultValue="2026-09-09" />
          </div>
        </LayerDialog.Body>
        <LayerDialog.Actions>
          <LayerDialog.Actions.Primary>
            Create deployment
          </LayerDialog.Actions.Primary>
        </LayerDialog.Actions>
      </LayerDialog.Content>
    </LayerDialog.Root>
  );
}
