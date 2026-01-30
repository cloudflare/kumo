import { Collapsible } from "@cloudflare/kumo";
import { useState } from "react";

export function CollapsibleHeroDemo() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="w-full">
      <Collapsible label="What is Kumo?" open={isOpen} onOpenChange={setIsOpen}>
        Kumo is Cloudflare's new design system.
      </Collapsible>
    </div>
  );
}

export function CollapsibleBasicDemo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full">
      <Collapsible label="What is Kumo?" open={isOpen} onOpenChange={setIsOpen}>
        Kumo is Cloudflare's new design system.
      </Collapsible>
    </div>
  );
}

export function CollapsibleMultipleDemo() {
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  return (
    <div className="w-full space-y-2">
      <Collapsible label="What is Kumo?" open={open1} onOpenChange={setOpen1}>
        Kumo is Cloudflare's new design system.
      </Collapsible>
      <Collapsible
        label="How do I use it?"
        open={open2}
        onOpenChange={setOpen2}
      >
        Install the components and import them into your project.
      </Collapsible>
      <Collapsible
        label="Is it open source?"
        open={open3}
        onOpenChange={setOpen3}
      >
        Check the repository for license information.
      </Collapsible>
    </div>
  );
}
