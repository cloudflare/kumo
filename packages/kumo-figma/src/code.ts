/**
 * Kumo UI Kit Generator - Main Plugin Entry Point
 *
 * Generates Figma components from Kumo component definitions.
 * Runs destructive sync - purges and recreates all components on each run.
 *
 * Target file: sKKZc6pC6W1TtzWBLxDGSU (kumo-ai)
 */

import { generateBadgeComponents } from "./generators/badge";
import { generateBannerComponents } from "./generators/banner";
import { generateBreadcrumbsComponents } from "./generators/breadcrumbs";
import { generateButtonComponents } from "./generators/button";
import { generateCheckboxComponents } from "./generators/checkbox";
import { generateClipboardTextComponents } from "./generators/clipboard-text";
import { generateCodeComponents } from "./generators/code";
import { generateCodeBlockComponents } from "./generators/code-block";
import { generateCollapsibleComponents } from "./generators/collapsible";
import { generateCommandPaletteComponents } from "./generators/command-palette";
import { generateComboboxComponents } from "./generators/combobox";
import { generateDateRangePickerComponents } from "./generators/date-range-picker";
import { generateDialogComponents } from "./generators/dialog";
import { generateDropdownComponents } from "./generators/dropdown";
import { generateEmptyComponents } from "./generators/empty";
import { generateInputComponents } from "./generators/input";
import { generateInputAreaComponents } from "./generators/input-area";
import { generateLayerCardComponents } from "./generators/layer-card";
import { generateLabelComponents } from "./generators/label";
import { generateLinkComponents } from "./generators/link";
import { generateLoaderComponents } from "./generators/loader";
import { generateLinkButtonComponents } from "./generators/link-button";
import { generateMenuBarComponents } from "./generators/menubar";
import { generateMeterComponents } from "./generators/meter";

import { generatePaginationComponents } from "./generators/pagination";
import {
  generateRadioComponents,
  generateRadioGroupComponents,
} from "./generators/radio";
import { generateRefreshButtonComponents } from "./generators/refresh-button";
import { generateSelectComponents } from "./generators/select";
import { generateSensitiveInputComponents } from "./generators/sensitive-input";
import { generateSurfaceComponents } from "./generators/surface";
import {
  generateSwitchComponents,
  generateSwitchGroupComponents,
} from "./generators/switch";
import { generateTableComponents } from "./generators/table";
import { generateTabsComponents } from "./generators/tabs";
import { generateTextComponents } from "./generators/text";
import { generateToastComponents } from "./generators/toast";
import { generateTooltipComponents } from "./generators/tooltip";
import {
  initializeColorVariables,
  clearColorVariables,
} from "./generators/shared";
import { logInfo, logError } from "./logger";

figma.showUI(__html__, { width: 320, height: 220 });

/**
 * Page name for the UI kit (icons + components on same page)
 */
const UI_KIT_PAGE_NAME = "ui kit";

/**
 * Destructive sync: ensures only the UI Kit page exists.
 * - Creates UI Kit page if it doesn't exist
 * - Removes ALL other pages
 * - Purges all content from UI Kit page
 *
 * @returns The clean UI Kit page ready for generation
 */
function destructiveSyncPages(): PageNode {
  logInfo("🔄 Starting destructive sync...");

  // Step 1: Find or create UI Kit page
  let uiKitPage = figma.root.children.find(
    (page) =>
      page.type === "PAGE" &&
      page.name.trim().toLowerCase() === UI_KIT_PAGE_NAME,
  ) as PageNode | undefined;

  if (!uiKitPage) {
    logInfo("📄 Creating UI Kit page");
    uiKitPage = figma.createPage();
    uiKitPage.name = UI_KIT_PAGE_NAME;
  } else {
    logInfo("✅ Found existing UI Kit page");
  }

  // IMPORTANT: Switch away from the current page before removing others.
  // Figma can throw when attempting to remove the active page.
  if (figma.currentPage.id !== uiKitPage.id) {
    figma.currentPage = uiKitPage;
  }

  // Step 2: Remove ALL other pages (Figma requires at least one page, so we keep uiKitPage)
  const pagesToRemove = figma.root.children.filter(
    (page) => page.type === "PAGE" && page.id !== uiKitPage!.id,
  );

  if (pagesToRemove.length > 0) {
    logInfo(`🗑️ Removing ${pagesToRemove.length} other page(s)...`);
    for (const page of pagesToRemove) {
      logInfo(`   - Removing page: "${page.name}"`);
      page.remove();
    }
  }

  // Step 3: Purge all content from UI Kit page
  const children = [...uiKitPage.children];
  if (children.length > 0) {
    logInfo(`🗑️ Purging ${children.length} items from UI Kit page`);
    for (const node of children) {
      node.remove();
    }
  }

  logInfo("✅ Destructive sync complete - single clean page ready");
  return uiKitPage;
}

/**
 * Starting Y position for first section
 */
const START_Y = 100;

/**
 * Component generator configuration
 * Each entry defines a component generator with its display name and execution function
 */
type GeneratorConfig = {
  name: string;
  execute: (
    page: PageNode,
    currentY: number,
  ) => Promise<{ nextY: number } | void>;
};

