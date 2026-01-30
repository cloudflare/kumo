/**
 * Type declarations for virtual:kumo-registry module.
 * Provides component registry data from the AI metadata.
 */
declare module "virtual:kumo-registry" {
  import type { ComponentRegistry } from "@cloudflare/kumo";

  /** Component registry markdown content for documentation */
  export const kumoRegistryMarkdown: string;

  /** Typed component registry JSON */
  export const kumoRegistryJson: ComponentRegistry;
}
