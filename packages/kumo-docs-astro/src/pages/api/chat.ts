import type { APIRoute } from "astro";
import {
  createKumoCatalog,
  initCatalog,
  type CustomComponentDefinition,
} from "@cloudflare/kumo/catalog";

export const prerender = false;

/** Maximum length (in characters) for a single user message. */
const MAX_MESSAGE_LENGTH = 2000;

/** Maximum length (in characters) for each history entry. */
const MAX_HISTORY_ENTRY_LENGTH = 4000;

/** Maximum number of history entries accepted in a request. */
const MAX_HISTORY_ENTRIES = 50;

/**
 * Aggregate character budget for the full message array (system + history + user).
 * Prevents cost amplification from many long history entries.
 */
const MAX_TOTAL_MESSAGE_CHARS = 40_000;

/**
 * AI Gateway ID — route Workers AI requests through AI Gateway for
 * analytics and gateway-level rate limiting.
 *
 * Create this gateway in the Cloudflare dashboard under AI → AI Gateway.
 * Caching is disabled so streaming is always visible in the demo.
 */
const AI_GATEWAY_ID = "kumo-docs";

const MODEL_ID = "@cf/zai-org/glm-4.7-flash";

/** Chat request body schema. */
interface ChatRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
}

/** Workers AI text-generation message format. */
interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Validate and parse incoming chat request body.
 * Returns parsed request or null if invalid.
 */
function parseChatRequest(body: unknown): ChatRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const obj = body as Record<string, unknown>;
  if (typeof obj.message !== "string" || obj.message.trim().length === 0) {
    return null;
  }
  const message = obj.message.trim();
  if (message.length > MAX_MESSAGE_LENGTH) {
    return null;
  }

  let history: ChatRequest["history"] | undefined;
  if (Array.isArray(obj.history)) {
    if (obj.history.length > MAX_HISTORY_ENTRIES) return null;
    const valid = obj.history.every(
      (entry: unknown) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as Record<string, unknown>).role === "string" &&
        typeof (entry as Record<string, unknown>).content === "string" &&
        ((entry as Record<string, unknown>).content as string).length <=
          MAX_HISTORY_ENTRY_LENGTH,
    );
    if (!valid) return null;
    history = obj.history as ChatRequest["history"];
  }

  return { message, history };
}

/**
 * Components included in the system prompt. Pruned to keep token budget
 * manageable — only types that appear in the generative component map and
 * are useful for freeform UI generation.
 */
const PROMPT_COMPONENTS = [
  // Layout
  "Surface",
  "Stack",
  "Cluster",
  "Grid",
  "Div",
  // Content
  "Text",
  "Badge",
  "Banner",
  "Code",
  "ClipboardText",
  // Interactive
  "Button",
  "Input",
  "Textarea",
  "Select",
  "SelectOption",
  "Checkbox",
  "Switch",
  "Tabs",
  "Collapsible",
  "RadioGroup",
  "RadioItem",
  "Field",
  "Label",
  // Data display
  "Table",
  "TableHeader",
  "TableHead",
  "TableBody",
  "TableRow",
  "TableCell",
  "TableFooter",
  "Meter",
  // Navigation
  "Link",
  // Feedback
  "Loader",
  "Empty",
] as const;

/**
 * Custom component metadata for prompt generation. The actual React component
 * lives in the client bundle (DemoButton.tsx); here we only need the metadata
 * so the LLM knows the type exists and what props it accepts.
 *
 * Using a no-op stub for `component` since the server never renders it.
 */
const CUSTOM_COMPONENTS: Readonly<Record<string, CustomComponentDefinition>> = {
  DemoButton: {
    component: "span",
    description: "A fancy button with a rainbow conic-gradient hover effect",
    props: {
      children: { type: "string", description: "Button label text" },
      variant: {
        type: "string",
        description: "Visual variant",
        values: ["light", "dark"],
        default: "light",
        optional: true,
      },
    },
  },
};

/** Cached system prompt — generated once per cold start. */
let systemPromptCache: string | null = null;
let systemPromptPromise: Promise<string> | null = null;

