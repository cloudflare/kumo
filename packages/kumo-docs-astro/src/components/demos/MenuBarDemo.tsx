import { useState } from "react";
import { MenuBar } from "@cloudflare/kumo";
import { TextBolderIcon, TextItalicIcon } from "@phosphor-icons/react";

export function MenuBarBasicDemo() {
  const [active, setActive] = useState<string | undefined>("bold");

  return (
    <MenuBar
      isActive={active}
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => setActive(active === "bold" ? undefined : "bold"),
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => setActive(active === "italic" ? undefined : "italic"),
        },
      ]}
    />
  );
}

export function MenuBarTextFormattingDemo() {
  const [active, setActive] = useState<string | undefined>("bold");

  return (
    <MenuBar
      isActive={active}
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => setActive(active === "bold" ? undefined : "bold"),
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => setActive(active === "italic" ? undefined : "italic"),
        },
      ]}
    />
  );
}

export function MenuBarNoActiveDemo() {
  const [active, setActive] = useState<string | undefined>(undefined);

  return (
    <MenuBar
      isActive={active}
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => setActive(active === "bold" ? undefined : "bold"),
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => setActive(active === "italic" ? undefined : "italic"),
        },
      ]}
    />
  );
}
