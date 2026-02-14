import { type CSSProperties } from "react";
import { cn } from "../../utils/cn";

/** Code language variant definitions. */
export const KUMO_CODE_VARIANTS = {
  lang: {
    ts: {
      classes: "",
      description: "TypeScript code",
    },
    tsx: {
      classes: "",
      description: "TypeScript JSX code",
    },
    jsonc: {
      classes: "",
      description: "JSON with comments",
    },
    bash: {
      classes: "",
      description: "Shell/Bash commands",
    },
    css: {
      classes: "",
      description: "CSS styles",
    },
  },
} as const;

export const KUMO_CODE_DEFAULT_VARIANTS = {
  lang: "ts",
} as const;

/**
 * Styling metadata for Code component (for AI/Figma plugin consumption)
 */
export const KUMO_CODE_STYLING = {
  /** Base semantic tokens used */
  baseTokens: ["text-kumo-strong"],
  /** Typography and layout */
  typography: {
    fontFamily: "font-mono",
    fontSize: "text-sm",
    lineHeight: "leading-[20px]",
  },
  /** Container dimensions */
  dimensions: {
    margin: "m-0",
    padding: "p-0",
    width: "w-auto",
  },
  /** Border and background */
  appearance: {
    borderRadius: "rounded-none",
    border: "border-none",
    background: "bg-transparent",
  },
} as const;

/**
 * Styling metadata for CodeBlock component (for AI/Figma plugin consumption)
 */
export const KUMO_CODEBLOCK_STYLING = {
  /** Base semantic tokens used */
  baseTokens: ["bg-kumo-base", "border-kumo-fill"],
  /** Container styling */
  container: {
    minWidth: "min-w-0",
    borderRadius: "rounded-md",
    border: "border border-kumo-fill",
    background: "bg-kumo-base",
  },
  /** Inner code element padding */
  innerPadding: "[&>pre]:p-2.5",
  /** Parsed dimensions */
  dimensions: {
    borderRadius: 6, // md = 6px
    padding: 10, // p-2.5 = 10px
  },
} as const;

// Derived types from KUMO_CODE_VARIANTS
export type KumoCodeLang = keyof typeof KUMO_CODE_VARIANTS.lang;

export interface KumoCodeVariantsProps {
  /**
   * Language hint for the code content.
   * - `"ts"` — TypeScript code
   * - `"tsx"` — TypeScript JSX code
   * - `"jsonc"` — JSON with comments
   * - `"bash"` — Shell/Bash commands
   * - `"css"` — CSS styles
   * @default "ts"
   */
  lang?: KumoCodeLang;
}

export function codeVariants({
  lang = KUMO_CODE_DEFAULT_VARIANTS.lang,
}: KumoCodeVariantsProps = {}) {
  return cn(
    // Base styles
    "m-0 w-auto rounded-none border-none bg-transparent p-0 font-mono text-sm leading-[20px] text-kumo-strong",
    // Apply lang-specific styles (currently none, but extensible)
    KUMO_CODE_VARIANTS.lang[lang].classes,
  );
}

// Legacy type alias for backwards compatibility
export type CodeLang = KumoCodeLang;

/** @deprecated Use CodeLang instead */
export type BundledLanguage = CodeLang;

/**
 * Code component props.
 *
 * @example
 * ```tsx
 * <Code code="const x = 1;" lang="ts" />
 * <Code code="export API_KEY={{apiKey}}" lang="bash"
 *   values={{ apiKey: { value: "sk_live_123", highlight: true } }}
 * />
 * ```
 */
export interface CodeProps extends KumoCodeVariantsProps {
  /** The code string to display. */
  code: string;
  /** Template values for `{{key}}` interpolation. Values with `highlight: true` are visually emphasized. */
  values?: Record<
    string,
    {
      value: string;
      highlight?: boolean;
    }
  >;
  /** Additional CSS classes merged via `cn()`. */
  className?: string;
  /** Inline styles. */
  style?: CSSProperties;
}

/**
 * Simple code component without syntax highlighting.
 *
 * Renders code in a monospace font with customizable language metadata.
 * For a bordered container version, use `Code.Block` or `CodeBlock`.
 *
 * **Styling:**
 * - Typography: `font-mono text-sm leading-[20px]`
 * - Colors: `text-kumo-strong` with `bg-transparent`
 * - No borders or padding (use CodeBlock for styled container)
 * - Supports all semantic tokens via className prop
 */
function CodeComponent({
  code,
  lang = KUMO_CODE_DEFAULT_VARIANTS.lang,
  className,
  style,
}: CodeProps) {
  return (
    <pre className={cn(codeVariants({ lang }), className)} style={style}>
      {code}
    </pre>
  );
}

CodeComponent.displayName = "Code";

/**
 * CodeBlock component props — code inside a bordered container.
 *
 * @example
 * ```tsx
 * <CodeBlock lang="tsx" code={`const greeting = "Hello!";`} />
 * ```
 */
export interface CodeBlockProps {
  /** The code string to display. */
  code: string;
  /**
   * Language hint for the code content.
   * @default "ts"
   */
  lang?: CodeLang;
}

/**
 * Code block with border and background container.
 *
 * A styled wrapper around Code that adds a bordered container with surface background.
 * Useful for displaying code snippets with visual separation from surrounding content.
 *
 * **Styling:**
 * - Container: `min-w-0 rounded-md border border-kumo-fill bg-kumo-base`
 * - Inner padding: `p-2.5` (10px)
 * - Uses semantic tokens: `bg-kumo-base`, `border-kumo-fill`
 */
function CodeBlockComponent({ code, lang }: CodeBlockProps) {
  return (
    <div className="min-w-0 rounded-md border border-kumo-fill bg-kumo-base [&>pre]:p-2.5!">
      <CodeComponent lang={lang} code={code} />
    </div>
  );
}

CodeBlockComponent.displayName = "CodeBlock";

// Export Code with Block sub-component (for registry detection)
export const Code = Object.assign(CodeComponent, {
  Block: CodeBlockComponent,
});

// Backward-compatible standalone export
export const CodeBlock = CodeBlockComponent;
