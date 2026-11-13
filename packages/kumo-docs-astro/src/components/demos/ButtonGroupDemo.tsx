import { Button, ButtonGroup, DropdownMenu } from "@cloudflare/kumo";
import { CaretDownIcon } from "@phosphor-icons/react";

/**
 * Split button: a primary action joined with a dropdown trigger for related
 * secondary actions. The caret button uses `shape="square"` and an
 * `aria-label`.
 */
export function ButtonGroupSplitDemo() {
  return (
    <ButtonGroup aria-label="Deploy">
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
 * Split buttons work with any button variant — here the secondary style for a
 * lower-emphasis action.
 */
export function ButtonGroupSecondaryDemo() {
  return (
    <ButtonGroup aria-label="Save">
      <Button variant="secondary">Save</Button>
      <DropdownMenu>
        <DropdownMenu.Trigger
          render={
            <Button
              variant="secondary"
              shape="square"
              aria-label="More save options"
            >
              <CaretDownIcon />
            </Button>
          }
        />
        <DropdownMenu.Content>
          <DropdownMenu.Item>Save as draft</DropdownMenu.Item>
          <DropdownMenu.Item>Save and publish</DropdownMenu.Item>
          <DropdownMenu.Item>Save a copy…</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </ButtonGroup>
  );
}

/**
 * Match the `size` on both buttons to keep the split button aligned.
 */
export function ButtonGroupSizesDemo() {
  const sizes = ["sm", "base", "lg"] as const;
  return (
    <div className="flex flex-wrap items-center gap-4">
      {sizes.map((size) => (
        <ButtonGroup key={size} aria-label="Deploy">
          <Button size={size} variant="primary">
            Deploy
          </Button>
          <DropdownMenu>
            <DropdownMenu.Trigger
              render={
                <Button
                  size={size}
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
              <DropdownMenu.Item>Schedule deploy…</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </ButtonGroup>
      ))}
    </div>
  );
}
