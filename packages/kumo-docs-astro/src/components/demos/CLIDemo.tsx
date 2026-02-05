import { type FC, useState, useRef, useEffect, useCallback } from "react";
import { kumoRegistryJson } from "virtual:kumo-registry";

// Types for the registry
interface PropInfo {
  type: string;
  optional?: boolean;
  required?: boolean;
  values?: string[];
  descriptions?: Record<string, string>;
  default?: string;
  description?: string;
}

interface SubComponent {
  description?: string;
  props?: Record<string, PropInfo>;
  renderElement?: string;
}

interface ComponentInfo {
  name: string;
  description: string;
  importPath: string;
  category: string;
  props: Record<string, PropInfo>;
  examples: string[];
  colors: string[];
  subComponents?: Record<string, SubComponent>;
}

interface BlockInfo {
  name: string;
  type: string;
  description: string;
  importPath: string;
  category: string;
  props: Record<string, PropInfo>;
  examples: string[];
  colors: string[];
  files: string[];
  dependencies: string[];
}

interface ComponentRegistry {
  version: string;
  components: Record<string, ComponentInfo>;
  blocks?: Record<string, BlockInfo>;
}

// Terminal line types
type LineType = "input" | "output" | "error";

interface TerminalLine {
  type: LineType;
  content: string;
}

const HELP_TEXT = `Kumo CLI - Component registry and blocks distribution

BLOCKS:
  kumo init            Initialize kumo.json configuration file
  kumo blocks          List all available blocks for CLI installation
  kumo add <block>     Install a block to your project

COMPONENT REGISTRY:
  kumo ls              List all Kumo components with categories
  kumo doc <name>      Get detailed documentation for a component
  kumo docs            Get documentation for all components

GENERAL:
  kumo help            Show this help message
  clear                Clear terminal

Examples:
  kumo init
  kumo blocks
  kumo add PageHeader
  kumo ls
  kumo doc Button
  kumo docs`;

/**
 * Format a prop for display
 */
function formatProp(name: string, prop: PropInfo): string[] {
  const lines: string[] = [];

  // Type
  let typeStr = prop.type;
  if (prop.values && prop.values.length > 0) {
    typeStr = prop.values.map((v) => `"${v}"`).join(" | ");
  }

  // Required/optional
  const required = prop.required === true || prop.optional === false;
  const requiredStr = required ? "(required)" : "";

  // Default
  const defaultStr = prop.default ? `[default: ${prop.default}]` : "";

  lines.push(`  ${name}: ${typeStr} ${requiredStr} ${defaultStr}`.trim());

  // Variant descriptions
  if (prop.descriptions && Object.keys(prop.descriptions).length > 0) {
    for (const [value, desc] of Object.entries(prop.descriptions)) {
      lines.push(`    - "${value}": ${desc}`);
    }
  }

  return lines;
}

/**
 * Format documentation for a single component
 */
function formatComponentDoc(component: ComponentInfo): string[] {
  const lines: string[] = [];

  lines.push(`# ${component.name}`);
  lines.push("");
  lines.push(component.description);
  lines.push("");
  lines.push(
    `Import: import { ${component.name} } from "${component.importPath}";`,
  );
  lines.push("");
  lines.push(`Category: ${component.category}`);
  lines.push("");

  // Props (only show variant/size/shape props for brevity)
  const importantProps = ["variant", "size", "shape"];
  const propsToShow = Object.entries(component.props).filter(
    ([name]) =>
      importantProps.includes(name) ||
      component.props[name].values ||
      component.props[name].required,
  );

  if (propsToShow.length > 0) {
    lines.push("## Props");
    lines.push("");
    for (const [propName, propInfo] of propsToShow.slice(0, 8)) {
      lines.push(...formatProp(propName, propInfo));
      lines.push("");
    }
    if (propsToShow.length > 8) {
      lines.push(`  ... and ${propsToShow.length - 8} more props`);
      lines.push("");
    }
  }

  // Sub-components
  if (component.subComponents) {
    lines.push("## Sub-Components");
    lines.push("");
    for (const [subName, subInfo] of Object.entries(component.subComponents)) {
      lines.push(`  ${component.name}.${subName}`);
      if (subInfo.description) {
        lines.push(`    ${subInfo.description}`);
      }
    }
    lines.push("");
  }

  // Examples (just first 2)
  if (component.examples && component.examples.length > 0) {
    lines.push("## Examples");
    lines.push("");
    for (const example of component.examples.slice(0, 2)) {
      lines.push("  " + example);
    }
    if (component.examples.length > 2) {
      lines.push("");
      lines.push(
        `  (${component.examples.length - 2} more examples available)`,
      );
    }
    lines.push("");
  }

  // Colors
  if (component.colors && component.colors.length > 0) {
    lines.push("## Semantic Tokens");
    lines.push("");
    lines.push("  " + component.colors.join(", "));
  }

  return lines;
}

