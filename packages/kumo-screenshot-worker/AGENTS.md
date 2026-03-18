# Screenshot Worker (`@cloudflare/kumo-screenshot-worker`)

Cloudflare Worker that uses Puppeteer + Browser Rendering to capture screenshots of Kumo docs pages. Used for visual regression testing.

**Parent:** See [root AGENTS.md](../../AGENTS.md) for monorepo context.

## STRUCTURE

```
kumo-screenshot-worker/
├── src/
│   └── index.ts          # Worker entry — auth, validation, screenshot logic
├── wrangler.jsonc        # Worker config (no secrets committed)
├── tsconfig.json         # Workers + DOM lib (DOM needed for evaluate() callbacks)
├── .dev.vars.example     # Template for local secrets
└── AGENTS.md             # This file
```

## SETUP

**Local dev:**

```bash
cp .dev.vars.example .dev.vars   # then fill in API_KEY
pnpm --filter @cloudflare/kumo-screenshot-worker dev
```

**Deploy:**

```bash
# Set secret (one-time per environment):
pnpm --filter @cloudflare/kumo-screenshot-worker exec wrangler secret put API_KEY

# Deploy:
pnpm --filter @cloudflare/kumo-screenshot-worker deploy
```

## SECRETS

| Name      | How set                       | Description                                      |
| --------- | ----------------------------- | ------------------------------------------------ |
| `API_KEY` | `wrangler secret put API_KEY` | Shared secret sent as `X-API-Key` request header |

**Never commit secret values.** `.dev.vars` is gitignored at the root level.

## API

All requests require `X-API-Key: <API_KEY>` header.

### `POST /batch`

```json
{
  "baseUrl": "https://kumo-ui.com",
  "pages": [
    {
      "url": "/components/button",
      "captureSections": true,
      "viewport": { "width": 1440, "height": 900 }
    }
  ]
}
```

Returns `{ results: ScreenshotResult[] }` where each result has a base64-encoded `image` or an `error` string.

**Limits:** max 50 pages per batch, max 64 KB per `css`/`js` action payload.

### Section Capture

When `captureSections: true`, the worker looks for elements with `data-vr-demo`, `data-vr-section`, and `data-vr-title` attributes in the DOM. These are set via `vrSection` and `vrTitle` props on `ComponentExample.astro` in the docs site.

## SECURITY NOTES

- **URL validation**: all URLs are validated as `https://` (or `http://localhost`). Private IP ranges and cloud-metadata endpoints are blocked to prevent SSRF.
- **Selector injection prevention**: `sectionSelector` from the request is passed as a parameter to `page.evaluate()`, never interpolated into eval strings.
- **`action.js`**: executes arbitrary JavaScript in the browser context. This is intentional — callers are trusted via `API_KEY`. Never expose the worker without the auth check.
- **CORS**: currently `*` (permissive). Acceptable for server-to-server use. Restrict to specific origins if the worker is ever called from a browser.

## COMMANDS

```bash
pnpm --filter @cloudflare/kumo-screenshot-worker dev        # Local dev server
pnpm --filter @cloudflare/kumo-screenshot-worker deploy     # Deploy to Cloudflare
pnpm --filter @cloudflare/kumo-screenshot-worker typecheck  # TypeScript check
pnpm --filter @cloudflare/kumo-screenshot-worker lint       # oxlint
```

## NOTES

- `tsconfig.json` includes `"DOM"` in `lib` — required so TypeScript understands the DOM code inside `page.evaluate()` callbacks, even though the Worker host has no DOM.
- `Buffer` usage requires `nodejs_compat` flag in `wrangler.toml` (already set).
- A fresh browser page is created per URL to prevent cookie/localStorage/style bleed between pages.
- External endpoint: `kumo-screenshot-worker.design-engineering.workers.dev`
