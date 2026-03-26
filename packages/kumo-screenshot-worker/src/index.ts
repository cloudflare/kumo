import puppeteer from "@cloudflare/puppeteer";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_PAGES = 50;
const MAX_ACTION_PAYLOAD_BYTES = 64_000; // 64 KB per css action payload

const HIDE_SIDEBAR_CSS = `
  aside[data-sidebar-open] { display: none !important; }
  .main-content { margin-left: 0 !important; }
`;

// Allowed origins for CORS. Restricted to known Cloudflare hosts — the worker
// is internal tooling and should never be called from arbitrary origins.
const ALLOWED_ORIGINS = [
  "https://kumo-ui.com",
  /^https:\/\/[a-z0-9-]+-kumo-docs\.design-engineering\.workers\.dev$/,
  /^https:\/\/[a-z0-9-]+\.kumo-docs\.pages\.dev$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin !== null &&
    ALLOWED_ORIGINS.some((o) =>
      typeof o === "string" ? o === origin : o.test(origin),
    );
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Env {
  BROWSER: Fetcher;
  API_KEY: string;
}

interface PageAction {
  type: "click" | "wait" | "hover" | "css";
  selector?: string;
  // For "wait": how long to pause (ms). For other types: extra delay after the action (ms).
  waitAfter?: number;
  css?: string;
  timeout?: number;
}

interface PageConfig {
  url: string;
  actions?: PageAction[];
  fullPage?: boolean;
  selector?: string;
  viewport?: { width: number; height: number };
  hideSidebar?: boolean;
  captureSections?: boolean;
  sectionSelector?: string;
}

interface BatchRequest {
  baseUrl: string;
  pages: PageConfig[];
  viewport?: { width: number; height: number };
  hideSidebar?: boolean;
}

interface ScreenshotResult {
  url: string;
  sectionId?: string;
  sectionTitle?: string;
  image?: string;
  error?: string;
  debug?: {
    dimensions?: { width: number; height: number };
    viewport?: { width: number; height: number };
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validates that a URL is safe to navigate to:
 * - Must be https:// (or http://localhost for local dev)
 * - Must not target private/cloud-metadata IP ranges
 */
function validateUrl(
  rawUrl: string,
): { ok: true; url: string } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, error: `Invalid URL: ${rawUrl}` };
  }

  const { protocol, hostname } = parsed;

  // Only allow https (or http for localhost in dev)
  const isHttps = protocol === "https:";
  const isLocalhost =
    protocol === "http:" &&
    (hostname === "localhost" || hostname === "127.0.0.1");
  if (!isHttps && !isLocalhost) {
    return {
      ok: false,
      error: `URL must use https (got: ${protocol}//${hostname})`,
    };
  }

  // Block cloud metadata and private IP ranges
  const privatePatterns = [
    /^169\.254\./, // AWS/GCP metadata (link-local)
    /^10\./, // RFC 1918
    /^172\.(1[6-9]|2\d|3[01])\./, // RFC 1918
    /^192\.168\./, // RFC 1918
    /^100\.64\./, // CGNAT
    /^::1$/, // IPv6 loopback
    /^fc00:/, // IPv6 ULA
    /^fd[0-9a-f]{2}:/i, // IPv6 ULA
    /^metadata\.google\.internal$/,
  ];

  for (const pattern of privatePatterns) {
    if (pattern.test(hostname)) {
      return {
        ok: false,
        error: `URL targets a private/reserved address: ${hostname}`,
      };
    }
  }

  return { ok: true, url: parsed.toString() };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = getCorsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const apiKey = request.headers.get("X-API-Key");
    if (!apiKey || apiKey !== env.API_KEY) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: cors },
      );
    }

    const url = new URL(request.url);

    if (url.pathname === "/batch" && request.method === "POST") {
      return handleBatch(request, env, cors);
    }

    return Response.json(
      { error: "Not found" },
      { status: 404, headers: cors },
    );
  },
};

