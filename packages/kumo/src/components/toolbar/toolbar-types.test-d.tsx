import { GearIcon } from "@phosphor-icons/react";
import { Toolbar } from "./toolbar";

function IconOnlyToolbarLinkWithoutName() {
  // @ts-expect-error icon-only links need aria-label, aria-labelledby, or title
  return <Toolbar.Link href="/settings" shape="square" icon={GearIcon} />;
}

function IconOnlyToolbarLinkWithName() {
  return (
    <>
      <Toolbar.Link
        href="/settings"
        shape="square"
        icon={GearIcon}
        aria-label="Settings"
      />
      <Toolbar.Link
        href="/settings"
        shape="square"
        icon={GearIcon}
        title="Settings"
      />
    </>
  );
}

function ToolbarLinkWithText() {
  return <Toolbar.Link href="/settings">Settings</Toolbar.Link>;
}

export {
  IconOnlyToolbarLinkWithoutName,
  IconOnlyToolbarLinkWithName,
  ToolbarLinkWithText,
};
