import { MenuBar } from "@cloudflare/kumo";
import { TextBolderIcon, TextItalicIcon } from "@phosphor-icons/react";

export function MenuBarBasicDemo() {
  return (
    <MenuBar
      isActive="bold"
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => {},
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => {},
        },
      ]}
    />
  );
}

export function MenuBarTextFormattingDemo() {
  return (
    <MenuBar
      isActive="bold"
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => {},
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => {},
        },
      ]}
    />
  );
}

export function MenuBarNoActiveDemo() {
  return (
    <MenuBar
      isActive=""
      optionIds
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => {},
        },
        {
          icon: <TextItalicIcon />,
          id: "italic",
          tooltip: "Italic",
          onClick: () => {},
        },
      ]}
    />
  );
}
