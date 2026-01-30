/**
 * Markdown generation for component registry.
 *
 * Generates AI-readable markdown documentation from the component registry.
 */

import type { ComponentRegistry } from "./types.js";
import {
  cleanupExample,
  shouldIncludeExample,
  isNearDuplicateExample,
  clearExampleSignatureCache,
} from "./example-cleanup.js";

// =============================================================================
// AI Context Generation
// =============================================================================

/**
 * Generate the complete markdown documentation for AI consumption.
 * Everything is derived from the component registry.
 */
export function generateAIContext(
  registry: ComponentRegistry,
  _componentColors: Map<string, string[]>,
): string {
  // Clear example signature cache for fresh duplicate detection
  clearExampleSignatureCache();

  let context = `# Kumo Component Registry

> Auto-generated component metadata for AI/agent consumption.

`;

  for (const [name, comp] of Object.entries(registry.components)) {
    context += `---\n\n`;
    context += `### ${name}\n\n`;
    context += `${comp.description}\n\n`;
    context += `**Type:** ${comp.type}\n\n`;
    context += `**Import:** \`import { ${name} } from "${comp.importPath}";\`\n\n`;
    context += `**Category:** ${comp.category}\n\n`;

    context += `**Props:**\n\n`;
    for (const [propName, prop] of Object.entries(comp.props)) {
      const required = prop.required ? " (required)" : "";
      const defaultVal = prop.default ? ` [default: ${prop.default}]` : "";
      context += `- \`${propName}\`: ${prop.type}${required}${defaultVal}\n`;

      if (prop.values && prop.descriptions) {
        for (const val of prop.values) {
          const desc = prop.descriptions[val];
          if (desc) {
            context += `  - \`"${val}"\`: ${desc}\n`;
          }
        }
      } else if (prop.description) {
        context += `  ${prop.description}\n`;
      }

      // Document state classes for variant props
      if (prop.stateClasses && Object.keys(prop.stateClasses).length > 0) {
        context += `\n  **State Classes:**\n`;
        for (const [variantValue, states] of Object.entries(
          prop.stateClasses,
        )) {
          context += `  - \`"${variantValue}"\`:\n`;
          for (const [stateName, stateClass] of Object.entries(states)) {
            context += `    - \`${stateName}\`: \`${stateClass}\`\n`;
          }
        }
      }
    }

    if (comp.colors.length > 0) {
      context += `\n**Colors (kumo tokens used):**\n\n`;
      context += `\`${comp.colors.join("`, `")}\`\n`;
    }

    // Document styling metadata (dimensions, states, icons)
    if (comp.styling) {
      context += `\n**Styling:**\n\n`;

      if (comp.styling.dimensions) {
        context += `- **Dimensions:** \`${comp.styling.dimensions}\`\n`;
      }
      if (comp.styling.borderRadius) {
        context += `- **Border Radius:** \`${comp.styling.borderRadius}\`\n`;
      }
      if (comp.styling.baseTokens && comp.styling.baseTokens.length > 0) {
        context += `- **Base Tokens:** \`${comp.styling.baseTokens.join("`, `")}\`\n`;
      }
      if (comp.styling.states && Object.keys(comp.styling.states).length > 0) {
        context += `- **States:**\n`;
        for (const [stateName, tokens] of Object.entries(comp.styling.states)) {
          context += `  - \`${stateName}\`: \`${tokens.join("`, `")}\`\n`;
        }
      }
      if (comp.styling.icons && comp.styling.icons.length > 0) {
        context += `- **Icons:**\n`;
        for (const icon of comp.styling.icons) {
          const stateInfo = icon.state ? ` (${icon.state})` : "";
          const sizeInfo = icon.size ? ` size ${icon.size}` : "";
          context += `  - \`${icon.name}\`${stateInfo}${sizeInfo}\n`;
        }
      }
      if (comp.styling.inputStyles) {
        context += `- **Input Styles:**\n`;
        if (comp.styling.inputStyles.base) {
          context += `  - Base: \`${comp.styling.inputStyles.base}\`\n`;
        }
        if (
          comp.styling.inputStyles.sizes &&
          Object.keys(comp.styling.inputStyles.sizes).length > 0
        ) {
          context += `  - Sizes:\n`;
          for (const [sizeName, classes] of Object.entries(
            comp.styling.inputStyles.sizes,
          )) {
            context += `    - \`${sizeName}\`: \`${classes}\`\n`;
          }
        }
      }
      if (
        comp.styling.sizeVariants &&
        Object.keys(comp.styling.sizeVariants).length > 0
      ) {
        context += `- **Size Variants:**\n`;
        for (const [sizeName, sizeData] of Object.entries(
          comp.styling.sizeVariants,
        )) {
          context += `  - \`${sizeName}\`:\n`;
          if (sizeData.height) {
            context += `    - Height: ${sizeData.height}px\n`;
          }
          if (sizeData.classes) {
            context += `    - Classes: \`${sizeData.classes}\`\n`;
          }
          if (sizeData.buttonSize) {
            context += `    - Button Size: \`${sizeData.buttonSize}\`\n`;
          }
          if (sizeData.dimensions) {
            context += `    - Dimensions:\n`;
            for (const [key, value] of Object.entries(sizeData.dimensions)) {
              context += `      - ${key}: ${value}\n`;
            }
          }
        }
      }
    }

    // Document sub-components for compound component patterns
    if (comp.subComponents && Object.keys(comp.subComponents).length > 0) {
      context += `\n**Sub-Components:**\n\n`;
      context += `This is a compound component. Use these sub-components:\n\n`;

      for (const [subName, subComp] of Object.entries(comp.subComponents)) {
        context += `#### ${name}.${subName}\n\n`;
        context += `${subComp.description}`;

        // Add render element info if available
        if (subComp.renderElement) {
          context += ` Renders a \`${subComp.renderElement}\` element.`;
        }
        context += "\n\n";

        // Show props with descriptions
        if (Object.keys(subComp.props).length > 0) {
          context += `Props:\n`;
          for (const [propName, prop] of Object.entries(subComp.props)) {
            const required = prop.required ? " (required)" : "";
            const defaultVal = prop.default
              ? ` [default: ${prop.default}]`
              : "";
            context += `- \`${propName}\`: ${prop.type}${required}${defaultVal}`;
            if (prop.description) {
              context += ` - ${prop.description}`;
            }
            context += "\n";
          }
          context += "\n";
        }

        // Show usage examples for pass-through components
        if (subComp.usageExamples && subComp.usageExamples.length > 0) {
          context += `Usage:\n`;
          for (const example of subComp.usageExamples) {
            context += `\`\`\`tsx\n${example}\n\`\`\`\n`;
          }
          context += "\n";
        }
      }
    }

    if (comp.examples.length > 0) {
      context += `\n**Examples:**\n\n`;
      for (const example of comp.examples) {
        // Clean up and filter examples
        if (!shouldIncludeExample(example, name)) {
          continue;
        }
        // Skip near-duplicate examples (e.g., multiple size variants)
        if (isNearDuplicateExample(example, name)) {
          continue;
        }
        const cleanedExample = cleanupExample(example);
        context += `\`\`\`tsx\n${cleanedExample}\n\`\`\`\n\n`;
      }
    }
    context += "\n";
  }

  context += `## Quick Reference

**Components by Category:**
`;
  for (const [category, names] of Object.entries(registry.search.byCategory)) {
    context += `- **${category}:** ${names.join(", ")}\n`;
  }

  return context;
}
