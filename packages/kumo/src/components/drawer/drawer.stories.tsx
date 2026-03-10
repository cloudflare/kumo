import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../button";
import { Drawer } from "./drawer";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Drawer</Button>} />
      <Drawer className='p-6'>
        <Drawer.Title>Edit Settings</Drawer.Title>
        <Drawer.Description className='mt-2'>
          Configure workspace settings before saving.
        </Drawer.Description>
        <div className='mt-6 flex justify-end gap-2 border-t border-kumo-fill pt-4'>
          <Drawer.Close
            render={(props) => (
              <Button variant='secondary' {...props}>
                Cancel
              </Button>
            )}
          />
          <Drawer.Close render={(props) => <Button {...props}>Save</Button>} />
        </div>
      </Drawer>
    </Drawer.Root>
  ),
};

export const BottomSheet: Story = {
  render: () => (
    <Drawer.Root swipeDirection='down'>
      <Drawer.Trigger render={(props) => <Button {...props}>Open Bottom Sheet</Button>} />
      <Drawer swipeDirection='down' className='p-4'>
        <div className='mx-auto mb-2 h-1.5 w-12 rounded-full bg-kumo-fill' />
        <Drawer.Title>Filters</Drawer.Title>
        <Drawer.Description className='mt-1'>
          Use filters to refine the result set.
        </Drawer.Description>
        <div className='mt-4 grid gap-2'>
          <Button variant='secondary'>Reset</Button>
          <Drawer.Close render={(props) => <Button {...props}>Apply</Button>} />
        </div>
      </Drawer>
    </Drawer.Root>
  ),
};