/**
 * Execute a CLI command and return output lines
 */
function executeCommand(
  input: string,
  registry: ComponentRegistry,
): { output: string[]; isError: boolean } {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  const baseCommand = parts[0]?.toLowerCase();

  // Handle clear command
  if (baseCommand === "clear") {
    return { output: ["__CLEAR__"], isError: false };
  }

  // Handle non-kumo commands
  if (baseCommand !== "kumo" && baseCommand !== "npx") {
    if (!trimmed) {
      return { output: [], isError: false };
    }
    return {
      output: [`command not found: ${baseCommand}`, 'Try "kumo help"'],
      isError: true,
    };
  }

  // Parse kumo command
  let commandIndex = 1;
  if (baseCommand === "npx") {
    // Skip "@cloudflare/kumo" part
    if (parts[1] === "@cloudflare/kumo") {
      commandIndex = 2;
    } else {
      return {
        output: [`Unknown package: ${parts[1]}`],
        isError: true,
      };
    }
  }

  const command = parts[commandIndex]?.toLowerCase();
  const arg = parts[commandIndex + 1];

  switch (command) {
    case "ls": {
      const components = Object.values(registry.components);

      // Group by category
      const byCategory = new Map<string, ComponentInfo[]>();
      for (const component of components) {
        const category = component.category || "Other";
        if (!byCategory.has(category)) {
          byCategory.set(category, []);
        }
        byCategory.get(category)!.push(component);
      }

      // Sort categories and components
      const sortedCategories = [...byCategory.keys()].sort();

      const output: string[] = [];
      output.push(`Kumo Components (${components.length} total)`);
      output.push("");

      for (const category of sortedCategories) {
        const categoryComponents = [...byCategory.get(category)!].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        output.push(`${category}:`);
        for (const component of categoryComponents) {
          // Truncate long descriptions
          const desc =
            component.description.length > 50
              ? component.description.slice(0, 47) + "..."
              : component.description;
          output.push(`  ${component.name} - ${desc}`);
        }
        output.push("");
      }

      return { output, isError: false };
    }

    case "doc":
    case "docs": {
      if (!arg && command === "doc") {
        // Show all docs briefly
        const output: string[] = [];
        output.push(`# Kumo Component Documentation`);
        output.push("");
        output.push(
          `${Object.keys(registry.components).length} components available`,
        );
        output.push("");
        output.push('Use "kumo doc <ComponentName>" for detailed docs');
        output.push("");
        output.push("Components:");
        for (const name of Object.keys(registry.components).sort()) {
          output.push(`  - ${name}`);
        }
        return { output, isError: false };
      }

      if (arg) {
        // Find component (case-insensitive)
        const lowerArg = arg.toLowerCase();
        const component = Object.values(registry.components).find(
          (c) => c.name.toLowerCase() === lowerArg,
        );

        if (!component) {
          // Find similar
          const similar = Object.keys(registry.components)
            .filter(
              (n) =>
                n.toLowerCase().includes(lowerArg) ||
                lowerArg.includes(n.toLowerCase()),
            )
            .slice(0, 5);

          const output = [`Component "${arg}" not found.`];
          if (similar.length > 0) {
            output.push("");
            output.push(`Did you mean: ${similar.join(", ")}?`);
          }
          output.push("");
          output.push('Run "kumo ls" to see all available components.');
          return { output, isError: true };
        }

        return { output: formatComponentDoc(component), isError: false };
      }

      // docs - show all (abbreviated)
      const output: string[] = [];
      output.push(`# Kumo Component Documentation`);
      output.push("");
      output.push(
        `${Object.keys(registry.components).length} components available`,
      );
      output.push("");
      output.push("---");

      for (const component of Object.values(registry.components).slice(0, 3)) {
        output.push("");
        output.push(...formatComponentDoc(component));
        output.push("");
        output.push("---");
      }

      output.push("");
      output.push(
        `... and ${Object.keys(registry.components).length - 3} more components`,
      );
      output.push("");
      output.push('Use "kumo doc <name>" to see a specific component.');

      return { output, isError: false };
    }

    case "init": {
      const output: string[] = [];
      output.push("Initializing Kumo configuration...");
      output.push("");
      output.push(
        "Where should blocks be installed? (src/components/kumo): src/components/kumo",
      );
      output.push("");
      output.push("Created kumo.json with the following configuration:");
      output.push("   Blocks directory: src/components/kumo");
      output.push("");
      output.push("Next steps:");
      output.push('  1. Run "kumo blocks" to see available blocks');
      output.push('  2. Run "kumo add <block-name>" to install a block');
      return { output, isError: false };
    }

    case "blocks": {
      if (!registry.blocks) {
        return {
          output: ["No blocks available in this version."],
          isError: true,
        };
      }

      const blocks = Object.values(registry.blocks);

      // Group by category
      const byCategory = new Map<string, BlockInfo[]>();
      for (const block of blocks) {
        const category = block.category || "Other";
        if (!byCategory.has(category)) {
          byCategory.set(category, []);
        }
        byCategory.get(category)!.push(block);
      }

      // Sort categories
      const sortedCategories = [...byCategory.keys()].sort();

      const output: string[] = [];
      output.push(`Kumo Blocks (${blocks.length} total)`);
      output.push("");

      for (const category of sortedCategories) {
        const categoryBlocks = [...byCategory.get(category)!].sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        output.push(`${category}:`);
        for (const block of categoryBlocks) {
          // Truncate long descriptions
          const desc =
            block.description.length > 60
              ? block.description.slice(0, 57) + "..."
              : block.description;
          output.push(`  ${block.name} - ${desc}`);
        }
        output.push("");
      }

      output.push("To install a block, run:");
      output.push("  kumo add <block-name>");
      output.push("");
      output.push("Example:");
      output.push("  kumo add PageHeader");

      return { output, isError: false };
    }

    case "add": {
      if (!arg) {
        return {
          output: [
            "Error: Block name is required.",
            "",
            "Usage: kumo add <block-name>",
            'Run "kumo blocks" to see available blocks.',
          ],
          isError: true,
        };
      }

      // Check if block exists
      const blockName = arg;
      const block = registry.blocks?.[blockName];

      if (!block) {
        // Try case-insensitive match
        const lowerArg = arg.toLowerCase();
        const matchedBlock = Object.values(registry.blocks || {}).find(
          (b) => b.name.toLowerCase() === lowerArg,
        );

        if (matchedBlock) {
          return executeCommand(`kumo add ${matchedBlock.name}`, registry);
        }

        const output = [`Error: Block '${blockName}' not found.`];
        output.push('Run "kumo blocks" to see available blocks.');
        return { output, isError: true };
      }

      // Simulate successful installation
      const output: string[] = [];
      output.push(`Installing block: ${block.name}`);

      for (const file of block.files) {
        output.push(`  ${file}`);
      }
      output.push("");

      if (block.dependencies && block.dependencies.length > 0) {
        output.push("This block depends on the following Kumo components:");
        for (const dep of block.dependencies) {
          output.push(`  - ${dep} (from @cloudflare/kumo)`);
        }
        output.push("");
        output.push("Make sure @cloudflare/kumo is installed in your project:");
        output.push("  pnpm add @cloudflare/kumo");
        output.push("");
      }

      output.push(`Successfully installed ${block.name}!`);
      output.push("");
      output.push("You can now import it in your project:");

      // Calculate import path (simplified for demo)
      const mainFile = block.files.find(
        (f) =>
          f.endsWith(".tsx") && !f.includes(".stories") && !f.includes(".test"),
      );
      if (mainFile) {
        const importPath = mainFile.replace(/\.tsx$/, "").replace(/\//g, "/");
        output.push(
          `  import { ${block.name} } from "src/components/kumo/${importPath}";`,
        );
      }

      return { output, isError: false };
    }

    case "help":
    case "--help":
    case "-h":
    case undefined: {
      return { output: HELP_TEXT.split("\n"), isError: false };
    }

    default: {
      return {
        output: [`Unknown command: ${command}`, "", HELP_TEXT],
        isError: true,
      };
    }
  }
}

/**
 * Interactive CLI Terminal component
 */
export const CLITerminal: FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "output",
      content:
        "Kumo CLI v" +
        kumoRegistryJson.version +
        ' - Type "kumo help" for commands',
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const registry = kumoRegistryJson as unknown as ComponentRegistry;

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!currentInput.trim() && !currentInput) {
      // Empty enter, just add new prompt
      setLines((prev) => [...prev, { type: "input", content: "" }]);
      return;
    }

    const input = currentInput;
    setCurrentInput("");

    // Add to history
    if (input.trim()) {
      setCommandHistory((prev) => [...prev, input]);
    }
    setHistoryIndex(-1);

    // Add input line
    const newLines: TerminalLine[] = [{ type: "input", content: input }];

    // Execute command
    const { output, isError } = executeCommand(input, registry);

    // Handle clear
    if (output[0] === "__CLEAR__") {
      setLines([]);
      return;
    }

    // Add output lines
    for (const line of output) {
      newLines.push({
        type: isError ? "error" : "output",
        content: line,
      });
    }

    setLines((prev) => [...prev, ...newLines]);
  }, [currentInput, registry]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setCurrentInput("");
          } else {
            setHistoryIndex(newIndex);
            setCurrentInput(commandHistory[newIndex]);
          }
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [handleSubmit, commandHistory, historyIndex],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-kumo-default">
        <div className="flex flex-wrap gap-2">
          {[
            "kumo help",
            "kumo blocks",
            "kumo add PageHeader",
            "kumo ls",
            "kumo doc Button",
          ].map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => {
                setCurrentInput(cmd);
                inputRef.current?.focus({ preventScroll: true });
              }}
              className="rounded bg-kumo-overlay px-2 py-1 font-mono text-xs text-kumo-default transition-colors hover:bg-kumo-recessed"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={terminalRef}
        onClick={handleTerminalClick}
        onKeyDown={undefined}
        className="relative h-[500px] w-full max-w-[800px] cursor-text overflow-x-auto overflow-y-auto overscroll-contain rounded-lg bg-kumo-contrast p-4 font-mono text-sm text-kumo-inverse"
      >
        {/* Output lines */}
        {lines.map((line, i) => {
          // Add spacing before output that follows an input line
          const prevLine = lines[i - 1];
          const isFirstOutputAfterInput =
            line.type !== "input" && prevLine?.type === "input";
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap ${isFirstOutputAfterInput ? "mt-1" : ""}`}
            >
              {line.type === "input" ? (
                <span className="text-kumo-success">
                  <span>$</span> {line.content}
                </span>
              ) : line.type === "error" ? (
                <span className="text-kumo-danger">{line.content}</span>
              ) : (
                <span className="text-kumo-success opacity-90">
                  {line.content}
                </span>
              )}
            </div>
          );
        })}

        {/* Current input line */}
        <div className="flex items-center">
          <span className="text-kumo-success">$</span>
          <span className="mx-1 text-kumo-success">{currentInput}</span>
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-kumo-contrast" />
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0"
            aria-label="Terminal input"
          />
        </div>
      </div>

      <p className="text-xs text-kumo-subtle">
        Tip: Use arrow keys for command history, Ctrl+L to clear
      </p>
    </div>
  );
};
