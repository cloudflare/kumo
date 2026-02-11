import { Popover, Button } from "@cloudflare/kumo";
import { BellIcon } from "@phosphor-icons/react";

export function PopoverHeroDemo() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button shape="square" icon={BellIcon} aria-label="Notifications" />
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Notifications</Popover.Title>
        <Popover.Description>
          You are all caught up. Good job!
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverBasicDemo() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button>Open Popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Popover Title</Popover.Title>
        <Popover.Description>
          This is a basic popover with a title and description.
        </Popover.Description>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverWithCloseDemo() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button>Open Settings</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Settings</Popover.Title>
        <Popover.Description>
          Configure your preferences below.
        </Popover.Description>
        <div className="mt-3">
          <Popover.Close asChild>
            <Button variant="secondary" size="sm">
              Close
            </Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverPositionDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Bottom</Button>
        </Popover.Trigger>
        <Popover.Content side="bottom">
          <Popover.Title>Bottom</Popover.Title>
          <Popover.Description>
            Popover on bottom (default).
          </Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Top</Button>
        </Popover.Trigger>
        <Popover.Content side="top">
          <Popover.Title>Top</Popover.Title>
          <Popover.Description>Popover on top.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Left</Button>
        </Popover.Trigger>
        <Popover.Content side="left">
          <Popover.Title>Left</Popover.Title>
          <Popover.Description>Popover on left.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">Right</Button>
        </Popover.Trigger>
        <Popover.Content side="right">
          <Popover.Title>Right</Popover.Title>
          <Popover.Description>Popover on right.</Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}

export function PopoverCustomContentDemo() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button>User Profile</Button>
      </Popover.Trigger>
      <Popover.Content className="w-64">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-kumo-recessed" />
          <div>
            <Popover.Title>Jane Doe</Popover.Title>
            <p className="text-sm text-kumo-subtle">jane@example.com</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 border-t border-kumo-line pt-3">
          <Button variant="secondary" size="sm" className="flex-1">
            Profile
          </Button>
          <Popover.Close asChild>
            <Button variant="ghost" size="sm" className="flex-1">
              Sign Out
            </Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverOpenOnHoverDemo() {
  return (
    <Popover>
      <Popover.Trigger openOnHover delay={200} asChild>
        <Button variant="secondary">Hover Me</Button>
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Hover Triggered</Popover.Title>
        <Popover.Description>
          This popover opens on hover with a 200ms delay. It can still contain
          interactive content like buttons and links.
        </Popover.Description>
        <div className="mt-3">
          <Popover.Close asChild>
            <Button variant="secondary" size="sm">
              Got it
            </Button>
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}
