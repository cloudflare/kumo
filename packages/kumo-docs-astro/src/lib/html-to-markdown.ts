import TurndownService from "turndown";
// @ts-expect-error no type declarations available
import { gfm } from "turndown-plugin-gfm";

/**
 * Shared turndown configuration used by both the build-time Astro integration
 * and the dev-mode API endpoint for consistent Markdown output.
 */
export function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  // GitHub Flavored Markdown support (tables, strikethrough, task lists)
  turndown.use(gfm);

  // Remove script/style tags
  turndown.remove(["script", "style"]);

  // Remove Astro island/slot elements (React hydration wrappers)
  turndown.remove((node) => {
    const tag = node.nodeName.toLowerCase();
    return tag === "astro-island" || tag === "astro-slot";
  });

  // Skip nav, header, footer, and sidebar elements
  turndown.remove((node) => {
    const tag = node.nodeName.toLowerCase();

    if (["nav", "header", "footer", "aside"].includes(tag)) {
      return true;
    }

    // Remove elements with data-copy-ignore attribute
    if (
      "getAttribute" in node &&
      (node as Element).getAttribute("data-copy-ignore") !== null
    ) {
      return true;
    }

    return false;
  });

  return turndown;
}

/**
 * Extract page metadata and content from a full HTML page string
 * and convert to a well-structured Markdown document.
 */
export function htmlToMarkdown(html: string): string {
  const turndown = createTurndownService();
  const parts: string[] = [];

  // Extract title from the page header's <h1>
  const pageHeaderMatch = html.match(
    /<div[^>]*id="page-header"[^>]*>([\s\S]*?)<\/div>\s*(?=<!--\s*Content|<main)/i,
  );
  const pageHeader = pageHeaderMatch ? pageHeaderMatch[1] : "";

  const titleMatch = pageHeader.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
    : undefined;

  if (title) {
    parts.push(`# ${title}`);
  }

  // Extract description from the page header <p>
  const descMatch = pageHeader.match(
    /<p[^>]*class="[^"]*text-lg[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
  );
  const description = descMatch
    ? descMatch[1].replace(/<[^>]*>/g, "").trim()
    : undefined;

  if (description) {
    parts.push(description);
  }

  // Extract GitHub source URL
  const githubMatch = pageHeader.match(
    /href="(https:\/\/github\.com\/cloudflare\/kumo[^"]*)"/i,
  );
  if (githubMatch) {
    parts.push(`**Source:** [GitHub](${githubMatch[1]})`);
  }

  // Extract Base UI documentation URL
  const baseUIMatch = pageHeader.match(/href="(https:\/\/base-ui\.com[^"]*)"/i);
  if (baseUIMatch) {
    parts.push(`**Base UI:** [Documentation](${baseUIMatch[1]})`);
  }

  // Add separator between header and content
  if (parts.length > 0) {
    parts.push("---");
  }

  // Extract and convert <main> content
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const content = mainMatch ? mainMatch[1] : html;
  const mainMarkdown = turndown.turndown(content).trim();

  if (mainMarkdown) {
    parts.push(mainMarkdown);
  }

  return parts.join("\n\n");
}
