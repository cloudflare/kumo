import type { APIRoute } from "astro";
import { htmlToMarkdown } from "../lib/html-to-markdown";

/**
 * Dev-mode API endpoint that serves page content as Markdown.
 *
 * Handles requests like /components/badge.md by fetching the corresponding
 * HTML page (/components/badge/) and converting it to Markdown via turndown.
 *
 * In production, static .md files from the build integration serve these URLs
 * instead — this endpoint is excluded from the build via `prerender = false`.
 */
export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const pagePath = params.path ?? "";

  // Build the URL for the corresponding HTML page
  // e.g., path "components/badge" -> /components/badge/
  const htmlPath = `/${pagePath}/`;
  const pageUrl = new URL(htmlPath, url.origin);

  try {
    const response = await fetch(pageUrl.toString(), {
      headers: { Accept: "text/html" },
    });

    if (!response.ok) {
      return new Response(`Page not found: ${htmlPath}`, { status: 404 });
    }

    const html = await response.text();
    const markdown = htmlToMarkdown(html);

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[markdown-endpoint] Failed to convert /${pagePath}:`,
      message,
    );
    return new Response(`Failed to generate markdown: ${message}`, {
      status: 500,
    });
  }
};
