/**
 * Figma Variables API client for syncing design tokens
 *
 * This module provides a unidirectional sync from code to Figma.
 * It purges all existing variables and recreates them fresh,
 * making the codebase the single source of truth.
 */

/** Color with optional alpha (input format) */
export type FigmaColorInput = { r: number; g: number; b: number; a?: number };

/** Color with required alpha (Figma API format) */
type FigmaColor = { r: number; g: number; b: number; a: number };

export type ResolvedToken = {
  name: string;
  light: FigmaColorInput;
  dark: FigmaColorInput;
};

/**
 * A resolved typography token with numeric value
 */
export type ResolvedTypographyToken = {
  name: string;
  value: number;
};

export type FigmaConfig = {
  fileKey: string;
  token: string;
};

/**
 * Extended theme mode configuration
 */
export type ExtendedMode = {
  name: string;
  /** Map of token name -> color value for this mode (overrides light values) */
  overrides: Record<string, FigmaColorInput>;
};

/**
 * Full sync configuration
 */
export type SyncConfig = {
  fileKey: string;
  token: string;
  collectionName: string;
  /** Base tokens with Light/Dark values */
  tokens: ResolvedToken[];
  /** Additional modes (e.g., fedramp) that extend the base tokens */
  extendedModes?: ExtendedMode[];
};

export type SyncResult = {
  success: boolean;
  error?: string;
  tempIdToRealId?: Record<string, string>;
};

/**
 * Normalize color to Figma format (0-1 range, always include alpha)
 */
function normalizeFigmaColor(color: FigmaColorInput): FigmaColor {
  return {
    r: color.r,
    g: color.g,
    b: color.b,
    a: color.a ?? 1,
  };
}

/**
 * Generate a stable ID for a variable based on its name
 */
function generateVariableId(name: string): string {
  return `var_${name.replace(/-/g, "_")}`;
}

/**
 * Generate a stable ID for a mode based on its name
 */
function generateModeId(name: string): string {
  return `mode_${name.toLowerCase().replace(/\s+/g, "_")}`;
}

type FigmaPayload = {
  variableCollections?: Array<{
    action: "CREATE" | "UPDATE" | "DELETE";
    id: string;
    name?: string;
    /** Initial mode ID for base collections (not used for extensions) */
    initialModeId?: string;
    /** For extension collections: the parent collection ID */
    parentVariableCollectionId?: string;
    /** For extension collections: maps extension mode IDs to parent mode IDs */
    initialModeIdToInitialParentModeIdMap?: Record<string, string>;
  }>;
  variableModes?: Array<{
    action: "CREATE" | "UPDATE" | "DELETE";
    id: string;
    name?: string;
    variableCollectionId?: string;
  }>;
  variables?: Array<{
    action: "CREATE" | "UPDATE" | "DELETE";
    id: string;
    name?: string;
    variableCollectionId?: string;
    resolvedType?: "COLOR" | "FLOAT" | "STRING";
  }>;
  variableModeValues?: Array<{
    variableId: string;
    modeId: string;
    value: FigmaColor | number | string;
  }>;
};

/**
 * Get local variables from a Figma file
 */
