/**
 * StreamingDemo — live generative UI chat demo for the docs site.
 *
 * Composes @cloudflare/kumo/streaming (useUITree, createJsonlParser, action system)
 * and @cloudflare/kumo/generative (UITreeRenderer, COMPONENT_MAP) to render
 * Kumo components from AI-generated JSONL/RFC6902 patch streams.
 *
 * Fetches from /api/chat (Workers AI SSE endpoint). Theme-aware via docs site
 * data-mode attribute.
 */

import {
  memo,
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
  type FormEvent,
} from "react";
import { Button, InputArea, Badge, Surface, Loader } from "@cloudflare/kumo";
import {
  useUITree,
  useRuntimeValueStore,
  createJsonlParser,
  BUILTIN_HANDLERS,
  dispatchAction,
  processActionResult,
  type ActionEvent,
  type UITree,
  type UIElement,
  type JsonPatchOp,
  type RuntimeValueStore,
} from "@cloudflare/kumo/streaming";
import {
  UITreeRenderer,
  isRenderableTree,
  defineCustomComponent,
} from "@cloudflare/kumo/generative";
import type { CustomComponentDefinition } from "@cloudflare/kumo/catalog";
import { DemoButton } from "./DemoButton";

// =============================================================================
// Types
// =============================================================================

type DemoStatus = "idle" | "streaming" | "error";

// =============================================================================
// Constants
// =============================================================================

const PRESET_PROMPTS = [
  {
    label: "User card",
    prompt: "Show me a user profile card with name, email, and role",
  },
  {
    label: "Settings form",
    prompt:
      "Build a notification preferences form with a text input for name, a select dropdown for email frequency (realtime, daily, weekly), checkboxes for notification channels, and a submit button",
  },
  {
    label: "Counter",
    prompt:
      "Create a simple counter UI: show the current count, and include exactly two buttons labeled Increment and Decrement",
  },
  {
    label: "Pricing table",
    prompt: "Display a pricing comparison table with 3 tiers",
  },
  {
    label: "Custom",
    prompt:
      'Show a heading that says "Custom Component Demo", a short paragraph explaining this is a custom DemoButton rendered through the customComponents extension point, then render two DemoButton components side by side: one with children "Light" and variant "light", and one with children "Dark" and variant "dark". Wrap the buttons in a horizontal layout with some spacing.',
  },
] as const;

// Custom component definition — defined outside the render path for stable
// identity (recommended pattern for custom components).
const demoButtonDef = defineCustomComponent({
  component: DemoButton,
  description: "A fancy button with a rainbow conic-gradient hover effect",
  props: {
    children: { type: "string", description: "Button label text" },
    variant: {
      type: "string",
      description: "Visual variant",
      values: ["light", "dark"] as const,
      default: "light",
      optional: true,
    },
  },
});

const CUSTOM_COMPONENTS: Readonly<Record<string, CustomComponentDefinition>> = {
  DemoButton: demoButtonDef,
};

// =============================================================================
// SSE stream reader
// =============================================================================

/**
 * Parse Workers AI SSE stream.
 *
 * Wire format: `data: {"response":"...token..."}\n\n` ending with `data: [DONE]\n\n`
 */
