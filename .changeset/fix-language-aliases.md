---
"@cloudflare/kumo": patch
---

Fix language alias normalization in ShikiProvider

- Add `normalizeLanguage()` function that maps common language aliases (js, ts, sh, yml, py, md, gql) to their canonical SupportedLanguage names
- Normalize language aliases in `ShikiProvider` when preloading grammars, so passing `['js', 'ts']` works the same as `['javascript', 'typescript']`
- Normalize language aliases in `highlight()` hook at runtime, so code fences using `js` or `ts` highlight correctly without warnings
- Export `normalizeLanguage` from `@cloudflare/kumo/code` for consumers who need to normalize aliases themselves
- Intentionally omit `mdx` alias since MDX has a distinct grammar that would lose JSX highlighting if mapped to `markdown`
