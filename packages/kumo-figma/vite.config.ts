import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules"],
  },
  pack: {
    entry: ["src/code.ts"],
    // Figma plugin main-thread bundle: single IIFE, ES2017 sandbox.
    format: "iife",
    target: "es2017",
    platform: "browser",
    outDir: "src",
    // outDir is src/ — never clean it.
    clean: false,
    dts: false,
    sourcemap: false,
    // Figma plugins run sandboxed: bundle everything, no externals.
    deps: { alwaysBundle: /.+/ },
    outputOptions: {
      entryFileNames: "code.js",
    },
  },
});
