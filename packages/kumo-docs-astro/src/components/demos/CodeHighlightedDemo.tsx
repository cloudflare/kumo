import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";
import { useState } from "react";
import type { ReactNode } from "react";

/**
 * Wrapper component that provides Shiki context for all demos.
 * This loads Shiki once and shares it across all CodeHighlighted instances.
 */
function DemoProvider({ children }: { children: ReactNode }) {
  return (
    <ShikiProvider
      engine="javascript"
      languages={[
        "tsx",
        "typescript",
        "javascript",
        "bash",
        "json",
        "css",
        "html",
      ]}
    >
      {children}
    </ShikiProvider>
  );
}

/** Basic syntax highlighting demo */
export function CodeHighlightedBasicDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`const greeting = "Hello, World!";
console.log(greeting);`}
        lang="typescript"
      />
    </DemoProvider>
  );
}

/** TypeScript with interface */
export function CodeHighlightedTypeScriptDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}`}
        lang="typescript"
      />
    </DemoProvider>
  );
}

/** React/TSX code example */
export function CodeHighlightedReactDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`}
        lang="tsx"
      />
    </DemoProvider>
  );
}

/** Bash/shell commands */
export function CodeHighlightedBashDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`# Install Kumo
npm install @cloudflare/kumo

# Or with pnpm
pnpm add @cloudflare/kumo

# Start development server
pnpm dev`}
        lang="bash"
      />
    </DemoProvider>
  );
}

/** JSON configuration */
export function CodeHighlightedJsonDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`{
  "name": "@cloudflare/kumo",
  "version": "1.9.0",
  "dependencies": {
    "react": "^19.0.0",
    "shiki": "^4.0.0"
  }
}`}
        lang="json"
      />
    </DemoProvider>
  );
}

/** With highlighted lines */
export function CodeHighlightedHighlightLinesDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`function processData(items: string[]) {
  // Filter out empty items
  const filtered = items.filter(Boolean);
  
  // Transform to uppercase (highlighted)
  const transformed = filtered.map(item => item.toUpperCase());
  
  // Return sorted result
  return transformed.toSorted();
}`}
        lang="typescript"
        highlightLines={[5, 6]}
      />
    </DemoProvider>
  );
}

/** With line numbers */
export function CodeHighlightedLineNumbersDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`import { useState, useEffect } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return size;
}`}
        lang="typescript"
        showLineNumbers
      />
    </DemoProvider>
  );
}

/** With copy button */
export function CodeHighlightedCopyButtonDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`npm install @cloudflare/kumo`}
        lang="bash"
        showCopyButton
      />
    </DemoProvider>
  );
}

/** Full featured example */
export function CodeHighlightedFullFeaturedDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`import { ShikiProvider, CodeHighlighted } from "@cloudflare/kumo/code";

export function CodeExample({ code, language }: Props) {
  return (
    <ShikiProvider
      engine="javascript"
      languages={["tsx", "typescript", "bash", "json"]}
    >
      <CodeHighlighted
        code={code}
        lang={language}
        showCopyButton
      />
    </ShikiProvider>
  );
}`}
        lang="tsx"
        showCopyButton
        highlightLines={[6, 7, 8, 9]}
      />
    </DemoProvider>
  );
}

/** Multiple code blocks sharing a provider */
export function CodeHighlightedSharedProviderDemo() {
  return (
    <DemoProvider>
      <div className="space-y-4">
        <CodeHighlighted
          code={`const config = { theme: "dark" };`}
          lang="typescript"
        />
        <CodeHighlighted code={`npm run build`} lang="bash" />
        <CodeHighlighted code={`{ "success": true }`} lang="json" />
      </div>
    </DemoProvider>
  );
}

/** CSS code example */
export function CodeHighlightedCssDemo() {
  return (
    <DemoProvider>
      <CodeHighlighted
        code={`.button {
  background: var(--color-brand);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  
  &:hover {
    background: var(--color-brand-hover);
  }
}`}
        lang="css"
      />
    </DemoProvider>
  );
}

/** Interactive highlight color customization demo */
export function CodeHighlightedCustomHighlightDemo() {
  const [hue, setHue] = useState(220);
  const [opacity, setOpacity] = useState(10);

  const lightBg = `hsla(${hue}, 80%, 50%, ${opacity / 100})`;
  const darkBg = `hsla(${hue}, 60%, 70%, ${(opacity + 5) / 100})`;

  // Generate a unique ID to scope the styles
  const styleId = "custom-highlight-demo";

  return (
    <DemoProvider>
      <div className="space-y-4">
        <style>{`
          #${styleId} .kumo-shiki {
            --kumo-code-highlight-bg: ${lightBg};
          }
          [data-mode="dark"] #${styleId} .kumo-shiki {
            --kumo-code-highlight-bg: ${darkBg};
          }
        `}</style>
        <div id={styleId}>
          <CodeHighlighted
            code={`function greet(name: string) {
  // This line is highlighted
  console.log(\`Hello, \${name}!\`);
  
  return name.toUpperCase();
}`}
            lang="typescript"
            highlightLines={[2, 3]}
          />
        </div>

        <div className="flex flex-wrap gap-6 rounded-md border border-kumo-hairline bg-kumo-elevated p-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-kumo-subtle">Hue: {hue}°</span>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-32"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-kumo-subtle">
              Opacity: {opacity}%
            </span>
            <input
              type="range"
              min="2"
              max="30"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-32"
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-kumo-subtle">CSS Variable</span>
            <code className="rounded bg-kumo-control px-2 py-1 font-mono text-xs">
              --kumo-code-highlight-bg: {lightBg}
            </code>
          </div>
        </div>
      </div>
    </DemoProvider>
  );
}
