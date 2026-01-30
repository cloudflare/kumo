import { Code, CodeBlock } from "@cloudflare/kumo";

export function CodeDemo() {
  return (
    <CodeBlock
      lang="tsx"
      code={`const greeting = "Hello, World!";
console.log(greeting);`}
    />
  );
}

export function CodeTypeScriptDemo() {
  return (
    <CodeBlock
      lang="tsx"
      code={`interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: "1",
  name: "John Doe",
  email: "john@example.com"
};`}
    />
  );
}

export function CodeBashDemo() {
  return (
    <CodeBlock
      lang="bash"
      code={`npm install @cloudflare/kumo
pnpm add @cloudflare/kumo`}
    />
  );
}

export function CodeJsonDemo() {
  return (
    <CodeBlock
      lang="jsonc"
      code={`{
  "name": "kumo",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0"
  }
}`}
    />
  );
}

export function CodeWithValuesDemo() {
  return (
    <Code
      lang="bash"
      code="export API_KEY={{apiKey}}"
      values={{
        apiKey: { value: "sk_live_123", highlight: true },
      }}
    />
  );
}
