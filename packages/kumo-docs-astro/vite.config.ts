import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    jsPlugins: [
      "../../lint/kumo-plugin.js",
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    plugins: ["eslint", "typescript", "unicorn", "oxc", "jsx-a11y"],
    categories: {
      correctness: "error",
      suspicious: "warn",
    },
    rules: {
      "kumo/no-tailwind-dark-variant": "error",
      "kumo/no-primitive-colors": "error",
      "kumo/no-cross-package-imports": "error",
      "kumo/no-flow-node-custom-render": "error",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/no-unnecessary-template-expression": "off",
      "typescript/no-unnecessary-type-assertion": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
});