async function getSystemPrompt(): Promise<string> {
  // In dev, rebuild prompt on each request so prompt tweaks are immediately
  // reflected without needing to restart the dev server.
  if (import.meta.env.DEV) {
    const catalog = createKumoCatalog({ customComponents: CUSTOM_COMPONENTS });
    await initCatalog(catalog);
    return catalog.generatePrompt({
      components: [...PROMPT_COMPONENTS],
      maxPropsPerComponent: 8,
    });
  }

  if (systemPromptCache) return systemPromptCache;
  if (systemPromptPromise) return systemPromptPromise;

  systemPromptPromise = (async () => {
    try {
      const catalog = createKumoCatalog({
        customComponents: CUSTOM_COMPONENTS,
      });
      await initCatalog(catalog);
      const prompt = catalog.generatePrompt({
        components: [...PROMPT_COMPONENTS],
        maxPropsPerComponent: 8,
      });
      systemPromptCache = prompt;
      return prompt;
    } catch (err) {
      // Clear promise so next request retries instead of caching the rejection.
      systemPromptPromise = null;
      throw err;
    }
  })();

  return systemPromptPromise;
}

/**
 * POST /api/chat — SSE streaming endpoint for Kumo generative UI.
 *
 * Accepts: { message: string; history?: Array<{ role, content }> }
 * Returns: text/event-stream with Workers AI text generation output
 *
 * Rate limited: 20 req/min per IP via CHAT_RATE_LIMIT binding.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;

  // --- Rate limiting ---
  const clientIp = request.headers.get("cf-connecting-ip");

  try {
    // In dev/preview, this header is often missing; avoid collapsing
    // all users into a single "unknown" rate-limit bucket.
    if (clientIp) {
      const { success } = await env.CHAT_RATE_LIMIT.limit({ key: clientIp });
      if (!success) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again in a minute." }),
          {
            status: 429,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }
  } catch (rateLimitErr) {
    console.error("[chat] rate limiter unavailable:", rateLimitErr);
    if (!import.meta.env.DEV) {
      return new Response(
        JSON.stringify({ error: "Rate limiting unavailable. Try again." }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // --- Parse request body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const chatRequest = parseChatRequest(body);
  if (!chatRequest) {
    return new Response(
      JSON.stringify({
        error:
          "Invalid request. Expected { message: string; history?: Array<{ role, content }> }",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Build message array ---
  let systemPrompt: string;
  try {
    systemPrompt = await getSystemPrompt();
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to generate system prompt." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const messages: AiMessage[] = [{ role: "system", content: systemPrompt }];

  // Append conversation history (clamp to last 20 turns to avoid token overflow)
  const MAX_HISTORY_TURNS = 20;
  if (chatRequest.history) {
    const recentHistory = chatRequest.history.slice(-MAX_HISTORY_TURNS);
    for (const entry of recentHistory) {
      if (entry.role === "user" || entry.role === "assistant") {
        messages.push({ role: entry.role, content: entry.content });
      }
    }
  }

  // Append current user message
  messages.push({ role: "user", content: chatRequest.message });

  // --- Aggregate token budget check (user + history only; system prompt is server-controlled) ---
  const userChars = messages.reduce(
    (sum, m) => (m.role === "system" ? sum : sum + m.content.length),
    0,
  );
  if (userChars > MAX_TOTAL_MESSAGE_CHARS) {
    return new Response(
      JSON.stringify({
        error: "Conversation too long. Please start a new chat.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // --- Stream from Workers AI ---
  try {
    const aiOptions = import.meta.env.DEV
      ? undefined
      : {
          gateway: {
            id: AI_GATEWAY_ID,
            cacheTtl: 0,
          },
        };

    const stream = await env.AI.run(
      MODEL_ID,
      {
        messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0,
      },
      aiOptions,
    );

    // Workers AI returns a ReadableStream in SSE format when stream: true
    if (stream instanceof ReadableStream) {
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming fallback (shouldn't happen with stream: true)
    const result = stream as Record<string, unknown>;
    const text = typeof result.response === "string" ? result.response : "";
    const encoder = new TextEncoder();
    const fallbackStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`),
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(fallbackStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat] AI error:", err);
    return new Response(
      JSON.stringify({ error: "AI service temporarily unavailable." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
};
