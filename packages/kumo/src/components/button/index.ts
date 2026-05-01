export {
  Button,
  RefreshButton,
  LinkButton,
  buttonVariants,
  type ButtonProps,
  type LinkButtonProps,
} from "./button";

/**
 * Components from this directory that should be surfaced individually in the
 * generated component registry (and therefore in the CLI, docs PropsTable,
 * Figma plugin, and search). Read by `scripts/component-registry/discovery.ts`.
 *
 * Each entry must correspond to an exported component plus a `${name}Props`
 * type in `button.tsx`. Directories without this export remain
 * single-component (legacy behavior).
 */
export const KUMO_REGISTRY_COMPONENTS = [
  "Button",
  "LinkButton",
  "RefreshButton",
] as const;
