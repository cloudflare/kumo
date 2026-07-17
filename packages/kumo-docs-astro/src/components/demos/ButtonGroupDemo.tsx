import { Button, ButtonGroup, DropdownMenu } from "@cloudflare/kumo";
import {
  CaretDownIcon,
  CopyIcon,
  PencilSimpleIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TrashIcon,
} from "@phosphor-icons/react";

/**
 * A basic segmented row of related actions joined into a single control.
 */
export function ButtonGroupBasicDemo() {
  return (
    <ButtonGroup>
      <Button variant="secondary">Day</Button>
      <Button variant="secondary">Week</Button>
      <Button variant="secondary">Month</Button>
    </ButtonGroup>
  );
}

/**
 * Split button: a primary action joined with a dropdown trigger for secondary
 * actions. The caret button uses `shape="square"` and an `aria-label`.
 */
export function ButtonGroupSplitDemo() {
  return (
    <ButtonGroup>
      <Button variant="primary">Deploy</Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          render={
            <Button
              variant="primary"
              shape="square"
              aria-label="More deploy options"
            >
              <CaretDownIcon />
            </Button>
          }
        />
        <DropdownMenu.Content>
          <DropdownMenu.Item>Deploy to staging</DropdownMenu.Item>
          <DropdownMenu.Item>Deploy and tail logs</DropdownMenu.Item>
          <DropdownMenu.Item>Schedule deploy…</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </ButtonGroup>
  );
}

/**
 * Icon-only groups work well as toolbars. Set `role="toolbar"` and an
 * `aria-label` to describe the set of actions.
 */
export function ButtonGroupIconDemo() {
  return (
    <ButtonGroup role="toolbar" aria-label="Text alignment">
      <Button variant="secondary" shape="square" aria-label="Align left">
        <TextAlignLeftIcon />
      </Button>
      <Button variant="secondary" shape="square" aria-label="Align center">
        <TextAlignCenterIcon />
      </Button>
      <Button variant="secondary" shape="square" aria-label="Align right">
        <TextAlignRightIcon />
      </Button>
    </ButtonGroup>
  );
}

/**
 * Buttons with leading icons and labels, grouped together.
 */
export function ButtonGroupWithIconsDemo() {
  return (
    <ButtonGroup>
      <Button variant="secondary" icon={PencilSimpleIcon}>
        Edit
      </Button>
      <Button variant="secondary" icon={CopyIcon}>
        Duplicate
      </Button>
      <Button variant="secondary-destructive" icon={TrashIcon}>
        Delete
      </Button>
    </ButtonGroup>
  );
}

/**
 * ButtonGroup respects each child's `size` — set the same size on every button
 * to keep the group aligned.
 */
export function ButtonGroupSizesDemo() {
  return (
    <div className="flex flex-col items-start gap-3">
      <ButtonGroup>
        <Button size="sm" variant="secondary">
          Day
        </Button>
        <Button size="sm" variant="secondary">
          Week
        </Button>
        <Button size="sm" variant="secondary">
          Month
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="lg" variant="secondary">
          Day
        </Button>
        <Button size="lg" variant="secondary">
          Week
        </Button>
        <Button size="lg" variant="secondary">
          Month
        </Button>
      </ButtonGroup>
    </div>
  );
}
