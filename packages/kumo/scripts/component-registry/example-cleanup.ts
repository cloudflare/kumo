/**
 * Example cleanup utilities for component registry generation.
 *
 * Cleans up extracted examples to fix common issues and filters
 * out problematic examples.
 */

// =============================================================================
// Example Cleanup
// =============================================================================

/**
 * Clean up extracted examples to fix common issues:
 * - Stringified functions: setPage="() => {}" -> setPage={() => {}}
 * - Stringified arrays: tabs={`[...]`} -> tabs={[...]}
 * - Escaped template literals: code={\`...\`} -> code={`...`}
 * - Unquoted identifiers used as strings: label={Checked} -> label="Checked"
 * - Double backticks from escaping: {``content``} -> {`content`}
 */
export function cleanupExample(example: string): string {
  let cleaned = example;

  // Fix stringified functions: prop="() => {}" -> prop={() => {}}
  cleaned = cleaned.replace(/(\w+)="(\(\)\s*=>\s*\{[^}]*\})"/g, "$1={$2}");

  // Fix stringified arrays: prop={`[...]`} -> prop={[...]}
  // Match prop={`[...multiline content...]`}
  cleaned = cleaned.replace(/(\w+)=\{`(\[[\s\S]*?\])`\}/g, "$1={$2}");

  // Fix escaped template literals: \` -> `
  cleaned = cleaned.replace(/\\`/g, "`");

  // Fix double backticks that result from escaping: {``content``} -> {`content`}
  // This happens when template literals get double-escaped
  cleaned = cleaned.replace(/\{``/g, "{`");
  cleaned = cleaned.replace(/``\}/g, "`}");

  // Fix unquoted identifiers that should be strings (common in Checkbox labels)
  // label={Checked} -> label="Checked" (when it's clearly meant to be a string)
  const identifierAsStringProps = ["label"];
  for (const prop of identifierAsStringProps) {
    // Match prop={SingleWord} where SingleWord is a simple identifier (not a component or expression)
    const pattern = new RegExp(`(${prop})=\\{([A-Z][a-z]+)\\}(?![\\w.])`, "g");
    cleaned = cleaned.replace(pattern, '$1="$2"');
  }

  return cleaned;
}

// =============================================================================
// Example Filtering
// =============================================================================

/**
 * Components that should be filtered out of examples (undefined in the generated code)
 */
const UNDEFINED_COMPONENTS = [
  "RefreshButton",
  "LinkButton",
  "DefaultMenuBar",
  "ToastTriggerButton",
];

/**
 * Variables that indicate an example can't be used standalone
 */
const UNDEFINED_VARS = [
  "args.placeholder",
  "args.inputSide",
  "botList",
  "INITIAL_BOT_LIST",
];

/**
 * Filter out problematic examples that can't be easily fixed
 */
export function shouldIncludeExample(
  example: string,
  componentName: string,
): boolean {
  // Skip examples that reference undefined components
  for (const comp of UNDEFINED_COMPONENTS) {
    if (example.includes(`<${comp}`)) {
      return false;
    }
  }

  // Skip empty or near-empty examples
  if (example.trim().length < 10) {
    return false;
  }

  // Skip examples that are just the component with no props (not useful)
  const emptyPattern = new RegExp(`^<${componentName}\\s*/>$`);
  if (emptyPattern.test(example.trim())) {
    return false;
  }

  // Skip examples with undefined variables (common in story extractions)
  for (const varName of UNDEFINED_VARS) {
    if (example.includes(varName)) {
      return false;
    }
  }

  return true;
}

// =============================================================================
// Near-Duplicate Detection
// =============================================================================

/**
 * Track seen examples to filter near-duplicates.
 * Key is component name, value is set of "signature" strings.
 */
const seenExampleSignatures = new Map<string, Set<string>>();

/**
 * Generate a signature for an example to detect near-duplicates.
 * Extracts the prop names being demonstrated.
 */
export function getExampleSignature(example: string): string {
  // Extract prop assignments like variant="primary" or size="sm"
  const propPattern = /(\w+)=["'{]/g;
  const props: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = propPattern.exec(example)) !== null) {
    props.push(match[1]);
  }
  // Sort for consistent comparison
  return props.sort().join(",");
}

/**
 * Check if this example is a near-duplicate of one we've already seen.
 * Returns true if we should skip this example.
 */
export function isNearDuplicateExample(
  example: string,
  componentName: string,
): boolean {
  const signature = getExampleSignature(example);

  // Get or create the set for this component
  let signatures = seenExampleSignatures.get(componentName);
  if (!signatures) {
    signatures = new Set();
    seenExampleSignatures.set(componentName, signatures);
  }

  // If we've seen this signature, it's a duplicate
  if (signatures.has(signature)) {
    return true;
  }

  // Mark as seen
  signatures.add(signature);
  return false;
}

/**
 * Clear the example signature cache.
 * Call this before processing a new registry to get fresh duplicate detection.
 */
export function clearExampleSignatureCache(): void {
  seenExampleSignatures.clear();
}
