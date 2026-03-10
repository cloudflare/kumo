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
      <Drawer.Trigger render={(props) => <Button {...props}>Open Right Drawer</Button>} />
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
          Use top drawers for global notices and quick actions.
        </Drawer.Description>
        <Drawer.Actions className='order-2'>
          <Drawer.Close
            render={(props) => (
              <Button variant='secondary' {...props}>
                Dismiss
              </Button>
            )}
          />
          <Drawer.Close render={(props) => <Button {...props}>Acknowledge</Button>} />
        </Drawer.Actions>
        <Drawer.Handle className='order-3 mb-0 mt-3' />
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
        <Drawer.Handle />
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

/** Responsive pattern: bottom-sheet on mobile, side drawer on desktop. */
export function DrawerResponsiveDemo() {
  return (
    <Drawer.Root swipeDirection='right'>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Responsive Drawer</Button>} />
      <Drawer
        className='p-4 md:p-6
          [--kumo-drawer-actions-inset:1rem] md:[--kumo-drawer-actions-inset:1.5rem]
          max-md:left-0 max-md:right-0 max-md:bottom-0 max-md:top-auto max-md:h-auto max-md:min-h-[50svh] max-md:max-h-[85vh] max-md:max-w-none max-md:rounded-t-xl max-md:rounded-b-none
          max-md:data-starting-style:translate-y-full max-md:data-closed:translate-y-full
          max-md:data-starting-style:translate-x-0 max-md:data-closed:translate-x-0'
      >
        <Drawer.Handle className='md:hidden' />
        <Drawer.Title>Responsive Drawer</Drawer.Title>
        <Drawer.Description className='mt-2'>
          On mobile it behaves like a bottom sheet, and on desktop it opens from the right.
        </Drawer.Description>
        <DrawerContentActions />
      </Drawer>
    </Drawer.Root>
  );
}

/** Backwards-compatible alias for existing docs sections. */
export const DrawerBasicDemo = DrawerRightDemo;

/** Hero example shown at the top of docs page. */
export const DrawerHeroDemo = DrawerRightDemo;
