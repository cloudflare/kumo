import { TextBolderIcon, TextItalicIcon } from "@phosphor-icons/react";
import { MenuBar } from "~/components/menubar/menubar";
import { DocLayout } from "~/components/docs/doc-layout";
import { ComponentExample } from "~/components/docs/component-example";
import { ComponentSection } from "~/components/docs/component-section";
import { CodeBlock } from "~/components/code/code-lazy";

export default function MenuBarDoc() {
  return (
    <DocLayout
      title="MenuBar"
      description="A horizontal menu bar with icon buttons, commonly used for text editors or toolbars."
    >
      {/* Demo */}
      <ComponentSection>
        <ComponentExample
          code={`<MenuBar
  isActive="bold"
  optionIds
  options={[
    {
      icon: <TextBolderIcon />,
      id: "bold",
      tooltip: "Bold",
      onClick: () => {},
    },
    {
      icon: <TextItalicIcon />,
      id: "italic",
      tooltip: "Italic",
      onClick: () => {},
    },
  ]}
/>`}
        >
          <MenuBar
            isActive="bold"
            optionIds
            options={[
              {
                icon: <TextBolderIcon />,
                id: "bold",
                tooltip: "Bold",
                onClick: () => {},
              },
              {
                icon: <TextItalicIcon />,
                id: "italic",
                tooltip: "Italic",
                onClick: () => {},
              },
            ]}
          />
        </ComponentExample>
      </ComponentSection>

      {/* Installation */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          lang="tsx"
          code={`import { MenuBar } from "~/components/menubar/menubar";`}
        />
      </ComponentSection>

      {/* Usage */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">Usage</h2>
        <CodeBlock
          lang="tsx"
          code={`import { MenuBar } from "~/components/menubar/menubar";
import { TextBolderIcon } from "@phosphor-icons/react";

export default function Example() {
  return (
    <MenuBar
      options={[
        {
          icon: <TextBolderIcon />,
          id: "bold",
          tooltip: "Bold",
          onClick: () => console.log("Bold clicked"),
        },
      ]}
    />
  );
}`}
        />
      </ComponentSection>

      {/* Examples */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-6">Examples</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Text Formatting</h3>
            <ComponentExample
              code={`<MenuBar
  isActive="bold"
  optionIds
  options={[
    {
      icon: <TextBolderIcon />,
      id: "bold",
      tooltip: "Bold",
      onClick: () => {},
    },
    {
      icon: <TextItalicIcon />,
      id: "italic",
      tooltip: "Italic",
      onClick: () => {},
    },
  ]}
/>`}
            >
              <MenuBar
                isActive="bold"
                optionIds
                options={[
                  {
                    icon: <TextBolderIcon />,
                    id: "bold",
                    tooltip: "Bold",
                    onClick: () => {},
                  },
                  {
                    icon: <TextItalicIcon />,
                    id: "italic",
                    tooltip: "Italic",
                    onClick: () => {},
                  },
                ]}
              />
            </ComponentExample>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Without Active State</h3>
            <ComponentExample
              code={`<MenuBar
  isActive=""
  optionIds
  options={[
    {
      icon: <TextBolderIcon />,
      id: "bold",
      tooltip: "Bold",
      onClick: () => {},
    },
    {
      icon: <TextItalicIcon />,
      id: "italic",
      tooltip: "Italic",
      onClick: () => {},
    },
  ]}
/>`}
            >
              <MenuBar
                isActive=""
                optionIds
                options={[
                  {
                    icon: <TextBolderIcon />,
                    id: "bold",
                    tooltip: "Bold",
                    onClick: () => {},
                  },
                  {
                    icon: <TextItalicIcon />,
                    id: "italic",
                    tooltip: "Italic",
                    onClick: () => {},
                  },
                ]}
              />
            </ComponentExample>
          </div>
        </div>
      </ComponentSection>

      {/* API Reference */}
      <ComponentSection>
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
              </tr>
            </thead>
            <tbody className="text-neutral-600 dark:text-neutral-400">
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">options</td>
                <td className="py-3 px-4 font-mono text-xs">{`Array<{ icon: ReactNode; id: string; tooltip: string; onClick: () => void }>`}</td>
                <td className="py-3 px-4 font-mono text-xs">[]</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">isActive</td>
                <td className="py-3 px-4 font-mono text-xs">string</td>
                <td className="py-3 px-4 font-mono text-xs">undefined</td>
              </tr>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <td className="py-3 px-4 font-mono text-xs">optionIds</td>
                <td className="py-3 px-4 font-mono text-xs">boolean</td>
                <td className="py-3 px-4 font-mono text-xs">false</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ComponentSection>
    </DocLayout>
  );
}
