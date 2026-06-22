/**
 * Central application logger.
 *
 * Today it wraps `console` with a structured, leveled format. The key design
 * point is the *sink* extension point: an external monitoring service (Sentry,
 * Logtail, a custom endpoint…) can be registered with `addLogSink` later
 * without touching any call site. Use this instead of `console.*` so runtime
 * failures are reported consistently across the app.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  /** Original error/value — for diagnostics only, never shown to users. */
  error?: unknown;
  timestamp: string;
}

export type LogSink = (entry: LogEntry) => void;

const sinks: LogSink[] = [];

/**
 * Register an external sink (e.g. forward `error` entries to a monitoring
 * service). Returns an unsubscribe function.
 */
export function addLogSink(sink: LogSink): () => void {
  sinks.push(sink);
  return () => {
    const index = sinks.indexOf(sink);
    if (index > -1) sinks.splice(index, 1);
  };
}

const isDev = process.env.NODE_ENV !== "production";

function writeToConsole(entry: LogEntry) {
  // Keep noisy `debug` out of production consoles.
  if (entry.level === "debug" && !isDev) return;

  const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
  const extra = [entry.context, entry.error].filter((v) => v !== undefined);

  switch (entry.level) {
    case "error":
      console.error(prefix, ...extra);
      break;
    case "warn":
      console.warn(prefix, ...extra);
      break;
    case "debug":
      console.debug(prefix, ...extra);
      break;
    default:
      console.info(prefix, ...extra);
  }
}

function emit(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: unknown
) {
  const entry: LogEntry = {
    level,
    message,
    context,
    error,
    timestamp: new Date().toISOString(),
  };

  writeToConsole(entry);

  for (const sink of sinks) {
    try {
      sink(entry);
    } catch {
      // A failing sink must never break the app or other sinks.
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) =>
    emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) =>
    emit("warn", message, context),
  /** Log an unexpected failure. Pass the original error as the 2nd argument. */
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    emit("error", message, context, error),
};