// ─── Batch handler ───────────────────────────────────────────────────────────

async function handleBatch(
  request: Request,
  env: Env,
  cors: Record<string, string>,
): Promise<Response> {
  const body = (await request.json()) as BatchRequest;
  const {
    baseUrl,
    pages,
    viewport: globalViewport,
    hideSidebar: globalHideSidebar,
  } = body;

  // ── Input validation ──────────────────────────────────────────────────────

  if (!Array.isArray(pages) || pages.length === 0) {
    return Response.json(
      { error: "pages must be a non-empty array" },
      { status: 400, headers: cors },
    );
  }

  if (pages.length > MAX_PAGES) {
    return Response.json(
      { error: `Too many pages: max ${MAX_PAGES}, got ${pages.length}` },
      { status: 400, headers: cors },
    );
  }

  // Validate baseUrl early so we catch misconfigured callers immediately.
  if (baseUrl) {
    const baseCheck = validateUrl(
      baseUrl.endsWith("/") ? baseUrl + "_" : baseUrl + "/_",
    );
    if (!baseCheck.ok) {
      return Response.json(
        { error: `Invalid baseUrl: ${baseCheck.error}` },
        { status: 400, headers: cors },
      );
    }
  }

  // Validate per-page action payloads to avoid oversized CSS strings.
  for (const pageConfig of pages) {
    for (const action of pageConfig.actions ?? []) {
      if (action.css && action.css.length > MAX_ACTION_PAYLOAD_BYTES) {
        return Response.json(
          { error: "css action payload exceeds 64 KB limit" },
          { status: 400, headers: cors },
        );
      }
    }
  }

  // ── Screenshot loop ───────────────────────────────────────────────────────

  const defaultViewport = globalViewport || { width: 1440, height: 900 };
  const results: ScreenshotResult[] = [];

  let browser;
  try {
    browser = await puppeteer.launch(env.BROWSER);

    for (const pageConfig of pages) {
      // Resolve and validate the full URL for this page.
      const rawUrl = pageConfig.url.startsWith("http")
        ? pageConfig.url
        : `${baseUrl}${pageConfig.url}`;

      const urlCheck = validateUrl(rawUrl);
      if (!urlCheck.ok) {
        results.push({ url: rawUrl, error: urlCheck.error });
        continue;
      }
      const fullUrl = urlCheck.url;

      // Create a fresh page per URL to prevent cookie/localStorage/style bleed.
      const page = await browser.newPage();

      try {
        const viewport = pageConfig.viewport || defaultViewport;
        await page.setViewport(viewport);

        await page.goto(fullUrl, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });

        const shouldHideSidebar = pageConfig.hideSidebar ?? globalHideSidebar;
        if (shouldHideSidebar) {
          await page.addStyleTag({ content: HIDE_SIDEBAR_CSS });
          await new Promise((r) => setTimeout(r, 100));
        }

        if (pageConfig.actions) {
          for (const action of pageConfig.actions) {
            await executeAction(page, action);
          }
        }

        if (pageConfig.captureSections) {
          // Find all elements with data-vr-demo attribute
          const demoElements = await page.$$("[data-vr-demo]");

          if (demoElements.length > 0) {
            // Use explicit VR demo elements
            for (const element of demoElements) {
              const attrs = await element.evaluate((el: Element) => ({
                sectionId: el.getAttribute("data-vr-section"),
                sectionTitle: el.getAttribute("data-vr-title"),
              }));

              if (attrs.sectionId) {
                await element.scrollIntoView();
                await new Promise((r) => setTimeout(r, 200));
                const shot = await element.screenshot({ type: "png" });
                results.push({
                  url: fullUrl,
                  sectionId: attrs.sectionId,
                  sectionTitle: attrs.sectionTitle || attrs.sectionId,
                  image: Buffer.from(shot).toString("base64"),
                });
              }
            }
          } else {
            // Fallback: full page screenshot if no VR demo elements found
            const shot = await page.screenshot({ type: "png" });
            results.push({
              url: fullUrl,
              image: Buffer.from(shot).toString("base64"),
            });
          }
        } else if (pageConfig.selector) {
          const element = await page.$(pageConfig.selector);
          if (element) {
            const shot = await element.screenshot({ type: "png" });
            results.push({
              url: fullUrl,
              image: Buffer.from(shot).toString("base64"),
            });
          } else {
            throw new Error(`Selector not found: ${pageConfig.selector}`);
          }
        } else {
          const shouldFullPage = pageConfig.fullPage ?? true;

          if (shouldFullPage) {
            const dimensions = await page.evaluate(() => {
              const main = document.querySelector("main");
              let contentHeight = 0;

              if (main) {
                let parent = main.parentElement;
                while (parent && parent !== document.body) {
                  const style = window.getComputedStyle(parent);
                  if (
                    style.overflow === "auto" ||
                    style.overflow === "scroll" ||
                    style.overflowY === "auto" ||
                    style.overflowY === "scroll"
                  ) {
                    contentHeight = parent.scrollHeight;
                    break;
                  }
                  parent = parent.parentElement;
                }
                if (contentHeight === 0) {
                  contentHeight = main.scrollHeight;
                }
              }

              const bodyHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body.scrollHeight,
                document.documentElement.clientHeight,
              );

              const finalHeight = Math.max(contentHeight, bodyHeight);

              const width = Math.max(
                document.documentElement.scrollWidth,
                document.body.scrollWidth,
                document.documentElement.clientWidth,
              );

              return { width, height: finalHeight };
            });

            await page.addStyleTag({
              content: `
                html, body { height: auto !important; min-height: auto !important; overflow: visible !important; }
                [style*="overflow: auto"], [style*="overflow: scroll"],
                [style*="overflow-y: auto"], [style*="overflow-y: scroll"] {
                  overflow: visible !important;
                  height: auto !important;
                  max-height: none !important;
                }
              `,
            });
            await new Promise((r) => setTimeout(r, 200));

            const newViewport = {
              width: Math.max(dimensions.width, viewport.width),
              height: Math.max(dimensions.height, viewport.height),
            };
            await page.setViewport(newViewport);
            await new Promise((r) => setTimeout(r, 300));

            const shot = await page.screenshot({ type: "png" });
            results.push({
              url: fullUrl,
              image: Buffer.from(shot).toString("base64"),
              debug: { dimensions, viewport: newViewport },
            });
          } else {
            const shot = await page.screenshot({ type: "png" });
            results.push({
              url: fullUrl,
              image: Buffer.from(shot).toString("base64"),
            });
          }
        }
      } catch (error) {
        results.push({
          url: fullUrl,
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        await page.close();
      }
    }

    return Response.json({ results }, { headers: cors });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: cors },
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ─── Action executor ─────────────────────────────────────────────────────────

type PuppeteerPage = Awaited<
  ReturnType<Awaited<ReturnType<typeof puppeteer.launch>>["newPage"]>
>;

async function executeAction(
  page: PuppeteerPage,
  action: PageAction,
): Promise<void> {
  switch (action.type) {
    case "click":
      if (action.selector) {
        await page.waitForSelector(action.selector, {
          timeout: action.timeout || 5000,
        });
        await page.click(action.selector);
      }
      break;

    case "hover":
      if (action.selector) {
        await page.waitForSelector(action.selector, {
          timeout: action.timeout || 5000,
        });
        await page.hover(action.selector);
      }
      break;

    case "wait":
      // waitAfter doubles as the wait duration for this action type.
      await new Promise((r) => setTimeout(r, action.waitAfter || 1000));
      break;

    case "css":
      if (action.css) {
        await page.addStyleTag({ content: action.css });
      }
      break;
  }

  if (action.waitAfter && action.type !== "wait") {
    await new Promise((r) => setTimeout(r, action.waitAfter));
  }
}
