import puppeteer, { ElementHandle } from "@cloudflare/puppeteer";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_PAGES = 50;
const MAX_ACTION_PAYLOAD_BYTES = 64_000; // 64 KB per css/js action payload

// Selectors for sections to skip in captureSections mode.
const SKIP_SECTION_IDS = [
  "barrel",
  "granular",
  "installation",
  "usage",
  "api-reference",
];

const DEFAULT_SECTION_SELECTOR = 'main h3 a[href^="#"]';

const HIDE_SIDEBAR_CSS = `
  aside[data-sidebar-open] { display: none !important; }
  .main-content { margin-left: 0 !important; }
`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Env {
  BROWSER: Fetcher;
  API_KEY: string;
}

interface PageAction {
  type: "click" | "wait" | "hover" | "css" | "js";
  selector?: string;
  // For "wait": how long to pause (ms). For other types: extra delay after the action (ms).
  waitAfter?: number;
  css?: string;
  // NOTE: "js" actions execute arbitrary JavaScript in the browser context.
  // This is intentional — callers are trusted via the API_KEY secret.
  // Never expose this worker publicly without the auth check.
  js?: string;
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
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const apiKey = request.headers.get("X-API-Key");
    if (!apiKey || apiKey !== env.API_KEY) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const url = new URL(request.url);

    if (url.pathname === "/batch" && request.method === "POST") {
      return handleBatch(request, env);
    }

    return Response.json(
      { error: "Not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  },
};

// ─── Batch handler ───────────────────────────────────────────────────────────

async function handleBatch(request: Request, env: Env): Promise<Response> {
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
      { status: 400, headers: CORS_HEADERS },
    );
  }

  if (pages.length > MAX_PAGES) {
    return Response.json(
      { error: `Too many pages: max ${MAX_PAGES}, got ${pages.length}` },
      { status: 400, headers: CORS_HEADERS },
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
        { status: 400, headers: CORS_HEADERS },
      );
    }
  }

  // Validate per-page action payloads to avoid giant JS/CSS strings.
  for (const pageConfig of pages) {
    for (const action of pageConfig.actions ?? []) {
      if (action.css && action.css.length > MAX_ACTION_PAYLOAD_BYTES) {
        return Response.json(
          { error: "css action payload exceeds 64 KB limit" },
          { status: 400, headers: CORS_HEADERS },
        );
      }
      if (action.js && action.js.length > MAX_ACTION_PAYLOAD_BYTES) {
        return Response.json(
          { error: "js action payload exceeds 64 KB limit" },
          { status: 400, headers: CORS_HEADERS },
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
          const sectionSelector =
            pageConfig.sectionSelector || DEFAULT_SECTION_SELECTOR;

          // Pass selector as a parameter — never interpolate caller input into eval strings.
          const sections = await page.evaluate(
            (sel: string, skipIds: string[]) => {
              const found: Array<{ id: string; title: string }> = [];
              const examplesAnchor = document.querySelector(
                'main h2 a[href="#examples"]',
              );
              const examplesParent = examplesAnchor
                ? examplesAnchor.closest("section, div")
                : null;

              document.querySelectorAll(sel).forEach((a) => {
                const href = a.getAttribute("href");
                if (!href || !href.startsWith("#")) return;
                const id = href.replace("#", "");
                if (skipIds.includes(id)) return;

                const title = a.textContent?.trim() ?? "";
                const container = a.closest(
                  'div.mb-12, section.mb-12, div[class*="mb-"]',
                );
                if (
                  examplesParent &&
                  container &&
                  !examplesParent.contains(container)
                )
                  return;
                if (container && id) {
                  found.push({ id, title });
                }
              });
              return found;
            },
            sectionSelector,
            SKIP_SECTION_IDS,
          );

          for (const section of sections) {
            // Use evaluateHandle to walk to the nearest mb-12 ancestor from the heading.
            const containerHandle = await page.evaluateHandle((id: string) => {
              const anchor = document.querySelector(`#${id}`);
              return anchor
                ? anchor.closest('div.mb-12, section.mb-12, div[class*="mb-"]')
                : null;
            }, section.id);
            const container =
              containerHandle.asElement() as ElementHandle<Element> | null;

            if (container) {
              await container.scrollIntoView();
              await new Promise((r) => setTimeout(r, 200));
              const shot = await container.screenshot({ type: "png" });
              results.push({
                url: fullUrl,
                sectionId: section.id,
                sectionTitle: section.title,
                image: Buffer.from(shot).toString("base64"),
              });
            }
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

    return Response.json({ results }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: CORS_HEADERS },
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

    case "js":
      // Executes arbitrary JS supplied by the caller. This is intentional —
      // callers are trusted via the API_KEY secret. Never expose the worker
      // publicly without the auth check in place.
      if (action.js) {
        await page.evaluate(action.js);
      }
      break;
  }

  if (action.waitAfter && action.type !== "wait") {
    await new Promise((r) => setTimeout(r, action.waitAfter));
  }
}
