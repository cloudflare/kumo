import { Dialog, DialogDescription, DialogRoot, DialogTitle, DialogTrigger } from "~/components/dialog/dialog";
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
          code={`<DialogRoot>
  <DialogTrigger render={(p) => <Button {...p}>Open Dialog</Button>} />
  <Dialog>
    <DialogTitle>Welcome</DialogTitle>
    <DialogDescription>
      This is a dialog component.
    </DialogDescription>
  </Dialog>
</DialogRoot>`}
        >
          <DialogRoot>
            <DialogTrigger render={(p) => <Button {...p}>Open Dialog</Button>} />
            <Dialog>
              <DialogTitle>Welcome</DialogTitle>
              <DialogDescription>
                This is a dialog component.
              </DialogDescription>
            </Dialog>
          </DialogRoot>
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { 
  Dialog, 
  DialogDescription, 
  DialogRoot, 
  DialogTitle, 
  DialogTrigger 
} from "~/components/dialog/dialog";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { 
  Dialog, 
  DialogDescription, 
  DialogRoot, 
  DialogTitle, 
  DialogTrigger 
} from "~/components/dialog/dialog";
import { Button } from "~/components/button/button";

export default function Example() {
  return (
    <DialogRoot>
      <DialogTrigger render={(p) => <Button {...p}>Open</Button>} />
      <Dialog>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogDescription>
          Dialog content goes here.
        </DialogDescription>
      </Dialog>
    </DialogRoot>
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
              code={`<DialogRoot>
  <DialogTrigger render={(p) => <Button {...p}>Click me</Button>} />
  <Dialog>
    <DialogTitle>Hello!</DialogTitle>
    <DialogDescription>I'm a dialog.</DialogDescription>
  </Dialog>
</DialogRoot>`}
            >
              <DialogRoot>
                <DialogTrigger render={(p) => <Button {...p}>Click me</Button>} />
                <Dialog>
                  <DialogTitle>Hello!</DialogTitle>
                  <DialogDescription>I'm a dialog.</DialogDescription>
                </Dialog>
              </DialogRoot>
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">With Actions</h3>
            <ComponentExample
              code={`<DialogRoot>
  <DialogTrigger render={(p) => <Button {...p}>Delete</Button>} />
  <Dialog>
    <DialogTitle>Are you sure?</DialogTitle>
    <DialogDescription>
      This action cannot be undone.
    </DialogDescription>
    <div className="flex gap-2 mt-4">
      <Button variant="destructive">Delete</Button>
      <Button variant="secondary">Cancel</Button>
    </div>
  </Dialog>
</DialogRoot>`}
            >
              <DialogRoot>
                <DialogTrigger render={(p) => <Button {...p}>Delete</Button>} />
                <Dialog>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone.
                  </DialogDescription>
                  <div className="flex gap-2 mt-4">
                    <Button variant="destructive">Delete</Button>
                    <Button variant="secondary">Cancel</Button>
                  </div>
                </Dialog>
              </DialogRoot>
            </ComponentExample>
          </div>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
