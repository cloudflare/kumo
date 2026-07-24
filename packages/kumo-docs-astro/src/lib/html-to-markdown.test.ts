import { describe, expect, it } from "vite-plus/test";
import { htmlToMarkdown, normalizeTableWhitespace } from "./html-to-markdown";

const compact =
  "<main><table><thead><tr><th>Token</th><th>Use</th></tr></thead><tbody><tr><td><code>bg-kumo-elevated</code></td><td>Slightly elevated surface</td></tr></tbody></table></main>";

const formatted = `<main>
  <table>
    <thead>
      <tr>
        <th>Token</th>
        <th>Use</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <code>bg-kumo-elevated</code>
        </td>
        <td>
          Slightly elevated surface
        </td>
      </tr>
    </tbody>
  </table>
</main>`;

describe("normalizeTableWhitespace", () => {
  it("collapses formatted table markup to the compact form", () => {
    expect(normalizeTableWhitespace(formatted).trim()).toContain(
      "<table><thead><tr><th>Token</th>",
    );
  });

  it("leaves non-table content untouched", () => {
    const html = "<p>keep\n  these\n  lines</p>";
    expect(normalizeTableWhitespace(html)).toBe(html);
  });
});

describe("htmlToMarkdown table robustness", () => {
  it("preserves significant spaces between inline elements in cells", () => {
    const html =
      "<main><table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr>\n  <td>\n    <code>sm</code> <code>base</code>\n  </td>\n  <td>x</td>\n</tr></tbody></table></main>";
    expect(htmlToMarkdown(html)).toContain("| `sm` `base` | x |");
  });

  it("renders block elements inside cells inline (MDX paragraph-wrapping)", () => {
    const withParagraphs =
      "<main><table><thead><tr><th>Token</th><th>Use</th></tr></thead><tbody><tr><td><code>bg-kumo-elevated</code></td><td><p>Slightly elevated surface</p></td></tr></tbody></table></main>";
    const md = htmlToMarkdown(withParagraphs);
    expect(md).toContain("| `bg-kumo-elevated` | Slightly elevated surface |");
  });

  it("produces identical valid tables from compact and formatted markup", () => {
    const a = htmlToMarkdown(compact);
    const b = htmlToMarkdown(formatted);
    expect(b).toBe(a);
    expect(b).toContain("| `bg-kumo-elevated` | Slightly elevated surface |");
  });
});
