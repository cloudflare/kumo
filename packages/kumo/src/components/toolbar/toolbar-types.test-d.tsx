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

function IconOnlyToolbarButtonWithoutName() {
  // @ts-expect-error icon-only buttons need aria-label, aria-labelledby, or title
  return <Toolbar.Button shape="square" icon={GearIcon} />;
}

function IconOnlyToolbarButtonWithName() {
  return (
    <>
      <Toolbar.Button shape="square" icon={GearIcon} aria-label="Settings" />
      <Toolbar.Button shape="square" icon={GearIcon} title="Settings" />
    </>
  );
}

function ToolbarButtonWithText() {
  return <Toolbar.Button icon={GearIcon}>Settings</Toolbar.Button>;
}

function ToolbarLinkWithText() {
  return <Toolbar.Link href="/settings">Settings</Toolbar.Link>;
}

export {
  IconOnlyToolbarButtonWithName,
  IconOnlyToolbarButtonWithoutName,
  IconOnlyToolbarLinkWithoutName,
  IconOnlyToolbarLinkWithName,
  ToolbarButtonWithText,
  ToolbarLinkWithText,
};