async function readSSEStream(
  response: Response,
  onToken: (token: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const body = response.body;
  if (!body) throw new Error("No response body");

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawDone = false;

  let pendingDataLines: string[] = [];

  function emitFromDataPayload(payload: string): void {
    const trimmed = payload.trim();
    if (trimmed === "") return;
    if (trimmed === "[DONE]") return;

    function emitToken(value: unknown): boolean {
      if (typeof value === "string") {
        if (value === "") return false;
        onToken(value);
        return true;
      }
      if (typeof value === "number" || typeof value === "boolean") {
        onToken(String(value));
        return true;
      }
      return false;
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed !== "object" || parsed === null) return;
      const obj = parsed as Record<string, unknown>;

      // Workers AI legacy format: { response: "..." }
      if ("response" in obj) {
        if (emitToken(obj.response)) return;
      }

      // OpenAI-compatible streaming format.
      // Common shapes:
      // - { choices: [{ delta: { content: "..." } }] }
      // - { choices: [{ delta: { text: "..." } }] }
      // - { choices: [{ text: "..." }] }
      if ("choices" in obj && Array.isArray(obj.choices)) {
        const choice = obj.choices[0] as Record<string, unknown> | undefined;
        if (!choice) return;

        if ("text" in choice && emitToken(choice.text)) return;

        if (typeof choice.delta === "object" && choice.delta) {
          const delta = choice.delta as Record<string, unknown>;

          if ("content" in delta && emitToken(delta.content)) return;
          if ("text" in delta && emitToken(delta.text)) return;
        }
      }
    } catch {
      // Some providers stream plain text tokens over SSE: `data: <token>`.
      // Treat unparseable payloads as raw token text.
      onToken(payload);
    }
  }

  function maybeEmitPendingBlock(): void {
    if (pendingDataLines.length === 0) return;
    const combined = pendingDataLines.join("\n");
    const trimmed = combined.trim();

    // Terminator event.
    if (trimmed === "[DONE]") {
      pendingDataLines = [];
      sawDone = true;
      return;
    }

    // If the block is parseable JSON, emit it. This handles both single-line
    // events and multi-line `data:` events (SSE spec) without requiring `\n\n`.
    try {
      JSON.parse(trimmed);
      emitFromDataPayload(combined);
      pendingDataLines = [];
      return;
    } catch {
      // If the first line doesn't look like JSON, treat it as a raw token.
      // Many providers stream `data: <token>` (plain text) per line.
      if (
        pendingDataLines.length === 1 &&
        !trimmed.startsWith("{") &&
        !trimmed.startsWith("[")
      ) {
        onToken(combined);
        pendingDataLines = [];
      }
    }
  }

  function processLine(rawLine: string): void {
    const line = rawLine.replace(/\r/g, "");
    if (line.trim() === "") {
      // Blank line ends an SSE event block.
      maybeEmitPendingBlock();
      return;
    }
    if (line.startsWith(":")) return; // SSE comment
    if (!line.startsWith("data:")) return;

    const payload = line.slice("data:".length).trimStart();
    pendingDataLines.push(payload);
    // Progress even when intermediaries omit the blank-line delimiter.
    maybeEmitPendingBlock();
  }

  try {
    for (;;) {
      if (signal.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse incrementally by lines.
      for (;;) {
        const newline = buffer.indexOf("\n");
        if (newline === -1) break;
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        processLine(line);
        if (sawDone) return;
      }
    }

    // Best-effort flush for streams that don't end with a newline.
    if (buffer.length > 0) processLine(buffer);
    maybeEmitPendingBlock();
    if (sawDone) return;
  } finally {
    reader.releaseLock();
  }
}

// =============================================================================
// Action log entry
// =============================================================================

interface ActionLogEntry {
  readonly timestamp: string;
  readonly event: ActionEvent;
}

// =============================================================================
// ActionPanel — shows action events fired by generated UI interactions
// =============================================================================

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function ActionLogRow({ entry }: { readonly entry: ActionLogEntry }) {
  const { event, timestamp } = entry;
  const ts = formatTimestamp(timestamp);

  const detailParts: string[] = [];
  if (event.params != null) {
    detailParts.push(`params=${JSON.stringify(event.params)}`);
  }
  if (event.context != null) {
    detailParts.push(`ctx=${JSON.stringify(event.context)}`);
  }
  const detail = detailParts.length > 0 ? ` ${detailParts.join(" ")}` : "";

  return (
    <div className="flex flex-col gap-0.5 border-b border-kumo-line py-1 font-mono text-[11px] last:border-0">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-kumo-subtle">{ts}</span>
        <span className="font-semibold text-kumo-brand">
          {event.actionName}
        </span>
        <span className="text-kumo-subtle">from</span>
        <span className="text-kumo-default">{event.sourceKey}</span>
        {detail && <span className="text-kumo-subtle">{detail}</span>}
      </div>
      {event.actionName === "submit_form" && (
        <div className="mt-0.5 text-kumo-subtle">
          {"-> POST /api/actions "}
          {JSON.stringify({
            actionName: event.actionName,
            sourceKey: event.sourceKey,
            ...(event.params != null ? { params: event.params } : undefined),
            ...(event.context != null ? { context: event.context } : undefined),
          })}
        </div>
      )}
    </div>
  );
}

const ActionPanel = memo(function ActionPanel({
  entries,
  onClear,
}: {
  readonly entries: readonly ActionLogEntry[];
  readonly onClear: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  return (
    <div className="flex-1 flex flex-col rounded-lg border border-kumo-line bg-kumo-elevated overflow-hidden">
      <div className="flex items-center justify-between border-b border-kumo-line px-3 py-2">
        <span className="text-xs font-semibold text-kumo-default">
          Action Events
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] text-kumo-subtle hover:text-kumo-default"
        >
          Clear
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-1.5"
        style={{ maxHeight: "160px" }}
      >
        {entries.length === 0 && (
          <span className="text-[11px] text-kumo-subtle">
            Interact with generated UI to see action events here.
          </span>
        )}
        {entries.map((entry, i) => (
          <ActionLogRow key={i} entry={entry} />
        ))}
      </div>
    </div>
  );
});

// =============================================================================
// SubmitPanel — shows the current submit_form payload preview
// =============================================================================

function findSubmitAction(tree: UITree): {
  readonly sourceKey: string;
  readonly action: NonNullable<UIElement["action"]>;
} | null {
  for (const [key, el] of Object.entries(tree.elements)) {
    if (!el?.action) continue;
    if (el.action.name !== "submit_form") continue;
    return { sourceKey: key, action: el.action };
  }
  return null;
}

const SubmitPanel = memo(function SubmitPanel({
  tree,
  runtimeValueStore,
}: {
  readonly tree: UITree;
  readonly runtimeValueStore: RuntimeValueStore;
}) {
  const submit = useMemo(() => findSubmitAction(tree), [tree]);

  const [runtimeValues, setRuntimeValues] = useState<
    Readonly<Record<string, unknown>>
  >({});

  useEffect(() => {
    const update = () => setRuntimeValues(runtimeValueStore.snapshotAll());
    update();
    return runtimeValueStore.subscribe(update);
  }, [runtimeValueStore]);

  const payloadText = useMemo(() => {
    if (!submit) return "";

    const body: Record<string, unknown> = {
      actionName: "submit_form",
      sourceKey: submit.sourceKey,
      context: { runtimeValues },
    };
    if (submit.action.params != null) {
      body.params = submit.action.params;
    }

    return `-> POST /api/actions\n${JSON.stringify(body, null, 2)}`;
  }, [submit, runtimeValues]);

  const handleCopy = useCallback(async () => {
    if (!payloadText) return;
    try {
      await navigator.clipboard.writeText(payloadText);
    } catch {
      // ignore
    }
  }, [payloadText]);

  return (
    <div className="flex-1 flex flex-col rounded-lg border border-kumo-line bg-kumo-elevated overflow-hidden">
      <div className="flex items-center justify-between border-b border-kumo-line px-3 py-2">
        <span className="text-xs font-semibold text-kumo-default">
          Submit Payload
        </span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!payloadText}
          className="text-[10px] text-kumo-subtle hover:text-kumo-default disabled:opacity-40"
        >
          Copy
        </button>
      </div>
      <pre
        className="flex-1 overflow-y-auto whitespace-pre-wrap px-3 py-1.5 font-mono text-[11px] text-kumo-strong"
        style={{ maxHeight: "160px" }}
      >
        {payloadText || (
          <span className="text-kumo-subtle">
            No submit_form action in current tree.
          </span>
        )}
      </pre>
    </div>
  );
});

