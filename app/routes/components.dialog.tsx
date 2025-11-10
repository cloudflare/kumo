import { Dialog } from "~/components/dialog/dialog";
import { Button } from "~/components/button/button";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function DialogDoc() {
  return (
    <DocLayout
      title="Dialog"
      description="A window overlaid on either the primary window or another dialog window, rendering the content underneath inert."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<Dialog.Root>
  <Dialog.Trigger render={(p) => <Button {...p}>Open Dialog</Button>} />
  <Dialog>
    <Dialog.Title>Welcome</Dialog.Title>
    <Dialog.Description>
      This is a dialog component.
    </Dialog.Description>
  </Dialog>
</Dialog.Root>`}
        >
          <Dialog.Root>
            <Dialog.Trigger render={(p) => <Button {...p}>Open Dialog</Button>} />
            <Dialog>
              <Dialog.Title>Welcome</Dialog.Title>
              <Dialog.Description>
                This is a dialog component.
              </Dialog.Description>
            </Dialog>
          </Dialog.Root>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Dialog } from "~/components/dialog/dialog";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { Dialog } from "~/components/dialog/dialog";
import { Button } from "~/components/button/button";

export default function Example() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={(p) => <Button {...p}>Open</Button>} />
      <Dialog>
        <Dialog.Title>Dialog Title</Dialog.Title>
        <Dialog.Description>
          Dialog content goes here.
        </Dialog.Description>
        <div className="flex justify-end gap-2 mt-4">
          <Dialog.Close
            render={(p) => (
              <Button variant="secondary" {...p}>
                Close
              </Button>
            )}
          />
        </div>
      </Dialog>
    </Dialog.Root>
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Dialog</h3>
            <ComponentExample
              code={`<Dialog.Root>
  <Dialog.Trigger render={(p) => <Button {...p}>Click me</Button>} />
  <Dialog>
    <Dialog.Title>Hello!</Dialog.Title>
    <Dialog.Description>I'm a dialog.</Dialog.Description>
  </Dialog>
</Dialog.Root>`}
            >
              <Dialog.Root>
                <Dialog.Trigger render={(p) => <Button {...p}>Click me</Button>} />
                <Dialog>
                  <Dialog.Title>Hello!</Dialog.Title>
                  <Dialog.Description>I'm a dialog.</Dialog.Description>
                </Dialog>
              </Dialog.Root>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Actions</h3>
            <ComponentExample
              code={`<Dialog.Root>
  <Dialog.Trigger render={(p) => <Button {...p}>Delete</Button>} />
  <Dialog>
    <Dialog.Title>Are you sure?</Dialog.Title>
    <Dialog.Description>
      This action cannot be undone.
    </Dialog.Description>
    <div className="flex gap-2 mt-4">
      <Button variant="destructive">Delete</Button>
      <Dialog.Close render={(p) => (
        <Button variant="secondary" {...p}>
          Cancel
        </Button>
      )} />
    </div>
  </Dialog>
</Dialog.Root>`}
            >
              <Dialog.Root>
                <Dialog.Trigger render={(p) => <Button {...p}>Delete</Button>} />
                <Dialog>
                  <Dialog.Title>Are you sure?</Dialog.Title>
                  <Dialog.Description>
                    This action cannot be undone.
                  </Dialog.Description>
                  <div className="flex gap-2 mt-4">
                    <Button variant="destructive">Delete</Button>
                    <Dialog.Close
                      render={(p) => (
                        <Button variant="secondary" {...p}>
                          Cancel
                        </Button>
                      )}
                    />
                  </div>
                </Dialog>
              </Dialog.Root>
            </ComponentExample>
          </div>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