export async function getLocalVariables(
  fileKey: string,
  token: string,
): Promise<{
  success: boolean;
  error?: string;
  data?: {
    variables: Record<
      string,
      { id: string; name: string; variableCollectionId: string }
    >;
    variableCollections: Record<
      string,
      {
        id: string;
        name: string;
        modes: Array<{ modeId: string; name: string }>;
      }
    >;
  };
}> {
  const url = `https://api.figma.com/v1/files/${fileKey}/variables/local`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-Figma-Token": token },
    });

    const responseText = await response.text();
    let responseJson: unknown;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        error: `Failed to parse response: ${responseText}`,
      };
    }

    if (!response.ok) {
      const errorMessage =
        responseJson &&
        typeof responseJson === "object" &&
        responseJson !== null
          ? (responseJson as Record<string, unknown>).message ||
            (responseJson as Record<string, unknown>).error ||
            responseText
          : responseText;
      return {
        success: false,
        error: `Figma API error (${response.status}): ${errorMessage}`,
      };
    }

    const meta =
      responseJson &&
      typeof responseJson === "object" &&
      responseJson !== null &&
      "meta" in responseJson
        ? (
            responseJson as {
              meta: {
                variables: Record<string, unknown>;
                variableCollections: Record<string, unknown>;
              };
            }
          ).meta
        : null;

    return {
      success: true,
      data: (meta as {
        variables: Record<
          string,
          { id: string; name: string; variableCollectionId: string }
        >;
        variableCollections: Record<
          string,
          {
            id: string;
            name: string;
            modes: Array<{ modeId: string; name: string }>;
          }
        >;
      }) ?? { variables: {}, variableCollections: {} },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Network error: ${message}` };
  }
}

/**
 * Send a payload to Figma Variables API
 */
async function sendFigmaPayload(
  fileKey: string,
  token: string,
  payload: FigmaPayload,
): Promise<SyncResult> {
  const url = `https://api.figma.com/v1/files/${fileKey}/variables`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-Figma-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseJson: unknown;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = null;
    }

    if (!response.ok) {
      const errorMessage =
        responseJson &&
        typeof responseJson === "object" &&
        responseJson !== null
          ? (responseJson as Record<string, unknown>).message ||
            (responseJson as Record<string, unknown>).error ||
            responseText
          : responseText;
      return {
        success: false,
        error: `Figma API error (${response.status}): ${errorMessage}`,
      };
    }

    const meta =
      responseJson &&
      typeof responseJson === "object" &&
      responseJson !== null &&
      "meta" in responseJson
        ? (
            responseJson as {
              meta: { tempIdToRealId?: Record<string, string> };
            }
          ).meta
        : null;

    return { success: true, tempIdToRealId: meta?.tempIdToRealId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Network error: ${message}` };
  }
}

/**
 * Delete all variables and collections from a Figma file
 */
export async function purgeAllVariables(
  fileKey: string,
  token: string,
): Promise<SyncResult> {
  // First, get all existing variables
  const existing = await getLocalVariables(fileKey, token);
  if (!existing.success || !existing.data) {
    return existing;
  }

  const { variables, variableCollections } = existing.data;
  const variableIds = Object.keys(variables);
  const collectionIds = Object.keys(variableCollections);

  if (variableIds.length === 0 && collectionIds.length === 0) {
    return { success: true };
  }

  // Delete all variables first, then collections
  const payload: FigmaPayload = {
    variables: variableIds.map((id) => ({ action: "DELETE", id })),
    variableCollections: collectionIds.map((id) => ({ action: "DELETE", id })),
  };

  return sendFigmaPayload(fileKey, token, payload);
}

/**
 * Sync tokens to Figma (purge + create)
 *
 * This is a unidirectional sync that makes the codebase the single source of truth.
 * It deletes all existing variables and recreates them from scratch.
 *
 * Creates:
 * 1. Base collection with Light and Dark modes
 * 2. Extension collections for each extended mode (e.g., "fedramp") that inherit
 *    from the base collection and can override specific token values.
 *    Each extension also has Light/Dark modes mapped to the parent's modes.
 */
export async function syncToFigma(config: SyncConfig): Promise<SyncResult> {
  const { fileKey, token, collectionName, tokens, extendedModes = [] } = config;

  if (!tokens.length) {
    return { success: false, error: "No tokens to sync" };
  }

  // Step 1: Purge all existing variables
  const purgeResult = await purgeAllVariables(fileKey, token);
  if (!purgeResult.success) {
    return { success: false, error: `Failed to purge: ${purgeResult.error}` };
  }

  // Step 2: Build the base collection payload
  const baseCollectionId = "kumo_collection";
  const lightModeId = generateModeId("Light");
  const darkModeId = generateModeId("Dark");

  // Build base mode definitions (Light and Dark only)
  const variableModes: FigmaPayload["variableModes"] = [
    {
      action: "UPDATE",
      id: lightModeId,
      name: "Light",
      variableCollectionId: baseCollectionId,
    },
    {
      action: "CREATE",
      id: darkModeId,
      name: "Dark",
      variableCollectionId: baseCollectionId,
    },
  ];

  // Build variables
  const variables: FigmaPayload["variables"] = tokens.map((t) => ({
    action: "CREATE",
    id: generateVariableId(t.name),
    name: t.name,
    variableCollectionId: baseCollectionId,
    resolvedType: "COLOR",
  }));

  // Build mode values for base collection
  const variableModeValues: FigmaPayload["variableModeValues"] = [];

  for (const t of tokens) {
    const varId = generateVariableId(t.name);

    // Light mode
    variableModeValues.push({
      variableId: varId,
      modeId: lightModeId,
      value: normalizeFigmaColor(t.light),
    });

    // Dark mode
    variableModeValues.push({
      variableId: varId,
      modeId: darkModeId,
      value: normalizeFigmaColor(t.dark),
    });
  }

  // Build base collection
  const variableCollections: NonNullable<FigmaPayload["variableCollections"]> =
    [
      {
        action: "CREATE",
        id: baseCollectionId,
        name: collectionName,
        initialModeId: lightModeId,
      },
    ];

  // Step 3: Build extension collections for each extended mode
  // Extension collections inherit from base and override specific tokens
  // They still have Light/Dark modes that map to the parent's Light/Dark
  for (const extMode of extendedModes) {
    const extCollectionId = `ext_${extMode.name.toLowerCase()}`;
    const extLightModeId = `${extCollectionId}_light`;
    const extDarkModeId = `${extCollectionId}_dark`;

    // Create extension collection with mode mapping to parent
    variableCollections.push({
      action: "CREATE",
      id: extCollectionId,
      name: extMode.name,
      parentVariableCollectionId: baseCollectionId,
      initialModeIdToInitialParentModeIdMap: {
        [extLightModeId]: lightModeId,
        [extDarkModeId]: darkModeId,
      },
    });

    // Add variable mode values for overrides in the extension collection
    // Only add values for tokens that have overrides
    for (const t of tokens) {
      const varId = generateVariableId(t.name);
      const override = extMode.overrides[t.name];

      if (override) {
        // Light mode override
        variableModeValues.push({
          variableId: varId,
          modeId: extLightModeId,
          value: normalizeFigmaColor(override),
        });

        // Dark mode override (use same override - fedramp overrides apply to both modes)
        variableModeValues.push({
          variableId: varId,
          modeId: extDarkModeId,
          value: normalizeFigmaColor(override),
        });
      }
    }
  }

  const createPayload: FigmaPayload = {
    variableCollections,
    variableModes,
    variables,
    variableModeValues,
  };

  return sendFigmaPayload(fileKey, token, createPayload);
}

/**
 * Configuration for syncing typography tokens
 */
export type TypographySyncConfig = {
  fileKey: string;
  token: string;
  collectionName: string;
  /** Typography tokens with numeric values */
  tokens: ResolvedTypographyToken[];
  /** Mode name (e.g., "Desktop") */
  modeName?: string;
};

/**
 * Sync typography tokens to Figma as FLOAT variables
 *
 * Creates a separate collection for typography with a single mode.
 * Unlike color tokens, typography tokens don't have light/dark variants.
 */
export async function syncTypographyToFigma(
  config: TypographySyncConfig,
): Promise<SyncResult> {
  const {
    fileKey,
    token,
    collectionName,
    tokens,
    modeName = "Desktop",
  } = config;

  if (!tokens.length) {
    return { success: false, error: "No typography tokens to sync" };
  }

  // Build the typography collection payload
  const typographyCollectionId = "typography_collection";
  const desktopModeId = generateModeId(modeName);

  // Build collection
  const variableCollections: NonNullable<FigmaPayload["variableCollections"]> =
    [
      {
        action: "CREATE",
        id: typographyCollectionId,
        name: collectionName,
        initialModeId: desktopModeId,
      },
    ];

  // Build mode (just rename the initial mode)
  const variableModes: FigmaPayload["variableModes"] = [
    {
      action: "UPDATE",
      id: desktopModeId,
      name: modeName,
      variableCollectionId: typographyCollectionId,
    },
  ];

  // Build variables
  const variables: FigmaPayload["variables"] = tokens.map((t) => ({
    action: "CREATE",
    id: generateVariableId(t.name),
    name: t.name,
    variableCollectionId: typographyCollectionId,
    resolvedType: "FLOAT",
  }));

  // Build mode values
  const variableModeValues: FigmaPayload["variableModeValues"] = tokens.map(
    (t) => ({
      variableId: generateVariableId(t.name),
      modeId: desktopModeId,
      value: t.value,
    }),
  );

  const createPayload: FigmaPayload = {
    variableCollections,
    variableModes,
    variables,
    variableModeValues,
  };

  return sendFigmaPayload(fileKey, token, createPayload);
}

/**
 * Combined sync configuration for both colors and typography
 */
export type CombinedSyncConfig = {
  fileKey: string;
  token: string;
  /** Color collection configuration */
  colors: {
    collectionName: string;
    tokens: ResolvedToken[];
    extendedModes?: ExtendedMode[];
  };
  /** Typography collection configuration */
  typography?: {
    collectionName: string;
    tokens: ResolvedTypographyToken[];
    modeName?: string;
  };
};

/**
 * Sync both color and typography tokens to Figma in a single operation
 *
 * This purges all existing variables and recreates both collections.
 */
export async function syncAllToFigma(
  config: CombinedSyncConfig,
): Promise<SyncResult> {
  const { fileKey, token, colors, typography } = config;

  // Step 1: Purge all existing variables
  const purgeResult = await purgeAllVariables(fileKey, token);
  if (!purgeResult.success) {
    return { success: false, error: `Failed to purge: ${purgeResult.error}` };
  }

  // Step 2: Build combined payload for both collections
  const colorCollectionId = "kumo_collection";
  const lightModeId = generateModeId("Light");
  const darkModeId = generateModeId("Dark");

  // Build color collection
  const variableCollections: NonNullable<FigmaPayload["variableCollections"]> =
    [
      {
        action: "CREATE",
        id: colorCollectionId,
        name: colors.collectionName,
        initialModeId: lightModeId,
      },
    ];

  // Build color modes
  const variableModes: FigmaPayload["variableModes"] = [
    {
      action: "UPDATE",
      id: lightModeId,
      name: "Light",
      variableCollectionId: colorCollectionId,
    },
    {
      action: "CREATE",
      id: darkModeId,
      name: "Dark",
      variableCollectionId: colorCollectionId,
    },
  ];

  // Build color variables
  const variables: FigmaPayload["variables"] = colors.tokens.map((t) => ({
    action: "CREATE",
    id: generateVariableId(t.name),
    name: t.name,
    variableCollectionId: colorCollectionId,
    resolvedType: "COLOR",
  }));

  // Build color mode values
  const variableModeValues: FigmaPayload["variableModeValues"] = [];

  for (const t of colors.tokens) {
    const varId = generateVariableId(t.name);

    // Light mode
    variableModeValues.push({
      variableId: varId,
      modeId: lightModeId,
      value: normalizeFigmaColor(t.light),
    });

    // Dark mode
    variableModeValues.push({
      variableId: varId,
      modeId: darkModeId,
      value: normalizeFigmaColor(t.dark),
    });
  }

  // Add extended modes for colors
  const extendedModes = colors.extendedModes ?? [];
  for (const extMode of extendedModes) {
    const extCollectionId = `ext_${extMode.name.toLowerCase()}`;
    const extLightModeId = `${extCollectionId}_light`;
    const extDarkModeId = `${extCollectionId}_dark`;

    variableCollections.push({
      action: "CREATE",
      id: extCollectionId,
      name: extMode.name,
      parentVariableCollectionId: colorCollectionId,
      initialModeIdToInitialParentModeIdMap: {
        [extLightModeId]: lightModeId,
        [extDarkModeId]: darkModeId,
      },
    });

    for (const t of colors.tokens) {
      const varId = generateVariableId(t.name);
      const override = extMode.overrides[t.name];

      if (override) {
        variableModeValues.push({
          variableId: varId,
          modeId: extLightModeId,
          value: normalizeFigmaColor(override),
        });

        variableModeValues.push({
          variableId: varId,
          modeId: extDarkModeId,
          value: normalizeFigmaColor(override),
        });
      }
    }
  }

  // Add typography collection if provided
  if (typography && typography.tokens.length > 0) {
    const typographyCollectionId = "typography_collection";
    const typographyModeId = generateModeId(typography.modeName ?? "Desktop");

    variableCollections.push({
      action: "CREATE",
      id: typographyCollectionId,
      name: typography.collectionName,
      initialModeId: typographyModeId,
    });

    variableModes.push({
      action: "UPDATE",
      id: typographyModeId,
      name: typography.modeName ?? "Desktop",
      variableCollectionId: typographyCollectionId,
    });

    for (const t of typography.tokens) {
      const varId = generateVariableId(`typography_${t.name}`);

      variables.push({
        action: "CREATE",
        id: varId,
        name: t.name,
        variableCollectionId: typographyCollectionId,
        resolvedType: "FLOAT",
      });

      variableModeValues.push({
        variableId: varId,
        modeId: typographyModeId,
        value: t.value,
      });
    }
  }

  const createPayload: FigmaPayload = {
    variableCollections,
    variableModes,
    variables,
    variableModeValues,
  };

  return sendFigmaPayload(fileKey, token, createPayload);
}

// Legacy export for backwards compatibility
export { syncToFigma as syncToFigmaLegacy };
