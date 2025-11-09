/**
 * AI Playground - Sandpack Version
 * 
 * Uses Sandpack for reliable bundling with all Kumo components embedded
 */

import { useState } from "react";
import { 
  SandpackProvider, 
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { Button } from "~/components/button/button";
import { getSandpackFiles } from "~/lib/sandpack-files";
import { 
  SparkleIcon, 
  CopyIcon, 
  DownloadIcon,
  ArrowsClockwiseIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { cn } from "~/components/utils";

export function meta() {
  return [
    { title: "AI Playground - Kumo" },
    { name: "description", content: "Generate and preview Kumo components with AI" },
  ];
}

interface GenerateResponse {
  success: boolean;
  code?: string;
  imports?: string[];
  error?: string;
}

export default function PlaygroundSandpack() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState(getSandpackFiles());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data: GenerateResponse = await response.json();
      
      if (data.success && data.code) {
        // Build imports from components used
        const imports: string[] = [];
        
        // Check which components are used
        if (data.code.includes("<Button")) imports.push('import { Button } from "./components/button";');
        if (data.code.includes("<Input")) imports.push('import { Input } from "./components/input";');
        if (data.code.includes("<Field")) imports.push('import { Field } from "./components/field";');
        if (data.code.includes("<Checkbox")) imports.push('import { Checkbox } from "./components/checkbox";');
        if (data.code.includes("<Surface")) imports.push('import { Surface } from "./components/surface";');
        if (data.code.includes("<Badge")) imports.push('import { Badge } from "./components/badge";');
        if (data.code.includes("<Banner")) imports.push('import { Banner } from "./components/banner";');
        if (data.code.includes("<LayerCard")) imports.push('import { LayerCard } from "./components/layer-card";');
        if (data.code.includes("<Loader")) imports.push('import { Loader } from "./components/loader";');
        if (data.code.includes("<Switch")) imports.push('import { Switch } from "./components/switch";');
        if (data.code.includes("<Select") || data.code.includes("<Option")) {
          imports.push('import { Select, Option } from "./components/select";');
        }
        if (data.code.includes("<Dialog")) {
          imports.push('import { Dialog, DialogRoot, DialogTrigger, DialogTitle, DialogDescription } from "./components/dialog";');
        }
        if (data.code.includes("<Tooltip")) {
          imports.push('import { Tooltip, TooltipProvider } from "./components/tooltip";');
        }
        if (data.code.includes("<DropdownMenu")) {
          imports.push('import { DropdownMenu } from "./components/dropdown";');
        }
        if (data.code.includes("<ResourceListPage")) {
          imports.push('import { ResourceListPage } from "./layouts/resource-list";');
        }
        if (data.code.includes("<Empty")) {
          imports.push('import { Empty } from "./blocks/empty";');
        }
        
        // Check for icons
        const iconMatches = data.code.match(/\b(\w+Icon)\b/g);
        if (iconMatches) {
          const uniqueIcons = [...new Set(iconMatches)];
          imports.push(`import { ${uniqueIcons.join(", ")} } from "@phosphor-icons/react";`);
        }
        
        // Add React imports if hooks are used
        if (data.code.includes("useState") || data.code.includes("useEffect")) {
          imports.unshift('import { useState, useEffect } from "react";');
        }
        
        // Build the full App.tsx
        const fullCode = `${imports.join("\n")}

export default function App() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      ${data.code}
    </div>
  );
}`;
        
        // Update files
        setFiles({
          ...files,
          "/App.tsx": {
            code: fullCode,
          },
        });
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };
  
  const handleCopy = async () => {
    const appFile = files["/App.tsx"];
    const code = typeof appFile === "string" ? appFile : appFile?.code || "";
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  const handleDownload = () => {
    const appFile = files["/App.tsx"];
    const code = typeof appFile === "string" ? appFile : appFile?.code || "";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "App.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleReset = () => {
    setFiles(getSandpackFiles());
    setPrompt("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                AI Playground
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Generate live component templates with AI • Powered by Sandpack
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowsClockwiseIcon}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={DownloadIcon}
                onClick={handleDownload}
              >
                Download
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={copied ? CheckIcon : CopyIcon}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Prompt Input */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe what you want to build... (e.g., 'Create a login form with email and password')"
              disabled={isGenerating}
              className={cn(
                "flex-1 h-9 px-3 rounded-lg text-base",
                "bg-white dark:bg-neutral-900",
                "ring ring-neutral-950/10 dark:ring-neutral-800",
                "text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400",
                "outline-none focus:ring-blue-500 focus:ring-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
            <Button
              variant="primary"
              icon={SparkleIcon}
              onClick={handleGenerate}
              loading={isGenerating}
              disabled={!prompt.trim() || isGenerating}
            >
              Generate
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              {error}
            </p>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            Press <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 rounded text-xs font-mono">⌘ + Enter</kbd> to generate
          </p>
        </div>
      </div>

      {/* Sandpack Editor */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          template="react-ts"
          files={files}
          customSetup={{
            dependencies: {
              "@phosphor-icons/react": "^2.1.10",
              "clsx": "^2.1.1",
              "tailwind-merge": "^3.3.1",
            },
          }}
          theme="auto"
          options={{
            externalResources: [
              "https://cdn.tailwindcss.com",
            ],
          }}
        >
          <SandpackLayout>
            <SandpackCodeEditor 
              showTabs
              showLineNumbers
              showInlineErrors
              wrapContent
              closableTabs
              style={{ height: "calc(100vh - 200px)" }}
            />
            <SandpackPreview 
              showOpenInCodeSandbox={false}
              showRefreshButton
              showRestartButton
              style={{ height: "calc(100vh - 200px)" }}
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-screen-2xl mx-auto px-6 py-3">
          <p className="text-xs text-neutral-500 text-center">
            Powered by OpenAI GPT-4 • Sandpack by CodeSandbox • Kumo Component Library
          </p>
        </div>
      </footer>
    </div>
  );
}
