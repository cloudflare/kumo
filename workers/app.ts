import { createRequestHandler } from "react-router";

interface Env {
  OPENAI_API_KEY?: string;
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    // Cache static pages for 1 hour
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    // Try to get from cache first
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // Not in cache, render with React Router
      response = await requestHandler(request, {
        cloudflare: { env, ctx },
      });
      
      // Cache successful GET requests for static pages
      if (request.method === "GET" && response.status === 200 && !url.pathname.startsWith("/api/")) {
        response = new Response(response.body, response);
        response.headers.set("Cache-Control", "public, max-age=3600");
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }
    
    return response;
  },
} satisfies ExportedHandler<Env>;
