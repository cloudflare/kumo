import { useState, useRef } from "react";
import { Popover, Button } from "@cloudflare/kumo";
import { BellIcon, DotsThree } from "@phosphor-icons/react";

export function PopoverHeroDemo() {
  return (
    <Popover>
      <Popover.Trigger
        render={
          <Button shape="square" icon={BellIcon} aria-label="Notifications" />
        }
      />
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
      <Popover.Trigger render={<Button />}>Open Popover</Popover.Trigger>
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
      <Popover.Trigger render={<Button />}>Open Settings</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Settings</Popover.Title>
        <Popover.Description>
          Configure your preferences below.
        </Popover.Description>
        <div className="mt-3">
          <Popover.Close render={<Button variant="secondary" size="sm" />}>
            Close
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
        <Popover.Trigger render={<Button variant="secondary" />}>
          Bottom
        </Popover.Trigger>
        <Popover.Content side="bottom">
          <Popover.Title>Bottom</Popover.Title>
          <Popover.Description>
            Popover on bottom (default).
          </Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger render={<Button variant="secondary" />}>
          Top
        </Popover.Trigger>
        <Popover.Content side="top">
          <Popover.Title>Top</Popover.Title>
          <Popover.Description>Popover on top.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger render={<Button variant="secondary" />}>
          Left
        </Popover.Trigger>
        <Popover.Content side="left">
          <Popover.Title>Left</Popover.Title>
          <Popover.Description>Popover on left.</Popover.Description>
        </Popover.Content>
      </Popover>

      <Popover>
        <Popover.Trigger render={<Button variant="secondary" />}>
          Right
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
      <Popover.Trigger render={<Button />}>User Profile</Popover.Trigger>
      <Popover.Content className="w-64">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-kumo-recessed" />
          <div>
            <Popover.Title>Jane Doe</Popover.Title>
            <p className="text-sm text-kumo-subtle">jane@example.com</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 border-t border-kumo-hairline pt-3">
          <Button variant="secondary" size="sm" className="flex-1">
            Profile
          </Button>
          <Popover.Close
            render={<Button variant="ghost" size="sm" className="flex-1" />}
          >
            Sign Out
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

export function PopoverOpenOnHoverDemo() {
  return (
    <Popover>
      <Popover.Trigger
        openOnHover
        delay={200}
        render={<Button variant="secondary" />}
      >
        Hover Me
      </Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Hover Triggered</Popover.Title>
        <Popover.Description>
          This popover opens on hover with a 200ms delay. It can still contain
          interactive content like buttons and links.
        </Popover.Description>
        <div className="mt-3">
          <Popover.Close render={<Button variant="secondary" size="sm" />}>
            Got it
          </Popover.Close>
        </div>
      </Popover.Content>
    </Popover>
  );
}

/** Popover anchored to a virtual element instead of a trigger. */
export function PopoverVirtualAnchorDemo() {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  const rows = [
    { id: "1", name: "api-gateway", status: "Active" },
    { id: "2", name: "auth-service", status: "Active" },
    { id: "3", name: "worker-prod", status: "Paused" },
  ];

  const handleEdit = (id: string) => {
    const row = rowRefs.current.get(id);
    if (row) {
      setAnchorRect(row.getBoundingClientRect());
      setSelectedRow(id);
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-kumo-hairline">
        <table className="w-full text-sm">
          <thead className="bg-kumo-elevated">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="w-12 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-kumo-hairline">
            {rows.map((row) => (
              <tr
                key={row.id}
                ref={(el) => {
                  if (el) rowRefs.current.set(row.id, el);
                }}
                className={
                  selectedRow === row.id ? "bg-kumo-recessed" : "bg-kumo-base"
                }
              >
                <td className="px-4 py-2 font-mono">{row.name}</td>
                <td className="px-4 py-2 text-kumo-subtle">{row.status}</td>
                <td className="px-4 py-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    shape="square"
                    icon={DotsThree}
                    aria-label={`Actions for ${row.name}`}
                    onClick={() => handleEdit(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Popover
        open={!!selectedRow}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      >
        <Popover.Content
          side="left"
          anchor={
            anchorRect ? { getBoundingClientRect: () => anchorRect } : undefined
          }
        >
          <Popover.Title>
            Edit {rows.find((r) => r.id === selectedRow)?.name}
          </Popover.Title>
          <Popover.Description>
            The popover anchors to the selected row, not the icon button.
          </Popover.Description>
          <div className="mt-3">
            <Popover.Close render={<Button size="sm" variant="secondary" />}>
              Close
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover>
    </div>
  );
}
