import type { AstroIntegration } from "astro";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { glob } from "fs/promises";
import { htmlToMarkdown } from "./html-to-markdown.js";

/**
 * Astro integration that serves and generates Markdown versions of doc pages.
 *
 * Dev mode: Vite middleware intercepts .md requests, fetches the corresponding
 * HTML page from the dev server, and converts it to Markdown on the fly.
 *
 * Build: After the build completes, reads each generated HTML file from the
 * output directory and writes a corresponding .md file (e.g., dist/components/badge.md).
 *
 * These .md files are used by the "Copy page" and "View as Markdown" features,
 * as well as Claude/ChatGPT integration URLs.
 */
export function markdownPages(): AstroIntegration {
  return {
    name: "markdown-pages",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ?? "";
          if (!url.endsWith(".md")) return next();

          // /components/badge.md -> /components/badge/
          const htmlPath = url.replace(/\.md$/, "/");

          try {
            // Fetch the HTML page from the dev server
            const address = server.httpServer?.address();
            const port =
              address && typeof address === "object" ? address.port : 4321;
            const pageUrl = `http://localhost:${port}${htmlPath}`;

            const response = await fetch(pageUrl, {
              headers: { Accept: "text/html" },
            });

            if (!response.ok) {
              res.statusCode = 404;
              res.end("Page not found");
              return;
            }

            const html = await response.text();
            const markdown = htmlToMarkdown(html);

            res.setHeader("Content-Type", "text/markdown; charset=utf-8");
            res.end(markdown);
          } catch (error) {
            console.error(`[markdown-pages] Failed to convert ${url}:`, error);
            res.statusCode = 500;
            res.end("Internal server error");
          }
        });
      },

      "astro:build:done": async ({ dir, logger }) => {
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
