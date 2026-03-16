import type { AstroIntegration } from "astro";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { glob } from "fs/promises";

/**
 * Astro integration that generates Markdown versions of HTML pages at build time.
 *
 * After the build completes, it reads each generated HTML file from the output
 * directory, extracts the <main> content, converts it to Markdown via turndown,
 * and writes a corresponding .md file (e.g., dist/components/button.md).
 *
 * These static .md files are served in production for:
 * - "View Page as Markdown" links
 * - Claude/ChatGPT integration URLs
 */
export function markdownPages(): AstroIntegration {
  return {
    name: "markdown-pages",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        // Dynamic import to avoid loading turndown during dev server startup
        const { htmlToMarkdown } = await import("./html-to-markdown.js");

        const outDir = dir.pathname;
        let generated = 0;
        let skipped = 0;

        // Find all index.html files in the output directory
        const htmlFiles: string[] = [];
        for await (const entry of glob(join(outDir, "**/index.html"))) {
          htmlFiles.push(entry);
        }

        for (const htmlFile of htmlFiles) {
          try {
            const html = await readFile(htmlFile, "utf-8");

            // Only generate .md for pages that have a <main> element
            // (i.e., doc pages using DocLayout, not the homepage or special pages)
            if (!/<main[^>]*>/i.test(html)) {
              skipped++;
              continue;
            }

            const markdown = htmlToMarkdown(html);

            // Write .md as a sibling to the directory
            // e.g., dist/components/badge/index.html -> dist/components/badge.md
            const mdFile = htmlFile.replace(/\/index\.html$/, ".md");
            await writeFile(mdFile, markdown, "utf-8");
            generated++;
          } catch (error) {
            logger.warn(
              `Failed to generate markdown for ${htmlFile}: ${error}`,
            );
            skipped++;
          }
        }

        logger.info(
          `Generated ${generated} markdown pages (${skipped} skipped)`,
        );
      },
    },
  };
}