// =============================================================================
// Main component
// =============================================================================

/** Live streaming generative UI demo. */
export function StreamingDemo() {
  // --- State ---
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);

  // --- Refs ---
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  // --- Hooks ---
  const runtimeValueStore = useRuntimeValueStore();

  // Stable ref for tree — avoids stale closure in handleAction
  const treeRef = useRef<UITree>({ root: "", elements: {} });
  // Stable ref for applyPatches
  const applyPatchesRef = useRef<(patches: readonly JsonPatchOp[]) => void>(
    () => {},
  );
  // Stable ref for handleSubmit (for form submission action)
  const handleSubmitRef = useRef<
    (e?: FormEvent, overrideMessage?: string) => void
  >(() => {});

  const clearActionLog = useCallback(() => setActionLog([]), []);

  const handleAction = useCallback((event: ActionEvent) => {
    // Always log the action event
    setActionLog((prev) => [
      ...prev,
      { timestamp: new Date().toISOString(), event },
    ]);

    // Docs demo: don't actually submit generated forms.
    // We still log + preview payloads to show it's possible.
    if (event.actionName === "submit_form") return;

    const result = dispatchAction(BUILTIN_HANDLERS, event, treeRef.current);
    if (result === null) return;
    processActionResult(result, {
      applyPatches: (patches: readonly JsonPatchOp[]) => {
        applyPatchesRef.current(patches);
      },
      sendMessage: (content: string) => {
        handleSubmitRef.current(undefined, content);
      },
      openExternal: (url: string, target: string) => {
        const safeTarget = target === "_self" ? "_self" : "_blank";
        const w = window.open(url, safeTarget, "noopener,noreferrer");
        if (w) w.opener = null;
      },
    });
  }, []);

  const { tree, applyPatches, reset } = useUITree({
    batchPatches: true,
    onAction: handleAction,
  });

  // Keep refs in sync
  treeRef.current = tree;
  applyPatchesRef.current = applyPatches;

  // --- Submit handler ---
  const handleSubmit = useCallback(
    (e?: FormEvent, overrideMessage?: string) => {
      if (e) e.preventDefault();
      const msg = overrideMessage ?? inputValue.trim();
      if (!msg) return;

      // Abort any in-flight stream
      abortRef.current?.abort();

      const runId = runIdRef.current + 1;
      runIdRef.current = runId;

      // Reset everything for a fresh response
      setLastPrompt(msg);
      runtimeValueStore.clear();
      reset();
      setErrorMessage(null);
      setStatus("streaming");
      setInputValue("");

      // Create fresh parser for this stream
      const parser = createJsonlParser();
      const controller = new AbortController();
      abortRef.current = controller;

      (async () => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
            },
            body: JSON.stringify({ message: msg }),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => null);
            const errMsg =
              typeof errBody === "object" &&
              errBody !== null &&
              "error" in errBody &&
              typeof (errBody as Record<string, unknown>).error === "string"
                ? ((errBody as Record<string, unknown>).error as string)
                : `Request failed (${String(response.status)})`;
            throw new Error(errMsg);
          }

          await readSSEStream(
            response,
            (token) => {
              const ops = parser.push(token);
              if (ops.length > 0) {
                applyPatches(ops);
              }
            },
            controller.signal,
          );

          // Flush remaining buffer
          const remaining = parser.flush();
          if (remaining.length > 0) {
            applyPatches(remaining);
          }

          if (runIdRef.current === runId) {
            setStatus("idle");
          }
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") return;

          // Flush partial ops even on error
          try {
            const remaining = parser.flush();
            if (remaining.length > 0) applyPatches(remaining);
          } catch {
            // Ignore flush errors
          }

          const errMessage =
            err instanceof Error ? err.message : "Something went wrong";
          if (runIdRef.current === runId) {
            setErrorMessage(errMessage);
            setStatus("error");
          }
        } finally {
          if (runIdRef.current === runId) {
            abortRef.current = null;
          }
        }
      })();
    },
    [inputValue, runtimeValueStore, reset, applyPatches],
  );

  // Keep handleSubmitRef in sync
  handleSubmitRef.current = handleSubmit;

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const isStreaming = status === "streaming";
  const showCurrentTree = isRenderableTree(tree);

  return (
    <div className="flex flex-col rounded-lg border border-kumo-line bg-kumo-base overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-kumo-line bg-kumo-elevated px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-kumo-default">
            Generative UI
          </span>
          <Badge variant="primary">Live</Badge>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-kumo-subtle">
            <Loader size="sm" />
            Streaming...
          </div>
        )}
      </div>

      {/* Generated UI area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: "200px", maxHeight: "520px" }}
      >
        {/* Empty state */}
        {!lastPrompt && !showCurrentTree && !isStreaming && (
          <div className="flex items-center justify-center py-12 text-center">
            <span className="text-sm text-kumo-subtle">
              Pick a preset or type a prompt below to generate UI.
            </span>
          </div>
        )}

        {/* Last user prompt */}
        {lastPrompt && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-lg bg-kumo-brand/10 px-3 py-2 text-sm text-kumo-default">
              {lastPrompt}
            </div>
          </div>
        )}

        {/* Current streaming/rendered tree */}
        {showCurrentTree && (
          <div className="rounded-lg border border-kumo-line bg-kumo-base p-4">
            <UITreeRenderer
              tree={tree}
              streaming={isStreaming}
              onAction={handleAction}
              runtimeValueStore={runtimeValueStore}
              customComponents={CUSTOM_COMPONENTS}
            />
          </div>
        )}

        {/* Error display */}
        {status === "error" && errorMessage && (
          <Surface className="rounded-lg border border-kumo-danger bg-kumo-danger-tint p-3">
            <span className="text-sm text-kumo-danger">{errorMessage}</span>
          </Surface>
        )}
      </div>

      {/* Action + Submit panels (always visible to avoid layout pop-in) */}
      <div className="flex gap-2 border-t border-kumo-line bg-kumo-elevated px-4 py-3">
        <ActionPanel entries={actionLog} onClear={clearActionLog} />
        <SubmitPanel tree={tree} runtimeValueStore={runtimeValueStore} />
      </div>

      {/* Controls — always visible */}
      <div className="border-t border-kumo-line bg-kumo-elevated p-3 space-y-2">
        {/* Preset pills — always shown */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={isStreaming}
              onClick={() => handleSubmit(undefined, preset.prompt)}
              className="rounded-full border border-kumo-line bg-kumo-base px-2.5 py-1 text-xs text-kumo-subtle transition-colors hover:border-kumo-brand hover:text-kumo-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => handleSubmit(e)}>
          <InputArea
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInputValue(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Describe the UI you want..."
            disabled={isStreaming}
            aria-label="Chat message"
            rows={2}
            className="w-full"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isStreaming || !inputValue.trim()}
            >
              {isStreaming ? "Streaming..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
