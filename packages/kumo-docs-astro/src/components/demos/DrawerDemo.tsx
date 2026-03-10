import { Button, Drawer } from "@cloudflare/kumo";

function DrawerContentActions() {
  return (
    <Drawer.Actions>
      <Drawer.Close
        render={(props) => (
          <Button variant='secondary' {...props}>
            Cancel
          </Button>
        )}
      />
      <Drawer.Close render={(props) => <Button {...props}>Save</Button>} />
    </Drawer.Actions>
  );
}

/** Right-side drawer (default). */
function DrawerRightDemo() {
  return (
    <Drawer.Root>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Drawer</Button>} />
      <Drawer className='p-6'>
        <Drawer.Title>Edit Settings</Drawer.Title>
        <Drawer.Description className='mt-2'>
          Configure workspace settings before saving.
        </Drawer.Description>
        <DrawerContentActions />
      </Drawer>
    </Drawer.Root>
  );
}

/** Left-side drawer. */
function DrawerLeftDemo() {
  return (
    <Drawer.Root swipeDirection='left'>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Left Drawer</Button>} />
      <Drawer swipeDirection='left' className='p-6'>
        <Drawer.Title>Navigation</Drawer.Title>
        <Drawer.Description className='mt-2'>
          Use this layout for contextual navigation panels.
        </Drawer.Description>
        <DrawerContentActions />
      </Drawer>
    </Drawer.Root>
  );
}

/** Horizontal side sheets: right + left. */
export function DrawerHorizontalSheetsDemo() {
  return (
    <div className='flex flex-wrap gap-2'>
      <DrawerLeftDemo />
      <DrawerRightDemo />
    </div>
  );
}

/** Top sheet. */
function DrawerTopDemo() {
  return (
    <Drawer.Root swipeDirection='up'>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Top Sheet</Button>} />
      <Drawer swipeDirection='up' className='p-6'>
        <Drawer.Title>Announcement</Drawer.Title>
        <Drawer.Description className='mt-2'>
          Use top sheets for global notices and quick actions.
        </Drawer.Description>
        <DrawerContentActions />
      </Drawer>
    </Drawer.Root>
  );
}

/** Bottom sheet. */
function DrawerBottomSheetDemo() {
  return (
    <Drawer.Root swipeDirection='down'>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Bottom Sheet</Button>} />
      <Drawer swipeDirection='down' className='p-6'>
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Description className='mt-2'>
          Use filters to refine the result set.
        </Drawer.Description>
        <Drawer.Actions>
          <Button variant='secondary'>Reset</Button>
          <Drawer.Close render={(props) => <Button {...props}>Apply</Button>} />
        </Drawer.Actions>
      </Drawer>
    </Drawer.Root>
  );
}

/** Vertical sheets: top + bottom. */
export function DrawerVerticalSheetsDemo() {
  return (
    <div className='flex flex-wrap gap-2'>
      <DrawerTopDemo />
      <DrawerBottomSheetDemo />
    </div>
  );
}

/** Backwards-compatible alias for existing docs sections. */
export const DrawerBasicDemo = DrawerRightDemo;

/** Hero example shown at the top of docs page. */
export const DrawerHeroDemo = DrawerRightDemo;
