---
"@cloudflare/kumo": minor
---

Expose `--font-scale` as a hookable multiplier on every font-size token.

- Every font-size token (`--text-xs`/`sm`/`base`/`lg`/`xl`/`2xl`) is now emitted as `calc(<base> * var(--font-scale, 1))`. The default multiplier (`1`) lives in the `var()` fallback, so no `:root` rule is emitted — consumers can override `--font-scale` at any scope without fighting `:root` specificity.
- Line-heights stay as raw ratios and multiply against the already-scaled font-size at use time, so they grow naturally.
- No named presets ship with the library. Density modes are an application-level UX concern; consumers who want a "compact" or "comfortable" mode declare their own selectors (e.g. `[data-density="compact"] { --font-scale: 0.875; }`) in their own stylesheet.
- Recommendation for consumer presets: pick multipliers that are terminating decimals so every scaled size is also a terminating decimal — `0.875` (7/8) and `1.125` (9/8) work cleanly; `12/13` and `14/13` produce infinite decimals like `13.9997px` that read as floating-point noise in DevTools.

No visual regression at the default multiplier.
