/**
 * Structured logging utility for Figma plugin
 *
 * Provides log levels (DEBUG, INFO, WARN, ERROR) with configurable verbosity.
 * In production, only WARN and ERROR are shown by default.
 *
 * Semantic logging functions with emojis for consistent output:
 * - logComplete: ✅ Task completed successfully
 * - logStart: 🎨 Starting a generation task
 * - logProgress: 📦 Progress update during generation
 * - logFound: 📖 Found/loaded resources
 *
 * ES2020 compatible for Figma plugin runtime.
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Current log level - only logs at this level or higher will be shown
 * Default: INFO (shows INFO, WARN, ERROR but not DEBUG)
 *
 * To enable DEBUG logs: Set LOG_LEVEL = LogLevel.DEBUG
 * For production: Set LOG_LEVEL = LogLevel.WARN
 */
export var LOG_LEVEL: LogLevel = LogLevel.INFO;

/**
 * Set the current log level
 */
export function setLogLevel(level: LogLevel): void {
  LOG_LEVEL = level;
}

/**
 * Internal logging function (no prefix, just logs the message)
 */
function log(level: LogLevel, ...args: unknown[]): void {
  if (level < LOG_LEVEL) {
    return;
  }

  switch (level) {
    case LogLevel.DEBUG:
    case LogLevel.INFO:
      console.log(...args);
      break;
    case LogLevel.WARN:
      console.warn(...args);
      break;
    case LogLevel.ERROR:
      console.error(...args);
      break;
  }
}

/**
 * Log debug message (verbose, development only)
 * Hidden by default, enable with setLogLevel(LogLevel.DEBUG)
 */
export function logDebug(...args: unknown[]): void {
  log(LogLevel.DEBUG, ...args);
}

/**
 * Log informational message
 * Shown by default in development
 */
export function logInfo(...args: unknown[]): void {
  log(LogLevel.INFO, ...args);
}

/**
 * Log warning message
 * Always shown (production + development)
 */
export function logWarn(...args: unknown[]): void {
  log(LogLevel.WARN, "⚠️", ...args);
}

/**
 * Log error message
 * Always shown (production + development)
 */
export function logError(...args: unknown[]): void {
  log(LogLevel.ERROR, "❌", ...args);
}

// ============================================================================
// SEMANTIC LOGGING FUNCTIONS
// Use these for consistent, meaningful log output across generators
// ============================================================================

/**
 * Log successful completion of a task
 * Use at the end of generator functions
 *
 * @example logComplete("Generated Badge ComponentSet with 8 variants (light + dark)")
 */
export function logComplete(...args: unknown[]): void {
  log(LogLevel.INFO, "✅", ...args);
}

/**
 * Log the start of a generation task
 * Use at the beginning of generator functions
 *
 * @example logStart("Badge", "Y=100")
 */
export function logStart(component: string, context?: string): void {
  var msg = component + ": Starting generation";
  if (context) {
    msg += " at " + context;
  }
  log(LogLevel.INFO, "🎨", msg);
}

/**
 * Log progress during generation
 * Use for intermediate steps like "Creating variant X" or "Combining as variants"
 *
 * @example logProgress("Badge", "Creating variant=info")
 * @example logProgress("Badge", "Combining as variants...")
 */
export function logProgress(component: string, message: string): void {
  log(LogLevel.INFO, "📦", component + ": " + message);
}

/**
 * Log found/loaded resources
 * Use when loading data, finding pages, etc.
 *
 * @example logFound("Found 535 icons in sprite")
 * @example logFound("Found existing Components page")
 */
export function logFound(...args: unknown[]): void {
  log(LogLevel.INFO, "📖", ...args);
}

/**
 * Log creation of new resources
 * Use when creating pages, files, etc.
 *
 * @example logCreate("Creating new Components page")
 */
export function logCreate(...args: unknown[]): void {
  log(LogLevel.INFO, "📄", ...args);
}

/**
 * Log cleanup/purge operations
 * Use when removing old content
 *
 * @example logPurge("Purging 12 items from Components page")
 */
export function logPurge(...args: unknown[]): void {
  log(LogLevel.INFO, "🗑️", ...args);
}
