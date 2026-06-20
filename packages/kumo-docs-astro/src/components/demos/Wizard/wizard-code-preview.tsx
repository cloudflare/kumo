import { CodeHighlighted, ShikiProvider } from "@cloudflare/kumo/code";
import { HELLO_WORLD_CODE } from "./wizard-demo-helpers";

export function WizardDemoCodePreview() {
  return (
    <ShikiProvider engine="javascript" languages={["typescript"]}>
      <CodeHighlighted
        code={HELLO_WORLD_CODE}
        lang="typescript"
        className="border-0! bg-transparent! [&_pre]:whitespace-pre text-xs"
      />
    </ShikiProvider>
  );
}
