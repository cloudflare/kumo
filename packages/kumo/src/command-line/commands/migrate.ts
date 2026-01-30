/**
 * Kumo CLI migrate command
 *
 * For CONSUMERS: Exports the token rename map when Kumo releases breaking changes.
 * The actual rename map is embedded at build time from the theme-generator config.
 *
 * For KUMO MAINTAINERS: Use `pnpm migrate:tokens` for the full migration workflow.
 */

// This map should be updated when kumo releases a breaking change to token names.
// After migration is complete (all codebases updated), this should be emptied.
//
// Format: { oldName: newName } where newName = "" means no pending migration
const PENDING_MIGRATIONS = {
  text: {} as Record<string, string>,
  color: {} as Record<string, string>,
} as const;

// Tailwind utility prefixes
const COLOR_PREFIXES = [
  "bg",
  "border",
  "border-t",
  "border-r",
  "border-b",
  "border-l",
  "border-x",
  "border-y",
  "ring",
  "ring-offset",
  "outline",
  "divide",
  "shadow",
  "accent",
  "caret",
  "fill",
  "stroke",
  "decoration",
  "from",
  "via",
  "to",
];
const TEXT_PREFIXES = ["text"];

type Direction = "to-new" | "to-old";

function hasPendingMigrations(): boolean {
  return (
    Object.values(PENDING_MIGRATIONS.text).some((v) => v !== "") ||
    Object.values(PENDING_MIGRATIONS.color).some((v) => v !== "")
  );
}

function generateClassMap(direction: Direction): Record<string, string> {
  const classMap: Record<string, string> = {};

  for (const [oldName, newName] of Object.entries(PENDING_MIGRATIONS.text)) {
    if (!newName) continue;
    const [from, to] =
      direction === "to-new" ? [oldName, newName] : [newName, oldName];
    for (const prefix of TEXT_PREFIXES) {
      classMap[`${prefix}-${from}`] = `${prefix}-${to}`;
    }
  }

  for (const [oldName, newName] of Object.entries(PENDING_MIGRATIONS.color)) {
    if (!newName) continue;
    const [from, to] =
      direction === "to-new" ? [oldName, newName] : [newName, oldName];
    for (const prefix of COLOR_PREFIXES) {
      classMap[`${prefix}-${from}`] = `${prefix}-${to}`;
    }
  }

  return classMap;
}

const MIGRATE_HELP = `
Kumo Token Migration Tool (for consumers)

When Kumo releases breaking changes to token names, use this command
to get the rename map for updating your codebase.

USAGE:
  npx @cloudflare/kumo migrate [options]

OPTIONS:
  --json         Output machine-readable JSON (default)
  --classes      Output as class-level mapping (bg-kumo-base -> bg-kumo-base)
  --to-old       Reverse mapping (new names -> old names)
  --help         Show this help message

EXAMPLES:
  # Check if there are pending migrations
  npx @cloudflare/kumo migrate

  # Get class-level mapping for sed/find-replace
  npx @cloudflare/kumo migrate --classes

  # Get JSON for custom codemod
  npx @cloudflare/kumo migrate --json > rename-map.json

USING WITH sed:
  npx @cloudflare/kumo migrate --classes | grep "^bg-\\|^text-" | \\
    while IFS= read -r line; do
      old=$(echo "$line" | awk '{print $1}')
      new=$(echo "$line" | awk '{print $3}')
      find src -name '*.tsx' -exec sed -i '' "s/\\b$old\\b/$new/g" {} +
    done

NOTE:
  If no migrations are pending, you're up to date with the current version.
  Migrations are only needed when upgrading to a new major/minor version
  that includes breaking token name changes.
`;

export function migrate(args: string[]): void {
  const showHelp = args.includes("--help") || args.includes("-h");
  const outputClasses = args.includes("--classes");
  const toOld = args.includes("--to-old");

  if (showHelp) {
    console.log(MIGRATE_HELP.trim());
    return;
  }

  if (!hasPendingMigrations()) {
    console.log("No pending token migrations.");
    console.log("\nYour codebase is up to date with the current Kumo version.");
    console.log("Token migrations are only needed when upgrading to versions");
    console.log("that include breaking changes to token names.");
    return;
  }

  const direction: Direction = toOld ? "to-old" : "to-new";
  const classMap = generateClassMap(direction);

  if (outputClasses) {
    const maxKeyLen = Math.max(...Object.keys(classMap).map((k) => k.length));
    console.log(`# Kumo Token Migration (${direction})`);
    console.log(`# ${Object.keys(classMap).length} class mappings\n`);
    for (const [from, to] of Object.entries(classMap)) {
      console.log(`${from.padEnd(maxKeyLen)} -> ${to}`);
    }
    return;
  }

  // Default: JSON output
  const output = {
    meta: {
      description: "Kumo token class name migration map",
      direction,
      generatedAt: new Date().toISOString(),
    },
    tokens: PENDING_MIGRATIONS,
    classes: classMap,
  };

  console.log(JSON.stringify(output, null, 2));
}
