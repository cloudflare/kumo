import { Button, Collapsible, Input, Text } from "@cloudflare/kumo";
import { useState } from "react";

/**
 * Hero demo using DefaultTrigger and DefaultPanel for classic Kumo styling.
 */
export function CollapsibleHeroDemo() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="w-full">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel>
          <Text>Kumo is Cloudflare's new design system.</Text>
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
    </div>
  );
}

/**
 * Basic usage with default styling components.
 */
export function CollapsibleBasicDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel>
          <Text>Kumo is Cloudflare's new design system.</Text>
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
    </div>
  );
}

/**
 * Multiple independent collapsibles.
 */
export function CollapsibleMultipleDemo() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  return (
    <div className="w-full space-y-2">
      <Collapsible.Root open={open1} onOpenChange={setOpen1}>
        <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel>
          <Text>Kumo is Cloudflare's new design system.</Text>
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
      <Collapsible.Root open={open2} onOpenChange={setOpen2}>
        <Collapsible.DefaultTrigger>How do I use it?</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel>
          <Text>Install the components and import them into your project.</Text>
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
      <Collapsible.Root open={open3} onOpenChange={setOpen3}>
        <Collapsible.DefaultTrigger>Is it open source?</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel>
          <Text>Check the repository for license information.</Text>
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
    </div>
  );
}

/**
 * Custom trigger using the render prop for full control.
 */
export function CollapsibleCustomTriggerDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.Trigger
          render={<Button variant="secondary" size="sm" />}
        >
          {isOpen ? "Hide details" : "Show details"}
        </Collapsible.Trigger>
        <Collapsible.Panel className="mt-3 rounded-lg bg-kumo-tint p-4">
          <Text>
            This panel uses custom styling instead of the default border-left accent.
          </Text>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

/**
 * Keep the panel mounted in the DOM when closed to preserve internal state like form inputs.
 */
export function CollapsibleKeepMountedDemo() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="w-full space-y-4">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.DefaultTrigger>Edit details</Collapsible.DefaultTrigger>
        <Collapsible.DefaultPanel keepMounted>
          <Text>
            Type something below, then collapse and re-open — your input is
            preserved because the panel stays mounted.
          </Text>
          <Input label="Name" placeholder="Type here…" />
        </Collapsible.DefaultPanel>
      </Collapsible.Root>
    </div>
  );
}

/**
 * Accordion pattern where only one item can be open at a time.
 */
export function CollapsibleAccordionDemo() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const items = [
    {
      title: "What is Kumo?",
      content: "Kumo is Cloudflare's new design system built on Base UI and Tailwind CSS v4.",
    },
    {
      title: "How do I install it?",
      content: "Run `npm install @cloudflare/kumo` and import the components you need.",
    },
    {
      title: "Is it accessible?",
      content: "Yes! Kumo is built on Base UI which provides excellent accessibility out of the box.",
    },
  ];

  return (
    <div className="w-full space-y-2">
      {items.map((item, i) => (
        <Collapsible.Root
          key={i}
          open={activeIndex === i}
          onOpenChange={(open) => setActiveIndex(open ? i : null)}
        >
          <Collapsible.DefaultTrigger>{item.title}</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>
            <Text>{item.content}</Text>
          </Collapsible.DefaultPanel>
        </Collapsible.Root>
      ))}
    </div>
  );
}
