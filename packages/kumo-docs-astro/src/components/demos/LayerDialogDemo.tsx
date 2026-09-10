import { useState } from "react";
import {
  Button,
  Input,
  LayerDialog,
  Text,
  type KumoLayerDialogSize,
  type KumoLayerDialogVerticalAlign,
} from "@cloudflare/kumo";

function LongContent() {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-kumo-line p-4 text-kumo-subtle">
        Navigation and command shortcuts
      </div>
      <Text variant="secondary">
        The title frame stays visible, receives a divider once content scrolls,
        and the scroll mask indicates more content below.
      </Text>
      <div className="h-96" />
    </div>
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
        <LayerDialog.Description>
          Browse available shortcuts without changing a setting.
        </LayerDialog.Description>
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
        <LayerDialog.Description>
          Route requests for this hostname to your Worker.
        </LayerDialog.Description>
        <LayerDialog.Body>
          <div className="flex flex-col gap-5">
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
        <LayerDialog.Description>
          Update the profile information shown to your teammates. Changes are
          not saved until you confirm.
        </LayerDialog.Description>
        <LayerDialog.Body>
          <div className="flex flex-col gap-5">
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
        <LayerDialog.Description>
          Deleting <strong className="text-kumo-default">{workerName}</strong>{" "}
          is permanent.
        </LayerDialog.Description>
        <LayerDialog.Body>
          <div className="flex flex-col gap-5">
            <Text variant="secondary">
              This deletes the Worker, deployments, and configuration. If this
              Worker consumes Queues, those connections are removed first.
              Queues, D1 databases, and messages stay in your account.
            </Text>
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
        <LayerDialog.Description>
          While saving, Close, Escape, backdrop, and mobile swipe dismissals are
          blocked together.
        </LayerDialog.Description>
        <LayerDialog.Body>
          <Text variant="secondary">
            Programmatic closes still work, so a successful save can dismiss the
            dialog through `actionsRef` or a controlled `open` prop.
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

export function LayerDialogMaxHeightDemo() {
  const [verticalAlign, setVerticalAlign] =
    useState<KumoLayerDialogVerticalAlign>("center");
  const [open, setOpen] = useState(false);

  const openAt = (align: KumoLayerDialogVerticalAlign) => {
    setVerticalAlign(align);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => openAt("center")}>Centered, tall content</Button>
        <Button onClick={() => openAt("top")}>Top-aligned, tall content</Button>
      </div>
      <LayerDialog.Root open={open} onOpenChange={setOpen}>
        <LayerDialog.Content verticalAlign={verticalAlign}>
          <LayerDialog.Title>Audit log</LayerDialog.Title>
          <LayerDialog.Description>
            The dialog grows with its content until it reaches the viewport cap,
            then only the body scrolls.
          </LayerDialog.Description>
          <LayerDialog.Body>
            <ol className="flex flex-col gap-2">
              {Array.from({ length: 40 }, (_, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-kumo-line px-3 py-2 text-kumo-subtle"
                >
                  Entry {index + 1}
                </li>
              ))}
            </ol>
          </LayerDialog.Body>
          <LayerDialog.Actions>
            <LayerDialog.Actions.Primary>
              Export log
            </LayerDialog.Actions.Primary>
          </LayerDialog.Actions>
        </LayerDialog.Content>
      </LayerDialog.Root>
    </>
  );
}

export function LayerDialogSizeDemo() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<KumoLayerDialogSize>("base");

  const openAtSize = (nextSize: KumoLayerDialogSize) => {
    setSize(nextSize);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => openAtSize("sm")}>Small</Button>
        <Button onClick={() => openAtSize("base")}>Default</Button>
        <Button onClick={() => openAtSize("lg")}>Large</Button>
        <Button onClick={() => openAtSize("xl")}>Extra large</Button>
      </div>
      <LayerDialog.Root open={open} onOpenChange={setOpen}>
        <LayerDialog.Content size={size}>
          <LayerDialog.Title>Review deployment configuration</LayerDialog.Title>
          <LayerDialog.Description>
            Confirm the service details and routing configuration before this
            deployment is created.
          </LayerDialog.Description>
          <LayerDialog.Body>
            <div className="grid gap-5 sm:grid-cols-2">
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
    </>
  );
}
