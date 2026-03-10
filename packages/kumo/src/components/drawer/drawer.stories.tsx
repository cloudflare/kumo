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
      </Drawer>
    </Drawer.Root>
  ),
};

export const BottomSheet: Story = {
  render: () => (
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
  ),
};