figma.ui.onmessage = async (msg: { type: string }) => {
  if (msg.type === "generate") {
    try {
      figma.notify("Starting Kumo UI Kit generation...");

      // Destructive sync: remove all other pages, purge UI Kit page content
      const uiKitPage = destructiveSyncPages();
      figma.currentPage = uiKitPage;

      // Destructive sync: clear and recreate color variables
      logInfo("🎨 Syncing color variables...");
      clearColorVariables();
      initializeColorVariables();

      // Track Y position for sequential section placement
      let nextY = START_Y;

      /**
       * Generator registry - add new generators here in any order.
       * They will be auto-sorted alphabetically at runtime.
       *
       * Component generators registry - add new generators here in any order.
       * They will be auto-sorted alphabetically at runtime.
       */
      const GENERATORS: (GeneratorConfig & { priority?: boolean })[] = [
        {
          name: "Badge",
          execute: async (_page, y) => {
            const result = await generateBadgeComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Banner",
          execute: async (_page, y) => {
            const result = await generateBannerComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Breadcrumbs",
          execute: async (_page, y) => {
            const result = await generateBreadcrumbsComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Button",
          execute: async (page, y) => {
            const result = await generateButtonComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Checkbox",
          execute: async (page, y) => {
            const result = await generateCheckboxComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "ClipboardText",
          execute: async (_page, y) => {
            const result = await generateClipboardTextComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Code",
          execute: async (page, y) => {
            const result = await generateCodeComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "CodeBlock",
          execute: async (page, y) => {
            const result = await generateCodeBlockComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Collapsible",
          execute: async (_page, y) => {
            const result = await generateCollapsibleComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Combobox",
          execute: async (_page, y) => {
            const result = await generateComboboxComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "CommandPalette",
          execute: async (page, y) => {
            const result = await generateCommandPaletteComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "DateRangePicker",
          execute: async (page, y) => {
            const result = await generateDateRangePickerComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Dialog",
          execute: async (page, y) => {
            const result = await generateDialogComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Dropdown",
          execute: async (page, y) => {
            const result = await generateDropdownComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Empty",
          execute: async (_page, y) => {
            const result = await generateEmptyComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Input",
          execute: async (page, y) => {
            const result = await generateInputComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "InputArea",
          execute: async (page, y) => {
            const result = await generateInputAreaComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Label",
          execute: async (page, y) => {
            const result = await generateLabelComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "LayerCard",
          execute: async (page, y) => {
            const result = await generateLayerCardComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Link",
          execute: async (page, y) => {
            const result = await generateLinkComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "LinkButton",
          execute: async (page, y) => {
            const result = await generateLinkButtonComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Loader",
          execute: async (page, y) => {
            const result = await generateLoaderComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "MenuBar",
          execute: async (page, y) => {
            const result = await generateMenuBarComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Meter",
          execute: async (_page, y) => {
            const result = await generateMeterComponents(y);
            return { nextY: result };
          },
        },

        {
          name: "Pagination",
          execute: async (_page, y) => {
            const result = await generatePaginationComponents(y);
            return { nextY: result };
          },
        },
        {
          name: "Radio",
          execute: async (page, y) => {
            const result = await generateRadioComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Radio.Group",
          execute: async (page, y) => {
            const result = await generateRadioGroupComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "RefreshButton",
          execute: async (page, y) => {
            const result = await generateRefreshButtonComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Select",
          execute: async (page, y) => {
            const result = await generateSelectComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "SensitiveInput",
          execute: async (page, y) => {
            const result = await generateSensitiveInputComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Surface",
          execute: async (page, y) => {
            const result = await generateSurfaceComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Switch",
          execute: async (page, y) => {
            const result = await generateSwitchComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Switch.Group",
          execute: async (page, y) => {
            const result = await generateSwitchGroupComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Table",
          execute: async (page, y) => {
            const result = await generateTableComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Tabs",
          execute: async (page, y) => {
            const result = await generateTabsComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Text",
          execute: async (page, y) => {
            const result = await generateTextComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Toast",
          execute: async (page, y) => {
            const result = await generateToastComponents(page, y);
            return { nextY: result };
          },
        },
        {
          name: "Tooltip",
          execute: async (page, y) => {
            const result = await generateTooltipComponents(page, y);
            return { nextY: result };
          },
        },
      ];

      // Sort generators: priority items first, then alphabetically by name
      const sortedGenerators = [...GENERATORS].sort((a, b) => {
        // Priority items come first
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        // Then sort alphabetically
        return a.name.localeCompare(b.name);
      });

      // Dynamically calculated total from generator array
      const TOTAL_COMPONENTS = sortedGenerators.length;

      // Step 3: Execute all generators sequentially (sorted alphabetically, priority first)
      for (let i = 0; i < sortedGenerators.length; i++) {
        const generator = sortedGenerators[i];
        const componentIndex = i + 1;

        figma.notify(
          `Generating ${generator.name} (${componentIndex}/${TOTAL_COMPONENTS})...`,
        );

        const result = await generator.execute(uiKitPage, nextY);

        // Update nextY if generator returns a new position
        if (result && result.nextY !== undefined) {
          nextY = result.nextY;
        }
      }

      figma.notify("✅ Generation complete!", { timeout: 3000 });
      figma.closePlugin(
        `Generation complete - created ${TOTAL_COMPONENTS} component types with light + dark modes`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logError("Generation error:", error);

      // Provide specific error guidance based on error type
      let errorNotification = `Error: ${message}`;

      // Check for missing kumo-colors collection
      if (message.includes("kumo-colors") || message.includes("collection")) {
        errorNotification =
          "Missing kumo-colors collection. Run token sync first: npx tsx sync-tokens-to-figma.ts";
        logError(
          "Kumo semantic color tokens not found. Please sync tokens from CSS to Figma variables.",
        );
      }
      // Check for missing font
      else if (message.includes("font") || message.includes("Inter")) {
        errorNotification =
          "Missing Inter font. Please install the Inter font family and restart Figma.";
        logError(
          "Inter font family not available. Install from https://rsms.me/inter/",
        );
      }
      // Generic mid-generation failure
      else {
        logError(
          `Generation failed during component creation. Partial state may exist on Components page.`,
        );
      }

      figma.notify(errorNotification, { error: true, timeout: 5000 });
      figma.closePlugin();
    }
  }

  if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
